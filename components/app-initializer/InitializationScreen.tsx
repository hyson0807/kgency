import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InitializationScreenProps {
  progress: number;
  currentOperation: string;
  error: string | null;
  onRetry: () => void;
  isOfflineMode?: boolean;
  networkStatus?: any;
  offlineInfo?: {
    isOffline: boolean;
    message: string;
    canUseCachedData: boolean;
    lastConnected?: string;
  } | null;
}

export const InitializationScreen: React.FC<InitializationScreenProps> = ({
  progress,
  currentOperation,
  error,
  onRetry,
  isOfflineMode = false,
  networkStatus,
  offlineInfo
}) => {
  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-white px-6">
        <Ionicons name="warning-outline" size={64} color="#ef4444" />
        
        <Text className="text-xl font-bold text-gray-900 mt-4 text-center">
          초기화 중 오류가 발생했습니다
        </Text>
        
        <Text className="text-sm text-gray-600 mt-2 text-center">
          {error}
        </Text>
        
        <TouchableOpacity
          onPress={onRetry}
          className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">다시 시도</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => {/* 오프라인 모드 또는 스킵 로직 */}}
          className="mt-4"
        >
          <Text className="text-gray-500 underline">건너뛰기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      {/* 로고 */}
      <View className="mb-8">
        <Text className="text-3xl font-bold text-blue-600 text-center">
          kgency
        </Text>
      </View>
      
      {/* 로딩 인디케이터 */}
      <ActivityIndicator size="large" color="#3b82f6" />
      
      {/* 진행률 표시 */}
      <View className="w-full mt-6">
        <View className="bg-gray-200 rounded-full h-2">
          <View 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </View>
        
        <Text className="text-sm text-gray-600 mt-2 text-center">
          {Math.round(progress)}%
        </Text>
      </View>
      
      {/* 현재 작업 표시 */}
      <Text className="text-base text-gray-700 mt-4 text-center">
        {currentOperation}
      </Text>
      
      {/* 오프라인 상태 표시 */}
      {isOfflineMode && offlineInfo && (
        <View className="bg-orange-50 p-3 rounded-lg mt-4 border border-orange-200">
          <View className="flex-row items-center justify-center">
            <Ionicons name="cloud-offline-outline" size={16} color="#f59e0b" />
            <Text className="text-orange-800 text-sm ml-2">오프라인 모드</Text>
          </View>
          <Text className="text-xs text-orange-700 text-center mt-1">
            캐시된 데이터를 사용 중입니다
          </Text>
        </View>
      )}
      
      {/* 네트워크 상태 표시 */}
      {networkStatus && !networkStatus.isConnected && (
        <View className="bg-red-50 p-3 rounded-lg mt-4 border border-red-200">
          <View className="flex-row items-center justify-center">
            <Ionicons name="wifi-outline" size={16} color="#ef4444" />
            <Text className="text-red-800 text-sm ml-2">네트워크 연결 없음</Text>
          </View>
        </View>
      )}
      
      {/* 팁이나 안내 메시지 */}
      <Text className="text-xs text-gray-500 mt-8 text-center">
        {isOfflineMode 
          ? '오프라인 모드에서 제한된 기능을 사용할 수 있습니다.'
          : '앱을 처음 사용하시면 데이터 준비에 시간이 걸릴 수 있습니다.'
        }
      </Text>
    </View>
  );
};