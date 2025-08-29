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

    // 3. 푸시 토큰 등록 (백그라운드 - 선택사항)
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

export * from './types';