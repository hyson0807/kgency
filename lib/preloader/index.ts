import React from 'react';
import { User } from '@/contexts/AuthContext';
import { preloadUserProfile } from './userPreloader';
import { preloadCompanyProfile } from './companyPreloader';
import { PreloadResult, ProgressCallback } from './types';
import { offlineManager } from '@/lib/offline/OfflineManager';

export const preloadAppData = async (
  user: User,
  onProgress?: ProgressCallback
): Promise<PreloadResult> => {
  // React Native 환경 체크
  const isReactNative = typeof window !== 'undefined' && !window.location;
  
  // 카카오톡 인앱 브라우저 감지 (웹 환경에서만)
  let isKakaoInApp = false;
  if (!isReactNative && typeof window !== 'undefined' && window.navigator?.userAgent) {
    try {
      const userAgent = window.navigator.userAgent.toLowerCase();
      isKakaoInApp = userAgent.includes('kakaotalk') || userAgent.includes('kakao');
    } catch (error) {
      // userAgent 접근 실패 시 무시
    }
  }
  
  // React Native와 카카오톡 인앱 브라우저에서는 오프라인 체크를 스킵
  const isOffline = (isReactNative || isKakaoInApp) ? false : offlineManager.isOffline();
  
  try {
    const platform = isReactNative ? ' (React Native)' : isKakaoInApp ? ' (카카오톡)' : '';
    console.log(`🚀 프로파일 데이터 프리로딩 시작: ${user.userType}(${user.userId || 'unknown'}) - ${isOffline ? '오프라인' : '온라인'} 모드${platform}`);
    
    // 오프라인 모드인 경우 캐시된 데이터 확인 (React Native와 카카오톡은 스킵)
    if (isOffline && !isReactNative && !isKakaoInApp) {
      return await handleOfflinePreload(user, onProgress);
    }
    
    let totalProgress = 20;
    onProgress?.(totalProgress, '프로파일 데이터 로딩 중...');

    // 사용자 타입별 프로파일 데이터만 로드
    let profileResult: PreloadResult;
    if (user.userType === 'user') {
      profileResult = await preloadUserProfile(user.userId || '');
    } else {
      profileResult = await preloadCompanyProfile(user.userId || '');
    }
    
    totalProgress = 60;

    // 오프라인 데이터 저장 (온라인 모드에서만)
    onProgress?.(totalProgress, '오프라인 데이터 저장 중...');
    try {
      if (profileResult.data) {
        await offlineManager.saveOfflineData(user.userId || '', user.userType, profileResult.data);
        console.log('💾 오프라인 프로파일 데이터 저장 완료');
      }
    } catch (offlineError) {
      console.warn('오프라인 데이터 저장 실패:', offlineError);
    }
    totalProgress = 90;

    onProgress?.(totalProgress, '초기화 완료 중...');

    const finalResult = {
      success: profileResult.success,
      canProceed: profileResult.canProceed && !!profileResult.data?.profile,
      data: profileResult.data,
      errors: profileResult.errors,
      isOfflineMode: false,
      networkStatus: offlineManager.getNetworkStatus()
    };
    
    console.log(`✅ 프로파일 프리로딩 완료: 성공=${profileResult.success}, 진행가능=${finalResult.canProceed}`);
    return finalResult;

  } catch (error) {
    console.error('앱 데이터 프리로딩 실패:', error);
    
    // 온라인 모드에서 실패 시 오프라인 데이터로 폴백 시도
    if (!isOffline) {
      console.log('🔄 온라인 실패, 오프라인 데이터로 폴백 시도...');
      try {
        return await handleOfflinePreload(user, onProgress, error);
      } catch (fallbackError) {
        console.error('오프라인 폴백도 실패:', fallbackError);
      }
    }
    
    return {
      success: false,
      canProceed: false,
      errors: [{ 
        operation: 'preloadAppData', 
        message: error instanceof Error ? error.message : '알 수 없는 오류' 
      }],
      isOfflineMode: isOffline,
      networkStatus: offlineManager.getNetworkStatus()
    };
  }
};

// 오프라인 모드 프리로딩 처리
const handleOfflinePreload = async (
  user: User, 
  onProgress?: ProgressCallback,
  originalError?: any
): Promise<PreloadResult> => {
  console.log('📱 오프라인 모드 프리로딩 시작...');
  
  onProgress?.(10, '오프라인 데이터 확인 중...');
  
  // 오프라인 데이터 가용성 확인
  const availability = await offlineManager.checkOfflineAvailability(user.userId || '', user.userType);
  
  if (!availability.available) {
    console.warn('오프라인 데이터 부족:', availability.reason);
    
    return {
      success: false,
      canProceed: false,
      errors: [{
        operation: 'offlinePreload',
        message: availability.reason || '오프라인 데이터를 사용할 수 없습니다.',
        recommendation: availability.recommendation || '인터넷 연결을 확인해주세요.'
      }],
      isOfflineMode: true,
      networkStatus: offlineManager.getNetworkStatus()
    };
  }
  
  onProgress?.(50, '캐시된 데이터 로딩 중...');
  
  const offlineData = availability.data!;
  const warnings = [];
  
  // 데이터 신선도 확인
  if (!availability.isDataFresh) {
    warnings.push({
      operation: 'dataFreshness',
      message: `데이터가 ${availability.hoursSinceSync}시간 전에 동기화되었습니다.`
    });
  }
  
  // 원본 에러가 있으면 추가
  if (originalError) {
    warnings.push({
      operation: 'networkFailure',
      message: `네트워크 오류로 인해 캐시된 데이터를 사용합니다: ${originalError.message}`
    });
  }
  
  onProgress?.(90, '오프라인 데이터 준비 완료');
  
  console.log(`📱 오프라인 데이터 로딩 완료: ${availability.hoursSinceSync}시간 전 동기화`);
  
  return {
    success: true,
    canProceed: true,
    data: offlineData,
    errors: warnings.length > 0 ? warnings : undefined,
    isOfflineMode: true,
    networkStatus: offlineManager.getNetworkStatus(),
    lastSync: availability.lastSync,
    hoursSinceSync: availability.hoursSinceSync
  };
};

// 오프라인 상태 모니터링 훅 (단순화됨)
export const useOfflineStatus = () => {
  const [networkStatus, setNetworkStatus] = React.useState(offlineManager.getNetworkStatus());
  
  React.useEffect(() => {
    const unsubscribe = offlineManager.onNetworkStatusChange(setNetworkStatus);
    return unsubscribe;
  }, []);
  
  return {
    isOffline: false, // 단순화: 기본적으로 온라인으로 가정
    networkStatus,
    offlineInfo: null // 오프라인 정보 비활성화
  };
};

export * from './types';