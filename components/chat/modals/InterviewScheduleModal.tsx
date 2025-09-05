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

interface InterviewScheduleModalProps {
  visible: boolean;
  onClose: () => void;
  onSendSchedule: (date: string, time: string) => Promise<void>;
}

export function InterviewScheduleModal({ visible, onClose, onSendSchedule }: InterviewScheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [sending, setSending] = useState(false);

  const dateOptions = [
    { label: '오늘', value: '오늘' },
    { label: '내일', value: '내일' },
    { label: '모레', value: '모레' },
  ];

  const timeOptions = [
    { label: '오전 10시', value: '오전 10:00' },
    { label: '오전 11시', value: '오전 11:00' },
    { label: '오후 1시', value: '오후 1:00' },
    { label: '오후 2시', value: '오후 2:00' },
    { label: '오후 3시', value: '오후 3:00' },
    { label: '오후 4시', value: '오후 4:00' },
    { label: '오후 5시', value: '오후 5:00' },
    { label: '오후 6시', value: '오후 6:00' },
  ];

  const handleSendSchedule = async () => {
    if (!selectedDate || !selectedTime || sending) return;

    if (!selectedDate || !selectedTime) {
      Alert.alert('알림', '날짜와 시간을 모두 선택해주세요.');
      return;
    }

    setSending(true);
    try {
      await onSendSchedule(selectedDate, selectedTime);
      setSelectedDate('');
      setSelectedTime('');
    } catch (error) {
      Alert.alert('오류', '면접 일정 전송에 실패했습니다.');
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    if (sending) return;
    setSelectedDate('');
    setSelectedTime('');
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
        <View className="bg-white rounded-t-3xl" style={{ maxHeight: '80%', minHeight: 400 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">면접 일정 보내기</Text>
            <TouchableOpacity
              onPress={handleClose}
              disabled={sending}
              className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="p-4 space-y-6">
              {/* Date Selection */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-3">날짜 선택</Text>
                <View className="flex-row space-x-2">
                  {dateOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedDate(option.value)}
                      disabled={sending}
                      className={`flex-1 py-3 px-4 rounded-xl border ${
                        selectedDate === option.value
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-200'
                      } ${sending ? 'opacity-50' : ''}`}
                    >
                      <Text className={`text-center font-medium ${
                        selectedDate === option.value ? 'text-white' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Time Selection */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-3">시간 선택</Text>
                <View className="flex-row flex-wrap gap-2">
                  {timeOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedTime(option.value)}
                      disabled={sending}
                      className={`py-3 px-4 rounded-xl border ${
                        selectedTime === option.value
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-200'
                      } ${sending ? 'opacity-50' : ''}`}
                      style={{ width: '48%' }}
                    >
                      <Text className={`text-center font-medium ${
                        selectedTime === option.value ? 'text-white' : 'text-gray-700'
                      }`}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Selected Schedule Preview */}
              {selectedDate && selectedTime && (
                <View className="p-4 bg-blue-50 rounded-xl">
                  <Text className="text-sm font-medium text-blue-700 mb-1">선택된 면접 일정</Text>
                  <Text className="text-blue-800">
                    📅 {selectedDate} {selectedTime}
                  </Text>
                </View>
              )}

              {/* Send Button */}
              <TouchableOpacity
                onPress={handleSendSchedule}
                disabled={!selectedDate || !selectedTime || sending}
                className={`p-4 rounded-xl items-center ${
                  selectedDate && selectedTime && !sending
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
              >
                <Text className={`font-medium ${
                  selectedDate && selectedTime && !sending ? 'text-white' : 'text-gray-500'
                }`}>
                  {sending ? '전송 중...' : '면접 일정 보내기'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}