import { api } from '@/lib/api';
import { CacheManager } from '@/lib/cache/AsyncStorageCache';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache/CacheKeys';
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
    const hasEssentialData = !!companyData.profile;

    // 개별 데이터 캐싱
    if (companyData.profile) {
      await cache.set(`${CACHE_KEYS.COMPANY_PROFILE}${companyId}`, companyData.profile, CACHE_TTL.USER_PROFILE);
    }
    
    if (companyData.companyKeywords) {
      await cache.set(`${CACHE_KEYS.COMPANY_KEYWORDS}${companyId}`, companyData.companyKeywords, CACHE_TTL.USER_KEYWORDS);
    }

    return {
      success: true,
      canProceed: hasEssentialData,
      data: {
        profile: companyData.profile,
        companyKeywords: companyData.companyKeywords || [],
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

    const cachedJobs = await cache.get(`${CACHE_KEYS.COMPANY_JOB_POSTINGS}${companyId}`, true);
    if (cachedJobs) {
      fallback.activeJobPostings = cachedJobs;
    }
  } catch (error) {
    console.warn('폴백 데이터 조회 실패:', error);
  }
  
  return fallback;
};