import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface YatraPackageCardProps {
  products: any[];
  isIAPAvailable: boolean;
  YATRA_PACKAGE_AVAILABLE: boolean;
  onPress: () => void;
  showModal: (title: string, message: string, type?: "info" | "confirm" | "warning", onConfirm?: () => void, showCancel?: boolean, confirmText?: string, cancelText?: string) => void;
}

const YatraPackageCard: React.FC<YatraPackageCardProps> = ({
  products,
  isIAPAvailable,
  YATRA_PACKAGE_AVAILABLE,
  onPress,
  showModal
}) => {
  const { t } = useTranslation();

  const handlePress = () => {
    if (YATRA_PACKAGE_AVAILABLE) {
      onPress();
    } else {
      showModal(
        t('shop.yatraComingSoon', '준비 중'),
        t('shop.yatraComingSoonDesc', '야트라 패키지는 현재 준비 중입니다.\\n곧 만나보실 수 있습니다!'),
        'info'
      );
    }
  };

  return (
    <View className="px-4 mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-4">{t('shop.yatraPackage', '야트라 패키지')}</Text>
      
      <View className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-sm border border-purple-200 p-6">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-purple-900">
              {t('shop.yatraPackageTitle', '야트라 스페셜 패키지')}
            </Text>
            <Text className="text-purple-700 text-sm mt-1">
              {t('shop.yatraPackageSubtitle', '구직 확정권 + PDF 가이드 + 토큰 20개')}
            </Text>
          </View>
          <View className="bg-purple-100 p-3 rounded-full">
            <Ionicons name="gift" size={24} color="#7C3AED" />
          </View>
        </View>

        <View className="bg-white/80 rounded-lg p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-700 font-medium">{t('shop.yatraPackageIncludes', '패키지 구성품:')}</Text>
            <View className="bg-purple-500 px-2 py-1 rounded">
              <Text className="text-white text-xs font-semibold">LIMITED</Text>
            </View>
          </View>
          <View className="space-y-2">
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
              <Text className="text-gray-600 ml-2 text-sm">{t('shop.yatraPDF', 'PDF 가이드북')}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
              <Text className="text-gray-600 ml-2 text-sm">{t('shop.yatraJobGuarantee', '야트라 전용 구직 확정권!')}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="checkmark-circle" size={16} color="#7C3AED" />
              <Text className="text-gray-600 ml-2 text-sm">{t('shop.yatraTokens', '토큰 20개 (22,000원 상당)')}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-2xl font-bold text-purple-900">
            {(() => {
              const yatraProduct = products.find(p => p.productId === 'yatra_package_1');
              if (yatraProduct && yatraProduct.localizedPrice) {
                return yatraProduct.localizedPrice;
              }
              return `₩55,000${!isIAPAvailable ? ` ${t('shop.devModePrice', '(개발모드)')}` : ''}`;
            })()}
          </Text>
        </View>

        <TouchableOpacity
          className={`py-4 rounded-xl mb-2 ${
            YATRA_PACKAGE_AVAILABLE ? 'bg-purple-600' : 'bg-gray-400'
          }`}
          onPress={handlePress}
        >
          <Text className="text-white text-center font-semibold text-lg">
            {YATRA_PACKAGE_AVAILABLE 
              ? t('shop.viewProductDetail', '상품설명보기')
              : t('shop.comingSoon', '준비 중')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default YatraPackageCard;