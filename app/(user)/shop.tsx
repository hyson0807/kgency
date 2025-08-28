import React, { useState, useEffect } from 'react';
import { View, ScrollView, Platform } from 'react-native';
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
import {
  // Token components
  TokenBalanceCard,
  TokenUsageGuide,
  // Package components
  TokenPackageCard,
  YatraPackageCard,
  // Modal components
  YatraDetailModal,
  EmailInputModal,
  // Common components
  ShopHeader,
  DevModeNotice,
  ContactSection
} from '@/components/user/shop';
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
        <ShopHeader />
        <TokenBalanceCard 
          userTokens={userTokens}
          onRefresh={fetchTokenBalance}
        />
        <DevModeNotice isIAPAvailable={isIAPAvailable} />
        <TokenPackageCard
          tokenPackages={tokenPackages}
          products={products}
          purchasing={purchasing}
          loading={loading}
          isIAPAvailable={isIAPAvailable}
          onPurchase={handlePurchase}
        />


        <YatraPackageCard
          products={products}
          isIAPAvailable={isIAPAvailable}
          YATRA_PACKAGE_AVAILABLE={YATRA_PACKAGE_AVAILABLE}
          onPress={() => setYatraModalVisible(true)}
          showModal={showModal}
        />

        <TokenUsageGuide />

        <ContactSection />

      </ScrollView>

      <YatraDetailModal
        visible={yatraModalVisible}
        onClose={() => setYatraModalVisible(false)}
        onPurchase={() => {
          setYatraModalVisible(false);
          setEmailModalVisible(true);
        }}
        purchasing={purchasing}
        loading={loading}
        YATRA_PACKAGE_AVAILABLE={YATRA_PACKAGE_AVAILABLE}
      />

      <EmailInputModal
        visible={emailModalVisible}
        onClose={() => setEmailModalVisible(false)}
        onConfirm={handleYatraPurchase}
        email={yatraEmail}
        onEmailChange={setYatraEmail}
        YATRA_PACKAGE_AVAILABLE={YATRA_PACKAGE_AVAILABLE}
      />



      <ModalComponent />
    </View>
  );
};
export default Shop;