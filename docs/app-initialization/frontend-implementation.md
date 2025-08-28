# 프론트엔드 구현 가이드

앱 초기화 시스템의 프론트엔드 구현에 대한 상세 가이드입니다.

**중요**: 이 구현에서 프론트엔드는 서버 API를 통해서만 데이터베이스에 접근합니다. 직접적인 Supabase 클라이언트 사용은 하지 않습니다.

## 📋 구현 파일 구조

```
/components/app-initializer/
├── AppInitializer.tsx          # 메인 초기화 컴포넌트
├── InitializationScreen.tsx    # 로딩 UI 컴포넌트
└── ErrorBoundary.tsx          # 초기화 에러 처리

/lib/preloader/
├── keywordPreloader.ts        # 키워드 마스터 데이터 로딩
├── userPreloader.ts          # 사용자별 데이터 로딩
├── companyPreloader.ts       # 회사별 데이터 로딩
├── types.ts                  # 프리로더 타입 정의
└── index.ts                 # 통합 API

/lib/cache/
├── AsyncStorageCache.ts      # AsyncStorage 캐시 매니저
├── CacheStrategy.ts         # 캐싱 전략 로직
└── CacheKeys.ts            # 캐시 키 관리

/hooks/
└── useAppInitialization.ts  # 초기화 커스텀 훅
```

## 🔧 핵심 컴포넌트 구현

### 1. AppInitializer.tsx

```typescript
// components/app-initializer/AppInitializer.tsx
import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { preloadAppData } from '@/lib/preloader';
import { InitializationScreen } from './InitializationScreen';
import { ErrorBoundary } from './ErrorBoundary';

interface AppInitializerProps {
  children: ReactNode;
}

interface InitializationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
  currentOperation: string;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [state, setState] = useState<InitializationState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    progress: 0,
    currentOperation: '초기화 준비 중...'
  });

  const updateProgress = (progress: number, operation: string) => {
    setState(prev => ({
      ...prev,
      progress,
      currentOperation: operation
    }));
  };

  const initializeApp = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // AuthContext 로딩이 완료될 때까지 대기
      if (authLoading) {
        updateProgress(10, '인증 상태 확인 중...');
        return;
      }

      // 비로그인 사용자는 초기화 스킵
      if (!isAuthenticated || !user) {
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          progress: 100,
          currentOperation: '완료'
        }));
        return;
      }

      updateProgress(20, '필수 데이터 로딩 중...');

      // 메인 데이터 프리로딩
      const result = await preloadAppData(user, updateProgress);

      if (!result.success) {
        // 부분 실패의 경우 필수 데이터가 있으면 진행
        if (result.canProceed) {
          console.warn('일부 데이터 로딩 실패:', result.errors);
          updateProgress(90, '부분 데이터로 시작...');
        } else {
          throw new Error(result.errors?.[0]?.message || '초기화 실패');
        }
      }

      updateProgress(100, '초기화 완료');
      
      // 초기화 완료
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false
      }));

    } catch (error) {
      console.error('앱 초기화 실패:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      }));
    }
  };

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      error: null,
      progress: 0,
      currentOperation: '재시도 중...'
    }));
    initializeApp();
  };

  // AuthContext 상태 변화 감지
  useEffect(() => {
    initializeApp();
  }, [authLoading, isAuthenticated, user?.userId]);

  // 초기화 중이거나 에러가 있는 경우 로딩 화면 표시
  if (state.isLoading || state.error) {
    return (
      <ErrorBoundary>
        <InitializationScreen
          progress={state.progress}
          currentOperation={state.currentOperation}
          error={state.error}
          onRetry={handleRetry}
        />
      </ErrorBoundary>
    );
  }

  // 초기화 완료 후 메인 앱 렌더링
  return <>{children}</>;
};
```

### 2. InitializationScreen.tsx

```typescript
// components/app-initializer/InitializationScreen.tsx
import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InitializationScreenProps {
  progress: number;
  currentOperation: string;
  error: string | null;
  onRetry: () => void;
}

export const InitializationScreen: React.FC<InitializationScreenProps> = ({
  progress,
  currentOperation,
  error,
  onRetry
}) => {
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Ionicons name="warning-outline" size={64} color="#ef4444" />
        
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
          초기화 중 오류가 발생했습니다
        </Text>
        
        <Text className="text-sm text-gray-600 mt-2 text-center">
          {error}
        </Text>
        
        <TouchableOpacity
          onPress={onRetry}
          className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">다시 시도</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {/* 오프라인 모드 또는 스킵 로직 */}}
          className="mt-4"
        >
          <Text className="text-gray-500 underline">건너뛰기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      {/* 로고 또는 아이콘 */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-blue-600 text-center">
          kgency
        </Text>
      </View>
      
      {/* 로딩 인디케이터 */}
      <ActivityIndicator size="large" color="#3b82f6" />
      
      {/* 진행률 표시 */}
      <View className="w-full mt-6">
        <View className="bg-gray-200 rounded-full h-2">
          <View 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </View>
        
        <Text className="text-sm text-gray-600 mt-2 text-center">
          {Math.round(progress)}%
        </Text>
      </View>
      
      {/* 현재 작업 표시 */}
      <Text className="text-base text-gray-700 mt-4 text-center">
        {currentOperation}
      </Text>
      
      {/* 팁이나 안내 메시지 */}
      <Text className="text-xs text-gray-500 mt-8 text-center">
        앱을 처음 사용하시면 데이터 준비에 시간이 걸릴 수 있습니다.
      </Text>
    </View>
  );
};
```

### 3. ErrorBoundary.tsx

```typescript
// components/app-initializer/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('초기화 ErrorBoundary에서 에러 캐치:', error, errorInfo);
    
    // 에러 리포팅 서비스에 전송 (선택사항)
    // crashlytics().recordError(error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center bg-white px-6">
          <Ionicons name="bug-outline" size={64} color="#ef4444" />
          
          <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
            예기치 못한 오류가 발생했습니다
          </Text>
          
          <Text className="text-sm text-gray-600 mt-2 text-center">
            앱을 다시 시작해주세요. 문제가 계속되면 고객센터에 문의해주세요.
          </Text>
          
          {/* 개발 모드에서만 에러 정보 표시 */}
          {__DEV__ && this.state.error && (
            <Text className="text-xs text-red-500 mt-4 text-center">
              {this.state.error.message}
            </Text>
          )}
          
          <TouchableOpacity
            onPress={this.handleRetry}
            className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-semibold">다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

## 📦 데이터 프리로딩 서비스

### 1. 통합 프리로더 (index.ts)

```typescript
// lib/preloader/index.ts
import { User } from '@/contexts/AuthContext';
import { preloadKeywords } from './keywordPreloader';
import { preloadUserData } from './userPreloader';
import { preloadCompanyData } from './companyPreloader';
import { PreloadResult, ProgressCallback } from './types';

export const preloadAppData = async (
  user: User,
  onProgress?: ProgressCallback
): Promise<PreloadResult> => {
  try {
    const results: PreloadResult[] = [];
    let totalProgress = 20; // 시작 진행률

    // 1. 키워드 마스터 데이터 (모든 사용자 공통)
    onProgress?.(totalProgress, '키워드 데이터 로딩 중...');
    const keywordResult = await preloadKeywords();
    results.push(keywordResult);
    totalProgress = 50;

    // 2. 사용자 타입별 데이터
    onProgress?.(totalProgress, '사용자 데이터 로딩 중...');
    
    let userDataResult: PreloadResult;
    if (user.userType === 'user') {
      userDataResult = await preloadUserData(user.userId);
    } else {
      userDataResult = await preloadCompanyData(user.userId);
    }
    
    results.push(userDataResult);
    totalProgress = 80;

    // 3. 푸시 토큰 등록 (백그라운드)
    onProgress?.(totalProgress, '푸시 알림 설정 중...');
    try {
      const { registerForPushNotificationsAsync, savePushToken } = await import('@/lib/notifications');
      const pushToken = await registerForPushNotificationsAsync();
      if (pushToken) {
        await savePushToken(user.userId);
      }
    } catch (pushError) {
      console.warn('푸시 토큰 등록 실패 (무시됨):', pushError);
    }

    // 결과 통합
    const allSuccess = results.every(result => result.success);
    const allErrors = results.flatMap(result => result.errors || []);
    const hasEssentialData = results.some(result => 
      result.success && (result.data?.keywords || result.data?.profile)
    );

    onProgress?.(90, '초기화 완료 중...');

    return {
      success: allSuccess,
      canProceed: hasEssentialData,
      data: results.reduce((acc, result) => ({ ...acc, ...result.data }), {}),
      errors: allErrors.length > 0 ? allErrors : undefined
    };

  } catch (error) {
    console.error('앱 데이터 프리로딩 실패:', error);
    return {
      success: false,
      canProceed: false,
      errors: [{ 
        operation: 'preloadAppData', 
        message: error instanceof Error ? error.message : '알 수 없는 오류' 
      }]
    };
  }
};
```

### 2. 키워드 프리로더

```typescript
// lib/preloader/keywordPreloader.ts
import { api } from '@/lib/api';
import { CacheManager } from '@/lib/cache/AsyncStorageCache';
import { CACHE_KEYS } from '@/lib/cache/CacheKeys';
import { PreloadResult } from './types';

const cache = new CacheManager();

export const preloadKeywords = async (): Promise<PreloadResult> => {
  try {
    // 1. 캐시에서 먼저 확인
    const cachedKeywords = await cache.get(CACHE_KEYS.KEYWORDS);
    if (cachedKeywords) {
      console.log('키워드 캐시에서 로딩');
      return {
        success: true,
        canProceed: true,
        data: { keywords: cachedKeywords }
      };
    }

    // 2. 서버에서 로딩
    const response = await api('GET', '/api/app-init/keywords');
    if (!response.success || !response.data) {
      throw new Error(response.error || '키워드 데이터를 불러올 수 없습니다.');
    }

    const keywords = response.data.keywords;

    // 3. 캐시에 저장 (24시간)
    await cache.set(CACHE_KEYS.KEYWORDS, keywords, 24 * 60 * 60 * 1000);

    // 4. 카테고리별로 정리
    const keywordsByCategory = keywords.reduce((acc: any, keyword: any) => {
      if (!acc[keyword.category]) {
        acc[keyword.category] = [];
      }
      acc[keyword.category].push(keyword);
      return acc;
    }, {});

    return {
      success: true,
      canProceed: true,
      data: { 
        keywords: keywords,
        keywordsByCategory: keywordsByCategory
      }
    };

  } catch (error) {
    console.error('키워드 프리로딩 실패:', error);
    
    // 캐시된 데이터라도 있으면 사용
    const fallbackKeywords = await cache.get(CACHE_KEYS.KEYWORDS, true); // 만료된 캐시도 허용
    if (fallbackKeywords) {
      return {
        success: false,
        canProceed: true,
        data: { keywords: fallbackKeywords },
        errors: [{ operation: 'preloadKeywords', message: '최신 데이터를 불러올 수 없어 캐시된 데이터를 사용합니다.' }]
      };
    }

    return {
      success: false,
      canProceed: false,
      errors: [{ 
        operation: 'preloadKeywords', 
        message: error instanceof Error ? error.message : '키워드 로딩 실패' 
      }]
    };
  }
};
```

### 3. 사용자 데이터 프리로더

```typescript
// lib/preloader/userPreloader.ts
import { api } from '@/lib/api';
import { CacheManager } from '@/lib/cache/AsyncStorageCache';
import { CACHE_KEYS } from '@/lib/cache/CacheKeys';
import { PreloadResult } from './types';

const cache = new CacheManager();

export const preloadUserData = async (userId: string): Promise<PreloadResult> => {
  try {
    // 통합 엔드포인트로 한 번에 사용자 데이터 로딩
    const response = await api('GET', '/api/app-init/user-essentials');
    
    if (!response.success) {
      throw new Error(response.error || '사용자 데이터 로딩 실패');
    }

    const userData = response.data;
    const hasEssentialData = userData.profile && userData.keywords;

    // 개별 데이터 캐싱 (향후 빠른 접근을 위해)
    if (userData.profile) {
      await cache.set(`${CACHE_KEYS.USER_PROFILE}${userId}`, userData.profile, 60 * 60 * 1000);
    }
    
    if (userData.keywords) {
      await cache.set(`${CACHE_KEYS.USER_KEYWORDS}${userId}`, userData.keywords, 60 * 60 * 1000);
    }

    return {
      success: true,
      canProceed: hasEssentialData,
      data: {
        profile: userData.profile,
        userKeywords: userData.keywords,
        recentApplications: userData.recentActivity?.applications || []
      }
    };

  } catch (error) {
    console.error('사용자 데이터 프리로딩 실패:', error);
    
    // 캐시된 데이터로 폴백 시도
    const fallbackData = await getFallbackUserData(userId);
    if (fallbackData.profile) {
      return {
        success: false,
        canProceed: true,
        data: fallbackData,
        errors: [{ 
          operation: 'preloadUserData', 
          message: '캐시된 데이터를 사용합니다.' 
        }]
      };
    }
    
    return {
      success: false,
      canProceed: false,
      errors: [{ 
        operation: 'preloadUserData', 
        message: error instanceof Error ? error.message : '사용자 데이터 로딩 실패' 
      }]
    };
  }
};

// 캐시된 데이터로 폴백
const getFallbackUserData = async (userId: string) => {
  const fallback: any = {};
  
  try {
    const cachedProfile = await cache.get(`${CACHE_KEYS.USER_PROFILE}${userId}`, true); // 만료된 캐시도 허용
    if (cachedProfile) {
      fallback.profile = cachedProfile;
    }
    
    const cachedKeywords = await cache.get(`${CACHE_KEYS.USER_KEYWORDS}${userId}`, true);
    if (cachedKeywords) {
      fallback.userKeywords = cachedKeywords;
    }
  } catch (error) {
    console.warn('폴백 데이터 조회 실패:', error);
  }
  
  return fallback;
};
```

### 4. 회사 데이터 프리로더

```typescript
// lib/preloader/companyPreloader.ts
import { api } from '@/lib/api';
import { CacheManager } from '@/lib/cache/AsyncStorageCache';
import { CACHE_KEYS } from '@/lib/cache/CacheKeys';
import { PreloadResult } from './types';

const cache = new CacheManager();

export const preloadCompanyData = async (companyId: string): Promise<PreloadResult> => {
  try {
    // 통합 엔드포인트로 한 번에 회사 데이터 로딩
    const response = await api('GET', '/api/app-init/user-essentials'); // 서버에서 userType에 따라 분기 처리
    
    if (!response.success) {
      throw new Error(response.error || '회사 데이터 로딩 실패');
    }

    const companyData = response.data;
    const hasEssentialData = companyData.profile;

    // 개별 데이터 캐싱
    if (companyData.profile) {
      await cache.set(`${CACHE_KEYS.COMPANY_PROFILE}${companyId}`, companyData.profile, 60 * 60 * 1000);
    }
    
    if (companyData.keywords) {
      await cache.set(`${CACHE_KEYS.COMPANY_KEYWORDS}${companyId}`, companyData.keywords, 60 * 60 * 1000);
    }

    return {
      success: true,
      canProceed: hasEssentialData,
      data: {
        profile: companyData.profile,
        companyKeywords: companyData.keywords || [],
        activeJobPostings: companyData.recentActivity?.jobPostings || []
      }
    };

  } catch (error) {
    console.error('회사 데이터 프리로딩 실패:', error);
    
    // 캐시된 데이터로 폴백 시도
    const fallbackData = await getFallbackCompanyData(companyId);
    if (fallbackData.profile) {
      return {
        success: false,
        canProceed: true,
        data: fallbackData,
        errors: [{ 
          operation: 'preloadCompanyData', 
          message: '캐시된 데이터를 사용합니다.' 
        }]
      };
    }
    
    return {
      success: false,
      canProceed: false,
      errors: [{ 
        operation: 'preloadCompanyData', 
        message: error instanceof Error ? error.message : '회사 데이터 로딩 실패' 
      }]
    };
  }
};

// 캐시된 데이터로 폴백
const getFallbackCompanyData = async (companyId: string) => {
  const fallback: any = {};
  
  try {
    const cachedProfile = await cache.get(`${CACHE_KEYS.COMPANY_PROFILE}${companyId}`, true);
    if (cachedProfile) {
      fallback.profile = cachedProfile;
    }
    
    const cachedKeywords = await cache.get(`${CACHE_KEYS.COMPANY_KEYWORDS}${companyId}`, true);
    if (cachedKeywords) {
      fallback.companyKeywords = cachedKeywords;
    }
  } catch (error) {
    console.warn('폴백 데이터 조회 실패:', error);
  }
  
  return fallback;
};
```

## 💾 캐싱 시스템

### 1. AsyncStorage 캐시 매니저

```typescript
// lib/cache/AsyncStorageCache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('캐시 저장 실패:', key, error);
    }
  }

  async get<T>(key: string, allowExpired: boolean = false): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;

      if (isExpired && !allowExpired) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('캐시 조회 실패:', key, error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('캐시 삭제 실패:', key, error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('캐시 전체 삭제 실패:', error);
    }
  }

  async getSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      return cacheKeys.length;
    } catch (error) {
      console.warn('캐시 크기 조회 실패:', error);
      return 0;
    }
  }
}
```

### 2. 캐시 키 관리

```typescript
// lib/cache/CacheKeys.ts
export const CACHE_KEYS = {
  // 공통 데이터
  KEYWORDS: 'cache:keywords:all',
  APP_CONFIG: 'cache:app:config',
  
  // 사용자별 데이터
  USER_PROFILE: 'cache:profile:user:',
  USER_KEYWORDS: 'cache:keywords:user:',
  USER_APPLICATIONS: 'cache:applications:user:',
  
  // 회사별 데이터
  COMPANY_PROFILE: 'cache:profile:company:',
  COMPANY_KEYWORDS: 'cache:keywords:company:',
  COMPANY_JOB_POSTINGS: 'cache:jobpostings:company:',
  
  // 임시 데이터
  TEMP_DATA: 'cache:temp:',
  
  // 버전 정보
  DATA_VERSION: 'cache:version:data'
} as const;

// 캐시 TTL 설정 (밀리초)
export const CACHE_TTL = {
  KEYWORDS: 24 * 60 * 60 * 1000,      // 24시간
  USER_PROFILE: 60 * 60 * 1000,       // 1시간
  USER_KEYWORDS: 60 * 60 * 1000,      // 1시간
  JOB_POSTINGS: 30 * 60 * 1000,       // 30분
  APP_CONFIG: 6 * 60 * 60 * 1000,     // 6시간
  TEMP_DATA: 10 * 60 * 1000           // 10분
} as const;
```

## 🎨 타입 정의

```typescript
// lib/preloader/types.ts
export interface PreloadResult {
  success: boolean;
  canProceed: boolean;
  data?: Record<string, any>;
  errors?: PreloadError[];
}

export interface PreloadError {
  operation: string;
  message: string;
  code?: string;
}

export type ProgressCallback = (progress: number, operation: string) => void;

export interface AppInitializationData {
  keywords?: any[];
  keywordsByCategory?: Record<string, any[]>;
  profile?: any;
  userKeywords?: any[];
  companyKeywords?: any[];
  recentApplications?: any[];
  activeJobPostings?: any[];
  appConfig?: any;
}
```

## 🔧 _layout.tsx 통합

```typescript
// app/_layout.tsx 수정
import {Stack} from "expo-router";
import "./global.css"
import {AuthProvider} from "@/contexts/AuthContext";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {TranslationProvider} from "@/contexts/TranslationContext";
import {NotificationProvider} from "@/contexts/NotificationContext";
import {TabBarProvider} from "@/contexts/TabBarContext";
import {UpdateManager} from "@/components/shared/update-manager";
import {AppInitializer} from "@/components/app-initializer/AppInitializer"; // 추가

export default function RootLayout() {
  return (
      <UpdateManager>
          <TranslationProvider>
                <AuthProvider>
                    <AppInitializer> {/* 추가 */}
                        <NotificationProvider>
                            <TabBarProvider>
                                <SafeAreaProvider>
                                    <Stack
                                        screenOptions={{
                                            headerShown: false,
                                        }}
                                    />
                                </SafeAreaProvider>
                            </TabBarProvider>
                        </NotificationProvider>
                    </AppInitializer> {/* 추가 */}
                </AuthProvider>
          </TranslationProvider>
      </UpdateManager>
  )
}
```

## 🎯 사용 방법

### 커스텀 훅 활용

```typescript
// hooks/useAppInitialization.ts
import { useContext, createContext } from 'react';

interface AppInitializationContextType {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  cachedData: any;
  retryInitialization: () => void;
}

export const AppInitializationContext = createContext<AppInitializationContextType | undefined>(undefined);

export const useAppInitialization = () => {
  const context = useContext(AppInitializationContext);
  if (!context) {
    throw new Error('useAppInitialization must be used within AppInitializer');
  }
  return context;
};
```

### 개발 모드 디버깅

```typescript
// 개발 모드에서만 초기화 상태 로깅
if (__DEV__) {
  console.log('초기화 진행률:', progress);
  console.log('현재 작업:', currentOperation);
  console.log('캐시 히트:', cacheHits);
  console.log('네트워크 요청 수:', networkRequests);
}
```

이 구현을 통해 kgency 앱은 시작 시 필요한 모든 데이터를 효율적으로 프리로딩하여 사용자에게 훨씬 더 빠른 경험을 제공할 수 있습니다.