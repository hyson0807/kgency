import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from '@/contexts/TranslationContext';

const ShopHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View className="bg-white px-6 py-8 border-b border-gray-200">
      <Text className="text-2xl font-bold text-gray-900 mb-2">{t('shop.title', '상점')}</Text>
      <Text className="text-gray-600">{t('shop.subtitle', '토큰을 구매하여 더 많은 기능을 이용해보세요')}</Text>
    </View>
  );
};

export default ShopHeader;