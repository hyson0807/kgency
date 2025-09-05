import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyMessagesProps {
  userType: 'user' | 'company';
}

export function EmptyMessages({ userType }: EmptyMessagesProps) {
  return (
    <View 
      className="flex-1 items-center justify-center px-8" 
      style={{ transform: [{ scaleY: -1 }, { scaleX: -1 }] }}
    >
      <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
      <Text className="text-gray-500 text-center mt-4 text-lg">
        첫 메시지를 보내보세요
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        {userType === 'user' ? '회사' : '구직자'}와 대화를 시작하세요
      </Text>
    </View>
  );
}