import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { UpdateState, UpdateType, UpdateConfig } from '../types';
import { StoreVersionService } from '../services/storeVersionService';
import { StoreNavigationService } from '../services/storeNavigationService';
import { CacheResetService } from '../services/cacheResetService';

interface UseAppUpdateOptions extends UpdateConfig {
  checkInterval?: number; // 체크 간격 (밀리초)
  autoCheck?: boolean; // 자동 체크 여부
}

export const useAppUpdate = (options: UseAppUpdateOptions = {}) => {
  const {
    forceUpdateVersions = [],
    skipVersionCheckInDev = true,
    checkInterval = 60 * 60 * 1000, // 1시간
    autoCheck = true,
  } = options;

  const currentVersion = Constants.expoConfig?.version || '1.0.0';

  const [updateState, setUpdateState] = useState<UpdateState>({
    isChecking: true,
    ota: {
      isAvailable: false,
      isDownloading: false,
      error: null,
    },
    store: {
      currentVersion,
      latestVersion: null,
      needsUpdate: false,
      isForced: false,
    },
    error: null,
  });

  /**
   * OTA 업데이트 체크 및 처리
   */
  const checkOTAUpdate = useCallback(async (): Promise<boolean> => {
    try {
      // Development 환경에서는 스킵
      if (__DEV__ || Updates.isEmbeddedLaunch) {
        console.log('OTA updates are disabled (development mode or embedded launch)');
        return false;
      }

      console.log('Checking for OTA updates...');
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        console.log('OTA update available, downloading...');
        setUpdateState(prev => ({
          ...prev,
          ota: { ...prev.ota, isAvailable: true, isDownloading: true }
        }));
        
        await Updates.fetchUpdateAsync();
        console.log('OTA update downloaded, reloading...');
        await Updates.reloadAsync();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('OTA update check failed:', error);
      setUpdateState(prev => ({
        ...prev,
        ota: { ...prev.ota, error: error instanceof Error ? error.message : 'OTA update failed' }
      }));
      return false;
    }
  }, []);

  /**
   * 스토어 버전 체크
   */
  const checkStoreVersion = useCallback(async (): Promise<boolean> => {
    try {
      const latestVersion = await StoreVersionService.getLatestStoreVersion();
      
      if (!latestVersion) {
        console.log('Could not fetch store version');
        return false;
      }

      const needsUpdate = StoreVersionService.compareVersions(currentVersion, latestVersion);
      const isForced = StoreVersionService.isForceUpdateRequired(currentVersion, forceUpdateVersions);

      setUpdateState(prev => ({
        ...prev,
        store: {
          ...prev.store,
          latestVersion,
          needsUpdate,
          isForced,
        }
      }));

      // 강제 업데이트가 필요한 경우 AsyncStorage에 저장
      if (needsUpdate) {
        await AsyncStorage.setItem('store_update_needed', 'true');
        await AsyncStorage.setItem('latest_store_version', latestVersion);
        if (isForced) {
          await AsyncStorage.setItem('force_update_required', 'true');
        }
      } else {
        await AsyncStorage.multiRemove(['store_update_needed', 'latest_store_version', 'force_update_required']);
      }

      return needsUpdate;
    } catch (error) {
      console.error('Store version check failed:', error);
      return false;
    }
  }, [currentVersion, forceUpdateVersions]);

  /**
   * 전체 업데이트 체크 로직
   */
  const checkForUpdates = useCallback(async () => {
    if (__DEV__ && skipVersionCheckInDev) {
      console.log('Update check skipped in development mode');
      setUpdateState(prev => ({ ...prev, isChecking: false }));
      return;
    }

    setUpdateState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      // 1. 먼저 OTA 업데이트 체크 (우선순위 높음)
      const otaUpdateFound = await checkOTAUpdate();
      if (otaUpdateFound) {
        return; // OTA 업데이트가 있으면 앱이 재시작되므로 여기서 종료
      }

      // 2. 스토어 버전 체크
      await checkStoreVersion();

      // 3. 캐시 정리 (버전 업데이트 후 초기화 실패 방지)
      const storedVersion = await CacheResetService.getStoredVersion();
      if (storedVersion && storedVersion !== currentVersion) {
        await CacheResetService.cleanupAfterUpdate(storedVersion, currentVersion);
      }

    } catch (error) {
      console.error('Update check failed:', error);
      setUpdateState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Update check failed'
      }));
    } finally {
      setUpdateState(prev => ({ ...prev, isChecking: false }));
    }
  }, [checkOTAUpdate, checkStoreVersion, currentVersion, skipVersionCheckInDev]);

  /**
   * 스토어로 이동
   */
  const openStore = useCallback(async () => {
    await StoreNavigationService.openStore();
  }, []);

  /**
   * 버전 업데이트 건너뛰기
   */
  const skipVersion = useCallback(async () => {
    if (updateState.store.latestVersion) {
      await AsyncStorage.setItem('skipped_store_version', updateState.store.latestVersion);
      setUpdateState(prev => ({
        ...prev,
        store: { ...prev.store, needsUpdate: false }
      }));
    }
  }, [updateState.store.latestVersion]);

  /**
   * 건너뛴 버전인지 확인
   */
  const isVersionSkipped = useCallback(async (): Promise<boolean> => {
    const skippedVersion = await AsyncStorage.getItem('skipped_store_version');
    return skippedVersion === updateState.store.latestVersion;
  }, [updateState.store.latestVersion]);

  /**
   * 업데이트 타입 결정
   */
  const getUpdateType = (): UpdateType => {
    if (updateState.ota.isAvailable) return 'ota';
    if (updateState.store.needsUpdate) return 'store';
    return 'none';
  };

  // 자동 체크 설정
  useEffect(() => {
    if (autoCheck) {
      checkForUpdates();

      // 주기적 체크
      const interval = setInterval(checkForUpdates, checkInterval);
      return () => clearInterval(interval);
    }
  }, [autoCheck, checkForUpdates, checkInterval]);

  return {
    ...updateState,
    updateType: getUpdateType(),
    checkForUpdates,
    openStore,
    skipVersion,
    isVersionSkipped,
    // 편의 메소드들
    hasAnyUpdate: updateState.ota.isAvailable || updateState.store.needsUpdate,
    shouldForceUpdate: updateState.store.isForced,
  };
};