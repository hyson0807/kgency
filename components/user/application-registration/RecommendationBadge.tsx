import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from '@/contexts/TranslationContext';

const RecommendationBadge: React.FC = () => {
  const { t } = useTranslation();

  return (
    <View className="absolute -top-2 right-5 bg-red-500 px-3 py-1 rounded-full z-10">
      <Text className="text-white text-xs font-semibold">
        {t('application.recommended', '추천')}
      </Text>
    </View>
  );
};

export default RecommendationBadge;