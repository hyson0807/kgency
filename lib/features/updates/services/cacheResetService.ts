import AsyncStorage from '@react-native-async-storage/async-storage';

export class CacheResetService {
  /**
   * 앱 업데이트 후 초기화 실패를 방지하기 위한 캐시 정리 서비스
   */
  
  // 보존해야 할 중요한 데이터 키들
  private static readonly PRESERVE_KEYS = [
    'auth_token',
    'refresh_token', 
    'user_id',
    'user_type',
    'phone_number',
    'onboarding_completed',
    'language_preference'
  ];

  // 버전별로 정리가 필요한 키들
  private static readonly VERSION_CLEANUP_RULES: Record<string, string[]> = {
    '1.0.4': [
      'old_cache_key',
      'deprecated_settings'
    ]
    // 새 버전이 나올 때마다 추가
  };

  /**
   * 앱 업데이트 후 호환되지 않는 캐시 데이터를 정리합니다
   */
  static async cleanupAfterUpdate(previousVersion?: string, currentVersion?: string): Promise<void> {
    try {
      console.log(`Cleaning up cache after update: ${previousVersion} -> ${currentVersion}`);
      
      if (!previousVersion || !currentVersion) {
        return;
      }

      // 버전이 바뀌었을 때만 정리 실행
      if (previousVersion !== currentVersion) {
        await this.performVersionCleanup(previousVersion, currentVersion);
        await this.updateStoredVersion(currentVersion);
      }
    } catch (error) {
      console.error('Failed to cleanup cache after update:', error);
    }
  }

  /**
   * 특정 버전에서 다른 버전으로 업데이트할 때 필요한 캐시 정리
   */
  private static async performVersionCleanup(fromVersion: string, toVersion: string): Promise<void> {
    const keysToRemove = this.VERSION_CLEANUP_RULES[toVersion] || [];
    
    if (keysToRemove.length > 0) {
      console.log(`Removing deprecated keys for version ${toVersion}:`, keysToRemove);
      await AsyncStorage.multiRemove(keysToRemove);
    }

    // 메이저 버전 업데이트시 모든 캐시 정리 (선택적)
    if (this.isMajorVersionUpdate(fromVersion, toVersion)) {
      await this.performMajorVersionCleanup();
    }
  }

  /**
   * 메이저 버전 업데이트 여부 확인
   */
  private static isMajorVersionUpdate(fromVersion: string, toVersion: string): boolean {
    const fromMajor = parseInt(fromVersion.split('.')[0]);
    const toMajor = parseInt(toVersion.split('.')[0]);
    return toMajor > fromMajor;
  }

  /**
   * 메이저 업데이트시 중요 데이터만 보존하고 나머지 정리
   */
  private static async performMajorVersionCleanup(): Promise<void> {
    try {
      console.log('Performing major version cleanup');
      
      // 중요한 데이터 백업
      const preservedData: Record<string, string | null> = {};
      for (const key of this.PRESERVE_KEYS) {
        preservedData[key] = await AsyncStorage.getItem(key);
      }

      // 모든 데이터 삭제
      await AsyncStorage.clear();

      // 중요한 데이터 복원
      const restorePromises = Object.entries(preservedData)
        .filter(([_, value]) => value !== null)
        .map(([key, value]) => AsyncStorage.setItem(key, value!));
      
      await Promise.all(restorePromises);
      
      console.log('Major version cleanup completed');
    } catch (error) {
      console.error('Failed to perform major version cleanup:', error);
    }
  }

  /**
   * 현재 버전을 저장소에 저장
   */
  private static async updateStoredVersion(version: string): Promise<void> {
    await AsyncStorage.setItem('app_version', version);
  }

  /**
   * 저장된 이전 버전 가져오기
   */
  static async getStoredVersion(): Promise<string | null> {
    return await AsyncStorage.getItem('app_version');
  }

  /**
   * 수동으로 캐시 정리 (개발/디버깅용)
   */
  static async clearAllCache(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('All cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}