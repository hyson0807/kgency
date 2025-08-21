import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';

export const InterviewScheduleCard = () => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#8B5CF6', '#A78BFA', '#C4B5FD']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 16, padding: 24, height: 140 }}
    >
      <View className="items-center justify-center h-full">
        <Text className="text-white text-xl font-bold text-center mt-2">
          {t('company.interview_schedule_title', '📅 스마트 면접 관리')}
        </Text>
        <Text className="text-white text-sm text-center mt-1 opacity-90">
          {t('company.interview_schedule_description', '면접 일정을 한눈에 관리하세요')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(company)/interview-calendar')}
          className="bg-white rounded-full px-6 py-2 mt-3"
        >
          <Text className="text-purple-600 font-bold text-center">
            {t('company.view_schedule_button', '면접 일정 보기')}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};