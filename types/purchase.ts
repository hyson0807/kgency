// 구매 관련 타입 정의

export interface PurchaseVerificationRequest {
  platform: 'ios' | 'android';
  receiptData?: string; // iOS용
  purchaseToken?: string; // Android용
}

export interface PurchaseVerificationResponse {
  success: boolean;
  tokensAdded?: number;
  purchaseId?: string;
  alreadyProcessed?: boolean;
  error?: string;
}

export interface TokenBalance {
  success: boolean;
  balance: number;
  error?: string;
}

export interface TokenTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'spend' | 'refund' | 'admin_gift';
  reference_id?: string;
  description?: string;
  metadata?: any;
  created_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  transaction_id: string;
  platform: 'ios' | 'android';
  price_cents: number;
  currency: string;
  tokens_given: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  receipt_data?: string;
  verification_data?: any;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AndroidPurchaseData {
  productId: string;
  purchaseToken: string;
  purchaseStateAndroid?: number;
  transactionReceipt?: string;
  transactionDate?: number;
  dataAndroid?: string;
  signatureAndroid?: string;
  autoRenewingAndroid?: boolean;
  purchaseState?: number;
}

export interface IOSPurchaseData {
  productId: string;
  transactionReceipt: string;
  transactionId: string;
  transactionDate: number;
  originalTransactionId?: string;
  originalTransactionDate?: number;
}

export type PurchaseData = AndroidPurchaseData | IOSPurchaseData;