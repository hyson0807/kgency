import { api } from '@/lib/api';
import { CacheManager } from '@/lib/cache/AsyncStorageCache';
import { CACHE_KEYS, CACHE_TTL } from '@/lib/cache/CacheKeys';
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

    const keywords = response.data;

    // 3. 캐시에 저장 (24시간)
    await cache.set(CACHE_KEYS.KEYWORDS, keywords, CACHE_TTL.KEYWORDS);

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