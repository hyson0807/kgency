import { UpdateConfig } from '../types';

/**
 * 업데이트 관련 설정
 * 앱 출시 시 실제 App Store ID와 Play Store 패키지명으로 변경 필요
 */
export const UPDATE_CONFIG: UpdateConfig = {
  // iOS App Store ID
  appStoreId: '6749147143',
  
  // Android Play Store 패키지명
  playStorePackageName: 'com.welkit.kgency',
  
  // 강제 업데이트가 필요한 버전들
  // 보안 취약점이나 중대한 버그가 있는 버전들을 여기에 추가
  forceUpdateVersions: [
    // '1.0.4',  // 현재 버전 - 필요시 주석 해제하여 강제 업데이트
  ],
  
  // 개발 환경에서 버전 체크 건너뛰기
  skipVersionCheckInDev: true,
};

/**
 * 개발/프로덕션 환경별 설정
 */
export const getUpdateConfig = (env: 'development' | 'production' = 'production'): UpdateConfig => {
  if (env === 'development') {
    return {
      ...UPDATE_CONFIG,
      skipVersionCheckInDev: true,
      forceUpdateVersions: [], // 개발 환경에서는 강제 업데이트 비활성화
    };
  }
  
  return UPDATE_CONFIG;
};