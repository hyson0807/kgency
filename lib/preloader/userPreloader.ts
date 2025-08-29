import { api } from '@/lib/api';
import { CacheManager } from '@/lib/cache/AsyncStorageCache';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache/CacheKeys';
import { PreloadResult } from './types';

const cache = new CacheManager();

export const preloadUserProfile = async (userId: string): Promise<PreloadResult> => {
  try {
    // 프로파일 데이터만 로딩
    const response = await api('GET', '/api/profiles');
    
    if (!response.success) {
      throw new Error(response.error || '사용자 프로파일 로딩 실패');
    }

    const profile = response.data;
    
    // 프로파일 데이터 캐싱
    if (profile) {
      await cache.set(`${CACHE_KEYS.USER_PROFILE}${userId}`, profile, CACHE_TTL.USER_PROFILE);
    }

    return {
      success: true,
      canProceed: !!profile,
      data: {
        profile: profile
      }
    };

  } catch (error) {
    console.error('사용자 프로파일 프리로딩 실패:', error);
    
    // 캐시된 프로파일 데이터로 폴백 시도
    const cachedProfile = await cache.get(`${CACHE_KEYS.USER_PROFILE}${userId}`, true); // 만료된 캐시도 허용
    if (cachedProfile) {
      return {
        success: false,
        canProceed: true,
        data: { profile: cachedProfile },
        errors: [{ 
          operation: 'preloadUserProfile', 
          message: '캐시된 프로파일 데이터를 사용합니다.' 
        }]
      };
    }
    
    return {
      success: false,
      canProceed: false,
      errors: [{ 
        operation: 'preloadUserProfile', 
        message: error instanceof Error ? error.message : '사용자 프로파일 로딩 실패' 
      }]
    };
  }
};




