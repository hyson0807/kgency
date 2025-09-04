import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useChatRooms } from '@/hooks/useChatRooms';
import { ChatRoomItem } from '@/components/chat/ChatRoomItem';
import type { UserChatRoom } from '@/types/chat';

export default function UserChats() {
  const { chatRooms, loading } = useChatRooms<UserChatRoom>({ userType: 'user' });

  const renderChatRoom = ({ item }: { item: UserChatRoom }) => (
    <ChatRoomItem chatRoom={item} userType="user" />
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-white border-b border-gray-200 px-4 py-3">
          <Text className="text-xl font-bold text-gray-900">채팅</Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-500">채팅방을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-xl font-bold text-gray-900">채팅</Text>
      </View>

      {chatRooms.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="chatbubbles-outline" size={64} color="#9ca3af" />
          <Text className="text-lg font-semibold text-gray-900 mt-4 mb-2">
            채팅방이 없습니다
          </Text>
          <Text className="text-gray-500 text-center leading-5">
            공고에 지원하고{'\n'}회사와 채팅하세요
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          renderItem={renderChatRoom}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}