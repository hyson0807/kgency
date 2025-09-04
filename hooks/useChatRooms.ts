import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { socketManager } from '@/lib/socketManager';
import { api } from '@/lib/api';
import type { UserChatRoom, CompanyChatRoom } from '@/types/chat';

type ChatRoom = UserChatRoom | CompanyChatRoom;

interface UseChatRoomsOptions {
  userType: 'user' | 'company';
}

/**
 * 채팅방 목록 관리를 위한 공통 훅
 * 사용자와 회사 모두에서 재사용 가능
 */
export const useChatRooms = <T extends ChatRoom>({ userType }: UseChatRoomsOptions) => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  // API 엔드포인트 결정
  const apiEndpoint = userType === 'user' ? '/api/chat/user/rooms' : '/api/chat/company/rooms';
  
  // 읽지 않은 메시지 수 필드명 결정
  const unreadCountField = userType === 'user' ? 'user_unread_count' : 'company_unread_count';

  // 채팅방 목록 가져오기
  const fetchChatRooms = useCallback(async () => {
    if (!user?.userId) return;

    try {
      const response = await api('GET', apiEndpoint);

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
  }, [user?.userId, apiEndpoint]);

  // 초기 로드
  useEffect(() => {
    if (user?.userId) {
      fetchChatRooms();
    }
  }, [user?.userId, fetchChatRooms]);

  // 실시간 채팅방 업데이트 구독
  useEffect(() => {
    if (!user?.userId) return;

    if (__DEV__) {
      console.log(`${userType} 채팅방 실시간 업데이트 구독 시작`);
    }
    
    const unsubscribe = socketManager.onChatRoomUpdated((data) => {
      if (__DEV__) {
        console.log(`${userType} 채팅방 실시간 업데이트:`, data);
      }
      
      setChatRooms(prevRooms => {
        const updatedRooms = prevRooms.map(room => 
          room.id === data.roomId 
            ? { 
                ...room, 
                last_message: data.last_message,
                last_message_at: data.last_message_at,
                [unreadCountField]: data.unread_count
              }
            : room
        );
        if (__DEV__) {
          console.log(`${userType} 채팅방 목록 업데이트됨:`, updatedRooms.find(r => r.id === data.roomId));
        }
        return updatedRooms;
      });
    });

    return () => {
      if (__DEV__) {
        console.log(`${userType} 채팅방 실시간 업데이트 구독 해제`);
      }
      unsubscribe();
    };
  }, [userType, unreadCountField, user?.userId]);

  // 화면 포커스 시 새로고침
  useFocusEffect(
    useCallback(() => {
      if (user?.userId) {
        fetchChatRooms();
        // refreshUnreadCount() 제거: WebSocket에서 자동으로 실시간 업데이트됨
      }
    }, [user?.userId, fetchChatRooms])
  );

  return {
    chatRooms,
    loading,
    fetchChatRooms,
    refreshChatRooms: fetchChatRooms // 명시적 새로고침용 별칭
  };
};