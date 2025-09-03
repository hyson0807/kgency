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
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { socketManager, SocketMessage } from '@/lib/socketManager';
import { useUnreadMessage } from '@/contexts/UnreadMessageContext';

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface ChatRoomInfo {
  id: string;
  user_id: string;
  company_id: string;
  job_posting_id: string;
  user: { name: string };
  company: { name: string };
  job_postings: { title: string };
}

export default function ChatRoom() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { profile } = useProfile();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomInfo, setRoomInfo] = useState<ChatRoomInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { refreshUnreadCount } = useUnreadMessage();

  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
      setMessages(prev => [...prev, chatMessage]);
      
      // 스크롤을 맨 아래로
      setTimeout(() => {
        flatListRef.current?.scrollToEnd();
      }, 100);

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
    }, 5000); // 5초마다 상태만 확인

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
      fetchMessages();
      markMessagesAsRead().then(() => {
        refreshUnreadCount();
      });
    }
  }, [roomId, profile]);

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

  const fetchMessages = async () => {
    try {
      const response = await api('GET', `/api/chat/room/${roomId}/messages`);

      if (response.success) {
        const newMessages = response.data || [];
        setMessages(newMessages);
        
        // 새로운 메시지가 있으면 읽음 처리
        if (newMessages.length > 0) {
          await markMessagesAsRead();
        }
      } else {
        console.error('Error fetching messages:', response.error);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!profile?.id) return;

    try {
      await api('PATCH', `/api/chat/room/${roomId}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

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

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffInHours = diff / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // 24시간 이내면 시간만 표시
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      // 24시간 이후면 날짜와 시간 표시
      return date.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
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

  if (loading || !roomInfo) {
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
          contentContainerStyle={messages.length === 0 ? { flex: 1, padding: 16 } : { padding: 16 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          showsVerticalScrollIndicator={false}
        />

        {/* Input */}
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="메시지를 입력하세요..."
              multiline
              maxLength={500}
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