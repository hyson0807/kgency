import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

export const InstantInterviewCard = () => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#6366F1', '#8B5CF6', '#A855F7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 16, padding: 24, height: 140 }}
    >
      <View className="items-center justify-center h-full">
        <Ionicons name="flash" size={32} color="#FDE047" />
        <Text className="text-white text-xl font-bold text-center mt-2">
          {t('home.instant_interview_title', '적합도 90% 이상 → 즉시 면접 확정!')}
        </Text>
        <Text className="text-white text-sm text-center mt-2 opacity-90">
          {t('home.ai_matching_subtitle', 'AI 매칭으로 완벽한 일자리를 찾아드립니다')}
        </Text>
      </View>
    </LinearGradient>
  );
};