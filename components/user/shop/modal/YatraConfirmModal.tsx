import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface YatraConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  email: string;
  purchasing: boolean;
  YATRA_PACKAGE_AVAILABLE: boolean;
}

const YatraConfirmModal: React.FC<YatraConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  email,
  purchasing,
  YATRA_PACKAGE_AVAILABLE
}) => {
  const { t } = useTranslation();

  if (!YATRA_PACKAGE_AVAILABLE) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center px-4">
        <View className="bg-white rounded-2xl p-6 max-h-[80%]">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900">
              {t('shop.purchaseYatra', '야트라 패키지 구매')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
            <View className="bg-purple-50 rounded-xl p-4 mb-4">
              <Text className="text-lg font-semibold text-purple-900 mb-2">
                야트라 스페셜 패키지
              </Text>
              <Text className="text-2xl font-bold text-purple-900 mb-3">
                ₩55,000
              </Text>
              
              <Text className="text-gray-700 font-medium mb-3">포함 내용:</Text>
              <View className="space-y-2">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                  <Text className="text-gray-600 ml-2 text-sm">PDF 가이드북</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                  <Text className="text-gray-600 ml-2 text-sm">야트라 전용 구직 확정권</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
                  <Text className="text-gray-600 ml-2 text-sm">토큰 10개 (11,000원 상당)</Text>
                </View>
              </View>
            </View>

            {email && (
              <View className="bg-blue-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="mail" size={20} color="#3B82F6" />
                  <Text className="text-gray-700 font-medium ml-2">PDF 수신 이메일:</Text>
                </View>
                <Text className="text-blue-900 font-semibold mt-1 ml-7">{email}</Text>
              </View>
            )}

            <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#F59E0B" />
                <View className="flex-1 ml-2">
                  <Text className="text-amber-800 text-sm">
                    구매 완료 후 토큰은 즉시 지급되며, PDF 파일과 구직 확정권은 1-2일 내로 이메일로 전송됩니다.
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              className="flex-1 py-3 bg-gray-200 rounded-xl"
              onPress={onClose}
              disabled={purchasing}
            >
              <Text className="text-gray-700 text-center font-semibold">
                {t('shop.cancel', '취소')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 bg-purple-600 rounded-xl"
              onPress={onConfirm}
              disabled={purchasing}
            >
              <Text className="text-white text-center font-semibold">
                {purchasing ? t('shop.purchasing', '구매 중...') : t('shop.purchaseBtn', '구매')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default YatraConfirmModal;