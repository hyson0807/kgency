import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadMoreHeaderProps {
  hasMoreOlder: boolean;
  loadingOlder: boolean;
  messagesLength: number;
}

export function LoadMoreHeader({ 
  hasMoreOlder, 
  loadingOlder, 
  messagesLength 
}: LoadMoreHeaderProps) {
  if (!hasMoreOlder && messagesLength > 0) {
    return (
      <View className="py-4 items-center">
        <Text className="text-gray-400 text-sm">대화의 시작입니다</Text>
      </View>
    );
  }

  if (loadingOlder) {
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text className="text-gray-400 text-sm mt-2">이전 메시지를 불러오는 중...</Text>
      </View>
    );
  }

  return null;
}