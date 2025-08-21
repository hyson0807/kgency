import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';

export const ProfileBoostCard = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#10B981', '#34D399', '#6EE7B7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 16, padding: 24, height: 140 }}
    >
      <View className="items-center justify-center h-full">
        <Text className="text-white text-xl font-bold text-center">
          {t('home.break_90_title', '🚀 적합도 90% 돌파하기')}
        </Text>
        <Text className="text-white text-sm text-center mt-1 opacity-90">
          {t('info.career_boost_title', '당신의 경력을 작성하면, 채용확률이 15% 올라가요!')}
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(pages)/(user)/(user-information)/info')}
          className="bg-white rounded-full px-6 py-2 mt-3"
        >
          <Text className="text-emerald-600 font-bold text-center">
            {t('home.upgrade_profile_button', '프로필 업그레이드')}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};