import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Platform } from 'react-native';
import { useTranslation } from '@/contexts/TranslationContext';

interface EmailInputModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  email: string;
  onEmailChange: (email: string) => void;
  YATRA_PACKAGE_AVAILABLE: boolean;
}

const EmailInputModal: React.FC<EmailInputModalProps> = ({
  visible,
  onClose,
  onConfirm,
  email,
  onEmailChange,
  YATRA_PACKAGE_AVAILABLE
}) => {
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
    onEmailChange('');
  };

  if (!YATRA_PACKAGE_AVAILABLE) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 justify-center px-6">
        <View className="bg-white rounded-2xl p-6">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            {t('shop.enterEmail', '이메일 주소 입력')}
          </Text>
          <Text className="text-gray-600 text-sm mb-6">
            {t('shop.enterEmailDesc', 'PDF 파일을 받으실 이메일 주소를 입력해주세요')}
          </Text>

          <TextInput
            className="border border-gray-300 rounded-lg px-4 text-base mb-6 text-center"
            style={{ 
              height: 48, 
              textAlignVertical: 'center',
              ...(Platform.OS === 'android' && { includeFontPadding: false })
            }}
            placeholder={t('shop.emailPlaceholder', 'example@email.com')}
            value={email}
            onChangeText={onEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 py-3 bg-gray-200 rounded-xl"
              onPress={handleClose}
            >
              <Text className="text-gray-700 text-center font-semibold">
                {t('shop.cancel', '취소')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-xl ${
                email && email.includes('@') ? 'bg-purple-600' : 'bg-gray-400'
              }`}
              onPress={onConfirm}
              disabled={!email || !email.includes('@')}
            >
              <Text className="text-white text-center font-semibold">
                {t('shop.next', '다음')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EmailInputModal;