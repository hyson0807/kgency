import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';

interface TokenBalanceCardProps {
  userTokens: number;
  onRefresh: () => void;
}

const TokenBalanceCard: React.FC<TokenBalanceCardProps> = ({ userTokens, onRefresh }) => {
  const { t } = useTranslation();

  return (
    <View className="bg-white mx-4 mt-6 rounded-xl shadow-sm border border-gray-200 p-6">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-gray-900">{t('shop.myTokens', '내 토큰')}</Text>
        <TouchableOpacity 
          onPress={onRefresh}
          className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full"
        >
          <Ionicons name="diamond" size={16} color="#3B82F6" />
          <Text className="text-blue-600 font-semibold ml-1">{userTokens}</Text>
          <Ionicons name="refresh" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
        </TouchableOpacity>
      </View>
      <Text className="text-gray-600 text-sm mb-4">
        {t('shop.myTokensDesc', '토큰을 사용하여 프리미엄 기능을 이용할 수 있습니다')}
      </Text>
      
      {/* 이용 내역 확인 버튼 */}
      <TouchableOpacity
        onPress={() => router.push('/(pages)/(user)/(shop)/usage-history')}
        className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
      >
        <View className="flex-row items-center">
          <Ionicons name="receipt-outline" size={20} color="#6B7280" />
          <Text className="text-gray-700 font-medium ml-2">{t('shop.tokenHistory', '토큰 이용 내역')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </TouchableOpacity>
    </View>
  );
};

export default TokenBalanceCard;