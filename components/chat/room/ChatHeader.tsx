import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTabBar } from '@/contexts/TabBarContext';
import type { ChatRoomInfo } from '@/types/chat';

interface ChatHeaderProps {
  roomInfo: ChatRoomInfo;
  otherPartyName: string;
  fromApplication?: string;
  fromNotification?: string;
  userType: 'user' | 'company';
  isConnected: boolean;
  isAuthenticated: boolean;
}

export function ChatHeader({
  roomInfo,
  otherPartyName,
  fromApplication,
  fromNotification,
  userType,
  isConnected,
  isAuthenticated
}: ChatHeaderProps) {
  const router = useRouter();
  const { setIsTabBarVisible } = useTabBar();

  const handleBackPress = () => {
    if (fromApplication === 'true') {
      // 탭바 복원 후 채팅 지원에서 온 경우 채팅 탭으로 이동
      setIsTabBarVisible(true);
      const chatRoute = userType === 'user' ? '/(user)/user-chats' : '/(company)/company-chats';
      router.replace(chatRoute);
    } else if (fromNotification === 'true') {
      // 탭바 복원 후 알림에서 온 경우 적절한 채팅 탭으로 이동
      setIsTabBarVisible(true);
      const chatRoute = userType === 'user' ? '/(user)/user-chats' : '/(company)/company-chats';
      router.replace(chatRoute);
    } else {
      // 일반적인 경우 뒤로가기 (탭바는 useFocusEffect의 cleanup에서 처리됨)
      router.back();
    }
  };

  return (
    <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
      <TouchableOpacity onPress={handleBackPress} className="mr-3">
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>
      
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">
          {otherPartyName}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {roomInfo.job_postings.title}
          </Text>
          {/* 연결 상태 표시 */}
          <View className="ml-2 flex-row items-center">
            <View 
              className={`w-2 h-2 rounded-full mr-1 ${
                isConnected && isAuthenticated 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`} 
            />
            <Text className={`text-xs ${
              isConnected && isAuthenticated 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {isConnected && isAuthenticated ? '연결됨' : '연결 중...'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}