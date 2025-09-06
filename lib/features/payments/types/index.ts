import { Platform } from 'react-native';

// Product 타입 정의
export interface Product {
  productId: string;
  title: string;
  description?: string;
  price: string;
  currency: string;
  localizedPrice: string;
  type?: string;
}

// 토큰 패키지 타입
export interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
}

// iOS 구매 데이터
export interface IOSPurchaseData {
  productId: string;
  transactionId: string;
  transactionDate: number;
  transactionReceipt: string;
}

// Android 구매 데이터
export interface AndroidPurchaseData {
  productId: string;
  purchaseToken: string;
  purchaseTime: number;
  purchaseState: number;
  packageName?: string;
  acknowledged?: boolean;
  orderId?: string;
  originalJson?: string;
  dataAndroid?: string;
  signatureAndroid?: string;
  autoRenewing?: boolean;
}

// 구매 검증 요청
export interface PurchaseVerificationRequest {
  platform: 'ios' | 'android';
  receiptData?: string; // iOS
  purchaseToken?: string; // Android
  productId?: string;
  email?: string; // Yatra 패키지용
}

// 구매 검증 응답
export interface PurchaseVerificationResponse {
  success: boolean;
  error?: string;
  balance?: number;
  tokens?: number;
}

// IAP Hook 설정
export interface UseIAPConfig {
  productIds?: string[];
  autoInit?: boolean;
  onPurchaseSuccess?: (purchase: any) => void;
  onPurchaseError?: (error: any) => void;
}

// IAP Hook 반환 타입
export interface UseIAPReturn {
  // 상태
  products: Product[];
  userTokens: number;
  isIAPAvailable: boolean;
  loading: boolean;
  purchasing: boolean;
  
  // 핵심 함수
  initializeIAP: () => Promise<void>;
  purchaseProduct: (productId: string) => Promise<void>;
  fetchTokenBalance: () => Promise<void>;
  refreshProducts: () => Promise<void>;
  
  // 유틸리티
  getLocalizedPrice: (productId: string) => string;
  handleMockPurchase: (tokens?: number) => Promise<void>;
  isUserCancellation: (error: any) => boolean;
  finishTransaction: (purchase: any) => Promise<void>;
}

// 플랫폼별 제품 ID 헬퍼
export const getProductId = (baseId: string): string => {
  return Platform.OS === 'android' ? `${baseId}_android` : baseId;
};

// 에러 코드
export enum IAPErrorCode {
  USER_CANCELLED = 'E_USER_CANCELLED',
  DEFERRED = 'E_DEFERRED',
  ALREADY_OWNED = 'E_ALREADY_OWNED',
  INVALID_PRODUCT = 'E_INVALID_PRODUCT',
  NETWORK_ERROR = 'E_NETWORK_ERROR',
  VERIFICATION_FAILED = 'E_VERIFICATION_FAILED',
}