export const CACHE_KEYS = {
  // 공통 데이터
  KEYWORDS: 'cache:keywords:all',
  APP_CONFIG: 'cache:app:config',
  
  // 사용자별 데이터
  USER_PROFILE: 'cache:profile:user:',
  USER_KEYWORDS: 'cache:keywords:user:',
  USER_APPLICATIONS: 'cache:applications:user:',
  
  // 회사별 데이터
  COMPANY_PROFILE: 'cache:profile:company:',
  COMPANY_KEYWORDS: 'cache:keywords:company:',
  COMPANY_JOB_POSTINGS: 'cache:jobpostings:company:',
  
  // 임시 데이터
  TEMP_DATA: 'cache:temp:',
  
  // 버전 정보
  DATA_VERSION: 'cache:version:data'
} as const;

// 캐시 TTL 설정 (밀리초)
export const CACHE_TTL = {
  KEYWORDS: 24 * 60 * 60 * 1000,      // 24시간
  USER_PROFILE: 60 * 60 * 1000,       // 1시간
  USER_KEYWORDS: 60 * 60 * 1000,      // 1시간
  JOB_POSTINGS: 30 * 60 * 1000,       // 30분
  APP_CONFIG: 6 * 60 * 60 * 1000,     // 6시간
  TEMP_DATA: 10 * 60 * 1000           // 10분
} as const;