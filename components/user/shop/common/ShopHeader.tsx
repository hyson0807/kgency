import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/contexts/TranslationContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ShopHeader: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <View className="bg-white border-b border-gray-200">
      <View className="flex-row items-center px-4 py-3">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="mr-3 p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900">
          {t('shop.title', '토큰 상점')}
        </Text>
      </View>
      <View className="px-6 pb-4">
        <Text className="text-gray-600 text-sm">
          {t('shop.subtitle', '토큰을 구매하여 더 많은 기능을 이용해보세요')}
        </Text>
      </View>
    </View>
  );
};

export default ShopHeader;