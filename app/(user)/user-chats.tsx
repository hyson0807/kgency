import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUnreadMessage } from '@/contexts/UnreadMessageContext';
import { useFocusEffect } from '@react-navigation/native';
import { socketManager } from '@/lib/socketManager';

interface ChatRoom {
  id: string;
  application_id: string;
  company_id: string;
  job_posting_id: string;
  last_message?: string;
  last_message_at?: string;
  user_unread_count: number;
  company: {
    name: string;
  };
  job_postings: {
    title: string;
  } | null; // job_postings는 null일 수 있음
}

export default function UserChats() {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { refreshUnreadCount } = useUnreadMessage();

  useEffect(() => {
    if (user?.userId) {
      fetchChatRooms();
    }
  }, [user]);

  // singleton 소켓 매니저 이벤트 구독 - 채팅방 업데이트
  useEffect(() => {
    const unsubscribe = socketManager.onChatRoomUpdated((data) => {
      console.log('사용자 채팅방 실시간 업데이트:', data);
      // 채팅방 목록에서 해당 채팅방 정보 업데이트
      setChatRooms(prevRooms => 
        prevRooms.map(room => 
          room.id === data.roomId 
            ? { 
                ...room, 
                last_message: data.last_message,
                last_message_at: data.last_message_at,
                user_unread_count: data.unread_count
              }
            : room
        )
      );
    });

    return unsubscribe;
  }, []);

  // 화면이 포커스될 때마다 채팅방 목록과 안읽은 메시지 카운트 새로고침
  useFocusEffect(
    useCallback(() => {
      if (user?.userId) {
        fetchChatRooms();
        refreshUnreadCount();
      }
    }, [user?.userId])
  );

  const fetchChatRooms = async () => {
    try {
      const response = await api('GET', '/api/chat/user/rooms');

      if (response.success) {
        setChatRooms(response.data || []);
      } else {
        console.error('Error fetching chat rooms:', response.error);
        Alert.alert('오류', '채팅방을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('오류', '채팅방을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      className="flex-row items-center p-4 bg-white border-b border-gray-100"
      onPress={() => router.push(`/(pages)/chat/${item.id}`)}
    >
      <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
        <Ionicons name="business" size={24} color="#3b82f6" />
      </View>
      
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
            {item.company.name}
          </Text>
          {item.user_unread_count > 0 && (
            <View className="bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5">
              <Text className="text-white text-xs font-bold">
                {item.user_unread_count > 99 ? '99+' : item.user_unread_count}
              </Text>
            </View>
          )}
        </View>
        
        <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
          {item.job_postings?.title || '공고 제목 없음'}
        </Text>
        
        <View className="flex-row items-center justify-between">
          <Text 
            className="text-sm text-gray-500 flex-1" 
            numberOfLines={1}
          >
            {item.last_message || '대화를 시작해보세요'}
          </Text>
          <Text className="text-xs text-gray-400 ml-2">
            {formatLastMessageTime(item.last_message_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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