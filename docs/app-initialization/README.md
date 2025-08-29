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

## 데이터 로딩 요구사항 (최적화됨)

### 1. 필수 로딩 데이터 (스플래시 화면 중) - 프로필 중심

#### 공통 필수 데이터
- **인증 상태 검증**: JWT 토큰 유효성 확인
- **사용자/회사 프로필**: 기본 프로필 정보 및 온보딩 상태

#### Job Seeker (user) 프로필 데이터
- 기본 프로필: 이름, 전화번호, 온보딩 완료 상태, 구직 활성 상태
- 상세 프로필: user_info 테이블의 연령, 성별, 비자, 한국어 수준, 경력 등
- 프로필 이미지 URL (있는 경우)

#### Company (company) 프로필 데이터  
- 기본 프로필: 회사명, 전화번호, 주소, 설명
- 온보딩 완료 상태 및 계정 활성 상태
- 프로필 이미지 URL (있는 경우)

### 2. 온디맨드 로딩 데이터 (각 화면 진입 시 별도 로드)

#### 사용자별 데이터 (기존 hook 활용)
- **키워드**: useUserKeywords hook을 통한 개별 로딩
- **지원 내역**: useApplications hook을 통한 개별 로딩
- **매칭 직무**: 홈화면에서 별도 API 호출

#### 회사별 데이터 (기존 hook 활용)
- **키워드 선호도**: 별도 hook을 통한 개별 로딩
- **직무 공고**: myJobPostings 화면에서 개별 로딩
- **지원자 관리**: 별도 화면에서 개별 로딩

### 3. 개선된 전략의 장점
- **빠른 초기화**: 프로필 데이터만 로드하여 앱 시작 속도 개선
- **중복 제거**: 기존 hook들과의 중복 API 호출 완전 제거
- **캐시 활용**: preload된 프로필 데이터를 Context로 전역 활용
- **유연성**: 각 화면별 데이터는 필요 시점에 개별 로딩

## 아키텍처 설계

### 전체 구조 (최적화됨)
```
app/_layout.tsx
├── UpdateManager (기존 Expo 업데이트)
├── TranslationProvider
├── AuthProvider  
├── ProfileProvider (신규 - preload된 프로필 관리)
├── NotificationProvider
├── TabBarProvider
└── AppInitializer (프로필 중심 초기화)
    ├── ProfilePreloader (프로필 데이터만 로딩)
    ├── CacheManager (AsyncStorage 기반 캐싱)
    └── InitializationScreen (로딩 UI)
```

### 핵심 컴포넌트 (개선됨)

#### ProfileProvider (신규)
- preload된 프로필 데이터를 전역 상태로 관리
- useProfile hook과 연동하여 cache-first 전략 지원
- 프로필 업데이트 시 자동 동기화

#### AppInitializer (간소화됨)
- 프로필 데이터만 preload하여 앱 시작 속도 최적화
- preload 결과를 ProfileProvider에 저장
- 오프라인 모드 지원 및 에러 처리

#### useProfile Hook (개선됨)
- 먼저 ProfileProvider의 preload 데이터 확인
- 없을 경우에만 API 호출 (cache-first 전략)
- 중복 API 호출 완전 제거

#### CacheManager (유지)
- AsyncStorage 기반 로컬 캐싱
- TTL(Time To Live) 기반 캐시 무효화
- 프로필 데이터 캐싱 및 오프라인 지원

## 구현 계획

### 파일 구조 (최적화됨)
```
/components/app-initializer/
├── AppInitializer.tsx          # 프로필 중심 초기화 컴포넌트
├── InitializationScreen.tsx    # 로딩 UI 컴포넌트
├── SkeletonScreen.tsx         # 스켈레톤 UI 컴포넌트
└── ErrorBoundary.tsx          # 초기화 에러 처리

/contexts/
└── ProfileContext.tsx         # preload된 프로필 전역 상태 관리

/lib/preloader/
├── userPreloader.ts          # 사용자 프로필만 로딩
├── companyPreloader.ts       # 회사 프로필만 로딩  
├── types.ts                  # 타입 정의
└── index.ts                 # 통합 preload 함수

/lib/cache/
├── AsyncStorageCache.ts      # 캐시 매니저 클래스
└── CacheKeys.ts            # 캐시 키와 TTL 관리

/lib/offline/
└── OfflineManager.ts        # 오프라인 모드 지원

/hooks/
├── useProfile.ts           # 개선된 cache-first 전략
├── useUserKeywords.ts      # 키워드 개별 로딩 (기존)
└── useApplications.ts      # 지원내역 개별 로딩 (기존)
```

### 단계별 로딩 전략 (최적화됨)

#### Phase 1: 필수 프로필 데이터만 (스플래시 중)
```typescript
const profileData = user.userType === 'user' 
  ? await preloadUserProfile(user.userId)
  : await preloadCompanyProfile(user.userId);

// ProfileProvider에 저장하여 전역 활용
setPreloadedProfile(profileData.profile);
```

#### Phase 2: 화면별 개별 데이터 (필요시 로딩)
```typescript
// 각 화면에서 기존 hook 활용
const useProfile = () => {
  // 1. 먼저 preload된 데이터 확인
  if (preloadedProfile) return preloadedProfile;
  
  // 2. 없을 경우에만 API 호출
  return await fetchProfile();
};

// 키워드는 키워드 화면에서만 로딩
const { keywords, user_keywords } = useUserKeywords();

// 지원내역은 지원내역 화면에서만 로딩
const { applications } = useApplications({ user, activeFilter });
```

#### 개선된 전략의 핵심
- **단일 책임**: 초기화는 프로필만, 나머지는 개별 화면 담당
- **중복 제거**: 같은 데이터를 두 번 요청하는 문제 해결
- **빠른 시작**: 최소한의 데이터로 앱 시작 시간 단축

### 캐싱 전략 (최적화됨)

#### 프로필 중심 캐시 레이어
```typescript
Level 1: ProfileProvider Context (앱 실행 중 메모리)
Level 2: AsyncStorage (앱 재시작 간 유지)
Level 3: 네트워크 (서버 최신 데이터)
```

#### TTL 설정 (프로필 중심)
```typescript
const CACHE_TTL = {
  USER_PROFILE: 60 * 60 * 1000,       // 1시간 (자주 업데이트)
  COMPANY_PROFILE: 60 * 60 * 1000,    // 1시간
  OFFLINE_DATA: 7 * 24 * 60 * 60 * 1000, // 7일 (오프라인 지원)
  TEMP_DATA: 10 * 60 * 1000,          // 10분
  NETWORK_STATUS: 5 * 60 * 1000       // 5분
};
```

#### Cache-First 전략
```typescript
const useProfile = () => {
  const { preloadedProfile } = useProfileContext();
  
  // 1순위: Context에서 preload된 데이터
  if (preloadedProfile) return { profile: preloadedProfile, loading: false };
  
  // 2순위: AsyncStorage 캐시
  const cached = await cache.get(`profile:${userId}`);
  if (cached && !expired) return { profile: cached, loading: false };
  
  // 3순위: 서버 API 호출 (최후 수단)
  return await fetchFromServer();
};
```

## 서버 엔드포인트 설계 (최적화됨)

### 기존 엔드포인트 활용

#### 프로필 전용 엔드포인트 (기존)
현재 구현된 `/api/profiles` 엔드포인트를 그대로 활용:

```javascript
GET /api/profiles

Response:
{
  success: true,
  data: {
    // 사용자 기본 프로필
    id: "user-uuid",
    user_type: "user",
    name: "사용자명",
    phone_number: "010-1234-5678",
    email: "user@example.com",
    onboarding_completed: true,
    job_seeking_active: true,
    profile_image_url: null,
    created_at: "2025-01-15T10:00:00Z",
    
    // 사용자 상세 정보 (user 타입인 경우)
    user_info: {
      id: "info-uuid",
      user_id: "user-uuid", 
      name: "실제이름",
      age: 25,
      gender: "남성",
      visa: "F-6",
      korean_level: "고급",
      how_long: "2년",
      experience: "신입",
      experience_content: "경력 설명...",
      topic: "전문분야",
      preferred_days: ["월", "화", "수"],
      preferred_times: ["오전", "오후"]
    }
  }
}
```

#### 회사 프로필 응답 (동일 엔드포인트)
```javascript
GET /api/profiles

Response (company 타입):
{
  success: true,
  data: {
    id: "company-uuid",
    user_type: "company",
    name: "회사명",
    phone_number: "02-1234-5678", 
    email: "company@example.com",
    address: "서울시 강남구...",
    description: "회사 설명...",
    onboarding_completed: true,
    profile_image_url: "https://...",
    created_at: "2025-01-15T10:00:00Z"
    // user_info는 없음 (회사는 별도 테이블 없음)
  }
}
```

### 서버 사이드 최적화 없이 활용

#### 장점
- **기존 코드 재사용**: 이미 구현된 `/api/profiles` 엔드포인트 활용
- **개발 시간 단축**: 새로운 서버 코드 작성 불필요
- **안정성**: 검증된 기존 API 사용
- **일관성**: 프로필 관련 로직이 한 곳에 집중

#### 기존 API의 최적화 포인트
현재 `/api/profiles` 엔드포인트는 이미 다음과 같이 최적화됨:
- **JOIN 쿼리**: user 타입의 경우 profiles와 user_info를 JOIN하여 한 번에 조회
- **타입별 분기**: user_type에 따라 적절한 데이터만 반환
- **캐싱 지원**: 기존 캐싱 로직 활용 가능

### 기존 서버 로직 활용

#### profiles.controller.js (기존)
현재 구현된 프로필 컨트롤러를 그대로 활용:

```javascript
// 이미 구현됨 - 추가 작업 불필요
const getProfile = async (req, res) => {
  try {
    const { userId, userType } = req.user;
    
    // 사용자 타입에 따른 프로필 조회
    if (userType === 'user') {
      const profile = await getUserProfileWithInfo(userId);
      res.json({ success: true, data: profile });
    } else if (userType === 'company') {
      const profile = await getCompanyProfile(userId);
      res.json({ success: true, data: profile });
    }
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '프로필을 불러오는데 실패했습니다.'
    });
  }
};
```

#### 기존 서비스 로직 (수정 불필요)
```javascript
// profiles.service.js - 이미 최적화됨
const getUserProfileWithInfo = async (userId) => {
  // JOIN 쿼리로 profiles와 user_info 한 번에 조회
  const result = await supabase
    .from('profiles')
    .select(`
      *,
      user_info (*)
    `)
    .eq('id', userId)
    .single();
  
  return result.data;
};

const getCompanyProfile = async (companyId) => {
  // 회사는 user_info 없이 기본 프로필만
  const result = await supabase
    .from('profiles')
    .select('*')
    .eq('id', companyId)
    .single();
  
  return result.data;
};
```

### 서버 사이드 캐싱 (선택적)

현재는 클라이언트 사이드 캐싱(AsyncStorage)으로 충분하며, 서버 사이드 캐싱은 필요 시 추후 도입 가능:

```javascript
// 향후 Redis 캐싱 도입 시 (선택적)
const CACHE_KEYS = {
  USER_PROFILE: 'profile:user:',
  COMPANY_PROFILE: 'profile:company:'
};

const CACHE_TTL = {
  PROFILE: 3600  // 1시간
};
```

## 성능 최적화 전략 (최적화됨)

### 1. 로딩 최적화
- **단순화된 초기화**: 프로필 데이터만 로드하여 앱 시작 시간 단축
- **중복 제거**: preload와 hook 간 중복 API 호출 완전 제거
- **메모리 효율**: 필요한 최소한의 데이터만 메모리에 유지

### 2. 캐싱 최적화
- **3단계 캐시**: Context → AsyncStorage → Network
- **Cache-First**: preload된 데이터 우선 사용
- **선택적 무효화**: 프로필 업데이트 시에만 캐시 갱신

### 3. 네트워크 최적화
- **기존 API 활용**: 새로운 엔드포인트 불필요
- **JOIN 쿼리**: 이미 최적화된 프로필 API 활용
- **타입별 분기**: 사용자/회사별 필요한 데이터만 조회

## 에러 처리 및 안정성 (최적화됨)

### 1. 프로필 로딩 실패 대응
```typescript
const preloadUserProfile = async (userId) => {
  try {
    // 1순위: 서버에서 최신 데이터 로드
    const response = await api('GET', '/api/profiles');
    return { success: true, data: { profile: response.data } };
    
  } catch (error) {
    // 2순위: 캐시된 데이터로 폴백
    const cachedProfile = await cache.get(`profile:${userId}`, true);
    if (cachedProfile) {
      return {
        success: false,
        canProceed: true,
        data: { profile: cachedProfile },
        errors: [{ message: '캐시된 프로필을 사용합니다.' }]
      };
    }
    
    // 3순위: 완전 실패
    return {
      success: false,
      canProceed: false,
      errors: [{ message: '프로필 로딩 실패' }]
    };
  }
};
```

### 2. 오프라인 모드 지원
```typescript
const handleOfflineMode = async () => {
  const cachedProfile = await getCachedProfile();
  
  if (cachedProfile) {
    return {
      data: { profile: cachedProfile },
      isOfflineMode: true,
      message: '오프라인 모드: 캐시된 프로필을 사용합니다.'
    };
  }
  
  throw new Error('오프라인에서 사용할 프로필 데이터가 없습니다.');
};
```

### 3. 단순화된 에러 처리
- **필수 데이터**: 프로필만 체크하면 되므로 에러 처리 로직 단순화
- **캐시 폴백**: 프로필 로딩 실패 시 캐시된 데이터 활용
- **부분 실패 없음**: 프로필 하나만 로드하므로 부분 실패 상황 제거

## 구현 우선순위 (최적화됨)

### ✅ Phase 1: 완료됨 (프로필 중심 시스템)
1. **AppInitializer 최적화**
   - 프로필 데이터만 preload하도록 간소화 ✅
   - ProfileProvider 도입으로 전역 상태 관리 ✅
   - 기존 스켈레톤 스크린과 에러 처리 활용 ✅

2. **Preloader 시스템 간소화**
   - keywordPreloader 제거 (불필요) ✅
   - userPreloader → preloadUserProfile 변경 ✅
   - companyPreloader → preloadCompanyProfile 변경 ✅

3. **useProfile Hook 개선**
   - Cache-first 전략 구현 ✅
   - ProfileProvider와 연동 ✅
   - 중복 API 호출 완전 제거 ✅

### 📋 Phase 2: 선택적 개선 (필요 시)
1. **성능 모니터링**
   - 앱 시작 시간 측정
   - 프로필 로딩 속도 분석
   - 캐시 히트율 모니터링

2. **서버 사이드 최적화** (선택적)
   - 프로필 API 응답 시간 개선
   - Redis 캐싱 도입 (트래픽 증가 시)
   - 프로필 이미지 CDN 최적화

3. **추가 기능**
   - 백그라운드 프로필 동기화
   - 프로필 변경 실시간 알림
   - 오프라인 편집 기능

## 실제 달성된 효과 ✅

### 사용자 경험 개선
- **빠른 앱 시작**: 프로필 데이터만 로드하여 초기화 시간 대폭 단축
- **중복 제거**: preload와 useProfile hook 간 중복 API 호출 완전 해결
- **즉시 사용**: Context에 저장된 프로필로 화면 즉시 렌더링
- **오프라인 지원**: 캐시된 프로필로 기본 기능 사용 가능

### 시스템 성능 향상
- **네트워크 효율**: 불필요한 키워드, 지원내역 API 호출 제거
- **메모리 효율**: 최소한의 필수 데이터만 전역 상태로 관리
- **캐시 활용**: 3단계 캐시 전략으로 최적화된 데이터 접근

### 개발 생산성 향상
- **코드 단순화**: 복잡한 다중 데이터 로딩 로직 제거
- **유지보수성**: 프로필 관련 로직이 한 곳에 집중
- **확장성**: 필요 시 다른 데이터도 동일한 패턴으로 추가 가능

### 핵심 성과
현재 구현을 통해 **앱 초기화 성능을 크게 개선**하면서도 **코드 복잡성은 오히려 줄이는** 목표를 달성했습니다. 사용자는 더 빠른 앱 시작을 경험하고, 개발자는 더 간단하고 유지보수하기 쉬운 코드를 갖게 되었습니다.