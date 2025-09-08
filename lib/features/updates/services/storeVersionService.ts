import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { UPDATE_CONFIG } from '../config';

export interface StoreVersionResponse {
  version?: string;
  results?: Array<{ version: string }>;
}

export class StoreVersionService {
  private static readonly BUNDLE_ID = 'com.welkit.kgency';
  private static readonly PACKAGE_NAME = 'com.welkit.kgency';

  /**
   * 앱스토어/플레이스토어에서 최신 버전을 가져옵니다
   */
  static async getLatestStoreVersion(): Promise<string | null> {
    try {
      if (Platform.OS === 'ios') {
        return await this.getIOSStoreVersion();
      } else if (Platform.OS === 'android') {
        return await this.getAndroidStoreVersion();
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch store version:', error);
      return null;
    }
  }

  /**
   * iOS App Store API를 통해 최신 버전을 가져옵니다
   */
  private static async getIOSStoreVersion(): Promise<string | null> {
    const bundleId = Constants.expoConfig?.ios?.bundleIdentifier || this.BUNDLE_ID;
    const response = await fetch(`https://itunes.apple.com/lookup?bundleId=${bundleId}`);
    const data: StoreVersionResponse = await response.json();
    return data.results?.[0]?.version || null;
  }

  /**
   * Android Play Store 버전 체크 (서버 API 필요)
   * 현재는 임시로 현재 버전을 반환
   */
  private static async getAndroidStoreVersion(): Promise<string | null> {
    // Play Store는 공식 API가 없으므로 서버를 통해 처리해야 함
    // 임시로 현재 버전 반환 (실제로는 서버 API 호출 필요)
    return Constants.expoConfig?.version || '1.0.0';
  }

  /**
   * 두 버전을 비교합니다
   * @param current 현재 버전
   * @param latest 최신 버전
   * @returns true면 업데이트 필요, false면 최신 버전
   */
  static compareVersions(current: string, latest: string): boolean {
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);
    
    const maxLength = Math.max(currentParts.length, latestParts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;
      
      if (latestPart > currentPart) {
        return true; // 업데이트 필요
      }
      if (latestPart < currentPart) {
        return false; // 최신 버전
      }
    }
    return false; // 같은 버전
  }

  /**
   * 강제 업데이트가 필요한지 확인합니다
   */
  static isForceUpdateRequired(currentVersion: string, forceVersions: string[] = []): boolean {
    return forceVersions.includes(currentVersion);
  }
}