import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuestionTemplateModalProps {
  visible: boolean;
  onClose: () => void;
  onSendQuestion: (question: string) => Promise<void>;
}

export function QuestionTemplateModal({ visible, onClose, onSendQuestion }: QuestionTemplateModalProps) {
  const [sending, setSending] = useState(false);

  const questionTemplates = [
    '주말 근무 가능한가요?',
    '몇 개월 일할 수 있나요?',
    '언제부터 출근 가능한가요?',
    '하루 몇 시간 근무 가능한가요?',
    '야간 근무 가능한가요?',
    '외국어 실력은 어느 정도인가요?',
    '이전 직장에서 어떤 일을 하셨나요?',
    '우리 회사에 지원한 이유는 무엇인가요?',
  ];

  const handleTemplateSelect = async (question: string) => {
    if (sending) return;
    
    setSending(true);
    try {
      await onSendQuestion(question);
    } catch (error) {
      Alert.alert('오류', '질문 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (sending) return;
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%', minHeight: 500 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">간단 질문하기</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={sending}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Template Questions */}
            <View className="p-4 space-y-2">
              <Text className="text-sm font-medium text-gray-700 mb-3">자주 묻는 질문</Text>
              {questionTemplates.map((question, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleTemplateSelect(question)}
                  disabled={sending}
                  className={`p-4 bg-gray-50 rounded-xl ${sending ? 'opacity-50' : ''}`}
                >
                  <Text className="text-gray-800 text-sm">{question}</Text>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}