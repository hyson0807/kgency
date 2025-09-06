import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { IAPErrorCode } from '@/lib/types/iap';
import type {
  Product,
  AndroidPurchaseData,
  IOSPurchaseData,
  PurchaseVerificationRequest,
  UseIAPConfig,
  UseIAPReturn,
} from '@/lib/types/iap';

// IAP 라이브러리 동적 로드
let RNIap: any = null;
let isIAPAvailable = false;

try {
  const iap = require('react-native-iap');
  RNIap = iap.default || iap;
  if (RNIap && typeof RNIap.initConnection === 'function') {
    isIAPAvailable = true;
  } else {
    RNIap = null;
  }
} catch (error) {
  RNIap = null;
}

export const useIAP = (config: UseIAPConfig = {}): UseIAPReturn => {
  const {
    productIds = [],
    autoInit = true,
    onPurchaseSuccess,
    onPurchaseError,
  } = config;

  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [userTokens, setUserTokens] = useState(0);
  const [loading, setLoading] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const isInitialized = useRef(false);

  // 토큰 잔액 조회
  const fetchTokenBalance = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api('GET', '/api/purchase/tokens/balance');
      if (response?.success) {
        setUserTokens(response.balance || 0);
      } else {
        setUserTokens(0);
      }
    } catch (error) {
      console.error('토큰 잔액 조회 실패:', error);
      setUserTokens(0);
    }
  }, [user]);

  // IAP 초기화
  const initializeIAP = useCallback(async () => {
    if (isInitialized.current || !isIAPAvailable) {
      return;
    }

    console.log('🔄 IAP 초기화 시작...');
    setLoading(true);

    try {
      console.log('🔌 IAP 연결 중...');
      await RNIap.initConnection();
      console.log('✅ IAP 연결 완료');

      // Android 미소비 구매 처리
      if (Platform.OS === 'android') {
        console.log('📱 Android 미소비 구매 확인 중...');
        try {
          const purchases = await RNIap.getAvailablePurchases();
          console.log('구매 목록:', purchases?.length || 0, '개');

          if (purchases && purchases.length > 0) {
            for (const purchase of purchases) {
              if (purchase.purchaseToken) {
                try {
                  await RNIap.consumePurchaseAndroid({
                    purchaseToken: purchase.purchaseToken,
                    developerPayload: ''
                  });
                  console.log('✅ 구매 소비 완료:', purchase.productId);
                } catch (consumeError) {
                  console.log('⚠️ 구매 소비 실패:', consumeError);
                }
              }
            }
          }
        } catch (error) {
          console.log('⚠️ 구매 확인 에러:', error);
        }
      }

      // 제품 정보 로드
      if (productIds.length > 0) {
        await loadProducts(productIds);
      }

      isInitialized.current = true;
    } catch (error: any) {
      console.error('🚨 IAP 초기화 에러:', error);
      console.error('에러 세부사항:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      });
    } finally {
      setLoading(false);
    }
  }, [productIds]);

  // 제품 정보 로드
  const loadProducts = async (ids: string[]) => {
    if (!isIAPAvailable) return;

    try {
      console.log('🛍️ 제품 정보 요청 중...', ids);
      const loadedProducts = await RNIap.getProducts({ skus: ids });
      console.log('📦 제품 응답 받음:', loadedProducts?.length || 0, '개');
      
      setProducts(loadedProducts || []);
      
      console.log('제품 로딩 결과:', {
        requestedIds: ids,
        loadedProducts: loadedProducts?.map((p: any) => ({ 
          id: p.productId, 
          title: p.title 
        })) || [],
      });
    } catch (error) {
      console.error('제품 로드 실패:', error);
      setProducts([]);
    }
  };

  // 제품 정보 새로고침
  const refreshProducts = useCallback(async () => {
    if (productIds.length > 0) {
      await loadProducts(productIds);
    }
  }, [productIds]);

  // 구매 처리
  const purchaseProduct = useCallback(async (productId: string) => {
    if (purchasing || !isIAPAvailable) return;

    setPurchasing(true);
    try {
      const product = products.find(p => p.productId === productId);
      if (!product) {
        throw new Error('Product not found');
      }

      console.log('구매 시작:', productId);
      
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

      // 서버에 영수증 전송 및 검증
      await verifyPurchaseWithServer(purchase);

      // 토큰 잔액 새로고침
      await fetchTokenBalance();

      // 성공 콜백
      if (onPurchaseSuccess) {
        onPurchaseSuccess(purchase);
      }

    } catch (error: any) {
      if (!isUserCancellation(error)) {
        console.error('구매 에러:', error);
        if (onPurchaseError) {
          onPurchaseError(error);
        }
      }
      throw error;
    } finally {
      setPurchasing(false);
    }
  }, [purchasing, products, onPurchaseSuccess, onPurchaseError, fetchTokenBalance]);

  // 구매 검증
  const verifyPurchaseWithServer = async (purchase: AndroidPurchaseData | IOSPurchaseData) => {
    const platform = Platform.OS as 'ios' | 'android';
    const payload: PurchaseVerificationRequest = { platform };

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

    const response = await api('POST', '/api/purchase/verify', payload);
    
    if (!response.success) {
      throw new Error('Purchase verification failed: ' + response.error);
    }

    // 트랜잭션 완료 처리
    await finishTransaction(purchase);
  };

  // 트랜잭션 완료
  const finishTransaction = useCallback(async (purchase: any) => {
    if (!isIAPAvailable || !RNIap) return;

    try {
      if (typeof RNIap.finishTransaction === 'function') {
        await RNIap.finishTransaction({ purchase, isConsumable: true });
      }

      // Android 소비 처리
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
    } catch (error) {
      console.error('트랜잭션 완료 실패:', error);
    }
  }, []);

  // 사용자 취소 여부 확인
  const isUserCancellation = useCallback((error: any): boolean => {
    return (
      error.code === IAPErrorCode.USER_CANCELLED || 
      error.code === IAPErrorCode.DEFERRED ||
      error.code === IAPErrorCode.ALREADY_OWNED ||
      error.userCancelled === true ||
      (error.message && (
        error.message.includes('cancelled') ||
        error.message.includes('canceled') ||
        error.message.includes('User canceled') ||
        error.message.includes('User cancelled') ||
        error.message.includes('already owned') ||
        error.message.includes('SKErrorDomain error 2')
      ))
    );
  }, []);

  // 로컬 가격 가져오기
  const getLocalizedPrice = useCallback((productId: string): string => {
    const product = products.find(p => p.productId === productId);
    return product?.localizedPrice || '';
  }, [products]);

  // 모의 구매 처리
  const handleMockPurchase = useCallback(async (tokens: number = 5) => {
    console.log('모의 구매 진행 중...');
    setPurchasing(true);
    
    try {
      // 실제 구매 과정 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 모의로 토큰 추가
      setUserTokens(prevTokens => prevTokens + tokens);
      console.log(`모의 구매로 토큰 ${tokens}개 추가됨`);
      
      if (onPurchaseSuccess) {
        onPurchaseSuccess({ mock: true, tokens });
      }
    } catch (error) {
      console.error('모의 구매 에러:', error);
      if (onPurchaseError) {
        onPurchaseError(error);
      }
      throw error;
    } finally {
      setPurchasing(false);
    }
  }, [onPurchaseSuccess, onPurchaseError]);

  // 자동 초기화
  useEffect(() => {
    if (autoInit) {
      initializeIAP();
      fetchTokenBalance();
    }

    return () => {
      if (isIAPAvailable && RNIap && typeof RNIap.endConnection === 'function') {
        try {
          RNIap.endConnection();
        } catch (error) {
          // 연결 종료 에러 무시
        }
      }
    };
  }, [autoInit]);

  return {
    // 상태
    products,
    userTokens,
    isIAPAvailable,
    loading,
    purchasing,
    
    // 핵심 함수
    initializeIAP,
    purchaseProduct,
    fetchTokenBalance,
    refreshProducts,
    
    // 유틸리티
    getLocalizedPrice,
    handleMockPurchase,
    isUserCancellation,
    finishTransaction,
  };
};