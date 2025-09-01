import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';

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
  const { profile } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomInfo, setRoomInfo] = useState<ChatRoomInfo | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (roomId && profile?.id) {
      fetchRoomInfo();
      fetchMessages();
      markMessagesAsRead();
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
        setMessages(response.data || []);
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
      const response = await api('POST', `/api/chat/room/${roomId}/message`, {
        message: newMessage.trim()
      });

      if (response.success) {
        setNewMessage('');
        // 새 메시지를 목록에 추가
        setMessages(prev => [...prev, response.data]);
        // 스크롤을 맨 아래로
        setTimeout(() => {
          flatListRef.current?.scrollToEnd();
        }, 100);
      } else {
        console.error('Error sending message:', response.error);
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
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
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
          <Text className="text-gray-500">채팅방을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text className="text-sm text-gray-500" numberOfLines={1}>
            {roomInfo.job_postings.title}
          </Text>
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
          contentContainerStyle={{ padding: 16 }}
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
              disabled={!newMessage.trim() || sending}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                newMessage.trim() && !sending 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }`}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={newMessage.trim() && !sending ? 'white' : '#9ca3af'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}