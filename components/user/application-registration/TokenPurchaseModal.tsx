import React from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface TokenPurchaseModalProps {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
  onPurchase: () => void;
  loading?: boolean;
  products?: any[];
  isIAPAvailable?: boolean;
}

const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({
  visible,
  onClose,
  onPurchaseSuccess,
  onPurchase,
  loading = false,
  products = [],
  isIAPAvailable = false
}) => {
  const { t } = useTranslation();

  // 실제 상품 가격 표시
  const tokenPackageId = 'token_5_pack'; // 또는 'token_5_pack_android' 
  const product = products.find(p => p.productId === tokenPackageId || p.productId === 'token_5_pack_android');
  const displayPrice = product ? product.localizedPrice : '₩5,000';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-2xl mx-4 p-6 max-w-sm w-full">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full items-center justify-center mb-4">
              <Ionicons name="diamond" size={32} color="white" />
            </View>
            <Text className="text-xl font-bold text-gray-900 text-center">
              {t('token.purchase_title', '토큰 충전')}
            </Text>
            <Text className="text-sm text-gray-600 text-center mt-2">
              {t('token.purchase_subtitle', '채팅 지원을 위한 토큰을 충전해주세요')}
            </Text>
          </View>

          {/* Token Package */}
          <View className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-white rounded-full items-center justify-center mr-3 shadow-sm">
                  <Ionicons name="diamond" size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text className="text-lg font-bold text-gray-900">
                    {t('token.package_5', '토큰 5개 팩')}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {t('token.package_desc', '채팅 지원 5회 이용 가능')}
                  </Text>
                </View>
              </View>
              <View className="bg-blue-500 px-3 py-1 rounded-full">
                <Text className="text-white text-sm font-bold">
                  {t('token.best_value', '추천')}
                </Text>
              </View>
            </View>

            {/* Price */}
            <View className="border-t border-blue-100 pt-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900">
                  {displayPrice}
                </Text>
                <Text className="text-sm text-gray-600">
                  {t('token.per_token', '토큰당 ₩1,000')}
                </Text>
              </View>
            </View>
          </View>

          {/* Benefits */}
          <View className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={16} color="#10B981" className="mt-0.5" />
              <View className="ml-2 flex-1">
                <Text className="text-green-800 text-xs font-medium mb-1">
                  {t('token.purchase_benefit', '구매 즉시 채팅 지원 가능')}
                </Text>
                <Text className="text-green-700 text-xs">
                  {t('token.purchase_desc', '구매 후 바로 1개가 사용되어 채팅 지원이 진행됩니다')}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View>
            {/* Purchase Button */}
            <TouchableOpacity
              className="bg-blue-500 rounded-xl py-4 px-6"
              onPress={onPurchase}
              disabled={loading}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="card" size={20} color="white" />
                    <Text className="text-white font-bold text-base ml-2">
                      {isIAPAvailable 
                        ? `${displayPrice} 결제하기`
                        : t('token.dev_mode', '개발 모드')
                      }
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              className="py-3 mt-3"
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text className="text-center text-gray-500 text-sm">
                {t('common.cancel', '취소')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Payment Info */}
          <View className="mt-4 pt-4 border-t border-gray-100">
            <Text className="text-center text-xs text-gray-500">
              {t('token.payment_info', '안전한 결제시스템으로 보호됩니다')}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default TokenPurchaseModal;