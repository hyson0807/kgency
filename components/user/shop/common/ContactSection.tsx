import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from '@/contexts/TranslationContext';

const ContactSection: React.FC = () => {
  const { t } = useTranslation();

  const handleCopyEmail = async () => {
    const email = 'welkit.answer@gmail.com';
    await Clipboard.setStringAsync(email);
    Alert.alert(
      '이메일 주소 복사됨',
      `${email} 주소가 클립보드에 복사되었습니다.`,
      [{ text: '확인' }]
    );
  };

  return (
    <View className="mt-8 mb-6 bg-gray-50 rounded-2xl p-6">
      <View className="flex-row items-start mb-3">
        <View className="bg-blue-100 p-2 rounded-full mr-3">
          <Ionicons name="help-circle" size={20} color="#3B82F6" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {t('shop.contactTitle', '구매 문의')}
          </Text>
          <Text className="text-gray-600 text-sm leading-5">
            {t('shop.contactDescription', '구매 오류 및 구매 관련 문의사항은 welkit.answer@gmail.com 으로 연락 주세요')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        className="bg-blue-600 rounded-xl py-3 px-4 mt-3"
        onPress={handleCopyEmail}
      >
        <Text className="text-white text-center font-semibold">
          이메일 주소 복사
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ContactSection;