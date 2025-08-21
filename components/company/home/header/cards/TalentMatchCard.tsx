import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';

export const TalentMatchCard = () => {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={['#10B981', '#34D399', '#6EE7B7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 16, padding: 24, height: 140 }}
    >
      <View className="items-center justify-center h-full">
        <Text className="text-white text-xl font-bold text-center">
          {t('company.perfect_talent_title', '🎯 완벽한 인재 매칭')}
        </Text>
        <Text className="text-white text-sm text-center mt-1 opacity-90">
          {t('company.talent_match_description', '우리 회사와 딱 맞는 인재를 찾아보세요!')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(pages)/(company)/(company-information)/keywords')}
          className="bg-white rounded-full px-6 py-2 mt-3"
        >
          <Text className="text-emerald-600 font-bold text-center">
            {t('company.find_talent_button', '우리 회사랑 맞는 인재 찾기')}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};