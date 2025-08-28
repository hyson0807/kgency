import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface DevModeNoticeProps {
  isIAPAvailable: boolean;
}

const DevModeNotice: React.FC<DevModeNoticeProps> = ({ isIAPAvailable }) => {
  const { t } = useTranslation();

  if (isIAPAvailable || !__DEV__) return null;

  return (
    <View className="bg-orange-50 mx-4 rounded-xl shadow-sm border border-orange-200 p-4 mb-4">
      <View className="flex-row items-center mb-3">
        <Ionicons name="information-circle" size={20} color="#f97316" />
        <Text className="text-orange-800 font-semibold ml-2">{t('shop.devMode', '개발 모드')}</Text>
      </View>
      <Text className="text-orange-700 text-sm leading-5 mb-3">
        {t('shop.devModeDesc', '현재 Expo Go에서 실행 중이므로 In-App Purchase 기능이 비활성화되어 있습니다.')}
      </Text>
      <View className="bg-orange-100 p-3 rounded-lg">
        <Text className="text-orange-800 text-xs font-semibold mb-1">{t('shop.testMethod', '테스트 방법:')}</Text>
        <Text className="font-mono text-xs text-orange-700">npx expo run:ios</Text>
        <Text className="text-orange-700 text-xs mt-1">{t('shop.or', '또는')}</Text>
        <Text className="font-mono text-xs text-orange-700">npx expo run:android</Text>
      </View>
    </View>
  );
};

export default DevModeNotice;