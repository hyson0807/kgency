import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useProfile } from '@/hooks/useProfile';
import { useTabBar } from '@/contexts/TabBarContext';
import { useMessagePagination } from '@/hooks/useMessagePagination';
import { api } from '@/lib/api';
import { socketManager } from '@/lib/socketManager';
import { formatMessageTime } from '@/utils/dateUtils';
import { APP_CONFIG } from '@/lib/config';
import type { ChatMessage, ChatRoomInfo, SocketMessage } from '@/types/chat';
import { ResumeMessageCard } from '@/components/chat/ResumeMessageCard';
import { ChatActionButtons } from '@/components/chat/ChatActionButtons';
import { ChatHeader } from '@/components/chat/room/ChatHeader';
import { ChatMessages } from '@/components/chat/room/ChatMessages';
import { ChatInput } from '@/components/chat/room/ChatInput';
import { EmptyMessages } from '@/components/chat/room/EmptyMessages';
import { LoadMoreHeader } from '@/components/chat/room/LoadMoreHeader';

export default function ChatRoom() {
  const params = useLocalSearchParams<{ 
    roomId: string; 
    initialMessage?: string; 
    messageType?: string;
    fromApplication?: string;
    fromNotification?: string;
  }>();
  const { roomId, initialMessage, messageType, fromApplication, fromNotification } = params;
  const { profile } = useProfile();
  const router = useRouter();
  const navigation = useNavigation();
  const { setIsTabBarVisible } = useTabBar();
  
  // 페이지네이션 훅 사용
  const {
    messages,
    hasMoreOlder,
    loadingOlder,
    initialLoading,
    loadInitialMessages,
    loadOlderMessages,
    addNewMessage,
    markMessagesAsRead
  } = useMessagePagination(roomId || null);

  const [roomInfo, setRoomInfo] = useState<ChatRoomInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);

  // 채팅방 진입 시 탭바 숨기기 및 스와이프 설정
  useFocusEffect(
    React.useCallback(() => {
      // 채팅방 진입 시 탭바 숨기기
      setIsTabBarVisible(false);
      
      if (fromApplication === 'true') {
        // 스와이프 뒤로가기 비활성화
        navigation.setOptions({
          gestureEnabled: false,
        });
      } else {
        // 일반적인 경우 스와이프 활성화
        navigation.setOptions({
          gestureEnabled: true,
        });
      }
      
      // 컴포넌트 언마운트 시 탭바 복원
      return () => {
        setIsTabBarVisible(true);
      };
    }, [navigation, fromApplication, setIsTabBarVisible])
  );

  // 메시지 수신 이벤트 구독 (한 번만)
  useEffect(() => {
    const unsubscribeMessage = socketManager.onMessageReceived((socketMessage: SocketMessage) => {
      // 실시간으로 받은 메시지를 ChatMessage 형태로 변환
      const chatMessage: ChatMessage = {
        id: socketMessage.id,
        sender_id: socketMessage.sender_id,
        message: socketMessage.message,
        message_type: socketMessage.message_type,
        created_at: socketMessage.created_at,
        is_read: socketMessage.is_read,
      };
      
      console.log('실시간 메시지 수신:', chatMessage);
      addNewMessage(chatMessage); // 페이지네이션 훅의 메서드 사용
      
      // inverted=true에서는 scrollToIndex(0)으로 최신 메시지로 스크롤
      setTimeout(() => {
        if (messages.length > 0) {
          flatListRef.current?.scrollToIndex({ index: 0, animated: true });
        }
      }, APP_CONFIG.BADGE_UPDATE_DELAY);

      // 메시지 읽음 처리 (서버에서 자동으로 WebSocket을 통해 카운트 업데이트됨)
      markMessagesAsRead();
    });

    return () => {
      unsubscribeMessage();
    };
  }, []);

  // 연결 상태 확인 및 채팅방 입장
  useEffect(() => {
    let hasJoinedRoom = false;
    let connectionRetryAttempts = 0;
    const maxRetryAttempts = 3;
    
    // 웹소켓 연결 재시도 함수
    const retryConnection = async () => {
      if (connectionRetryAttempts >= maxRetryAttempts) {
        console.log('웹소켓 연결 재시도 횟수 초과, 포기');
        return false;
      }
      
      connectionRetryAttempts++;
      console.log(`웹소켓 연결 재시도 ${connectionRetryAttempts}/${maxRetryAttempts}`);
      
      try {
        await socketManager.reinitialize();
        // 재초기화 후 잠시 기다림
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { isConnected: connected, isAuthenticated: authenticated } = socketManager.getConnectionStatus();
        setIsConnected(connected);
        setIsAuthenticated(authenticated);
        
        return connected && authenticated;
      } catch (error) {
        console.error('웹소켓 재연결 실패:', error);
        return false;
      }
    };
    
    // 초기 연결 상태 확인 및 재시도
    const initializeConnection = async () => {
      let { isConnected: connected, isAuthenticated: authenticated } = socketManager.getConnectionStatus();
      setIsConnected(connected);
      setIsAuthenticated(authenticated);
      
      // 연결이 안되어있으면 재시도
      if (!connected || !authenticated) {
        console.log('웹소켓 연결 상태 불량, 재시도 시작');
        const retrySuccess = await retryConnection();
        if (retrySuccess) {
          const status = socketManager.getConnectionStatus();
          connected = status.isConnected;
          authenticated = status.isAuthenticated;
        }
      }
      
      // 연결 성공 시 채팅방 입장
      if (connected && authenticated && roomId && !hasJoinedRoom) {
        hasJoinedRoom = true;
        socketManager.joinRoom(roomId as string).then((success) => {
          if (__DEV__ && success) {
            console.log('채팅방 입장 성공:', roomId);
          }
        });
      }
    };
    
    // 초기 연결 확인 실행
    initializeConnection();

    // 주기적으로 연결 상태만 확인 (입장 시도는 하지 않음)
    const statusCheckInterval = setInterval(() => {
      const { isConnected: connected, isAuthenticated: authenticated } = socketManager.getConnectionStatus();
      setIsConnected(connected);
      setIsAuthenticated(authenticated);
      
      // 연결이 끊어졌다가 다시 연결된 경우에만 재입장 시도
      if (connected && authenticated && roomId && !hasJoinedRoom) {
        hasJoinedRoom = true;
        socketManager.joinRoom(roomId as string).then((success) => {
          if (__DEV__ && success) {
            console.log('채팅방 재입장 성공:', roomId);
          }
        });
      } else if (!connected || !authenticated) {
        hasJoinedRoom = false;
      }
    }, APP_CONFIG.STATUS_CHECK_INTERVAL); // 설정된 간격으로 상태 확인

    return () => {
      clearInterval(statusCheckInterval);
      if (roomId) {
        socketManager.leaveRoom(roomId as string);
      }
    };
  }, [roomId]);

  useEffect(() => {
    if (roomId && profile?.id) {
      fetchRoomInfo();
      loadInitialMessages(); // 페이지네이션 훅의 메서드 사용
      markMessagesAsRead(); // 서버에서 자동으로 WebSocket을 통해 카운트 업데이트됨
    }
  }, [roomId, profile, loadInitialMessages, initialMessage, messageType]);

  // 초기 메시지 자동 전송
  useEffect(() => {
    const sendInitialMessage = async () => {
      if (
        initialMessage && 
        messageType === 'resume' && 
        !initialMessageSent && 
        isConnected && 
        isAuthenticated && 
        profile?.id &&
        !initialLoading
      ) {
        console.log('이력서 자동 전송 시작');
        setInitialMessageSent(true);
        
        try {
          const success = await socketManager.sendMessage(initialMessage, 'resume');
          if (success) {
            console.log('이력서 자동 전송 성공');
            // URL 파라미터 정리하지 않고 그대로 유지 (화면 깜빡임 방지)
          } else {
            console.error('이력서 자동 전송 실패');
          }
        } catch (error) {
          console.error('이력서 자동 전송 중 오류:', error);
        }
      }
    };

    // 조건이 충족되면 약간의 딜레이 후 전송 (소켓 연결 안정화)
    if (initialMessage && messageType === 'resume' && !initialMessageSent && isConnected && isAuthenticated) {
      setTimeout(sendInitialMessage, 1000);
    }
  }, [initialMessage, messageType, initialMessageSent, isConnected, isAuthenticated, profile?.id, initialLoading, roomId]);

  const fetchRoomInfo = async () => {
    try {
      const response = await api('GET', `/api/chat/room/${roomId}`);

      if (response.success) {
        setRoomInfo(response.data);
        // 탈퇴한 사용자가 있는지 체크
        if (response.hasWithdrawnUser) {
          console.log('채팅방에 탈퇴한 사용자가 포함되어 있습니다.');
        }
      } else {
        console.error('Error fetching room info:', response.error);
        
        // 채팅방이 존재하지 않는 경우 (상대방 탈퇴 등)
        if (response.errorType === 'room_not_found') {
          Alert.alert(
            '채팅방을 찾을 수 없습니다',
            '상대방이 탈퇴했거나 채팅방이 삭제되었을 수 있습니다.',
            [
              {
                text: '확인',
                onPress: () => router.back()
              }
            ]
          );
        } else {
          Alert.alert('오류', '채팅방 정보를 불러올 수 없습니다.');
          router.back();
        }
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('오류', '채팅방 정보를 불러올 수 없습니다.');
      router.back();
    }
  };

  // 기존 fetchMessages 함수는 페이지네이션 훅으로 대체되었습니다.

  const sendMessage = async () => {
    if (!newMessage.trim() || sending || !profile?.id) return;

    setSending(true);
    try {
      // singleton 소켓 매니저를 통한 메시지 전송
      const success = await socketManager.sendMessage(newMessage.trim());
      
      if (success) {
        setNewMessage('');
        // 메시지는 실시간으로 수신될 때 추가됨 (onMessageReceived)
      } else {
        console.error('WebSocket 메시지 전송 실패');
        Alert.alert('오류', '메시지 전송에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleActionMessage = async (message: string): Promise<boolean> => {
    try {
      return await socketManager.sendMessage(message);
    } catch (error) {
      console.error('Action message send error:', error);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
      return false;
    }
  };



  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.sender_id === profile?.id;
    
    // 이력서 메시지인지 확인 (messageType이 'resume'이거나 initialMessage와 일치하는 경우)
    const isResumeMessage = (
      (initialMessage && item.message === initialMessage && messageType === 'resume') ||
      item.message_type === 'resume'
    );
    
    // 이력서 메시지면 ResumeMessageCard 컴포넌트 사용
    if (isResumeMessage) {
      return (
        <ResumeMessageCard
          message={item.message}
          isMyMessage={isMyMessage}
          timestamp={formatMessageTime(item.created_at)}
        />
      );
    }
    
    // 일반 메시지면 기존 렌더링
    return (
      <View className={`mb-3 ${isMyMessage ? 'items-end' : 'items-start'}`}>
        <View
          className={`max-w-[80%] px-3 py-2 rounded-2xl ${
            isMyMessage 
              ? 'bg-blue-500 rounded-br-md' 
              : 'bg-gray-200 rounded-bl-md'
          }`}
        >
          <Text className={isMyMessage ? 'text-white' : 'text-gray-900'}>
            {item.message}
          </Text>
        </View>
        <Text className="text-xs text-gray-400 mt-1 mx-1">
          {formatMessageTime(item.created_at)}
        </Text>
      </View>
    );
  };

  if (initialLoading || !roomInfo) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">채팅방을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderEmptyMessages = () => (
    <EmptyMessages userType={profile?.user_type || 'user'} />
  );

  const renderLoadMoreHeader = () => (
    <LoadMoreHeader 
      hasMoreOlder={hasMoreOlder}
      loadingOlder={loadingOlder}
      messagesLength={messages.length}
    />
  );

  const otherParty = profile?.user_type === 'user' ? roomInfo.company : roomInfo.user;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ChatHeader
        roomInfo={roomInfo}
        otherPartyName={otherParty.name}
        fromApplication={fromApplication}
        fromNotification={fromNotification}
        userType={profile?.user_type || 'user'}
        isConnected={isConnected}
        isAuthenticated={isAuthenticated}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ChatMessages
          messages={messages}
          hasMoreOlder={hasMoreOlder}
          loadingOlder={loadingOlder}
          flatListRef={flatListRef}
          renderMessage={renderMessage}
          renderEmptyMessages={renderEmptyMessages}
          renderLoadMoreHeader={renderLoadMoreHeader}
          onLoadOlderMessages={loadOlderMessages}
        />

        {/* Action Buttons - 회사 계정만 표시 */}
        {profile?.user_type === 'company' && (
            <ChatActionButtons
                onSendMessage={handleActionMessage}
                disabled={!isConnected || !isAuthenticated}
            />
        )}

        <ChatInput
          newMessage={newMessage}
          sending={sending}
          isConnected={isConnected}
          isAuthenticated={isAuthenticated}
          onChangeText={setNewMessage}
          onSendMessage={sendMessage}
        />


      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}