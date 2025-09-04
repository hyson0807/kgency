// 서버 URL 중앙 설정
const SERVER_CONFIG = {
  // 개발 서버 URL (로컬 IP 주소)
  DEV_SERVER_URL: 'http://192.168.0.15:5004',
  
  // 프로덕션 서버 URL
  PROD_SERVER_URL: 'https://kgencyserver-production-45af.up.railway.app',
};

// 현재 환경에 따른 서버 URL 반환
export const getServerUrl = (): string => {
  return __DEV__ ? SERVER_CONFIG.DEV_SERVER_URL : SERVER_CONFIG.PROD_SERVER_URL;
};


export const SERVER_URL = getServerUrl();