import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QuestionTemplateModal } from './modals/QuestionTemplateModal';
import { InterviewScheduleModal } from './modals/InterviewScheduleModal';
import { Alert } from 'react-native';

interface ChatActionButtonsProps {
  onSendMessage: (message: string) => Promise<boolean>;
  disabled?: boolean;
}

export function ChatActionButtons({ onSendMessage, disabled = false }: ChatActionButtonsProps) {
  const [questionModalVisible, setQuestionModalVisible] = useState(false);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  const handleQuestionSend = async (question: string) => {
    const success = await onSendMessage(question);
    if (success) {
      setQuestionModalVisible(false);
    }
  };

  const handleScheduleSend = async (date: string, time: string) => {
    const message = `면접 일정 안내드립니다.\n\n📅 날짜: ${date}\n🕐 시간: ${time}\n\n해당 시간에 면접 참석 가능하시다면 답변 부탁드립니다.`;
    const success = await onSendMessage(message);
    if (success) {
      setScheduleModalVisible(false);
    }
  };

  const handleRejection = () => {
    Alert.alert(
      '지원 거절',
      '정말로 이 지원자를 거절하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '거절하기',
          style: 'destructive',
          onPress: async () => {
            const message = '지원해 주셔서 감사합니다. 아쉽게도 이번에는 다른 분으로 결정되었습니다. 좋은 기회가 있다면 다시 만나뵐 수 있기를 바랍니다.';
            await onSendMessage(message);
          }
        }
      ]
    );
  };

  return (
    <View className="bg-white border-t border-gray-200 px-4 py-3">
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => setQuestionModalVisible(true)}
          disabled={disabled}
          className={`flex-1 py-3 px-4 rounded-lg border border-gray-200 flex-row items-center justify-center ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#3B82F6" />
          <Text className="text-blue-500 font-medium ml-2 text-sm">간단 질문</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setScheduleModalVisible(true)}
          disabled={disabled}
          className={`flex-1 py-3 px-4 rounded-lg bg-blue-500 flex-row items-center justify-center ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          <Ionicons name="calendar-outline" size={18} color="white" />
          <Text className="text-white font-medium ml-2 text-sm">면접 일정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRejection}
          disabled={disabled}
          className={`flex-1 py-3 px-4 rounded-lg border border-gray-200 flex-row items-center justify-center ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
          <Text className="text-red-500 font-medium ml-2 text-sm">다음 기회에</Text>
        </TouchableOpacity>
      </View>

      <QuestionTemplateModal
        visible={questionModalVisible}
        onClose={() => setQuestionModalVisible(false)}
        onSendQuestion={handleQuestionSend}
      />

      <InterviewScheduleModal
        visible={scheduleModalVisible}
        onClose={() => setScheduleModalVisible(false)}
        onSendSchedule={handleScheduleSend}
      />
    </View>
  );
}