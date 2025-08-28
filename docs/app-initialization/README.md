# 앱 초기화 시스템 설계 문서

이 문서는 kgency 모바일 앱의 초기화 시스템 구현을 위한 완전한 설계 및 구현 가이드입니다.

## 📋 목차

1. [개요](#개요)
2. [현재 상황 분석](#현재-상황-분석)
3. [데이터 로딩 요구사항](#데이터-로딩-요구사항)
4. [아키텍처 설계](#아키텍처-설계)
5. [구현 계획](#구현-계획)
6. [서버 엔드포인트 설계](#서버-엔드포인트-설계)
7. [성능 최적화 전략](#성능-최적화-전략)
8. [에러 처리 및 안정성](#에러-처리-및-안정성)
9. [구현 우선순위](#구현-우선순위)

## 개요

### 문제 정의
현재 kgency 앱은 사용자가 홈 화면에 도착한 후에 데이터를 로딩하기 시작하여, 사용자가 빈 화면이나 로딩 상태를 오래 기다리는 문제가 있습니다.

### 목표
- **사용자 경험 향상**: 홈 화면 도달 시 이미 핵심 데이터가 준비된 상태
- **네트워크 최적화**: 병렬 로딩과 캐싱을 통한 효율적인 데이터 가져오기
- **안정성 확보**: 네트워크 오류나 부분 실패에 대한 견고한 처리
- **확장성**: 새로운 데이터 요구사항을 쉽게 추가할 수 있는 구조

## 현재 상황 분석

### 기존 초기화 흐름
```
앱 시작 → UpdateManager → AuthContext 초기화 → 각 화면별 개별 데이터 로딩
```

### 서버 중심 데이터 아키텍처
kgency는 서버 API를 통해서만 데이터베이스에 접근하는 구조를 사용합니다:

#### 서버 API 사용 (lib/api.ts)
- **모든 데이터베이스 접근**: 서버를 통해서만 DB 조회/수정
- **인증 관리**: OTP 전송/검증, JWT 토큰 관리
- **프로필 관리**: 사용자/회사 프로필 CRUD
- **키워드 관리**: 사용자/회사 키워드 CRUD
- **지원 관리**: 지원 현황, 면접 스케줄링
- **메시지 시스템**: 사용자-회사 간 커뮤니케이션

## 데이터 로딩 요구사항

### 1. 필수 로딩 데이터 (스플래시 화면 중)

#### 공통 데이터
- **키워드 마스터 데이터**: 전체 키워드 목록 (카테고리별)
- **앱 설정**: 기능 플래그, 알림 설정
- **인증 상태 검증**: 토큰 유효성 확인

#### Job Seeker (user) 타입별 데이터
- 사용자 프로필 정보
- 선택한 키워드 목록
- 최근 지원 현황 (최대 5개)
- 푸시 토큰 등록

#### Company (company) 타입별 데이터
- 회사 프로필 정보
- 회사 키워드 선호도
- 활성 직무 공고 수
- 푸시 토큰 등록

### 2. 백그라운드 로딩 데이터 (홈 화면 진입 후)

#### Job Seeker 홈화면
- 매칭된 직무 공고 목록
- 전체 지원 현황
- 면접 일정 알림

#### Company 홈화면
- 지원자 목록
- 직무 공고별 지원 현황
- 면접 스케줄 관리

## 아키텍처 설계

### 전체 구조
```
app/_layout.tsx
├── UpdateManager (기존 Expo 업데이트)
└── AppInitializer (신규 초기화 시스템)
    ├── PreloadManager (데이터 로딩 관리)
    ├── CacheManager (캐싱 시스템)  
    └── InitializationScreen (로딩 UI)
```

### 핵심 컴포넌트

#### AppInitializer
- UpdateManager 완료 후 실행
- 사용자 타입별 초기화 로직 분기
- 에러 처리 및 재시도 메커니즘
- 초기화 진행 상태 관리

#### PreloadManager
- 병렬 데이터 로딩 조율
- 우선순위 기반 로딩 스케줄링
- 사용자 타입별 맞춤 데이터 수집

#### CacheManager
- AsyncStorage 기반 로컬 캐싱
- TTL(Time To Live) 기반 캐시 무효화
- 캐시 히트율 및 성능 모니터링

## 구현 계획

### 파일 구조
```
/components/app-initializer/
├── AppInitializer.tsx          # 메인 초기화 컴포넌트
├── InitializationScreen.tsx    # 로딩 UI 컴포넌트
└── ErrorBoundary.tsx          # 초기화 에러 처리

/lib/preloader/
├── keywordPreloader.ts        # 키워드 마스터 데이터
├── userPreloader.ts          # 사용자별 데이터
├── companyPreloader.ts       # 회사별 데이터
├── types.ts                  # 타입 정의
└── index.ts                 # 통합 API

/lib/cache/
├── AsyncStorageCache.ts      # 캐시 매니저
├── CacheStrategy.ts         # 캐싱 전략 로직
└── CacheKeys.ts            # 캐시 키 관리

/hooks/
└── useAppInitialization.ts  # 초기화 커스텀 훅
```

### 단계별 로딩 전략

#### Phase 1: 필수 데이터 (스플래시 중)
```typescript
const essentialData = await Promise.all([
  preloadKeywords(),           // 키워드 마스터 데이터
  validateAuthState(),         // 인증 상태 검증
  preloadUserProfile(),        // 기본 프로필 정보
  registerPushToken()          // 푸시 알림 등록
]);
```

#### Phase 2: 맞춤 데이터 (백그라운드)
```typescript
const customizedData = await Promise.all([
  preloadUserKeywords(),       // 사용자별 키워드
  preloadRecentActivity(),     // 최근 활동 데이터
  preloadAppConfig()           // 앱 설정 및 기능 플래그
]);
```

#### Phase 3: 홈화면 데이터 (화면 진입 후)
```typescript
const homeScreenData = userType === 'user' 
  ? await preloadUserHomeData()    // 매칭 직무, 지원 현황
  : await preloadCompanyHomeData() // 지원자 목록, 공고 현황
```

### 캐싱 전략

#### 캐시 레이어 구조
```typescript
Level 1: 메모리 캐시 (React State/Context)
Level 2: AsyncStorage (앱 재시작 간 유지)  
Level 3: 네트워크 (서버 최신 데이터)
```

#### TTL 설정
```typescript
const CACHE_TTL = {
  KEYWORDS: 24 * 60 * 60 * 1000,      // 24시간
  USER_PROFILE: 60 * 60 * 1000,       // 1시간
  JOB_POSTINGS: 30 * 60 * 1000,       // 30분
  APP_CONFIG: 6 * 60 * 60 * 1000      // 6시간
};
```

## 서버 엔드포인트 설계

### 새로운 초기화 전용 엔드포인트

#### 파일 구조 (서버)
```javascript
kgency_server/src/
├── controllers/appInit.controller.js  # 초기화 컨트롤러
├── routes/appInit.routes.js           # 초기화 라우트
├── services/appInit.service.js        # 초기화 서비스 로직
└── utils/dataAggregator.js           # 데이터 집계 유틸
```

### 핵심 엔드포인트

#### 1. 통합 초기화 엔드포인트
```javascript
GET /api/app-init/bootstrap

Response Structure:
{
  success: true,
  data: {
    keywords: {
      byCategory: {
        country: [...],
        job: [...],
        condition: [...],
        location: [...],
        visa: [...],
        workDay: [...],
        koreanLevel: [...],
        gender: [...],
        age: [...],
        moveable: [...]
      },
      version: "1.0.1"
    },
    userEssentials: {
      profile: {
        id: "user-uuid",
        name: "사용자명",
        user_type: "user",
        onboarding_completed: true,
        // ... 기타 프로필 정보
      },
      selectedKeywords: [
        {
          keyword_id: 1,
          keyword: {
            id: 1,
            keyword: "한국",
            category: "country"
          }
        },
        // ... 더 많은 키워드
      ],
      recentActivity: {
        applicationCount: 5,
        interviewCount: 2,
        newMessageCount: 1
      }
    },
    config: {
      features: {
        instantInterview: true,
        yatra: true,
        notifications: true
      },
      notifications: {
        enabled: true,
        types: ["application", "interview", "message"]
      }
    }
  },
  meta: {
    version: "app-data-v1.2.3",
    cachedAt: "2025-01-15T10:30:00Z",
    ttl: 3600
  }
}
```

#### 2. 키워드 전용 엔드포인트
```javascript
GET /api/app-init/keywords

Response:
{
  success: true,
  data: {
    keywords: [...],
    version: "keywords-v1.0.1",
    lastUpdated: "2025-01-15T10:00:00Z"
  }
}
```

#### 3. 사용자별 필수 데이터
```javascript
GET /api/app-init/user-essentials

Response:
{
  success: true,
  data: {
    profile: {...},
    keywords: [...],
    recentActivity: {...},
    settings: {...}
  }
}
```

### 서버 구현 로직

#### appInit.controller.js
```javascript
const getBootstrapData = async (req, res) => {
  try {
    const { userType, userId } = req.user;
    
    // 병렬로 필수 데이터 수집
    const [keywords, userEssentials, appConfig] = await Promise.all([
      keywordService.getAllKeywordsWithCache(),
      userService.getUserEssentials(userId, userType),
      configService.getAppConfig()
    ]);
    
    res.json({
      success: true,
      data: {
        keywords,
        userEssentials,
        config: appConfig
      },
      meta: {
        version: getDataVersion(),
        cachedAt: new Date().toISOString(),
        ttl: 3600
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '초기화 데이터를 불러오는데 실패했습니다.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
```

#### appInit.service.js
```javascript
const getUserEssentials = async (userId, userType) => {
  try {
    if (userType === 'user') {
      return await getUserBootstrapData(userId);
    } else if (userType === 'company') {
      return await getCompanyBootstrapData(userId);
    }
  } catch (error) {
    throw new Error(`사용자 필수 데이터 로딩 실패: ${error.message}`);
  }
};

const getUserBootstrapData = async (userId) => {
  const [profile, keywords, recentApps] = await Promise.all([
    profileService.getProfileWithCache(userId),
    keywordService.getUserKeywords(userId),
    applicationService.getRecentApplications(userId, 5)
  ]);
  
  return {
    profile,
    keywords,
    recentActivity: {
      applicationCount: recentApps.length,
      // ... 기타 활동 데이터
    }
  };
};

const getCompanyBootstrapData = async (companyId) => {
  const [profile, keywords, jobPostings] = await Promise.all([
    profileService.getProfileWithCache(companyId),
    keywordService.getCompanyKeywords(companyId),
    jobPostingService.getActiveJobPostings(companyId, 10)
  ]);
  
  return {
    profile,
    keywords,
    recentActivity: {
      activeJobPostings: jobPostings.length,
      // ... 기타 활동 데이터
    }
  };
};
```

### 캐싱 전략 (서버 사이드)

#### Redis 캐싱 도입
```javascript
const redis = require('redis');
const client = redis.createClient();

const CACHE_KEYS = {
  KEYWORDS_ALL: 'keywords:all',
  USER_PROFILE: 'profile:user:',
  COMPANY_PROFILE: 'profile:company:',
  APP_CONFIG: 'config:app',
  USER_KEYWORDS: 'keywords:user:'
};

const CACHE_TTL = {
  KEYWORDS: 86400,        // 24시간
  PROFILE: 3600,          // 1시간
  APP_CONFIG: 21600,      // 6시간
  USER_KEYWORDS: 3600     // 1시간
};

// 키워드 마스터 데이터 캐싱
const getAllKeywordsWithCache = async () => {
  const cached = await client.get(CACHE_KEYS.KEYWORDS_ALL);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const keywords = await getKeywordsFromDB();
  await client.setex(
    CACHE_KEYS.KEYWORDS_ALL, 
    CACHE_TTL.KEYWORDS, 
    JSON.stringify(keywords)
  );
  
  return keywords;
};

// 캐시 무효화
const invalidateUserCache = async (userId) => {
  await Promise.all([
    client.del(`${CACHE_KEYS.USER_PROFILE}${userId}`),
    client.del(`${CACHE_KEYS.USER_KEYWORDS}${userId}`)
  ]);
};
```

## 성능 최적화 전략

### 1. 로딩 최적화
- **병렬 로딩**: Promise.all을 사용한 동시 데이터 요청
- **우선순위 기반**: 필수 데이터 우선 로딩 후 부가 데이터
- **청크 로딩**: 큰 데이터셋의 점진적 로딩
- **메모리 관리**: 불필요한 데이터 조기 해제

### 2. 네트워크 최적화
- **응답 압축**: gzip 압축 적용
- **필드 선택**: 필요한 컬럼만 조회 (SELECT specific fields)
- **배치 쿼리**: JOIN을 활용한 단일 쿼리로 관련 데이터 일괄 조회
- **HTTP/2**: Keep-alive 연결 활용

### 3. 캐싱 최적화
- **다층 캐싱**: 메모리 → AsyncStorage → 네트워크
- **캐시 워밍**: 자주 사용되는 데이터 사전 로딩
- **지능형 무효화**: 데이터 변경 시 관련 캐시만 선택적 무효화

## 에러 처리 및 안정성

### 1. 부분 실패 대응
```typescript
const safeBootstrap = async () => {
  const results = await Promise.allSettled([
    preloadKeywords(),
    preloadUserProfile(),
    preloadRecentActivity()
  ]);
  
  const successfulData = {};
  const errors = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successfulData[DATA_KEYS[index]] = result.value;
    } else {
      errors.push({
        operation: DATA_KEYS[index],
        error: result.reason.message
      });
    }
  });
  
  // 중요한 데이터가 로딩되었는지 확인
  const hasEssentialData = successfulData.keywords && successfulData.profile;
  
  return {
    data: successfulData,
    errors,
    canProceed: hasEssentialData
  };
};
```

### 2. 재시도 메커니즘
```typescript
const retryWithBackoff = async (fn, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, i) * 1000)
        );
      }
    }
  }
  
  throw lastError;
};
```

### 3. 오프라인 모드
```typescript
const handleOfflineMode = async () => {
  const cachedData = await getCachedEssentialData();
  
  if (cachedData.keywords && cachedData.profile) {
    return {
      data: cachedData,
      isOfflineMode: true,
      message: '오프라인 모드로 실행됩니다.'
    };
  }
  
  throw new Error('오프라인 상태에서 필요한 데이터가 없습니다.');
};
```

### 4. 타임아웃 처리
```typescript
const withTimeout = (promise, timeoutMs = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]);
};
```

## 구현 우선순위

### Phase 1: 기본 인프라 구축 (1-2주)
1. **AppInitializer 컴포넌트 생성**
   - 기본 초기화 플로우 구현
   - 로딩 상태 UI 구현
   - 에러 처리 기본 구조

2. **서버 엔드포인트 구현**
   - `/api/app-init/bootstrap` 엔드포인트
   - 기존 데이터 서비스와 통합
   - 기본적인 에러 처리

3. **프론트엔드 통합**
   - `_layout.tsx`에 AppInitializer 적용
   - 기존 AuthContext와 연동
   - 기본 캐싱 구현

### Phase 2: 데이터 로딩 최적화 (2-3주)
1. **데이터 프리로딩 서비스 구현**
   - 사용자 타입별 데이터 로딩 로직
   - 병렬 로딩 최적화
   - 우선순위 기반 로딩

2. **캐싱 시스템 개선**
   - AsyncStorage 기반 캐싱
   - TTL 및 캐시 무효화 로직
   - 캐시 히트율 모니터링

3. **성능 최적화**
   - 네트워크 요청 최적화
   - 메모리 사용량 최적화
   - 로딩 시간 측정 및 분석

### Phase 3: 고도화 및 안정성 (2-3주)
1. **서버 사이드 캐싱**
   - Redis 캐싱 시스템 도입
   - 캐시 무효화 전략 구현
   - 서버 부하 모니터링

2. **에러 처리 및 복구**
   - 부분 실패 대응 로직
   - 자동 재시도 메커니즘
   - 오프라인 모드 지원

3. **모니터링 및 분석**
   - 성능 메트릭 수집
   - 사용자 경험 분석
   - A/B 테스트 지원

### Phase 4: 최적화 및 확장성 (1-2주)
1. **고급 최적화**
   - 지능형 프리로딩
   - 사용자 패턴 기반 캐싱
   - 배경 새로고침

2. **개발자 도구**
   - 초기화 상태 디버깅 도구
   - 성능 분석 대시보드
   - 캐시 관리 도구

3. **문서화 및 테스트**
   - API 문서 업데이트
   - 단위 테스트 및 통합 테스트
   - 성능 벤치마크 설정

## 예상 효과

### 사용자 경험 개선
- **로딩 시간 단축**: 홈 화면 진입 시 대부분 데이터 준비 완료
- **네트워크 효율**: 중복 요청 제거 및 배치 처리
- **오프라인 지원**: 캐시된 데이터로 기본 기능 사용 가능

### 시스템 성능 향상
- **서버 부하 감소**: 캐싱을 통한 DB 쿼리 수 감소
- **네트워크 대역폭 절약**: 압축 및 필요한 데이터만 전송
- **안정성 향상**: 부분 실패에도 앱 기능 유지

### 개발 생산성 향상
- **모듈화**: 새로운 초기화 데이터 쉽게 추가
- **디버깅**: 초기화 과정 모니터링 및 분석 도구
- **유지보수**: 중앙화된 데이터 로딩 로직

이 설계를 통해 kgency 앱은 사용자에게 더 빠르고 안정적인 경험을 제공할 수 있으며, 동시에 시스템의 확장성과 유지보수성을 크게 향상시킬 수 있습니다.