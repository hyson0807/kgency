# 프론트엔드 구현 가이드 (최적화됨)

프로필 중심 앱 초기화 시스템의 프론트엔드 구현에 대한 가이드입니다.

## 📋 최적화된 파일 구조

```
/contexts/
└── ProfileContext.tsx         # preload된 프로필 전역 상태 관리

/components/app-initializer/
├── AppInitializer.tsx          # 프로필 중심 초기화 컴포넌트
├── InitializationScreen.tsx    # 로딩 UI 컴포넌트  
├── SkeletonScreen.tsx         # 스켈레톤 UI 컴포넌트
└── ErrorBoundary.tsx          # 초기화 에러 처리

/lib/preloader/
├── userPreloader.ts          # 사용자 프로필만 로딩
├── companyPreloader.ts       # 회사 프로필만 로딩
├── types.ts                  # 프리로더 타입 정의
└── index.ts                 # 통합 preload 함수

/lib/cache/
├── AsyncStorageCache.ts      # AsyncStorage 캐시 매니저 클래스
└── CacheKeys.ts            # 캐시 키와 TTL 관리

/lib/offline/
└── OfflineManager.ts        # 오프라인 모드 지원

/hooks/
├── useProfile.ts           # 개선된 cache-first 전략
├── useUserKeywords.ts      # 키워드 개별 로딩 (기존 유지)
└── useApplications.ts      # 지원내역 개별 로딩 (기존 유지)
```

## 🔧 핵심 컴포넌트 구현

### 1. ProfileContext.tsx (신규)

```typescript
// contexts/ProfileContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

// 프로필 타입 정의
interface Profile {
  id: string;
  user_type: 'user' | 'company';
  name: string;
  phone_number: string;
  email?: string;
  address?: string;
  description?: string;
  onboarding_completed: boolean;
  job_seeking_active?: boolean;
  profile_image_url?: string | null;
  created_at?: string;
}

interface UserInfo {
  id: string;
  user_id: string;
  name?: string;
  age?: number;
  gender?: string;
  visa?: string;
  korean_level?: string;
  how_long?: string | null;
  experience?: string | null;
  topic?: string;
  experience_content?: string | null;
  preferred_days?: string[];
  preferred_times?: string[];
}

type FullProfile = Profile & {
  user_info?: UserInfo;
};

interface ProfileContextType {
  preloadedProfile: FullProfile | null;
  setPreloadedProfile: (profile: FullProfile | null) => void;
  isProfilePreloaded: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preloadedProfile, setPreloadedProfile] = useState<FullProfile | null>(null);

  const value = {
    preloadedProfile,
    setPreloadedProfile,
    isProfilePreloaded: !!preloadedProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};
```

### 2. AppInitializer.tsx (최적화됨)

```typescript
// components/app-initializer/AppInitializer.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileContext } from '@/contexts/ProfileContext';
import { preloadAppData } from '@/lib/preloader';
import { InitializationScreen } from './InitializationScreen';
import { SkeletonScreen } from './SkeletonScreen';
import { ErrorBoundary } from './ErrorBoundary';

interface AppInitializerProps {
  children: ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { setPreloadedProfile } = useProfileContext();
  const [state, setState] = useState({
    isInitialized: false,
    isLoading: true,
    error: null,
    progress: 0,
    currentOperation: '초기화 준비 중...',
    showSkeletonScreen: false
  });

  const initializeApp = async () => {
    try {
      // 인증 확인
      if (authLoading) return;
      
      if (!isAuthenticated || !user) {
        setState(prev => ({ ...prev, isInitialized: true, isLoading: false }));
        return;
      }

      // 프로필 데이터 preload
      const result = await preloadAppData(user, (progress, operation) => {
        setState(prev => ({ ...prev, progress, currentOperation: operation }));
      });

      // preload된 프로필 데이터를 Context에 저장
      if (result.data?.profile) {
        setPreloadedProfile(result.data.profile);
      }

      // 초기화 완료
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '초기화 실패'
      }));
    }
  };

  useEffect(() => {
    initializeApp();
  }, [authLoading, isAuthenticated, user?.userId]);

  // 스켈레톤 스크린 표시 (진행률 70% 이상)
  if (state.showSkeletonScreen && user) {
    return (
      <ErrorBoundary>
        <SkeletonScreen variant="home" userType={user.userType} animated={true} />
      </ErrorBoundary>
    );
  }

  // 초기화 중이거나 에러가 있는 경우 로딩 화면
  if (state.isLoading || state.error) {
    return (
      <ErrorBoundary>
        <InitializationScreen
          progress={state.progress}
          currentOperation={state.currentOperation}
          error={state.error}
          onRetry={() => initializeApp()}
        />
      </ErrorBoundary>
    );
  }

  // 초기화 완료 후 메인 앱 렌더링
  return <ErrorBoundary>{children}</ErrorBoundary>;
};
```

### 3. 프리로더 시스템 (최적화됨)

```typescript
// lib/preloader/userPreloader.ts
import { api } from '@/lib/api';
import { CacheManager } from '@/lib/cache/AsyncStorageCache';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache/CacheKeys';
import { PreloadResult } from './types';

const cache = new CacheManager();

export const preloadUserProfile = async (userId: string): Promise<PreloadResult> => {
  try {
    // 프로필 데이터만 로딩
    const response = await api('GET', '/api/profiles');
    
    if (!response.success) {
      throw new Error(response.error || '사용자 프로필 로딩 실패');
    }

    const profile = response.data;
    
    // 프로필 데이터 캐싱
    if (profile) {
      await cache.set(`${CACHE_KEYS.USER_PROFILE}${userId}`, profile, CACHE_TTL.USER_PROFILE);
    }

    return {
      success: true,
      canProceed: !!profile,
      data: { profile: profile }
    };

  } catch (error) {
    // 캐시된 프로필 데이터로 폴백 시도
    const cachedProfile = await cache.get(`${CACHE_KEYS.USER_PROFILE}${userId}`, true);
    if (cachedProfile) {
      return {
        success: false,
        canProceed: true,
        data: { profile: cachedProfile },
        errors: [{ operation: 'preloadUserProfile', message: '캐시된 프로필 데이터를 사용합니다.' }]
      };
    }
    
    return {
      success: false,
      canProceed: false,
      errors: [{ operation: 'preloadUserProfile', message: error instanceof Error ? error.message : '사용자 프로필 로딩 실패' }]
    };
  }
};
```

```typescript
// lib/preloader/companyPreloader.ts
export const preloadCompanyProfile = async (companyId: string): Promise<PreloadResult> => {
  try {
    // 회사 프로필 데이터만 로딩
    const response = await api('GET', '/api/profiles');
    
    if (!response.success) {
      throw new Error(response.error || '회사 프로필 로딩 실패');
    }

    const profile = response.data;

    // 프로필 데이터 캐싱
    if (profile) {
      await cache.set(`${CACHE_KEYS.COMPANY_PROFILE}${companyId}`, profile, CACHE_TTL.USER_PROFILE);
    }

    return {
      success: true,
      canProceed: !!profile,
      data: { profile: profile }
    };

  } catch (error) {
    // 캐시된 프로필 데이터로 폴백 시도
    const cachedProfile = await cache.get(`${CACHE_KEYS.COMPANY_PROFILE}${companyId}`, true);
    if (cachedProfile) {
      return {
        success: false,
        canProceed: true,
        data: { profile: cachedProfile },
        errors: [{ operation: 'preloadCompanyProfile', message: '캐시된 프로필 데이터를 사용합니다.' }]
      };
    }
    
    return {
      success: false,
      canProceed: false,
      errors: [{ operation: 'preloadCompanyProfile', message: error instanceof Error ? error.message : '회사 프로필 로딩 실패' }]
    };
  }
};
```

```typescript
// lib/preloader/index.ts
import { User } from '@/contexts/AuthContext';
import { preloadUserProfile } from './userPreloader';
import { preloadCompanyProfile } from './companyPreloader';
import { PreloadResult, ProgressCallback } from './types';
import { offlineManager } from '@/lib/offline/OfflineManager';

export const preloadAppData = async (
  user: User,
  onProgress?: ProgressCallback
): Promise<PreloadResult> => {
  const isOffline = offlineManager.isOffline();
  
  try {
    console.log(`🚀 프로파일 데이터 프리로딩 시작: ${user.userType}(${user.userId || 'unknown'})`);
    
    // 오프라인 모드인 경우 캐시된 데이터 확인
    if (isOffline) {
      return await handleOfflinePreload(user, onProgress);
    }
    
    onProgress?.(20, '프로파일 데이터 로딩 중...');

    // 사용자 타입별 프로파일 데이터만 로드
    let profileResult: PreloadResult;
    if (user.userType === 'user') {
      profileResult = await preloadUserProfile(user.userId || '');
    } else {
      profileResult = await preloadCompanyProfile(user.userId || '');
    }
    
    // 오프라인 데이터 저장
    onProgress?.(60, '오프라인 데이터 저장 중...');
    try {
      if (profileResult.data) {
        await offlineManager.saveOfflineData(user.userId || '', user.userType, profileResult.data);
      }
    } catch (offlineError) {
      console.warn('오프라인 데이터 저장 실패:', offlineError);
    }

    onProgress?.(90, '초기화 완료 중...');

    const finalResult = {
      success: profileResult.success,
      canProceed: profileResult.canProceed && !!profileResult.data?.profile,
      data: profileResult.data,
      errors: profileResult.errors,
      isOfflineMode: false,
      networkStatus: offlineManager.getNetworkStatus()
    };
    
    console.log(`✅ 프로파일 프리로딩 완료: 성공=${profileResult.success}`);
    return finalResult;

  } catch (error) {
    console.error('프로파일 데이터 프리로딩 실패:', error);
    
    // 온라인 모드에서 실패 시 오프라인 데이터로 폴백 시도
    if (!isOffline) {
      try {
        return await handleOfflinePreload(user, onProgress, error);
      } catch (fallbackError) {
        console.error('오프라인 폴백도 실패:', fallbackError);
      }
    }
    
    return {
      success: false,
      canProceed: false,
      errors: [{ operation: 'preloadAppData', message: error instanceof Error ? error.message : '알 수 없는 오류' }],
      isOfflineMode: isOffline,
      networkStatus: offlineManager.getNetworkStatus()
    };
  }
};
```

### 4. useProfile Hook (개선됨)

```typescript
// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileContext } from '@/contexts/ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";
import { api } from "@/lib/api";

export const useProfile = () => {
    const { user } = useAuth();
    const { preloadedProfile, setPreloadedProfile } = useProfileContext();
    const [profile, setProfile] = useState(preloadedProfile);
    const [loading, setLoading] = useState(!preloadedProfile);
    const [error, setError] = useState<string | null>(null);

    // 프로필 가져오기 (cache-first 전략)
    const fetchProfile = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        // 이미 preloaded 프로필이 있으면 사용
        if (preloadedProfile) {
            setProfile(preloadedProfile);
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const response = await api('GET', '/api/profiles');
            if (!response.success) {
                if (response.error === '프로필이 존재하지 않습니다.') {
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('userData');
                    await AsyncStorage.removeItem('userProfile');
                    router.replace('/start');
                    return;
                }
                throw new Error(response.error);
            }
            
            const fullProfile = response.data;
            setProfile(fullProfile);
            setPreloadedProfile(fullProfile); // Context에도 저장
            await AsyncStorage.setItem('userProfile', JSON.stringify(fullProfile));
        } catch (error) {
            setError('프로필을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 프로필 업데이트
    const updateProfile = async (updates: any): Promise<boolean> => {
        if (!user || !profile) return false;

        try {
            setError(null);
            const response = await api('PUT', '/api/profiles', updates);
            if (!response.success) {
                throw new Error(response.error);
            }
            
            // 프로필 다시 가져오기
            await fetchProfile();
            // Context의 preloaded 프로필도 무효화
            setPreloadedProfile(null);
            return true;
        } catch (error) {
            setError('프로필 업데이트에 실패했습니다.');
            return false;
        }
    };

    // 컴포넌트 마운트 시 프로필 가져오기
    useEffect(() => {
        if (user?.userId) {
            // preloaded 프로필이 있으면 즉시 사용, 없으면 fetch
            if (preloadedProfile) {
                setProfile(preloadedProfile);
                setLoading(false);
            } else {
                fetchProfile();
            }
        } else {
            setLoading(false);
        }
    }, [user?.userId, preloadedProfile]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile: () => {
            setPreloadedProfile(null);
            fetchProfile();
        },
        fetchProfile
    };
};
```

## 🚀 통합 가이드

### _layout.tsx에 Provider 추가

```typescript
// app/_layout.tsx
import { ProfileProvider } from "@/contexts/ProfileContext";

export default function RootLayout() {
  return (
    <UpdateManager>
      <TranslationProvider>
        <AuthProvider>
          <ProfileProvider> {/* 신규 추가 */}
            <NotificationProvider>
              <TabBarProvider>
                <SafeAreaProvider>
                  <Stack screenOptions={{ headerShown: false }} />
                </SafeAreaProvider>
              </TabBarProvider>
            </NotificationProvider>
          </ProfileProvider>
        </AuthProvider>
      </TranslationProvider>
    </UpdateManager>
  )
}
```

## 🎯 주요 개선사항

### ✅ 완료된 최적화
1. **프로필 중심 preloading**: 키워드, 지원내역 등 불필요한 데이터 제거
2. **Context 기반 전역 상태**: preload된 프로필을 앱 전체에서 활용
3. **Cache-First 전략**: useProfile hook이 preload된 데이터 우선 사용
4. **중복 제거**: 같은 프로필 데이터를 두 번 요청하지 않음
5. **빠른 초기화**: 최소한의 데이터로 앱 시작 시간 단축

### 💡 핵심 원칙
- **단일 책임**: 초기화는 프로필만, 나머지는 개별 화면에서 처리
- **기존 API 활용**: 새로운 서버 엔드포인트 불필요
- **점진적 개선**: 기존 코드와 호환되면서 성능 개선

이로써 **프로필 중심의 최적화된 앱 초기화 시스템**이 완성되었습니다. 사용자는 더 빠른 앱 시작을, 개발자는 더 간단한 코드를 얻게 되었습니다.