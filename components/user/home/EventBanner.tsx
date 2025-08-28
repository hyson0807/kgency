import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

export const EventBanner = () => {
  const { t } = useTranslation();

  const handlePress = () => {
    // TODO: 실제 배포 URL로 변경 필요
    const shopUrl = 'https://kgency-shop.vercel.app'; // 또는 실제 kgency_shop URL
    Linking.openURL(shopUrl).catch(err => {
      console.error('Failed to open URL:', err);
    });
  };

  return (
    <View className="mb-3" style={{ marginHorizontal: -16, paddingHorizontal: 16 }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#10B981', '#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            height: 70, 
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 16,
            position: 'relative'
          }}
        >
          <View className="flex-row items-center justify-between h-full">
            <View className="flex-row items-center flex-1">
              <View className="bg-white/20 rounded-full p-2 mr-3">
                <Ionicons name="book-outline" size={24} color="#ffffff" />
              </View>
              <View className="flex-1 mr-8">
                <Text className="text-white text-sm font-bold">
                  {t('event_banner.title', '취업 성공률 높이는 교육 자료')}
                </Text>
                <Text className="text-white/90 text-xs mt-1">
                  {t('event_banner.subtitle', '전문가가 만든 실전 가이드북 확인하기')}
                </Text>
              </View>
            </View>
            
            <View className="flex-row items-center">
              <MaterialIcons name="arrow-forward-ios" size={16} color="#ffffff" />
            </View>
          </View>

          {/* 미묘한 광택 효과 */}
          <View 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundColor: 'transparent',
              borderBottomWidth: 0.5,
              borderBottomColor: '#ffffff'
            }}
          />
        </LinearGradient>
      </TouchableOpacity>

    </View>
  );
};