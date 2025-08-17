import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
// IAP 라이브러리는 development build에서만 동작
let RNIap: any = null;
let isIAPAvailable = false;

try {
  const iap = require('react-native-iap');
  RNIap = iap.default || iap;
  // IAP가 제대로 로드되었는지 확인
  if (RNIap && typeof RNIap.initConnection === 'function') {
    isIAPAvailable = true;
    console.log('react-native-iap loaded successfully');
  } else {
    console.log('react-native-iap loaded but initConnection not available');
    RNIap = null;
  }
} catch (error) {
  console.log('react-native-iap not available in current environment:', error);
  RNIap = null;
}
import { api } from '@/lib/api';
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
  const [products, setProducts] = useState<any[]>([]);
  const [purchasing, setPurchasing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showModal, ModalComponent } = useModal();

  const tokenPackages: TokenPackage[] = [
    {
      id: Platform.OS === 'android' ? 'token_5_pack_android' : 'token_5_pack',
      tokens: 5,
      price: 5500,
      isPopular: true
    }
  ];

  useEffect(() => {
    initIAP();
    fetchTokenBalance();
    
    return () => {
      if (isIAPAvailable && RNIap && typeof RNIap.endConnection === 'function') {
        try {
          RNIap.endConnection();
        } catch (error) {
          console.log('Error closing IAP connection:', error);
        }
      }
    };
  }, []);

  const initIAP = async () => {
    setLoading(true);
    
    try {
      if (!isIAPAvailable) {
        console.log('IAP not available - running in Expo Go or IAP not properly installed');
        return;
      }
      
      console.log('Initializing IAP connection...');
      await RNIap.initConnection();
      
      // 앱 시작 시 미소비 구매 확인 및 처리 (Android용)
      if (Platform.OS === 'android') {
        try {
          console.log('Checking for unconsumed purchases...');
          const purchases = await RNIap.getAvailablePurchases();
          
          if (purchases && purchases.length > 0) {
            console.log(`Found ${purchases.length} unconsumed purchases`);
            
            for (const purchase of purchases) {
              if ((purchase.productId === 'token_5_pack' || purchase.productId === 'token_5_pack_android') && purchase.purchaseToken) {
                console.log('Consuming previous purchase:', purchase.productId);
                try {
                  await RNIap.consumePurchaseAndroid({
                    purchaseToken: purchase.purchaseToken,
                    developerPayload: ''
                  });
                  console.log('Previous purchase consumed successfully');
                } catch (consumeError) {
                  console.log('Error consuming previous purchase:', consumeError);
                }
              }
            }
          }
        } catch (error) {
          console.log('Error checking available purchases:', error);
        }
      }
      
      console.log('Getting products...');
      const productId = Platform.OS === 'android' ? 'token_5_pack_android' : 'token_5_pack';
      const products = await RNIap.getProducts({ skus: [productId] });
      console.log('Raw IAP products response:', products);
      setProducts(products);
      
      if (products && products.length > 0) {
        console.log('IAP Products loaded successfully:', products);
      } else {
        console.log('No IAP products found - this could be because:');
        console.log('1. Running on iOS Simulator (IAP not supported)');
        console.log('2. Product not submitted/approved in App Store Connect');
        console.log('3. Not signed in to sandbox account on real device');
        console.log('4. Bundle identifier mismatch');
      }
      
    } catch (error) {
      console.error('IAP initialization failed:', error);
      
      // 개발 환경에서는 에러 메시지를 표시하지 않음
      if (!__DEV__) {
        showModal(
          '오류',
          '결제 시스템 초기화에 실패했습니다.',
          'warning'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenBalance = async () => {
    if (!user) {
      console.log('No user logged in, skipping token balance fetch');
      return;
    }
    
    try {
      console.log('Fetching token balance for user:', user.userId);
      const response = await api('GET', '/api/purchase/tokens/balance');
      console.log('Token balance response:', response);
      
      if (response?.success) {
        setUserTokens(response.balance || 0);
      } else {
        console.log('Token balance fetch unsuccessful:', response);
        // 기본값 0으로 설정
        setUserTokens(0);
      }
    } catch (error: any) {
      console.error('Failed to fetch token balance:', error);
      
      // Network error인 경우 사용자에게 알림
      if (error?.message?.includes('Network Error') && __DEV__) {
        console.log('Network error - server might not be running');
      }
      
      // 기본값 0으로 설정
      setUserTokens(0);
    }
  };

  const handlePurchase = async (packageItem: TokenPackage) => {
    if (purchasing) return;
    
    // 실제 상품 가격 표시를 위해 IAP 제품 정보 사용
    const product = products.find(p => p.productId === packageItem.id);
    const displayPrice = product ? product.localizedPrice : `₩${packageItem.price.toLocaleString()}`;
    
    showModal(
      '토큰 구매',
      `${packageItem.tokens}개의 토큰을 ${displayPrice}에 구매하시겠습니까?`,
      'confirm',
      () => processPurchase(packageItem),
      true,
      '구매',
      '취소'
    );
  };

  const processPurchase = async (packageItem: TokenPackage) => {
    if (purchasing) return;
    
    setPurchasing(true);
    try {
      if (!isIAPAvailable) {
        // 개발 환경에서는 모의 구매 처리
        showModal(
          '개발 모드',
          '현재 Expo Go에서 실행 중이거나 IAP가 설치되지 않았습니다. \n\n실제 IAP 테스트를 위해서는 development build를 사용해주세요:\n\nnpx expo run:ios',
          'info'
        );
        return;
      }
      
      console.log('Starting purchase for:', packageItem.id);
      
      let purchase: any;
      
      if (Platform.OS === 'android') {
        // Android: requestPurchase는 purchase 객체를 직접 반환하지 않음
        console.log('Android purchase starting...');
        
        // 구매 요청 - requestPurchase가 실제로 구매 데이터를 반환할 수도 있음
        try {
          const purchaseResult = await RNIap.requestPurchase({ skus: [packageItem.id] });
          console.log('RequestPurchase result:', purchaseResult);
          
          // requestPurchase가 구매 정보를 반환했다면 사용
          if (purchaseResult && purchaseResult.purchaseToken) {
            purchase = purchaseResult;
            console.log('Using purchase from requestPurchase');
          }
        } catch (purchaseError) {
          console.log('RequestPurchase error or returned void:', purchaseError);
        }
        
        // purchase가 없으면 getAvailablePurchases로 가져오기
        if (!purchase) {
          console.log('Fetching purchase details from getAvailablePurchases...');
          const purchases = await RNIap.getAvailablePurchases();
          console.log('Available purchases:', purchases);
          
          // 방금 구매한 상품 찾기
          purchase = purchases.find((p: any) => p.productId === packageItem.id);
          
          if (!purchase && purchases.length > 0) {
            // 구매 정보를 못 찾으면 가장 최근 구매 사용
            purchase = purchases[purchases.length - 1];
          }
        }
        
        console.log('Android purchase found:', purchase);
      } else {
        // iOS: requestPurchase가 purchase 객체를 직접 반환
        const purchaseParams = { sku: packageItem.id };
        console.log('iOS purchase params:', purchaseParams);
        purchase = await RNIap.requestPurchase(purchaseParams);
        console.log('iOS purchase initiated:', purchase);
      }

      if (!purchase) {
        throw new Error('Purchase object not received');
      }
      
      // 서버에 영수증 전송
      await verifyPurchaseWithServer(purchase);
      
      // 성공 후 잔액 새로고침
      await fetchTokenBalance();
      
      showModal(
        '구매 완료',
        '5개의 토큰이 지급되었습니다!',
        'info'
      );

    } catch (error: any) {
      // 사용자가 취소한 경우 - 다양한 취소 코드 처리
      if (error.code === 'E_USER_CANCELLED' || 
          error.code === 'E_DEFERRED' ||
          error.userCancelled === true ||
          (error.message && error.message.includes('cancelled')) ||
          (error.message && error.message.includes('SKErrorDomain error 2'))) {
        console.log('User cancelled the purchase');
        return; // 에러 메시지를 표시하지 않음
      }
      
      // 취소가 아닌 실제 에러인 경우만 에러 로그 출력
      console.error('Purchase failed:', error);
      
      let errorMessage = '결제 처리 중 오류가 발생했습니다.';
      
      // 기타 에러 메시지 처리
      if (error.message) {
        if (error.message.includes('already processed')) {
          errorMessage = '이미 처리된 구매입니다.';
        } else if (error.message.includes('verification failed')) {
          errorMessage = '구매 검증에 실패했습니다.';
        }
      }
      
      showModal(
        '구매 실패',
        errorMessage,
        'warning'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const verifyPurchaseWithServer = async (purchase: any) => {
    const platform = Platform.OS;
    const payload: any = {};
    
    // Android 구매 객체 디버깅
    console.log('=== Purchase Object Debug ===');
    console.log('Full purchase object:', JSON.stringify(purchase, null, 2));
    console.log('Purchase keys:', Object.keys(purchase));
    
    // 플랫폼별 데이터 설정
    if (platform === 'ios') {
      payload.receiptData = purchase.transactionReceipt;
    } else {
      // Android - 다양한 키 이름 시도 (purchaseStateAndroid는 토큰이 아니므로 제외)
      const androidToken = purchase.purchaseToken || 
                          purchase.purchase_token || 
                          purchase.token;
      
      if (!androidToken) {
        console.error('Android purchase token not found in:', purchase);
        console.error('Available keys:', Object.keys(purchase));
        // 토큰이 없으면 에러 발생
        throw new Error('구매 토큰을 찾을 수 없습니다. 구매 정보가 올바르지 않습니다.');
      }
      
      payload.purchaseToken = androidToken;
    }
    
    // 플랫폼 정보 설정 (device 필드 제거, platform만 사용)
    payload.platform = platform;

    console.log('Verifying purchase with server:');
    console.log('Platform:', platform);
    console.log('Purchase object keys:', Object.keys(purchase));
    console.log('Purchase purchaseToken:', payload.purchaseToken ? 'Present' : 'Missing');
    console.log('Payload being sent:', JSON.stringify(payload, null, 2));
    
    const response = await api('POST', '/api/purchase/verify', payload);
    
    console.log('Server response:', JSON.stringify(response, null, 2));
    
    if (!response.success) {
      throw new Error('Purchase verification failed: ' + response.error);
    }

    console.log('Purchase verified successfully:', response);
    
    // 구매 완료 처리
    if (isIAPAvailable && RNIap && typeof RNIap.finishTransaction === 'function') {
      await RNIap.finishTransaction({ purchase, isConsumable: true });
      
      // Android에서는 추가로 consumePurchase 호출 필요
      if (Platform.OS === 'android' && purchase.purchaseToken) {
        try {
          await RNIap.consumePurchaseAndroid({ 
            purchaseToken: purchase.purchaseToken,
            developerPayload: ''
          });
          console.log('Purchase consumed successfully');
        } catch (error) {
          console.log('Error consuming purchase:', error);
        }
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{paddingTop: 44}}>
      <ScrollView className="flex-1">
        <View className="bg-white px-6 py-8 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-2">상점</Text>
          <Text className="text-gray-600">토큰을 구매하여 더 많은 기능을 이용해보세요</Text>
        </View>

        <View className="bg-white mx-4 mt-6 rounded-xl shadow-sm border border-gray-200 p-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">내 토큰</Text>
            <TouchableOpacity 
              onPress={fetchTokenBalance}
              className="flex-row items-center bg-blue-50 px-3 py-1 rounded-full"
            >
              <Ionicons name="diamond" size={16} color="#3B82F6" />
              <Text className="text-blue-600 font-semibold ml-1">{userTokens}</Text>
              <Ionicons name="refresh" size={14} color="#3B82F6" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-600 text-sm mb-4">
            토큰을 사용하여 프리미엄 기능을 이용할 수 있습니다
          </Text>
          
          {/* 이용 내역 확인 버튼 */}
          <TouchableOpacity
            onPress={() => router.push('/(pages)/(user)/(shop)/usage-history')}
            className="flex-row items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={20} color="#6B7280" />
              <Text className="text-gray-700 font-medium ml-2">토큰 이용 내역</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* 개발 환경 안내 */}
        {!isIAPAvailable && __DEV__ && (
          <View className="bg-orange-50 mx-4 rounded-xl shadow-sm border border-orange-200 p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={20} color="#f97316" />
              <Text className="text-orange-800 font-semibold ml-2">개발 모드</Text>
            </View>
            <Text className="text-orange-700 text-sm leading-5 mb-3">
              현재 Expo Go에서 실행 중이므로 In-App Purchase 기능이 비활성화되어 있습니다.
            </Text>
            <View className="bg-orange-100 p-3 rounded-lg">
              <Text className="text-orange-800 text-xs font-semibold mb-1">테스트 방법:</Text>
              <Text className="font-mono text-xs text-orange-700">npx expo run:ios</Text>
              <Text className="text-orange-700 text-xs mt-1">또는</Text>
              <Text className="font-mono text-xs text-orange-700">npx expo run:android</Text>
            </View>
          </View>
        )}

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
                    {(() => {
                      const product = products.find(p => p.productId === packageItem.id);
                      if (product && product.localizedPrice) {
                        return product.localizedPrice;
                      }
                      // 개발 환경에서는 기본 가격 표시
                      return `₩${packageItem.price.toLocaleString()}${!isIAPAvailable ? ' (개발모드)' : ''}`;
                    })()}
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
                className={`py-4 rounded-xl ${
                  purchasing || loading ? 'bg-gray-400' : !isIAPAvailable ? 'bg-orange-500' : 'bg-blue-600'
                }`}
                onPress={() => handlePurchase(packageItem)}
                disabled={purchasing || loading}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {purchasing ? '구매 중...' : loading ? '로딩 중...' : !isIAPAvailable ? 'Expo Go' : '구매하기'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View className="bg-white mx-4 rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">토큰 사용 안내</Text>
          <View className="space-y-2">
            <View className="flex-row items-start mb-3">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
              <Text className="text-gray-600 flex-1">즉시면접 예약 (토큰 1개)</Text>
            </View>
            <View className="flex-row items-start mb-3">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
              <Text className="text-gray-600 flex-1">프리미엄 기능 이용</Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
              <Text className="text-gray-600 flex-1">추가 서비스 준비 중</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <ModalComponent />
    </View>
  );
};

export default Shop;