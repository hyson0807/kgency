import React, { useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from "@/lib/api";
import { useTranslation } from '@/contexts/TranslationContext';
import { useModal } from '@/lib/shared/ui/hooks/useModal';
import { useIAP } from '@/lib/features/payments/hooks/useIAP';
import { getProductId, TokenPackage } from '@/lib/features/payments/types';
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

const Shop = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [yatraModalVisible, setYatraModalVisible] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [yatraEmail, setYatraEmail] = useState('');
  const { showModal, ModalComponent } = useModal();

  // 야트라 패키지 출시 플래그
  const YATRA_PACKAGE_AVAILABLE = true;
  
  // 토큰 패키지 정의
  const tokenPackages: TokenPackage[] = [
    {
      id: getProductId('token_5_pack'),
      tokens: 5,
      price: 5500,
      isPopular: true
    }
  ];

  // IAP Hook 사용
  const {
    products,
    userTokens,
    isIAPAvailable,
    loading,
    purchasing,
    purchaseProduct,
    fetchTokenBalance,
    isUserCancellation,
  } = useIAP({
    productIds: [
      getProductId('token_5_pack'),
      'yatra_package_1'
    ],
    autoInit: true,
  });

  // 토큰 구매 처리
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

  // 실제 구매 프로세스
  const processPurchase = async (packageItem: TokenPackage) => {
    if (purchasing) return;
    
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
      
      // 실제 구매 진행
      await purchaseProduct(packageItem.id);
      
      // 성공 후 잔액 새로고침
      await fetchTokenBalance();
      
      showModal(
        t('shop.purchaseComplete', '구매 완료'),
        t('shop.purchaseSuccess', '5개의 토큰이 지급되었습니다!', { count: 5 }),
        'info'
      );
    } catch (error: any) {
      if (isUserCancellation(error)) {
        return; // 사용자 취소는 조용히 처리
      }
      
      let errorMessage = t('shop.errorGeneral', '결제 처리 중 오류가 발생했습니다.');
      
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
    }
  };

  // 야트라 구매 처리
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

  // 야트라 구매 프로세스
  const processYatraPurchase = async () => {
    if (purchasing) return;
    
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
      
      // 야트라 구매는 별도 검증 로직 필요
      await purchaseYatraWithEmail('yatra_package_1', yatraEmail);
      
      // 성공 후 잔액 새로고침
      await fetchTokenBalance();
      
      showModal(
        t('shop.yatraPurchaseComplete', '야트라 패키지 구매 완료'),
        t('shop.yatraPurchaseSuccess', '야트라 패키지 구매가 완료되었습니다!\n\n• 토큰 20개가 즉시 충전되었습니다\n• PDF 파일과 구직 확정권은 1-2일 내로 이메일로 전송됩니다\n• 감사합니다!'),
        'info'
      );
      
      setYatraEmail('');
    } catch (error: any) {
      if (isUserCancellation(error)) {
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
    }
  };

  // 야트라 구매 (이메일 포함)
  const purchaseYatraWithEmail = async (productId: string, email: string) => {
    // IAP 라이브러리 동적 로드 체크
    let RNIap: any = null;
    try {
      const iap = require('react-native-iap');
      RNIap = iap.default || iap;
    } catch {
      throw new Error('IAP not available');
    }

    let purchase: any;
    
    if (Platform.OS === 'android') {
      purchase = await RNIap.requestPurchase({ 
        skus: [productId]
      });
    } else {
      purchase = await RNIap.requestPurchase({ 
        sku: productId
      });
    }
    
    if (!purchase) {
      throw new Error('Purchase object not received');
    }
    
    // 서버에 영수증 전송 (이메일 포함)
    await verifyYatraPurchaseWithServer(purchase, email);
    
    // 트랜잭션 완료 처리
    if (RNIap && typeof RNIap.finishTransaction === 'function') {
      await RNIap.finishTransaction({ purchase, isConsumable: true });
      
      if (Platform.OS === 'android' && purchase.purchaseToken) {
        try {
          await RNIap.consumePurchaseAndroid({ 
            purchaseToken: purchase.purchaseToken,
            developerPayload: ''
          });
        } catch (error) {
          console.error('Android consume error:', error);
        }
      }
    }
  };

  // 야트라 구매 검증
  const verifyYatraPurchaseWithServer = async (purchase: any, email: string) => {
    const platform = Platform.OS as 'ios' | 'android';
    const payload: any = { 
      platform,
      productId: 'yatra_package_1',
      email: email
    };
    
    if (platform === 'ios') {
      payload.receiptData = purchase.transactionReceipt;
    } else {
      const androidToken = purchase.purchaseToken;
      if (!androidToken) {
        throw new Error('구매 토큰을 찾을 수 없습니다.');
      }
      payload.purchaseToken = androidToken;
    }
    
    const response = await api('POST', '/api/purchase/yatra/verify', payload);
    
    if (!response.success) {
      throw new Error('Purchase verification failed: ' + response.error);
    }
  };

  return (
    <View className="flex-1 bg-gray-50" style={{paddingTop: insets.top}}>
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