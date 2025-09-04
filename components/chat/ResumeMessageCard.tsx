import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ResumeMessageCardProps {
  message: string;
  isMyMessage: boolean;
  timestamp: string;
}

export const ResumeMessageCard: React.FC<ResumeMessageCardProps> = ({ 
  message, 
  isMyMessage, 
  timestamp 
}) => {
  return (
    <View className={`mb-3 ${isMyMessage ? 'items-end' : 'items-start'}`}>
      <View className={`max-w-[85%] p-4 rounded-xl shadow-sm ${
        isMyMessage ? 'bg-blue-500' : 'bg-white border border-gray-200'
      }`}>
        {/* 이력서 헤더 */}
        <View className="flex-row items-center mb-3">
          <View className={`w-8 h-8 rounded-full items-center justify-center ${
            isMyMessage ? 'bg-blue-400' : 'bg-blue-100'
          }`}>
            <Ionicons 
              name="document-text" 
              size={16} 
              color={isMyMessage ? 'white' : '#3B82F6'} 
            />
          </View>
          <Text className={`ml-2 font-semibold ${
            isMyMessage ? 'text-white' : 'text-blue-700'
          }`}>
            입사지원서
          </Text>
        </View>
        
        {/* 전체 내용 표시 */}
        <Text 
          className={`text-sm leading-5 ${
            isMyMessage ? 'text-blue-100' : 'text-gray-600'
          }`}
        >
          {message}
        </Text>
      </View>
      
      <Text className="text-xs text-gray-400 mt-1 mx-1">
        {timestamp}
      </Text>
    </View>
  );
};