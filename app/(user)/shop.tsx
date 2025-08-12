import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useModal } from '@/hooks/useModal';

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
}

const Shop = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [userTokens, setUserTokens] = useState(0);
  const { showModal, ModalComponent } = useModal();

  const tokenPackages: TokenPackage[] = [
    {
      id: '1',
      tokens: 5,
      price: 5500,
      isPopular: true
    }
  ];

  const handlePurchase = (packageItem: TokenPackage) => {
    showModal(
      '토큰 구매',
      `${packageItem.tokens}개의 토큰을 ${packageItem.price.toLocaleString()}원에 구매하시겠습니까?`,
      'confirm',
      () => processPurchase(),
      true,
      '구매',
      '취소'
    );
  };

  const processPurchase = () => {
    showModal(
      '알림',
      '결제 기능은 추후 구현될 예정입니다.',
      'info',
      undefined,
      false
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="bg-white px-6 py-8 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-2">상점</Text>
          <Text className="text-gray-600">토큰을 구매하여 더 많은 기능을 이용해보세요</Text>
        </View>

        <View className="bg-white mx-4 mt-6 rounded-xl shadow-sm border border-gray-200 p-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">내 토큰</Text>
            <View className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full">
              <Ionicons name="diamond" size={16} color="#3B82F6" />
              <Text className="text-blue-600 font-semibold ml-1">{userTokens}</Text>
            </View>
          </View>
          <Text className="text-gray-600 text-sm">
            토큰을 사용하여 프리미엄 기능을 이용할 수 있습니다
          </Text>
        </View>

        <View className="px-4 mt-8 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">토큰 패키지</Text>
          
          {tokenPackages.map((packageItem) => (
            <View 
              key={packageItem.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4"
            >
              {packageItem.isPopular && (
                <View className="absolute -top-3 left-4">
                  <View className="bg-orange-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-semibold">인기</Text>
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
                      {packageItem.tokens}개 토큰
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      다양한 프리미엄 기능 이용
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
                    ₩{packageItem.price.toLocaleString()}
                  </Text>
                </View>
                
                {packageItem.originalPrice && (
                  <View className="bg-red-50 px-2 py-1 rounded">
                    <Text className="text-red-600 text-xs font-semibold">
                      {Math.round((1 - packageItem.price / packageItem.originalPrice) * 100)}% 할인
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                className="bg-blue-600 py-4 rounded-xl"
                onPress={() => handlePurchase(packageItem)}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  구매하기
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View className="bg-white mx-4 rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">토큰 사용 안내</Text>
          <View className="space-y-2">
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" className="mr-3 mt-0.5" />
              <Text className="text-gray-600 flex-1">프리미엄 지원서 작성</Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" className="mr-3 mt-0.5" />
              <Text className="text-gray-600 flex-1">우선순위 매칭</Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" className="mr-3 mt-0.5" />
              <Text className="text-gray-600 flex-1">추가 지원 기회</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <ModalComponent />
    </SafeAreaView>
  );
};

export default Shop;