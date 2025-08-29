import { api } from '@/lib/api';
import { CacheManager } from '@/lib/cache/AsyncStorageCache';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache/CacheKeys';
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
    const hasEssentialData = userData.profile && userData.selectedKeywords;

    // 개별 데이터 캐싱 (향후 빠른 접근을 위해)
    if (userData.profile) {
      await cache.set(`${CACHE_KEYS.USER_PROFILE}${userId}`, userData.profile, CACHE_TTL.USER_PROFILE);
    }
    
    if (userData.selectedKeywords) {
      await cache.set(`${CACHE_KEYS.USER_KEYWORDS}${userId}`, userData.selectedKeywords, CACHE_TTL.USER_KEYWORDS);
    }

    return {
      success: true,
      canProceed: hasEssentialData,
      data: {
        profile: userData.profile,
        userKeywords: userData.selectedKeywords || [],
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