import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { formatLastMessageTime } from '@/utils/dateUtils';
import type { UserChatRoom, CompanyChatRoom } from '@/types/chat';

interface ChatRoomItemProps {
  chatRoom: UserChatRoom | CompanyChatRoom;
  userType: 'user' | 'company';
}

/**
 * 재사용 가능한 채팅방 아이템 컴포넌트
 * 사용자용과 회사용 채팅방 목록에서 공통으로 사용
 */
export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ chatRoom, userType }) => {
  const router = useRouter();

  // 타입에 따른 설정
  const config = userType === 'user' 
    ? {
        name: (chatRoom as UserChatRoom).company.name,
        unreadCount: (chatRoom as UserChatRoom).user_unread_count,
        iconName: 'business' as const,
        iconColor: (chatRoom as UserChatRoom).company.name === '탈퇴한 회사' ? '#9ca3af' : '#3b82f6',
        bgColor: (chatRoom as UserChatRoom).company.name === '탈퇴한 회사' ? 'bg-gray-100' : 'bg-blue-100',
        isWithdrawn: (chatRoom as UserChatRoom).company.name === '탈퇴한 회사'
      }
    : {
        name: (chatRoom as CompanyChatRoom).user.name || '구직자',
        unreadCount: (chatRoom as CompanyChatRoom).company_unread_count,
        iconName: 'person' as const,
        iconColor: (chatRoom as CompanyChatRoom).user.name === '탈퇴한 사용자' ? '#9ca3af' : '#10b981',
        bgColor: (chatRoom as CompanyChatRoom).user.name === '탈퇴한 사용자' ? 'bg-gray-100' : 'bg-green-100',
        isWithdrawn: (chatRoom as CompanyChatRoom).user.name === '탈퇴한 사용자'
      };

  const handlePress = () => {
    router.push(`/(pages)/chat/${chatRoom.id}`);
  };

  return (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-white border-b border-gray-100"
      onPress={handlePress}
    >
      {/* 아바타 */}
      <View className={`w-12 h-12 ${config.bgColor} rounded-full items-center justify-center mr-3`}>
        <Ionicons name={config.iconName} size={24} color={config.iconColor} />
      </View>
      
      {/* 채팅방 정보 */}
      <View className="flex-1">
        {/* 이름과 읽지 않은 메시지 수 */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center flex-1">
            <Text className={`text-base font-semibold ${config.isWithdrawn ? 'text-gray-500' : 'text-gray-900'}`} numberOfLines={1}>
              {config.name}
            </Text>
            {config.isWithdrawn && (
              <Text className="text-xs text-gray-400 ml-2">(탈퇴)</Text>
            )}
          </View>
          {config.unreadCount > 0 && !config.isWithdrawn && (
            <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-white text-xs font-bold">
                {config.unreadCount > 99 ? '99+' : config.unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        {/* 공고 제목 */}
        <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
          {chatRoom.job_postings?.title || '공고 제목 없음'}
        </Text>
        
        {/* 마지막 메시지와 시간 */}
        <View className="flex-row items-center justify-between">
          <Text 
            className={`text-sm flex-1 ${config.isWithdrawn ? 'text-gray-400' : 'text-gray-500'}`} 
            numberOfLines={1}
          >
            {config.isWithdrawn 
              ? '상대방이 탈퇴하여 더 이상 대화할 수 없습니다' 
              : (chatRoom.last_message || '대화를 시작해보세요')
            }
          </Text>
          {!config.isWithdrawn && (
            <Text className="text-xs text-gray-400 ml-2">
              {formatLastMessageTime(chatRoom.last_message_at)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};