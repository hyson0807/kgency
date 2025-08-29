import React from 'react';
import { User } from '@/contexts/AuthContext';
import { preloadKeywords } from './keywordPreloader';
import { preloadUserData } from './userPreloader';
import { preloadCompanyData } from './companyPreloader';
import { PreloadResult, ProgressCallback } from './types';
import { offlineManager } from '@/lib/offline/OfflineManager';

export const preloadAppData = async (
  user: User,
  onProgress?: ProgressCallback
): Promise<PreloadResult> => {
  const isOffline = offlineManager.isOffline();
  
  try {
    console.log(`🚀 앱 데이터 프리로딩 시작: ${user.userType}(${user.userId}) - ${isOffline ? '오프라인' : '온라인'} 모드`);
    
    // 오프라인 모드인 경우 캐시된 데이터 확인
    if (isOffline) {
      return await handleOfflinePreload(user, onProgress);
    }
    
    const results: PreloadResult[] = [];
    let totalProgress = 10;

    // 1. 키워드 마스터 데이터 (모든 사용자 공통)
    onProgress?.(totalProgress, '키워드 데이터 로딩 중...');
    const keywordResult = await preloadKeywords();
    results.push(keywordResult);
    totalProgress = 40;

    // 2. 사용자 타입별 데이터
    onProgress?.(totalProgress, '사용자 데이터 로딩 중...');
    
    let userDataResult: PreloadResult;
    if (user.userType === 'user') {
      userDataResult = await preloadUserData(user.userId);
    } else {
      userDataResult = await preloadCompanyData(user.userId);
    }
    
    results.push(userDataResult);
    totalProgress = 70;

    // 3. 오프라인 데이터 저장 (온라인 모드에서만)
    onProgress?.(totalProgress, '오프라인 데이터 저장 중...');
    try {
      const combinedData = results.reduce((acc, result) => ({ ...acc, ...result.data }), {});
      await offlineManager.saveOfflineData(user.userId, user.userType, combinedData);
      console.log('💾 오프라인 데이터 저장 완료');
    } catch (offlineError) {
      console.warn('오프라인 데이터 저장 실패:', offlineError);
    }
    totalProgress = 80;

    // 4. 푸시 토큰 등록 (백그라운드 - 선택사항)
    onProgress?.(totalProgress, '푸시 알림 설정 중...');
    try {
      // 푸시 토큰 등록 로직은 나중에 추가
      console.log('푸시 토큰 등록 스킵됨');
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

    const finalResult = {
      success: allSuccess,
      canProceed: hasEssentialData,
      data: results.reduce((acc, result) => ({ ...acc, ...result.data }), {}),
      errors: allErrors.length > 0 ? allErrors : undefined,
      isOfflineMode: false,
      networkStatus: offlineManager.getNetworkStatus()
    };
    
    console.log(`✅ 온라인 프리로딩 완료: 성공=${allSuccess}, 진행가능=${hasEssentialData}`);
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
  const availability = await offlineManager.checkOfflineAvailability(user.userId, user.userType);
  
  if (!availability.available) {
    console.warn('오프라인 데이터 부족:', availability.reason);
    
    return {
      success: false,
      canProceed: false,
      errors: [{
        operation: 'offlinePreload',
        message: availability.reason,
        recommendation: availability.recommendation
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