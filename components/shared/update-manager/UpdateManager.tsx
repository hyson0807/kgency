import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

import { useAppUpdate, StoreUpdateModal, UPDATE_CONFIG } from '@/lib/features/updates';

SplashScreen.preventAutoHideAsync().catch(() => {
  // 이미 숨겨진 경우 무시
});

interface UpdateManagerProps {
  children: React.ReactNode;
}

export default function UpdateManager({ children }: UpdateManagerProps) {
  const [showStoreUpdateModal, setShowStoreUpdateModal] = useState(false);
  
  const {
    isChecking,
    ota,
    store,
    updateType,
    shouldForceUpdate,
    openStore,
    skipVersion,
    isVersionSkipped,
  } = useAppUpdate({
    ...UPDATE_CONFIG, // config에서 설정 가져오기
    autoCheck: true,
  });

  // 스플래시 화면 처리
  useEffect(() => {
    const hideSplashScreen = async () => {
      if (!isChecking && !ota.isDownloading) {
        try {
          await SplashScreen.hideAsync();
        } catch (error) {
          // 이미 숨겨진 경우 무시
          console.log('SplashScreen already hidden:', error);
        }
      }
    };
    
    hideSplashScreen().catch(console.error);
  }, [isChecking, ota.isDownloading]);

  // 스토어 업데이트 모달 표시 로직
  useEffect(() => {
    const showStoreModal = async () => {
      if (store.needsUpdate && !ota.isAvailable && !isChecking) {
        // 강제 업데이트이거나, 건너뛴 버전이 아닌 경우 모달 표시
        if (shouldForceUpdate) {
          setShowStoreUpdateModal(true);
        } else {
          // 건너뛴 버전인지 확인
          const skipped = await isVersionSkipped();
          if (!skipped) {
            setShowStoreUpdateModal(true);
          }
        }
      }
    };

    showStoreModal().catch(console.error);
  }, [store.needsUpdate, ota.isAvailable, isChecking, shouldForceUpdate, isVersionSkipped]);

  const handleStoreUpdate = async () => {
    setShowStoreUpdateModal(false);
    await openStore();
  };

  const handleSkipUpdate = async () => {
    setShowStoreUpdateModal(false);
    await skipVersion();
  };

  const handleCloseModal = () => {
    if (!shouldForceUpdate) {
      setShowStoreUpdateModal(false);
    }
  };

  // 로딩 화면 (OTA 업데이트 또는 초기 체크 중)
  if (isChecking || ota.isDownloading) {
    const loadingText = ota.isDownloading 
      ? '업데이트 다운로드 중...' 
      : isChecking 
        ? '업데이트 확인 중...' 
        : '로딩 중...';

    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="items-center">
          <Image 
            source={require('@/assets/images/kgency_logo.png')}
            className="w-32 h-32 mb-8"
            resizeMode="contain"
          />
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-lg font-medium text-gray-800">
            {loadingText}
          </Text>
          <Text className="mt-2 text-sm text-gray-500">
            잠시만 기다려 주세요
          </Text>
          
          {/* 디버그 정보 (개발 환경에서만) */}
          {__DEV__ && (
            <View className="mt-4 p-3 bg-gray-100 rounded-lg">
              <Text className="text-xs text-gray-600">
                Debug: {JSON.stringify({ 
                  updateType, 
                  storeUpdate: store.needsUpdate,
                  forced: shouldForceUpdate 
                }, null, 2)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <>
      {children}
      
      {/* 스토어 업데이트 모달 */}
      <StoreUpdateModal
        visible={showStoreUpdateModal}
        updateState={{ isChecking, ota, store, error: null }}
        onUpdate={handleStoreUpdate}
        onSkip={shouldForceUpdate ? undefined : handleSkipUpdate}
        onClose={shouldForceUpdate ? undefined : handleCloseModal}
      />
    </>
  );
}