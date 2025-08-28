# 백엔드 구현 가이드

앱 초기화 시스템의 백엔드 구현에 대한 상세 가이드입니다.

**중요**: 모든 데이터베이스 접근은 서버를 통해서만 이루어집니다. 프론트엔드에서 직접 Supabase에 접근하지 않으므로, 모든 비즈니스 로직과 데이터 처리는 서버에서 담당합니다.

## 📋 서버 파일 구조

```
kgency_server/src/
├── controllers/
│   └── appInit.controller.js      # 초기화 요청 처리
├── routes/
│   └── appInit.routes.js          # 초기화 라우팅
├── services/
│   └── appInit.service.js         # 초기화 비즈니스 로직
├── utils/
│   ├── dataAggregator.js          # 데이터 집계 유틸
│   └── cacheManager.js            # 서버 사이드 캐싱
└── middlewares/
    └── cacheMiddleware.js         # 캐시 미들웨어
```

## 🔧 핵심 구현

### 1. 라우트 설정 (appInit.routes.js)

```javascript
// src/routes/appInit.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const rateLimit = require('../middlewares/rateLimiter');
const cacheMiddleware = require('../middlewares/cacheMiddleware');
const appInitController = require('../controllers/appInit.controller');

// Rate limiting - 초기화 요청은 빈번하지 않으므로 엄격하게 설정
const initRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 최대 10번
  message: {
    success: false,
    error: '초기화 요청이 너무 빈번합니다. 잠시 후 다시 시도해주세요.'
  }
});

// 통합 초기화 엔드포인트
router.get('/bootstrap', 
  initRateLimit,
  auth, 
  appInitController.getBootstrapData
);

// 키워드 전용 엔드포인트 (캐싱 적용)
router.get('/keywords', 
  cacheMiddleware({ 
    ttl: 24 * 60 * 60, // 24시간 캐싱
    key: 'keywords:all' 
  }),
  appInitController.getKeywords
);

// 사용자별 필수 데이터
router.get('/user-essentials', 
  initRateLimit,
  auth, 
  appInitController.getUserEssentials
);

// 데이터 버전 체크
router.get('/version', 
  cacheMiddleware({ 
    ttl: 60 * 60, // 1시간 캐싱
    key: 'data:version' 
  }),
  appInitController.getDataVersion
);

// 헬스 체크
router.get('/health', appInitController.healthCheck);

module.exports = router;
```

### 2. 컨트롤러 구현 (appInit.controller.js)

```javascript
// src/controllers/appInit.controller.js
const appInitService = require('../services/appInit.service');

// 통합 초기화 데이터 제공
const getBootstrapData = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { userId, userType } = req.user;
    
    console.log(`[${userId}] 초기화 데이터 요청 시작 (${userType})`);
    
    // 메인 데이터 수집
    const bootstrapData = await appInitService.getBootstrapData(userId, userType);
    
    const responseTime = Date.now() - startTime;
    console.log(`[${userId}] 초기화 완료: ${responseTime}ms`);
    
    res.json({
      success: true,
      data: bootstrapData,
      meta: {
        version: appInitService.getDataVersion(),
        cachedAt: new Date().toISOString(),
        responseTime: responseTime,
        ttl: 3600 // 1시간
      }
    });
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('초기화 데이터 제공 실패:', error);
    
    // 부분 실패의 경우 사용 가능한 데이터라도 반환
    const fallbackData = await appInitService.getFallbackData(req.user?.userId, req.user?.userType);
    
    if (fallbackData && Object.keys(fallbackData).length > 0) {
      return res.json({
        success: false,
        data: fallbackData,
        errors: [{
          operation: 'getBootstrapData',
          message: '일부 데이터를 불러올 수 없어 캐시된 데이터를 사용합니다.',
          code: 'PARTIAL_FAILURE'
        }],
        meta: {
          version: appInitService.getDataVersion(),
          responseTime: responseTime,
          isFallback: true
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: '초기화 데이터를 불러오는데 실패했습니다.',
      meta: {
        responseTime: responseTime
      },
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 키워드 마스터 데이터
const getKeywords = async (req, res) => {
  try {
    const keywords = await appInitService.getAllKeywords();
    
    res.json({
      success: true,
      data: {
        keywords: keywords.data,
        byCategory: keywords.byCategory,
        version: keywords.version,
        lastUpdated: keywords.lastUpdated
      }
    });
    
  } catch (error) {
    console.error('키워드 데이터 제공 실패:', error);
    res.status(500).json({
      success: false,
      error: '키워드 데이터를 불러올 수 없습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 사용자별 필수 데이터
const getUserEssentials = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    const essentials = await appInitService.getUserEssentials(userId, userType);
    
    res.json({
      success: true,
      data: essentials
    });
    
  } catch (error) {
    console.error('사용자 필수 데이터 제공 실패:', error);
    res.status(500).json({
      success: false,
      error: '사용자 데이터를 불러올 수 없습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 데이터 버전 체크
const getDataVersion = async (req, res) => {
  try {
    const version = appInitService.getDataVersion();
    res.json({
      success: true,
      data: {
        version: version,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '버전 정보를 불러올 수 없습니다.'
    });
  }
};

// 헬스 체크
const healthCheck = async (req, res) => {
  try {
    const health = await appInitService.checkHealth();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: '서비스가 일시적으로 이용할 수 없습니다.'
    });
  }
};

module.exports = {
  getBootstrapData,
  getKeywords,
  getUserEssentials,
  getDataVersion,
  healthCheck
};
```

### 3. 서비스 로직 (appInit.service.js)

```javascript
// src/services/appInit.service.js
const { supabase } = require('../config/database');
const cacheManager = require('../utils/cacheManager');

// 메인 초기화 데이터 수집
const getBootstrapData = async (userId, userType) => {
  try {
    // 병렬로 필수 데이터 수집
    const [keywords, userEssentials, appConfig] = await Promise.all([
      getAllKeywords(),
      getUserEssentials(userId, userType),
      getAppConfig()
    ]);

    return {
      keywords: keywords,
      userEssentials: userEssentials,
      config: appConfig
    };
    
  } catch (error) {
    console.error('초기화 데이터 수집 실패:', error);
    throw new Error('초기화 데이터를 수집할 수 없습니다.');
  }
};

// 키워드 마스터 데이터 (캐싱 적용)
const getAllKeywords = async () => {
  const cacheKey = 'keywords:all';
  
  try {
    // 캐시 확인
    const cached = await cacheManager.get(cacheKey);
    if (cached) {
      console.log('키워드 캐시 히트');
      return cached;
    }

    console.log('키워드 DB에서 로딩');
    
    // DB에서 조회
    const { data: keywords, error } = await supabase
      .from('keyword')
      .select('*')
      .order('category', { ascending: true })
      .order('keyword', { ascending: true });

    if (error) throw error;

    // 카테고리별로 그룹화
    const byCategory = keywords.reduce((acc, keyword) => {
      if (!acc[keyword.category]) {
        acc[keyword.category] = [];
      }
      acc[keyword.category].push(keyword);
      return acc;
    }, {});

    const result = {
      data: keywords,
      byCategory: byCategory,
      version: generateKeywordVersion(keywords),
      lastUpdated: new Date().toISOString()
    };

    // 캐시에 저장 (24시간)
    await cacheManager.set(cacheKey, result, 24 * 60 * 60);
    
    return result;
    
  } catch (error) {
    console.error('키워드 조회 실패:', error);
    throw new Error('키워드 데이터를 조회할 수 없습니다.');
  }
};

// 사용자별 필수 데이터
const getUserEssentials = async (userId, userType) => {
  try {
    if (userType === 'user') {
      return await getUserBootstrapData(userId);
    } else if (userType === 'company') {
      return await getCompanyBootstrapData(userId);
    } else {
      throw new Error('잘못된 사용자 타입입니다.');
    }
  } catch (error) {
    console.error('사용자 필수 데이터 수집 실패:', error);
    throw error;
  }
};

// 구직자 초기화 데이터
const getUserBootstrapData = async (userId) => {
  try {
    const [profile, keywords, recentApps, userInfo] = await Promise.allSettled([
      getUserProfile(userId),
      getUserKeywords(userId),
      getRecentApplications(userId, 5),
      getUserInfo(userId)
    ]);

    const result = {};
    
    // 프로필 (필수)
    if (profile.status === 'fulfilled') {
      result.profile = profile.value;
    } else {
      throw new Error('프로필 정보를 불러올 수 없습니다.');
    }

    // 사용자 키워드 (필수)
    if (keywords.status === 'fulfilled') {
      result.selectedKeywords = keywords.value;
    } else {
      console.warn('사용자 키워드 로딩 실패:', keywords.reason);
      result.selectedKeywords = [];
    }

    // 최근 지원 현황 (옵션)
    if (recentApps.status === 'fulfilled') {
      result.recentActivity = {
        applicationCount: recentApps.value.length,
        applications: recentApps.value
      };
    } else {
      result.recentActivity = { applicationCount: 0, applications: [] };
    }

    // 사용자 정보 (옵션)
    if (userInfo.status === 'fulfilled') {
      result.userInfo = userInfo.value;
    }

    return result;
    
  } catch (error) {
    console.error('구직자 데이터 수집 실패:', error);
    throw error;
  }
};

// 회사 초기화 데이터
const getCompanyBootstrapData = async (companyId) => {
  try {
    const [profile, keywords, jobPostings] = await Promise.allSettled([
      getCompanyProfile(companyId),
      getCompanyKeywords(companyId),
      getActiveJobPostings(companyId, 10)
    ]);

    const result = {};
    
    // 회사 프로필 (필수)
    if (profile.status === 'fulfilled') {
      result.profile = profile.value;
    } else {
      throw new Error('회사 프로필 정보를 불러올 수 없습니다.');
    }

    // 회사 키워드 (옵션)
    if (keywords.status === 'fulfilled') {
      result.companyKeywords = keywords.value;
    } else {
      console.warn('회사 키워드 로딩 실패:', keywords.reason);
      result.companyKeywords = [];
    }

    // 활성 직무 공고 (옵션)
    if (jobPostings.status === 'fulfilled') {
      result.recentActivity = {
        activeJobPostings: jobPostings.value.length,
        jobPostings: jobPostings.value
      };
    } else {
      result.recentActivity = { activeJobPostings: 0, jobPostings: [] };
    }

    return result;
    
  } catch (error) {
    console.error('회사 데이터 수집 실패:', error);
    throw error;
  }
};

// 개별 데이터 조회 함수들
const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      user_info (*)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

const getUserKeywords = async (userId) => {
  const { data, error } = await supabase
    .from('user_keyword')
    .select(`
      keyword_id,
      keyword:keyword_id (
        id,
        keyword,
        category
      )
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

const getRecentApplications = async (userId, limit) => {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      id,
      status,
      applied_at,
      job_posting:job_posting_id (
        id,
        title,
        company:company_id (
          id,
          name
        )
      )
    `)
    .eq('user_id', userId)
    .order('applied_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

const getUserInfo = async (userId) => {
  const { data, error } = await supabase
    .from('user_info')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // 데이터 없음 오류가 아닌 경우만
    throw error;
  }
  return data;
};

const getCompanyProfile = async (companyId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', companyId)
    .single();

  if (error) throw error;
  return data;
};

const getCompanyKeywords = async (companyId) => {
  const { data, error } = await supabase
    .from('company_keyword')
    .select(`
      keyword_id,
      keyword:keyword_id (
        id,
        keyword,
        category
      )
    `)
    .eq('company_id', companyId);

  if (error) throw error;
  return data || [];
};

const getActiveJobPostings = async (companyId, limit) => {
  const { data, error } = await supabase
    .from('job_postings')
    .select(`
      id,
      title,
      hiring_count,
      salary_range,
      created_at,
      is_active
    `)
    .eq('company_id', companyId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
};

// 앱 설정 정보
const getAppConfig = async () => {
  return {
    features: {
      instantInterview: true,
      yatra: true,
      notifications: true,
      translation: true
    },
    notifications: {
      enabled: true,
      types: ['application', 'interview', 'message']
    },
    maintenance: {
      enabled: false,
      message: null
    }
  };
};

// 폴백 데이터 (캐시된 데이터)
const getFallbackData = async (userId, userType) => {
  try {
    const fallback = {};
    
    // 캐시된 키워드 데이터
    const cachedKeywords = await cacheManager.get('keywords:all', true); // 만료된 캐시도 허용
    if (cachedKeywords) {
      fallback.keywords = cachedKeywords;
    }

    // 캐시된 프로필 데이터
    const profileCacheKey = `profile:${userType}:${userId}`;
    const cachedProfile = await cacheManager.get(profileCacheKey, true);
    if (cachedProfile) {
      fallback.userEssentials = { profile: cachedProfile };
    }

    return fallback;
    
  } catch (error) {
    console.error('폴백 데이터 조회 실패:', error);
    return null;
  }
};

// 유틸리티 함수들
const generateKeywordVersion = (keywords) => {
  // 키워드 데이터의 해시값으로 버전 생성
  const hash = require('crypto')
    .createHash('md5')
    .update(JSON.stringify(keywords.map(k => k.id + k.keyword)))
    .digest('hex');
  return `keywords-${hash.substring(0, 8)}`;
};

const getDataVersion = () => {
  return `app-data-v${process.env.APP_VERSION || '1.0.0'}-${Date.now()}`;
};

const checkHealth = async () => {
  try {
    // DB 연결 확인
    const { error } = await supabase
      .from('keyword')
      .select('count(*)')
      .limit(1);
    
    if (error) throw error;

    return {
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error('데이터베이스 연결 실패');
  }
};

module.exports = {
  getBootstrapData,
  getAllKeywords,
  getUserEssentials,
  getFallbackData,
  getDataVersion,
  checkHealth
};
```

### 4. 캐시 매니저 (cacheManager.js)

```javascript
// src/utils/cacheManager.js
const redis = require('redis');

// Redis 클라이언트 설정
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0
});

client.on('error', (err) => {
  console.error('Redis 연결 오류:', err);
});

client.on('connect', () => {
  console.log('Redis 연결 성공');
});

// 메모리 폴백 캐시 (Redis 사용 불가능 시)
const memoryCache = new Map();

class CacheManager {
  constructor() {
    this.useRedis = process.env.NODE_ENV === 'production' && process.env.REDIS_HOST;
  }

  async set(key, data, ttlSeconds) {
    try {
      const serializedData = JSON.stringify(data);
      
      if (this.useRedis) {
        await client.setex(key, ttlSeconds, serializedData);
      } else {
        // 메모리 캐시 사용
        memoryCache.set(key, {
          data: serializedData,
          expiry: Date.now() + (ttlSeconds * 1000)
        });
        
        // 메모리 사용량 제한 (최대 100개)
        if (memoryCache.size > 100) {
          const firstKey = memoryCache.keys().next().value;
          memoryCache.delete(firstKey);
        }
      }
      
      console.log(`캐시 저장: ${key} (TTL: ${ttlSeconds}s)`);
    } catch (error) {
      console.warn('캐시 저장 실패:', key, error.message);
    }
  }

  async get(key, allowExpired = false) {
    try {
      let data = null;
      
      if (this.useRedis) {
        data = await client.get(key);
      } else {
        // 메모리 캐시 확인
        const cached = memoryCache.get(key);
        if (cached) {
          if (allowExpired || cached.expiry > Date.now()) {
            data = cached.data;
          } else {
            memoryCache.delete(key);
          }
        }
      }
      
      if (data) {
        console.log(`캐시 히트: ${key}`);
        return JSON.parse(data);
      }
      
      console.log(`캐시 미스: ${key}`);
      return null;
      
    } catch (error) {
      console.warn('캐시 조회 실패:', key, error.message);
      return null;
    }
  }

  async remove(key) {
    try {
      if (this.useRedis) {
        await client.del(key);
      } else {
        memoryCache.delete(key);
      }
      console.log(`캐시 삭제: ${key}`);
    } catch (error) {
      console.warn('캐시 삭제 실패:', key, error.message);
    }
  }

  async clear(pattern = '*') {
    try {
      if (this.useRedis) {
        const keys = await client.keys(pattern);
        if (keys.length > 0) {
          await client.del(keys);
        }
      } else {
        memoryCache.clear();
      }
      console.log(`캐시 전체 삭제: ${pattern}`);
    } catch (error) {
      console.warn('캐시 전체 삭제 실패:', error.message);
    }
  }

  async getStats() {
    try {
      if (this.useRedis) {
        const info = await client.info('memory');
        return { type: 'redis', info };
      } else {
        return { 
          type: 'memory', 
          size: memoryCache.size,
          keys: Array.from(memoryCache.keys())
        };
      }
    } catch (error) {
      return { error: error.message };
    }
  }
}

module.exports = new CacheManager();
```

### 5. 캐시 미들웨어 (cacheMiddleware.js)

```javascript
// src/middlewares/cacheMiddleware.js
const cacheManager = require('../utils/cacheManager');

const cacheMiddleware = (options = {}) => {
  const { 
    ttl = 3600, // 기본 1시간
    key,
    condition = () => true,
    skipCache = false
  } = options;

  return async (req, res, next) => {
    // 캐시 스킵 조건
    if (skipCache || req.query.nocache === 'true') {
      return next();
    }

    // 조건부 캐싱
    if (!condition(req)) {
      return next();
    }

    // 캐시 키 생성
    const cacheKey = key || `${req.method}:${req.path}:${JSON.stringify(req.query)}`;
    
    try {
      // 캐시된 응답 확인
      const cachedResponse = await cacheManager.get(cacheKey);
      
      if (cachedResponse) {
        console.log(`캐시에서 응답: ${cacheKey}`);
        
        // 캐시 헤더 추가
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`
        });
        
        return res.json(cachedResponse);
      }

      // 캐시 미스 - 응답을 가로채서 캐시에 저장
      const originalJson = res.json;
      res.json = function(data) {
        // 성공적인 응답만 캐시
        if (data && data.success !== false) {
          cacheManager.set(cacheKey, data, ttl).catch(err => {
            console.warn('응답 캐싱 실패:', err);
          });
        }
        
        // 캐시 헤더 추가
        res.set({
          'X-Cache': 'MISS',
          'X-Cache-Key': cacheKey,
          'Cache-Control': `public, max-age=${ttl}`
        });
        
        return originalJson.call(this, data);
      };

      next();
      
    } catch (error) {
      console.warn('캐시 미들웨어 오류:', error);
      next();
    }
  };
};

module.exports = cacheMiddleware;
```

### 6. 라우트 등록

```javascript
// src/routes/index.js 수정
const express = require('express');
const router = express.Router();

// 기존 라우트들...
const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
// ... 다른 라우트들

// 새로 추가: 앱 초기화 라우트
const appInitRoutes = require('./appInit.routes');

// 라우트 연결
router.use('/auth', authRoutes);
router.use('/profiles', profileRoutes);
// ... 기존 라우트들

// 앱 초기화 라우트 추가
router.use('/app-init', appInitRoutes);

module.exports = router;
```

## 🔧 캐싱 전략 상세

### 캐시 키 명명 규칙

```javascript
// 캐시 키 패턴
const CACHE_PATTERNS = {
  KEYWORDS: 'keywords:all',
  USER_PROFILE: 'profile:user:{userId}',
  COMPANY_PROFILE: 'profile:company:{companyId}',
  USER_KEYWORDS: 'keywords:user:{userId}',
  COMPANY_KEYWORDS: 'keywords:company:{companyId}',
  APPLICATIONS: 'apps:user:{userId}:recent',
  JOB_POSTINGS: 'jobs:company:{companyId}:active',
  APP_CONFIG: 'config:app',
  DATA_VERSION: 'version:data'
};

// TTL 설정
const CACHE_TTL = {
  KEYWORDS: 24 * 60 * 60,      // 24시간
  PROFILE: 60 * 60,            // 1시간
  USER_DATA: 30 * 60,          // 30분
  APP_CONFIG: 6 * 60 * 60,     // 6시간
  VERSION: 60 * 60             // 1시간
};
```

### 캐시 무효화 전략

```javascript
// 캐시 무효화 유틸리티
const invalidateUserCache = async (userId, userType) => {
  const keysToInvalidate = [
    `profile:${userType}:${userId}`,
    `keywords:${userType}:${userId}`,
  ];
  
  if (userType === 'user') {
    keysToInvalidate.push(`apps:user:${userId}:recent`);
  } else {
    keysToInvalidate.push(`jobs:company:${userId}:active`);
  }
  
  await Promise.all(keysToInvalidate.map(key => cacheManager.remove(key)));
};

// 키워드 변경 시 관련 캐시 무효화
const invalidateKeywordCache = async () => {
  await cacheManager.remove('keywords:all');
  await cacheManager.clear('keywords:user:*');
  await cacheManager.clear('keywords:company:*');
};
```

## 📊 모니터링 및 로깅

### 성능 메트릭 수집

```javascript
// 초기화 성능 측정
const collectMetrics = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { userId, userType } = req.user || {};
    
    console.log(`[METRICS] ${req.method} ${req.path}`, {
      duration: `${duration}ms`,
      userId,
      userType,
      cacheHit: res.get('X-Cache') === 'HIT',
      statusCode: res.statusCode
    });
    
    // 메트릭 수집 서비스로 전송 (선택사항)
    // metricsService.record('api_init_duration', duration, { userId, userType });
  });
  
  next();
};
```

### 에러 추적

```javascript
// 초기화 관련 에러 추적
const trackInitializationError = (error, context) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context: context,
    timestamp: new Date().toISOString()
  };
  
  console.error('[INIT_ERROR]', errorData);
  
  // 에러 추적 서비스로 전송 (예: Sentry)
  // Sentry.captureException(error, { extra: context });
};
```

## 🚀 배포 및 환경 설정

### 환경 변수 설정

```bash
# .env 파일 추가
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 캐시 설정
CACHE_ENABLED=true
CACHE_DEFAULT_TTL=3600

# 앱 버전
APP_VERSION=1.0.0
```

### PM2 설정 (프로덕션)

```javascript
// ecosystem.config.js 수정
module.exports = {
  apps: [{
    name: 'kgency-server',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      REDIS_HOST: 'localhost'
    },
    env_production: {
      NODE_ENV: 'production',
      REDIS_HOST: 'redis-server-host',
      CACHE_ENABLED: 'true'
    }
  }]
};
```

## 🧪 테스트

### 초기화 API 테스트

```javascript
// tests/appInit.test.js
const request = require('supertest');
const app = require('../src/app');

describe('App Initialization API', () => {
  let authToken;
  
  beforeAll(async () => {
    // 테스트 사용자 로그인
    const loginResponse = await request(app)
      .post('/api/auth/verify-otp')
      .send({ phone: 'test-phone', otp: '123456' });
    
    authToken = loginResponse.body.token;
  });

  describe('GET /api/app-init/bootstrap', () => {
    it('should return bootstrap data for authenticated user', async () => {
      const response = await request(app)
        .get('/api/app-init/bootstrap')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('keywords');
      expect(response.body.data).toHaveProperty('userEssentials');
      expect(response.body.data).toHaveProperty('config');
    });

    it('should return cached data on subsequent requests', async () => {
      const response1 = await request(app)
        .get('/api/app-init/bootstrap')
        .set('Authorization', `Bearer ${authToken}`);

      const response2 = await request(app)
        .get('/api/app-init/bootstrap')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response2.headers['x-cache']).toBe('HIT');
    });
  });

  describe('GET /api/app-init/keywords', () => {
    it('should return all keywords', async () => {
      const response = await request(app)
        .get('/api/app-init/keywords')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.keywords).toBeInstanceOf(Array);
      expect(response.body.data.byCategory).toBeInstanceOf(Object);
    });
  });
});
```

이 백엔드 구현을 통해 kgency 앱은 효율적이고 안정적인 초기화 시스템을 갖추게 되며, 사용자에게 빠른 앱 시작 경험을 제공할 수 있습니다.