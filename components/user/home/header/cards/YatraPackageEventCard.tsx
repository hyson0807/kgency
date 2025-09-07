import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';

export const YatraPackageEventCard = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handlePress = () => {
    router.push('/(pages)/(user)/(shop)/shop');
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <LinearGradient
        colors={['#F59E0B', '#F97316', '#DC2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 24, height: 140 }}
      >
        <View className="items-center justify-center h-full">
          <View className="flex-row items-center mb-2">
            <Ionicons name="airplane" size={24} color="#FEF3C7" />
            <Text className="text-yellow-100 text-lg font-bold ml-2">
              {t('event.yatra_package', 'Yatra 패키지')}
            </Text>
            <Ionicons name="sparkles" size={20} color="#FEF3C7" className="ml-1" />
          </View>
          <Text className="text-white text-xl font-bold text-center">
            {t('event.yatra_title', '🎉 특별 이벤트 진행중!')}
          </Text>
          <Text className="text-white text-sm text-center mt-1 opacity-90">
            {t('event.yatra_subtitle', '토큰 + 구직확정 패키지')}
          </Text>
          <View className="bg-white/20 rounded-full px-4 py-1 mt-2">
            <Text className="text-white text-xs font-medium">
              {t('event.limited_time', '⏰ 한정시간')}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};