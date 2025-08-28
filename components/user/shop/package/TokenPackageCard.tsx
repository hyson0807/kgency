import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
}

interface TokenPackageCardProps {
  tokenPackages: TokenPackage[];
  products: any[];
  purchasing: boolean;
  loading: boolean;
  isIAPAvailable: boolean;
  onPurchase: (packageItem: TokenPackage) => void;
}

const TokenPackageCard: React.FC<TokenPackageCardProps> = ({
  tokenPackages,
  products,
  purchasing,
  loading,
  isIAPAvailable,
  onPurchase
}) => {
  const { t } = useTranslation();

  return (
    <View className="px-4 mt-8 mb-6">
      <Text className="text-lg font-semibold text-gray-900 mb-4">{t('shop.tokenPackages', '토큰 패키지')}</Text>
      
      {tokenPackages.map((packageItem) => (
        <View 
          key={packageItem.id}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4"
        >
          {packageItem.isPopular && (
            <View className="absolute -top-3 left-4">
              <View className="bg-orange-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-semibold">{t('shop.popular', '인기')}</Text>
              </View>
            </View>
          )}
          
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-blue-100 p-3 rounded-full mr-4">
                <Ionicons name="diamond" size={24} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-900">
                  {t('shop.tokenCount', `${packageItem.tokens}개 토큰`, { count: packageItem.tokens })}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {t('shop.premiumFeatures', '다양한 프리미엄 기능 이용')}
                </Text>
              </View>
            </View>
          </View>
          <View className="flex-row items-center justify-between mb-4">
            <View>
              {packageItem.originalPrice && (
                <Text className="text-gray-400 text-sm line-through">
                  ₩{packageItem.originalPrice.toLocaleString()}
                </Text>
              )}
              <Text className="text-2xl font-bold text-gray-900">
                {(() => {
                  const product = products.find(p => p.productId === packageItem.id);
                  if (product && product.localizedPrice) {
                    return product.localizedPrice;
                  }
                  return `₩${packageItem.price.toLocaleString()}${!isIAPAvailable ? ` ${t('shop.devModePrice', '(개발모드)')}` : ''}`;
                })()}
              </Text>
            </View>
            
            {packageItem.originalPrice && (
              <View className="bg-red-50 px-2 py-1 rounded">
                <Text className="text-red-600 text-xs font-semibold">
                  {t('shop.discount', `${Math.round((1 - packageItem.price / packageItem.originalPrice) * 100)}% 할인`, { percent: Math.round((1 - packageItem.price / packageItem.originalPrice) * 100) })}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            className={`py-4 rounded-xl ${
              purchasing || loading ? 'bg-gray-400' : !isIAPAvailable ? 'bg-orange-500' : 'bg-blue-600'
            }`}
            onPress={() => onPurchase(packageItem)}
            disabled={purchasing || loading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {purchasing ? t('shop.purchasing', '구매 중...') : loading ? t('shop.loading', '로딩 중...') : !isIAPAvailable ? t('shop.expoGo', 'Expo Go') : t('shop.purchase', '구매하기')}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

export default TokenPackageCard;