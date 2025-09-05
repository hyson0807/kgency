import React from 'react';
import { View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CHAT_CONFIG } from '@/lib/config';

interface ChatInputProps {
  newMessage: string;
  sending: boolean;
  isConnected: boolean;
  isAuthenticated: boolean;
  onChangeText: (text: string) => void;
  onSendMessage: () => void;
}

export function ChatInput({
  newMessage,
  sending,
  isConnected,
  isAuthenticated,
  onChangeText,
  onSendMessage
}: ChatInputProps) {
  const canSend = newMessage.trim() && !sending && isConnected && isAuthenticated;

  return (
    <View className="bg-white border-t border-gray-200 px-4 py-3">
      <View className="flex-row items-center">
        <TextInput
          value={newMessage}
          onChangeText={onChangeText}
          placeholder="메시지를 입력하세요..."
          multiline
          maxLength={CHAT_CONFIG.MAX_MESSAGE_LENGTH}
          className="flex-1 max-h-24 px-4 py-3 bg-gray-100 rounded-full mr-3"
          style={{ textAlignVertical: 'top' }}
        />
        
        <TouchableOpacity
          onPress={onSendMessage}
          disabled={!canSend}
          className={`w-10 h-10 rounded-full items-center justify-center ${
            canSend ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          {sending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Ionicons 
              name="send" 
              size={20} 
              color={canSend ? 'white' : '#9ca3af'} 
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}