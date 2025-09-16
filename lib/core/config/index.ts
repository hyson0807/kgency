/**
 * 애플리케이션 전역 설정 상수들
 */

// 서버 URL 설정
export const SERVER_CONFIG = {
  DEV_SERVER_URL: process.env.EXPO_PUBLIC_DEV_SERVER_URL || 'http://172.30.1.88:5004',
  PROD_SERVER_URL: process.env.EXPO_PUBLIC_PROD_SERVER_URL || 'https://kgency-server.onrender.com',
  
  get SERVER_URL() {
    return __DEV__ ? this.DEV_SERVER_URL : this.PROD_SERVER_URL;
  }
} as const;

// Socket.io 관련 설정
export const SOCKET_CONFIG = {
  TRANSPORTS: ['websocket', 'polling'] as const,
  TIMEOUT: 20000, // 20초
  RECONNECTION_DELAY: 1000, // 1초
  MAX_RECONNECT_ATTEMPTS: 5,
  ROOM_JOIN_TIMEOUT: 5000, // 5초
} as const;

// 채팅 관련 설정
export const CHAT_CONFIG = {
  MAX_MESSAGE_LENGTH: 500,
  MESSAGE_FETCH_LIMIT: 50,
  UNREAD_COUNT_REFRESH_DELAY: 2000, // 2초
  
  // 메시지 페이지네이션 설정
  INITIAL_MESSAGE_LOAD: 20,        // 초기 로딩 메시지 수
  MESSAGE_LOAD_MORE: 20,           // 추가 로딩 시 메시지 수  
  MESSAGE_CACHE_SIZE: 50,          // 캐싱할 메시지 수
  LOAD_MORE_THRESHOLD: 0.1,        // 무한 스크롤 트리거 지점 (10%)
  SCROLL_TO_END_DELAY: 100,        // 스크롤 맨 아래로 이동 지연시간
} as const;

// 날짜/시간 포맷 설정
export const DATE_CONFIG = {
  TIME_FORMAT: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  } as const,
  
  DATE_FORMAT: {
    month: 'short',
    day: 'numeric'
  } as const,
  
  LOCALE: 'ko-KR'
} as const;

// 앱 상태 관련 설정
export const APP_CONFIG = {
  STATUS_CHECK_INTERVAL: 5000, // 5초
  BADGE_UPDATE_DELAY: 100, // 0.1초
} as const;

// 하위 호환성을 위한 기존 함수들
export const getServerUrl = (): string => SERVER_CONFIG.SERVER_URL;
export const SERVER_URL = SERVER_CONFIG.SERVER_URL;