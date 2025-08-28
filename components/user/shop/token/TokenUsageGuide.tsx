import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

const TokenUsageGuide: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View className="bg-white mx-4 rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <Text className="text-lg font-semibold text-gray-900 mb-3">{t('shop.tokenUsageGuide', '토큰 사용 안내')}</Text>
      <View className="space-y-2">
        <View className="flex-row items-start mb-3">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
          <Text className="text-gray-600 flex-1">{t('shop.instantInterview', '즉시면접 예약 (토큰 1개)')}</Text>
        </View>
        <View className="flex-row items-start mb-3">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
          <Text className="text-gray-600 flex-1">{t('shop.premiumFeature', '프리미엄 기능 이용')}</Text>
        </View>
        <View className="flex-row items-start">
          <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
          <Text className="text-gray-600 flex-1">{t('shop.additionalService', '추가 서비스 준비 중')}</Text>
        </View>
      </View>
    </View>
  );
};

export default TokenUsageGuide;