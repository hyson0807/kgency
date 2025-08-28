import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Modal, TextInput, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { AndroidPurchaseData, IOSPurchaseData, PurchaseVerificationRequest } from '@/types/purchase';
// IAP 라이브러리는 development build에서만 동작
let RNIap: any = null;
let isIAPAvailable = false;
try {
  const iap = require('react-native-iap');
  RNIap = iap.default || iap;
  // IAP가 제대로 로드되었는지 확인
  if (RNIap && typeof RNIap.initConnection === 'function') {
    isIAPAvailable = true;
  } else {
    RNIap = null;
  }
} catch (error) {
  RNIap = null;
}
import { api } from "@/lib/api"
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
  const [yatraModalVisible, setYatraModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [yatraEmail, setYatraEmail] = useState('');
  const { showModal, ModalComponent } = useModal();

  // 야트라 패키지 출시 플래그 - 앱스토어 심사 후 true로 변경
  const YATRA_PACKAGE_AVAILABLE = false;
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
        }
      }
    };
  }, []);
  const initIAP = async () => {
    setLoading(true);
    
    try {
      if (!isIAPAvailable) {
        return;
      }
      
      await RNIap.initConnection();
      
      // 앱 시작 시 미소비 구매 확인 및 처리 (Android용)
      if (Platform.OS === 'android') {
        try {
          const purchases = await RNIap.getAvailablePurchases();
          
          if (purchases && purchases.length > 0) {
            
            for (const purchase of purchases) {
              if ((purchase.productId === 'token_5_pack' || purchase.productId === 'token_5_pack_android') && purchase.purchaseToken) {
                try {
                  await RNIap.consumePurchaseAndroid({
                    purchaseToken: purchase.purchaseToken,
                    developerPayload: ''
                  });
                } catch (consumeError) {
                }
              }
            }
          }
        } catch (error) {
        }
      }
      
      const productIds = [
        Platform.OS === 'android' ? 'token_5_pack_android' : 'token_5_pack',
        'yatra_package_1'
      ];
      const products = await RNIap.getProducts({ skus: productIds });
      setProducts(products);
      
      if (products && products.length > 0) {
      } else {
      }
      
    } catch (error) {
      
      // 개발 환경에서는 에러 메시지를 표시하지 않음
      if (!__DEV__) {
        showModal(
          t('shop.error', '오류'),
          t('shop.errorInit', '결제 시스템 초기화에 실패했습니다.'),
          'warning'
        );
      }
    } finally {
      setLoading(false);
    }
  };
  const fetchTokenBalance = async () => {
    if (!user) {
      return;
    }
    
    try {
      const response = await api('GET', '/api/purchase/tokens/balance');
      
      if (response?.success) {
        setUserTokens(response.balance || 0);
      } else {
        // 기본값 0으로 설정
        setUserTokens(0);
      }
    } catch (error: any) {
      
      // Network error인 경우 사용자에게 알림
      if (error?.message?.includes('Network Error') && __DEV__) {
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
      t('shop.purchaseToken', '토큰 구매'),
      t('shop.purchaseConfirm', `${packageItem.tokens}개의 토큰을 ${displayPrice}에 구매하시겠습니까?`, { count: packageItem.tokens, price: displayPrice }),
      'confirm',
      () => processPurchase(packageItem),
      true,
      t('shop.purchaseBtn', '구매'),
      t('shop.cancel', '취소')
    );
  };
  const processPurchase = async (packageItem: TokenPackage) => {
    if (purchasing) return;
    
    setPurchasing(true);
    try {
      if (!isIAPAvailable) {
        // 개발 환경에서는 모의 구매 처리
        showModal(
          t('shop.devModeInfo', '개발 모드'),
          t('shop.devModeNotice', '현재 Expo Go에서 실행 중이거나 IAP가 설치되지 않았습니다. \n\n실제 IAP 테스트를 위해서는 development build를 사용해주세요:\n\nnpx expo run:ios'),
          'info'
        );
        return;
      }
      
      
      let purchase: any;
      
      // iOS와 Android 통합 처리 - 동일한 방식 사용
      
      if (Platform.OS === 'android') {
        // Android: skus 배열로 전달
        purchase = await RNIap.requestPurchase({ 
          skus: [packageItem.id]
        });
      } else {
        // iOS: sku 단일 값으로 전달
        purchase = await RNIap.requestPurchase({ 
          sku: packageItem.id 
        });
      }
      
      if (!purchase) {
        throw new Error('Purchase object not received');
      }
      
      // 서버에 영수증 전송
      await verifyPurchaseWithServer(purchase);
      
      // 성공 후 잔액 새로고침
      await fetchTokenBalance();
      
      showModal(
        t('shop.purchaseComplete', '구매 완료'),
        t('shop.purchaseSuccess', '5개의 토큰이 지급되었습니다!', { count: 5 }),
        'info'
      );
    } catch (error: any) {
      // 사용자가 취소한 경우 - iOS와 Android 공통 처리
      const isUserCancellation = 
        error.code === 'E_USER_CANCELLED' || 
        error.code === 'E_DEFERRED' ||
        error.code === 'E_ALREADY_OWNED' ||
        error.userCancelled === true ||
        (error.message && (
          error.message.includes('cancelled') ||
          error.message.includes('canceled') ||
          error.message.includes('User canceled') ||
          error.message.includes('User cancelled') ||
          error.message.includes('already owned') ||
          error.message.includes('SKErrorDomain error 2') // iOS 취소 에러
        ));
      if (isUserCancellation) {
        return; // 에러 메시지를 표시하지 않음
      }
      
      // 취소가 아닌 실제 에러인 경우만 에러 로그 출력
      
      let errorMessage = t('shop.errorGeneral', '결제 처리 중 오류가 발생했습니다.');
      
      // 플랫폼별 에러 메시지 처리
      if (error.message) {
        if (error.message.includes('already processed')) {
          errorMessage = t('shop.errorAlreadyProcessed', '이미 처리된 구매입니다.');
        } else if (error.message.includes('verification failed')) {
          errorMessage = t('shop.errorVerification', '구매 검증에 실패했습니다.');
        } else if (error.message.includes('Network Error')) {
          errorMessage = t('shop.errorNetwork', '네트워크 연결을 확인해주세요.');
        } else if (error.message.includes('Google Play API') || error.message.includes('Apple Store')) {
          errorMessage = t('shop.errorService', '결제 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      }
      
      showModal(
        t('shop.purchaseFailed', '구매 실패'),
        errorMessage,
        'warning'
      );
    } finally {
      setPurchasing(false);
    }
  };
  const verifyPurchaseWithServer = async (purchase: AndroidPurchaseData | IOSPurchaseData) => {
    const platform = Platform.OS as 'ios' | 'android';
    const payload: PurchaseVerificationRequest = { platform };
    
    // Android 구매 객체 디버깅
    
    // 플랫폼별 데이터 설정 (타입 안전성 강화)
    if (platform === 'ios') {
      const iosPurchase = purchase as IOSPurchaseData;
      payload.receiptData = iosPurchase.transactionReceipt;
    } else {
      const androidPurchase = purchase as AndroidPurchaseData;
      // Android - purchaseToken 확인
      const androidToken = androidPurchase.purchaseToken;
      
      if (!androidToken) {
        // 토큰이 없으면 에러 발생
        throw new Error('구매 토큰을 찾을 수 없습니다. 구매 정보가 올바르지 않습니다.');
      }
      
      payload.purchaseToken = androidToken;
    }
    
    const response = await api('POST', '/api/purchase/verify', payload);
    
    
    if (!response.success) {
      throw new Error('Purchase verification failed: ' + response.error);
    }
    
    // 구매 완료 처리
    if (isIAPAvailable && RNIap && typeof RNIap.finishTransaction === 'function') {
      await RNIap.finishTransaction({ purchase, isConsumable: true });
      
      // Android에서는 추가로 consumePurchase 호출 필요
      if (Platform.OS === 'android') {
        const androidPurchase = purchase as AndroidPurchaseData;
        if (androidPurchase.purchaseToken) {
          try {
            await RNIap.consumePurchaseAndroid({ 
              purchaseToken: androidPurchase.purchaseToken,
              developerPayload: ''
            });
          } catch (error) {
          }
        }
      }
    }
  };

  const handleYatraPurchase = async () => {
    if (purchasing || !yatraEmail || !yatraEmail.includes('@')) return;
    
    setEmailModalVisible(false);
    
    // 야트라 패키지 구매 확인
    showModal(
      t('shop.purchaseYatra', '야트라 패키지 구매'),
      t('shop.purchaseYatraConfirm', '야트라 스페셜 패키지를 ₩55,000에 구매하시겠습니까?\n\n포함 내용:\n• PDF 가이드북\n• 야트라 전용 구직 확정권\n• 토큰 20개 (22,000원 상당)'),
      'confirm',
      () => processYatraPurchase(),
      true,
      t('shop.purchaseBtn', '구매'),
      t('shop.cancel', '취소')
    );
  };

  const processYatraPurchase = async () => {
    if (purchasing) return;
    
    setPurchasing(true);
    try {
      if (!isIAPAvailable) {
        // 개발 환경에서는 모의 구매 처리
        showModal(
          t('shop.devModeInfo', '개발 모드'),
          t('shop.devModeNotice', '현재 Expo Go에서 실행 중이거나 IAP가 설치되지 않았습니다. \n\n실제 IAP 테스트를 위해서는 development build를 사용해주세요'),
          'info'
        );
        setYatraEmail('');
        return;
      }
      
      let purchase: any;
      
      if (Platform.OS === 'android') {
        purchase = await RNIap.requestPurchase({ 
          skus: ['yatra_package_1']
        });
      } else {
        purchase = await RNIap.requestPurchase({ 
          sku: 'yatra_package_1'
        });
      }
      
      if (!purchase) {
        throw new Error('Purchase object not received');
      }
      
      // 서버에 영수증 전송 (이메일 포함)
      await verifyYatraPurchaseWithServer(purchase, yatraEmail);
      
      // 성공 후 잔액 새로고침
      await fetchTokenBalance();
      
      showModal(
        t('shop.yatraPurchaseComplete', '야트라 패키지 구매 완료'),
        t('shop.yatraPurchaseSuccess', '야트라 패키지 구매가 완료되었습니다!\n\n• 토큰 20개가 즉시 충전되었습니다\n• PDF 파일과 구직 확정권은 1-2일 내로 이메일로 전송됩니다\n• 감사합니다!'),
        'info'
      );
      
      setYatraEmail('');
    } catch (error: any) {
      // 사용자가 취소한 경우
      const isUserCancellation = 
        error.code === 'E_USER_CANCELLED' || 
        error.code === 'E_DEFERRED' ||
        error.code === 'E_ALREADY_OWNED' ||
        error.userCancelled === true ||
        (error.message && (
          error.message.includes('cancelled') ||
          error.message.includes('canceled') ||
          error.message.includes('User canceled') ||
          error.message.includes('User cancelled') ||
          error.message.includes('already owned') ||
          error.message.includes('SKErrorDomain error 2')
        ));
      
      if (isUserCancellation) {
        setYatraEmail('');
        return;
      }
      
      let errorMessage = t('shop.errorGeneral', '결제 처리 중 오류가 발생했습니다.');
      
      if (error.message) {
        if (error.message.includes('already processed')) {
          errorMessage = t('shop.errorAlreadyProcessed', '이미 처리된 구매입니다.');
        } else if (error.message.includes('verification failed')) {
          errorMessage = t('shop.errorVerification', '구매 검증에 실패했습니다.');
        } else if (error.message.includes('Network Error')) {
          errorMessage = t('shop.errorNetwork', '네트워크 연결을 확인해주세요.');
        }
      }
      
      showModal(
        t('shop.purchaseFailed', '구매 실패'),
        errorMessage,
        'warning'
      );
      
      setYatraEmail('');
    } finally {
      setPurchasing(false);
    }
  };

  const verifyYatraPurchaseWithServer = async (purchase: AndroidPurchaseData | IOSPurchaseData, email: string) => {
    const platform = Platform.OS as 'ios' | 'android';
    const payload: any = { 
      platform,
      productId: 'yatra_package_1',
      email: email
    };
    
    if (platform === 'ios') {
      const iosPurchase = purchase as IOSPurchaseData;
      payload.receiptData = iosPurchase.transactionReceipt;
    } else {
      const androidPurchase = purchase as AndroidPurchaseData;
      const androidToken = androidPurchase.purchaseToken;
      
      if (!androidToken) {
        throw new Error('구매 토큰을 찾을 수 없습니다.');
      }
      
      payload.purchaseToken = androidToken;
    }
    
    const response = await api('POST', '/api/purchase/yatra/verify', payload);
    
    if (!response.success) {
      throw new Error('Purchase verification failed: ' + response.error);
    }
    
    // 구매 완료 처리
    if (isIAPAvailable && RNIap && typeof RNIap.finishTransaction === 'function') {
      await RNIap.finishTransaction({ purchase, isConsumable: true });
      
      if (Platform.OS === 'android') {
        const androidPurchase = purchase as AndroidPurchaseData;
        if (androidPurchase.purchaseToken) {
          try {
            await RNIap.consumePurchaseAndroid({ 
              purchaseToken: androidPurchase.purchaseToken,
              developerPayload: ''
            });
          } catch (error) {
            console.error('Android consume error:', error);
          }
        }
      }
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{paddingTop: 44}}>
      <ScrollView className="flex-1">
        <View className="bg-white px-6 py-8 border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900 mb-2">{t('shop.title', '상점')}</Text>
          <Text className="text-gray-600">{t('shop.subtitle', '토큰을 구매하여 더 많은 기능을 이용해보세요')}</Text>
        </View>
        <View className="bg-white mx-4 mt-6 rounded-xl shadow-sm border border-gray-200 p-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-semibold text-gray-900">{t('shop.myTokens', '내 토큰')}</Text>
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
        {/* 개발 환경 안내 */}
        {!isIAPAvailable && __DEV__ && (
          <View className="bg-orange-50 mx-4 rounded-xl shadow-sm border border-orange-200 p-4 mb-4">
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={20} color="#f97316" />
              <Text className="text-orange-800 font-semibold ml-2">{t('shop.devMode', '개발 모드')}</Text>
            </View>
            <Text className="text-orange-700 text-sm leading-5 mb-3">
              {t('shop.devModeDesc', '현재 Expo Go에서 실행 중이므로 In-App Purchase 기능이 비활성화되어 있습니다.')}
            </Text>
            <View className="bg-orange-100 p-3 rounded-lg">
              <Text className="text-orange-800 text-xs font-semibold mb-1">{t('shop.testMethod', '테스트 방법:')}</Text>
              <Text className="font-mono text-xs text-orange-700">npx expo run:ios</Text>
              <Text className="text-orange-700 text-xs mt-1">{t('shop.or', '또는')}</Text>
              <Text className="font-mono text-xs text-orange-700">npx expo run:android</Text>
            </View>
          </View>
        )}
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
                      // 개발 환경에서는 기본 가격 표시
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
                onPress={() => handlePurchase(packageItem)}
                disabled={purchasing || loading}
              >
                <Text className="text-white text-center font-semibold text-lg">
                  {purchasing ? t('shop.purchasing', '구매 중...') : loading ? t('shop.loading', '로딩 중...') : !isIAPAvailable ? t('shop.expoGo', 'Expo Go') : t('shop.purchase', '구매하기')}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>


        {/* 야트라 패키지 섹션 */}
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
              onPress={() => {
                if (YATRA_PACKAGE_AVAILABLE) {
                  setYatraModalVisible(true);
                } else {
                  showModal(
                    t('shop.yatraComingSoon', '준비 중'),
                    t('shop.yatraComingSoonDesc', '야트라 패키지는 현재 준비 중입니다.\n곧 만나보실 수 있습니다!'),
                    'info'
                  );
                }
              }}
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

        <View className="bg-white mx-4 rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <Text className="text-lg font-semibold text-gray-900 mb-3">{t('shop.tokenUsageGuide', '토큰 사용 안내')}</Text>
          <View className="space-y-2">
            <View className="flex-row items-start mb-3">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
              <Text className="text-gray-600 flex-1">{t('shop.instantInterview', '즉시면접 예약 (토큰 1개)')}</Text>
            </View>
            <View className="flex-row items-start mb-3">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
              <Text className="text-gray-600 flex-1">{t('shop.premiumFeature', '프리미엄 기능 이용')}</Text>
            </View>
            <View className="flex-row items-start">
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginRight: 12, marginTop: 2 }} />
              <Text className="text-gray-600 flex-1">{t('shop.additionalService', '추가 서비스 준비 중')}</Text>
            </View>
          </View>
        </View>

        {/* 구매 문의 섹션 */}
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
              onPress={async () => {
                const email = 'welkit.answer@gmail.com';
                await Clipboard.setStringAsync(email);
                Alert.alert(
                  '이메일 주소 복사됨',
                  `${email} 주소가 클립보드에 복사되었습니다.`,
                  [{ text: '확인' }]
                );
              }}
          >
            <Text className="text-white text-center font-semibold">
              이메일 주소 복사
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* 야트라 패키지 상세 설명 모달 */}
      {YATRA_PACKAGE_AVAILABLE && (
      <Modal
        animationType="slide"
        transparent={true}
        visible={yatraModalVisible}
        onRequestClose={() => setYatraModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 py-8" style={{ maxHeight: '80%' }}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900">
                {t('shop.yatraPackageDetail', '야트라 패키지 상세')}
              </Text>
              <TouchableOpacity onPress={() => setYatraModalVisible(false)}>
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
              onPress={() => {
                setYatraModalVisible(false);
                setEmailModalVisible(true);
              }}
              disabled={purchasing || loading}
            >
              <Text className="text-white text-center font-semibold text-lg">
                {purchasing ? t('shop.purchasing', '구매 중...') : loading ? t('shop.loading', '로딩 중...') : t('shop.purchaseNow', '구매하기')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      )}

      {/* 이메일 입력 모달 */}
      {YATRA_PACKAGE_AVAILABLE && (
      <Modal
        animationType="slide"
        transparent={true}
        visible={emailModalVisible}
        onRequestClose={() => setEmailModalVisible(false)}
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
              className="border border-gray-300 rounded-lg px-4 py-3 text-base mb-6"
              placeholder={t('shop.emailPlaceholder', 'example@email.com')}
              value={yatraEmail}
              onChangeText={setYatraEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 py-3 bg-gray-200 rounded-xl"
                onPress={() => {
                  setEmailModalVisible(false);
                  setYatraEmail('');
                }}
              >
                <Text className="text-gray-700 text-center font-semibold">
                  {t('shop.cancel', '취소')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${
                  yatraEmail && yatraEmail.includes('@') ? 'bg-purple-600' : 'bg-gray-400'
                }`}
                onPress={() => handleYatraPurchase()}
                disabled={!yatraEmail || !yatraEmail.includes('@') || purchasing}
              >
                <Text className="text-white text-center font-semibold">
                  {t('shop.next', '다음')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      )}



      <ModalComponent />
    </View>
  );
};
export default Shop;