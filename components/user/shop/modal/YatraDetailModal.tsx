import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface YatraDetailModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: () => void;
  purchasing: boolean;
  loading: boolean;
  YATRA_PACKAGE_AVAILABLE: boolean;
}

const YatraDetailModal: React.FC<YatraDetailModalProps> = ({
  visible,
  onClose,
  onPurchase,
  purchasing,
  loading,
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
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl px-6 py-8" style={{ maxHeight: '80%' }}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-gray-900">
              {t('shop.yatraPackageDetail', '야트라 패키지 상세')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                {t('shop.whatYouGet', '무엇을 받게 되나요?')}
              </Text>
              
              <View className="bg-purple-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-start mb-3">
                  <View className="bg-purple-100 p-2 rounded-full mr-3">
                    <Ionicons name="document-text" size={20} color="#7C3AED" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold mb-1">
                      {t('shop.pdfGuide', 'PDF 가이드북')}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {t('shop.pdfGuideDesc', '한국에서 일자리를 구하는 완벽한 가이드')}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-indigo-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-start mb-3">
                  <View className="bg-indigo-100 p-2 rounded-full mr-3">
                    <Ionicons name="shield-checkmark" size={20} color="#4F46E5" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold mb-1">
                      {t('shop.jobGuarantee', '야트라 전용 구직 확정권')}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {t('shop.jobGuaranteeDesc', '야트라에서 제공하는 특별한 구직 기회를 보장받습니다')}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="bg-blue-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-start mb-3">
                  <View className="bg-blue-100 p-2 rounded-full mr-3">
                    <Ionicons name="diamond" size={20} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold mb-1">
                      {t('shop.tokenBonus', '토큰 20개')}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {t('shop.tokenBonusDesc', '22,000원 상당의 토큰을 즉시 지급')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-3">
                {t('shop.howItWorks', '구매 후 프로세스')}
              </Text>
              <View className="space-y-3">
                <View className="flex-row items-center">
                  <View className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">1</Text>
                  </View>
                  <Text className="text-gray-700 flex-1">
                    {t('shop.step1', '이메일 주소 입력')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">2</Text>
                  </View>
                  <Text className="text-gray-700 flex-1">
                    {t('shop.step2', '결제 완료')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">3</Text>
                  </View>
                  <Text className="text-gray-700 flex-1">
                    {t('shop.step3', '이메일로 PDF 파일 전송 + 토큰 20개 자동 충전')}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="bg-purple-600 w-8 h-8 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold">4</Text>
                  </View>
                  <Text className="text-gray-700 flex-1">
                    {t('shop.step4', '야트라에서 구직 확정 메시지 발송')}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            className="py-4 bg-purple-600 rounded-xl mt-4"
            onPress={onPurchase}
            disabled={purchasing || loading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {purchasing ? t('shop.purchasing', '구매 중...') : loading ? t('shop.loading', '로딩 중...') : t('shop.purchaseNow', '구매하기')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default YatraDetailModal;