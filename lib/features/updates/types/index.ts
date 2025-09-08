export interface StoreVersionInfo {
  currentVersion: string;
  latestVersion: string | null;
  needsUpdate: boolean;
  isForced: boolean; // 강제 업데이트 여부
}

export interface OTAUpdateInfo {
  isAvailable: boolean;
  isDownloading: boolean;
  error: string | null;
}

export interface UpdateState {
  isChecking: boolean;
  ota: OTAUpdateInfo;
  store: StoreVersionInfo;
  error: string | null;
}

export type UpdateType = 'ota' | 'store' | 'none';

export interface UpdateConfig {
  appStoreId?: string;
  playStorePackageName?: string;
  forceUpdateVersions?: string[]; // 강제 업데이트가 필요한 버전들
  skipVersionCheckInDev?: boolean;
}