import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';

export const QuickHireCard = () => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#3B82F6', '#60A5FA', '#93C5FD']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 16, padding: 24, height: 140 }}
    >
      <View className="items-center justify-center h-full">
        <Text className="text-white text-xl font-bold text-center mt-2">
          {t('company.quick_hire_title', '⚡ 즉시 채용 시스템')}
        </Text>
        <Text className="text-white text-sm text-center mt-1 opacity-90">
          {t('company.quick_hire_description', '적합도 90% 이상 인재와 바로 면접 확정!')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(pages)/(company)/(job-posting-registration)/job-posting-step1')}
          className="bg-white rounded-full px-6 py-2 mt-3"
        >
          <Text className="text-blue-600 font-bold text-center">
            {t('company.post_job_button', '채용 공고 등록하기')}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};