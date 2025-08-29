import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import * as Updates from 'expo-updates';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

interface UpdateManagerProps {
  children: React.ReactNode;
}

interface UpdateState {
  isChecking: boolean;
  isDownloading: boolean;
  isUpdateAvailable: boolean;
  updateError: string | null;
}

export default function UpdateManager({ children }: UpdateManagerProps) {
  const [updateState, setUpdateState] = useState<UpdateState>({
    isChecking: true,
    isDownloading: false,
    isUpdateAvailable: false,
    updateError: null
  });

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      if (!Updates.isEnabled) {
        console.log('Updates are disabled (development mode)');
        setUpdateState(prev => ({ ...prev, isChecking: false }));
        await SplashScreen.hideAsync();
        return;
      }

      console.log('Checking for updates...');
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        console.log('Update available, downloading...');
        setUpdateState(prev => ({ 
          ...prev, 
          isUpdateAvailable: true, 
          isDownloading: true 
        }));
        
        const updateResult = await Updates.fetchUpdateAsync();
        console.log('Update downloaded:', updateResult);
        
        console.log('Reloading app with new update...');
        await Updates.reloadAsync();
      } else {
        console.log('No updates available');
        setUpdateState(prev => ({ ...prev, isChecking: false }));
        await SplashScreen.hideAsync();
      }
    } catch (error) {
      // 개발환경에서는 에러 로그를 출력하지 않음
      if (__DEV__) {
        console.log('Development mode - update check skipped');
      } else {
        console.error('Update check failed:', error);
      }
      setUpdateState(prev => ({ 
        ...prev, 
        isChecking: false, 
        updateError: null // 개발환경에서는 에러를 표시하지 않음
      }));
      await SplashScreen.hideAsync();
    }
  };

  if (updateState.isChecking || updateState.isDownloading) {
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
            {updateState.isChecking ? '업데이트 확인 중...' : '업데이트 다운로드 중...'}
          </Text>
          <Text className="mt-2 text-sm text-gray-500">
            잠시만 기다려 주세요
          </Text>
        </View>
      </View>
    );
  }

  return <>{children}</>;
}