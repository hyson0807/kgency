import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useMessagePagination } from '@/hooks/useMessagePagination';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { socketManager } from '@/lib/socketManager';
import { useUnreadMessage } from '@/contexts/UnreadMessageContext';
import { formatMessageTime } from '@/utils/dateUtils';
import { CHAT_CONFIG, APP_CONFIG } from '@/lib/config';
import type { ChatMessage, ChatRoomInfo, SocketMessage } from '@/types/chat';

export default function ChatRoom() {
  const params = useLocalSearchParams<{ 
    roomId: string; 
    initialMessage?: string; 
    messageType?: string; 
  }>();
  const { roomId, initialMessage, messageType } = params;
  const { profile } = useProfile();
  const router = useRouter();
  const { refreshUnreadCount } = useUnreadMessage();
  
  // 페이지네이션 훅 사용
  const {
    messages,
    hasMoreOlder,
    loadingOlder,
    initialLoading,
    loadInitialMessages,
    loadOlderMessages,
    addNewMessage,
    markMessagesAsRead,
    reset
  } = useMessagePagination(roomId || null);

  const [roomInfo, setRoomInfo] = useState<ChatRoomInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const [cameFromResumeFlow, setCameFromResumeFlow] = useState(false);

  // 메시지 수신 이벤트 구독 (한 번만)
  useEffect(() => {
    const unsubscribeMessage = socketManager.onMessageReceived((socketMessage: SocketMessage) => {
      // 실시간으로 받은 메시지를 ChatMessage 형태로 변환
      const chatMessage: ChatMessage = {
        id: socketMessage.id,
        sender_id: socketMessage.sender_id,
        message: socketMessage.message,
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

      // 메시지 읽음 처리 및 총 안읽은 메시지 카운트 새로고침
      markMessagesAsRead().then(() => {
        refreshUnreadCount();
      });
    });

    return () => {
      unsubscribeMessage();
    };
  }, []);

  // 연결 상태 확인 및 채팅방 입장
  useEffect(() => {
    let hasJoinedRoom = false;
    
    // 초기 연결 상태 확인
    const { isConnected: connected, isAuthenticated: authenticated } = socketManager.getConnectionStatus();
    setIsConnected(connected);
    setIsAuthenticated(authenticated);

    // 초기 연결 시 즉시 입장 시도
    if (connected && authenticated && roomId && !hasJoinedRoom) {
      hasJoinedRoom = true;
      socketManager.joinRoom(roomId as string).then((success) => {
        if (__DEV__ && success) {
          console.log('채팅방 입장 성공:', roomId);
        }
      });
    }

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
      markMessagesAsRead().then(() => {
        refreshUnreadCount();
      });
    }
    
    // 이력서 플로우에서 왔는지 확인
    if (initialMessage && messageType === 'resume') {
      setCameFromResumeFlow(true);
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
          const success = await socketManager.sendMessage(initialMessage);
          if (success) {
            console.log('이력서 자동 전송 성공');
            // URL 파라미터 정리 (navigate로 현재 URL에서 파라미터만 제거)
            router.replace(`/chat/${roomId}`);
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
  }, [initialMessage, messageType, initialMessageSent, isConnected, isAuthenticated, profile?.id, initialLoading, roomId, router]);

  const fetchRoomInfo = async () => {
    try {
      const response = await api('GET', `/api/chat/room/${roomId}`);

      if (response.success) {
        setRoomInfo(response.data);
      } else {
        console.error('Error fetching room info:', response.error);
        Alert.alert('오류', '채팅방 정보를 불러올 수 없습니다.');
        router.back();
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



  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMyMessage = item.sender_id === profile?.id;
    
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
    <View className="flex-1 items-center justify-center px-8">
      <Ionicons name="chatbubbles-outline" size={48} color="#9CA3AF" />
      <Text className="text-gray-500 text-center mt-4 text-lg">
        첫 메시지를 보내보세요
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        {profile?.user_type === 'user' ? '회사' : '구직자'}와 대화를 시작하세요
      </Text>
    </View>
  );

  // 이전 메시지 로딩을 위한 헤더 컴포넌트
  const renderLoadMoreHeader = () => {
    if (!hasMoreOlder && messages.length > 0) {
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
  };

  const otherParty = profile?.user_type === 'user' ? roomInfo.company : roomInfo.user;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {otherParty.name}
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          ListEmptyComponent={renderEmptyMessages}
          ListFooterComponent={renderLoadMoreHeader} // inverted=true 시 Footer가 상단에 표시됨
          contentContainerStyle={messages.length === 0 ? { flex: 1, padding: 16 } : { padding: 16 }}
          showsVerticalScrollIndicator={false}
          inverted // 리스트를 뒤집어서 최신 메시지가 아래쪽에 표시
          // 역방향 무한 스크롤 설정 (inverted=true 시 onEndReached는 맨 위 스크롤을 감지)
          onEndReached={() => {
            // inverted=true에서 onEndReached는 맨 위로 스크롤했을 때 호출됨
            if (hasMoreOlder && !loadingOlder) {
              loadOlderMessages();
            }
          }}
          onEndReachedThreshold={CHAT_CONFIG.LOAD_MORE_THRESHOLD} // 10% 지점에서 트리거
        />

        {/* Input */}
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="메시지를 입력하세요..."
              multiline
              maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
              className="flex-1 max-h-24 px-4 py-3 bg-gray-100 rounded-full mr-3"
              style={{ textAlignVertical: 'top' }}
            />
            
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending || !isConnected || !isAuthenticated}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                newMessage.trim() && !sending && isConnected && isAuthenticated
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={newMessage.trim() && !sending && isConnected && isAuthenticated ? 'white' : '#9ca3af'} 
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}