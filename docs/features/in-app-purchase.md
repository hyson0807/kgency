# K-Agency 앱내 구입 기능 안내

안녕하세요, Apple 심사팀님께

K-Agency는 외국인 구직자와 한국 기업을 연결하는 채용 매칭 플랫폼으로, 이번 업데이트에서 토큰 기반의 앱내 구입 기능을 새롭게 도입했습니다. 저희 서비스는 두 가지 사용자 그룹을 대상으로 합니다. 첫 번째는 한국에서 일자리를 찾는 외국인 구직자이며, 두 번째는 외국인 인재를 채용하려는 한국 기업입니다. 현재 앱내 구입 기능은 구직자를 대상으로 제공되며, 향후 기업 대상 프리미엄 서비스로 확장할 예정입니다.

토큰은 K-Agency 앱 내에서 프리미엄 기능을 이용하기 위한 디지털 화폐입니다. 현재 구매 가능한 상품은 5토큰 패키지(₩5,500)이며, iOS에서는 'token_5_pack', Android에서는 'token_5_pack_android'라는 Product ID로 등록된 소비성 상품입니다. 구직자는 이 토큰을 구매하여 앱 내의 다양한 프리미엄 기능을 이용할 수 있습니다.

토큰의 주요 사용처는 '즉시면접 예약' 기능입니다. 이 기능은 1토큰을 사용하여 구직자가 마음에 드는 채용공고를 발견했을 때 복잡한 이력서 제출 과정 없이 바로 면접 일정을 확정할 수 있는 혁신적인 서비스입니다. 한국어가 서툰 외국인 구직자들에게는 이력서 작성이 큰 부담이 되는데, 저희 플랫폼의 AI 매칭 시스템이 이미 구직자와 기업 간의 적합도를 분석하여 완벽한 매칭이 이루어진 경우에만 이 기능을 사용할 수 있도록 했습니다. 이를 통해 구직자는 기업의 무응답 걱정 없이 100% 면접을 보장받을 수 있으며, 기업 입장에서도 검증된 적합한 인재와 즉시 면접을 진행할 수 있는 장점이 있습니다.

구매 프로세스는 매우 직관적입니다. 구직자가 앱 하단 탭 메뉴에서 '상점'을 선택하면 현재 보유한 토큰 수와 구매 가능한 패키지를 확인할 수 있습니다. 5토큰 패키지의 구매 버튼을 누르면 구매 확인 다이얼로그가 표시되고, 사용자가 확인하면 Apple의 결제 시스템으로 연결됩니다. 결제가 완료되면 영수증이 자동으로 저희 서버로 전송되어 검증 과정을 거치며, 검증이 성공적으로 완료되면 즉시 토큰이 사용자 계정에 지급됩니다. 모든 구매 및 사용 내역은 '토큰 이용 내역' 메뉴에서 투명하게 확인할 수 있습니다.

기술적으로는 React Native 커뮤니티에서 가장 널리 사용되는 react-native-iap 라이브러리(v12.15.4)를 통해 iOS StoreKit과 Android Billing Library를 통합 구현했습니다. 모든 구매는 서버 측에서 철저히 검증되며, iOS의 경우 transactionReceipt를, Android의 경우 purchaseToken을 서버로 전송하여 검증합니다. JWT 토큰 기반 사용자 인증과 HTTPS 통신으로 모든 데이터를 암호화하여 보안을 강화했으며, 중복 구매 방지 로직을 구현하여 사용자를 보호하고 있습니다.

저희는 Apple의 모든 가이드라인을 철저히 준수하고 있습니다. 모든 디지털 콘텐츠와 서비스는 오직 Apple의 앱내 구입을 통해서만 구매 가능하며, 외부 결제 링크나 웹사이트를 통한 결제 옵션은 일체 제공하지 않습니다. 가격은 명확하게 표시되어 있으며, 구매 전 반드시 확인 다이얼로그를 통해 사용자의 의사를 재확인합니다. 또한 사용자는 언제든지 자신의 토큰 잔액과 거래 내역을 확인할 수 있습니다. 환불 정책은 Apple의 표준 정책을 따르며, 사용하지 않은 토큰에 대해서는 환불이 가능하지만 이미 사용된 토큰은 환불이 불가능합니다.

K-Agency의 토큰 시스템은 단순한 수익 모델이 아닌, 구직자와 기업 간의 효율적인 매칭을 촉진하는 핵심 기능입니다. 특히 언어 장벽으로 어려움을 겪는 외국인 구직자들이 보다 쉽게 한국에서 일자리를 찾을 수 있도록 돕는 사회적 가치를 지닌 서비스입니다. 앞으로도 사용자들의 피드백을 바탕으로 더 많은 유용한 기능들을 추가할 예정이며, 모든 유료 기능은 Apple의 정책에 따라 앱내 구입을 통해서만 제공될 것입니다.

감사합니다.

## 2. 데이터베이스 설계

### 2.1 새로운 테이블 생성

#### `user_tokens` - 사용자 토큰 잔액
```sql
CREATE TABLE user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 CHECK (balance >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_user_tokens_user_id ON user_tokens(user_id);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_tokens_updated_at 
    BEFORE UPDATE ON user_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

#### `token_transactions` - 토큰 거래 내역
```sql
CREATE TABLE token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- 양수: 획득, 음수: 사용
  type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'spend', 'refund', 'admin_gift')),
  reference_id UUID, -- 구매 ID 또는 즉시면접 지원 ID 참조
  description TEXT,
  metadata JSONB, -- 추가 정보 (상품 ID, 트랜잭션 ID 등)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX idx_token_transactions_type ON token_transactions(type);
CREATE INDEX idx_token_transactions_created_at ON token_transactions(created_at);
```

#### `purchases` - 구매 기록
```sql
CREATE TABLE purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id VARCHAR(255) NOT NULL, -- 'token_5_pack'
  transaction_id VARCHAR(255) UNIQUE NOT NULL, -- App Store/Play Store 트랜잭션 ID
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
  price_cents INTEGER NOT NULL, -- 가격 (센트 단위, ₩5,500 = 550000)
  currency VARCHAR(3) NOT NULL DEFAULT 'KRW',
  tokens_given INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  receipt_data TEXT, -- 영수증 원본 데이터
  verification_data JSONB, -- 검증 응답 데이터
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_transaction_id ON purchases(transaction_id);
CREATE INDEX idx_purchases_status ON purchases(status);

-- 업데이트 시간 자동 갱신
CREATE TRIGGER update_purchases_updated_at 
    BEFORE UPDATE ON purchases 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.2 기존 테이블 수정

#### `applications` 테이블에 토큰 사용 기록 추가
```sql
ALTER TABLE applications 
ADD COLUMN token_used BOOLEAN DEFAULT FALSE,
ADD COLUMN token_transaction_id UUID REFERENCES token_transactions(id);

-- 인덱스 추가
CREATE INDEX idx_applications_token_used ON applications(token_used);
```

## 3. 서버 구현

### 3.1 의존성 추가

#### package.json에 라이브러리 추가
```bash
cd kgency_server
npm install node-apple-receipt-verify googleapis
```

#### 환경 변수 추가 (.env)
```env
# Apple App Store
APPLE_SHARED_SECRET=your_app_store_shared_secret
APPLE_BUNDLE_ID=com.welkit.kgency

# Google Play Store
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_PACKAGE_NAME=com.welkit.kgency

# IAP 설정
IAP_ENVIRONMENT=sandbox # production for live
```

### 3.2 서비스 구현

#### `src/services/purchase.service.js`
```javascript
const { supabase } = require('../config/database');
const appleReceiptVerify = require('node-apple-receipt-verify');
const { google } = require('googleapis');

class PurchaseService {
  constructor() {
    // Apple 영수증 검증 설정
    appleReceiptVerify.config({
      secret: process.env.APPLE_SHARED_SECRET,
      environment: process.env.IAP_ENVIRONMENT === 'production' ? ['production'] : ['sandbox'],
      verbose: true
    });

    // Google Play 검증 설정
    this.androidPublisher = google.androidpublisher('v3');
    this.googleAuth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/androidpublisher']
    );
  }

  async verifyAppleReceipt(receiptData, userId) {
    try {
      const products = await appleReceiptVerify.validate({
        receipt: receiptData,
        device: false
      });

      // 구매 내역에서 토큰 패키지 찾기
      const tokenPurchase = products.receipt.in_app.find(
        item => item.product_id === 'token_5_pack'
      );

      if (!tokenPurchase) {
        throw new Error('Token purchase not found in receipt');
      }

      return {
        isValid: true,
        transactionId: tokenPurchase.transaction_id,
        productId: tokenPurchase.product_id,
        purchaseDate: new Date(parseInt(tokenPurchase.purchase_date_ms)),
        verificationData: products
      };
    } catch (error) {
      console.error('Apple receipt verification failed:', error);
      return { isValid: false, error: error.message };
    }
  }

  async verifyGoogleReceipt(purchaseToken, userId) {
    try {
      const response = await this.androidPublisher.purchases.products.get({
        packageName: process.env.GOOGLE_PACKAGE_NAME,
        productId: 'token_5_pack',
        token: purchaseToken,
        auth: this.googleAuth
      });

      const purchase = response.data;
      
      if (purchase.purchaseState !== 0) { // 0 = purchased
        throw new Error('Purchase not in purchased state');
      }

      return {
        isValid: true,
        transactionId: purchase.orderId,
        productId: 'token_5_pack',
        purchaseDate: new Date(parseInt(purchase.purchaseTimeMillis)),
        verificationData: purchase
      };
    } catch (error) {
      console.error('Google receipt verification failed:', error);
      return { isValid: false, error: error.message };
    }
  }

  async processPurchase(userId, platform, receiptData, purchaseToken) {
    const client = supabase;

    try {
      // 1. 영수증 검증
      let verificationResult;
      if (platform === 'ios') {
        verificationResult = await this.verifyAppleReceipt(receiptData, userId);
      } else if (platform === 'android') {
        verificationResult = await this.verifyGoogleReceipt(purchaseToken, userId);
      } else {
        throw new Error('Invalid platform');
      }

      if (!verificationResult.isValid) {
        throw new Error(`Receipt verification failed: ${verificationResult.error}`);
      }

      // 2. 중복 구매 확인
      const { data: existingPurchase } = await client
        .from('purchases')
        .select('id')
        .eq('transaction_id', verificationResult.transactionId)
        .single();

      if (existingPurchase) {
        throw new Error('Purchase already processed');
      }

      // 3. 트랜잭션 시작
      const { data: purchase, error: purchaseError } = await client
        .from('purchases')
        .insert({
          user_id: userId,
          product_id: verificationResult.productId,
          transaction_id: verificationResult.transactionId,
          platform: platform,
          price_cents: 550000, // ₩5,500
          currency: 'KRW',
          tokens_given: 5,
          status: 'completed',
          receipt_data: receiptData || purchaseToken,
          verification_data: verificationResult.verificationData,
          verified_at: new Date().toISOString()
        })
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // 4. 토큰 지급
      await this.addTokensToUser(userId, 5, purchase.id);

      return {
        success: true,
        purchase: purchase,
        tokensAdded: 5
      };

    } catch (error) {
      console.error('Purchase processing failed:', error);
      throw error;
    }
  }

  async addTokensToUser(userId, amount, purchaseId) {
    const client = supabase;

    try {
      // 1. 사용자 토큰 잔액 업데이트 (UPSERT)
      const { error: tokenError } = await client
        .from('user_tokens')
        .upsert({
          user_id: userId,
          balance: amount
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        });

      if (tokenError) {
        // 기존 잔액이 있는 경우 더하기
        const { data: currentTokens } = await client
          .from('user_tokens')
          .select('balance')
          .eq('user_id', userId)
          .single();

        const newBalance = (currentTokens?.balance || 0) + amount;

        const { error: updateError } = await client
          .from('user_tokens')
          .update({ balance: newBalance })
          .eq('user_id', userId);

        if (updateError) throw updateError;
      }

      // 2. 거래 내역 기록
      const { error: transactionError } = await client
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          type: 'purchase',
          reference_id: purchaseId,
          description: `토큰 ${amount}개 구매`,
          metadata: { product_id: 'token_5_pack', purchase_id: purchaseId }
        });

      if (transactionError) throw transactionError;

      return { success: true };

    } catch (error) {
      console.error('Failed to add tokens:', error);
      throw error;
    }
  }

  async spendTokens(userId, amount, description, referenceId = null) {
    const client = supabase;

    try {
      // 1. 현재 잔액 확인
      const { data: userTokens, error: fetchError } = await client
        .from('user_tokens')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (fetchError || !userTokens) {
        throw new Error('User tokens not found');
      }

      if (userTokens.balance < amount) {
        throw new Error('Insufficient tokens');
      }

      // 2. 잔액 차감
      const newBalance = userTokens.balance - amount;
      const { error: updateError } = await client
        .from('user_tokens')
        .update({ balance: newBalance })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // 3. 거래 내역 기록
      const { data: transaction, error: transactionError } = await client
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount: -amount, // 음수로 기록
          type: 'spend',
          reference_id: referenceId,
          description: description,
          metadata: { remaining_balance: newBalance }
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      return {
        success: true,
        remainingBalance: newBalance,
        transactionId: transaction.id
      };

    } catch (error) {
      console.error('Failed to spend tokens:', error);
      throw error;
    }
  }

  async getUserTokenBalance(userId) {
    const { data, error } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    return data?.balance || 0;
  }

  async getUserPurchaseHistory(userId) {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getUserTokenTransactions(userId, limit = 50) {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
}

module.exports = new PurchaseService();
```

### 3.3 컨트롤러 구현

#### `src/controllers/purchase.controller.js`
```javascript
const purchaseService = require('../services/purchase.service');

class PurchaseController {
  async verifyPurchase(req, res) {
    try {
      const { platform, receiptData, purchaseToken } = req.body;
      const userId = req.user.userId;

      if (!platform || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters'
        });
      }

      if (platform === 'ios' && !receiptData) {
        return res.status(400).json({
          success: false,
          error: 'Receipt data required for iOS'
        });
      }

      if (platform === 'android' && !purchaseToken) {
        return res.status(400).json({
          success: false,
          error: 'Purchase token required for Android'
        });
      }

      const result = await purchaseService.processPurchase(
        userId,
        platform,
        receiptData,
        purchaseToken
      );

      res.json({
        success: true,
        tokensAdded: result.tokensAdded,
        purchaseId: result.purchase.id
      });

    } catch (error) {
      console.error('Purchase verification failed:', error);
      
      let statusCode = 500;
      let errorMessage = 'Internal server error';

      if (error.message.includes('already processed')) {
        statusCode = 409;
        errorMessage = 'Purchase already processed';
      } else if (error.message.includes('verification failed')) {
        statusCode = 400;
        errorMessage = 'Invalid receipt';
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  }

  async getTokenBalance(req, res) {
    try {
      const userId = req.user.userId;
      const balance = await purchaseService.getUserTokenBalance(userId);
      
      res.json({
        success: true,
        balance: balance
      });
    } catch (error) {
      console.error('Failed to get token balance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get token balance'
      });
    }
  }

  async getPurchaseHistory(req, res) {
    try {
      const userId = req.user.userId;
      const purchases = await purchaseService.getUserPurchaseHistory(userId);
      
      res.json({
        success: true,
        purchases: purchases
      });
    } catch (error) {
      console.error('Failed to get purchase history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get purchase history'
      });
    }
  }

  async getTokenTransactions(req, res) {
    try {
      const userId = req.user.userId;
      const { limit = 50 } = req.query;
      
      const transactions = await purchaseService.getUserTokenTransactions(
        userId,
        parseInt(limit)
      );
      
      res.json({
        success: true,
        transactions: transactions
      });
    } catch (error) {
      console.error('Failed to get token transactions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get token transactions'
      });
    }
  }

  async spendTokensForInstantInterview(req, res) {
    try {
      const userId = req.user.userId;
      const { applicationId } = req.body;

      if (!applicationId) {
        return res.status(400).json({
          success: false,
          error: 'Application ID required'
        });
      }

      const result = await purchaseService.spendTokens(
        userId,
        1, // 즉시면접 1회 = 토큰 1개
        '즉시면접 예약',
        applicationId
      );

      res.json({
        success: true,
        remainingBalance: result.remainingBalance,
        transactionId: result.transactionId
      });

    } catch (error) {
      console.error('Failed to spend tokens for instant interview:', error);
      
      let statusCode = 500;
      let errorMessage = 'Failed to process token payment';

      if (error.message.includes('Insufficient tokens')) {
        statusCode = 400;
        errorMessage = 'Insufficient tokens';
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage
      });
    }
  }
}

module.exports = new PurchaseController();
```

### 3.4 라우터 구현

#### `src/routes/purchase.routes.js`
```javascript
const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const authMiddleware = require('../middlewares/auth');
const rateLimiter = require('../middlewares/rateLimiter');

// 모든 구매 관련 엔드포인트는 인증 필요
router.use(authMiddleware);

// 구매 검증 (레이트 리미팅 적용)
router.post('/verify', rateLimiter, purchaseController.verifyPurchase);

// 토큰 잔액 조회
router.get('/tokens/balance', purchaseController.getTokenBalance);

// 구매 내역 조회
router.get('/history', purchaseController.getPurchaseHistory);

// 토큰 거래 내역 조회
router.get('/tokens/transactions', purchaseController.getTokenTransactions);

// 즉시면접용 토큰 사용
router.post('/tokens/spend-instant-interview', purchaseController.spendTokensForInstantInterview);

module.exports = router;
```

#### `src/routes/index.js` 수정
```javascript
// 기존 라우터들...
const purchaseRoutes = require('./purchase.routes');

// 라우터 등록
app.use('/api/purchase', purchaseRoutes);
```

## 4. 앱스토어/플레이스토어 설정

### 4.1 Apple App Store Connect

1. **상품 생성**
   - App Store Connect → 앱 선택 → 기능 → App 내 구입
   - 새 상품 추가: 소모성 제품
   - 제품 ID: `token_5_pack`
   - 가격: ₩5,500 (Tier 선택)

2. **공유 비밀번호 생성**
   - App Store Connect → 사용자 및 액세스 → 공유 비밀번호
   - 생성된 비밀번호를 `APPLE_SHARED_SECRET`에 설정

### 4.2 Google Play Console

1. **상품 생성**
   - Play Console → 앱 선택 → 수익 창출 → 제품 → 인앱 상품
   - 상품 ID: `token_5_pack`
   - 가격: ₩5,500

2. **서비스 계정 설정**
   - Google Cloud Console → IAM 및 관리자 → 서비스 계정
   - Play Android Developer API 권한 부여
   - JSON 키 다운로드하여 환경 변수 설정

## 5. 클라이언트 구현

### 5.1 React Native 라이브러리 설치

```bash
npm install react-native-iap
cd ios && pod install # iOS만
```

### 5.2 토큰 구매 컴포넌트 수정

#### `app/(user)/shop.tsx` 수정
```typescript
import RNIap, { Product, PurchaseResult } from 'react-native-iap';

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [userTokens, setUserTokens] = useState(0);
  const [purchasing, setPurchasing] = useState(false);
  
  useEffect(() => {
    initIAP();
    fetchTokenBalance();
    
    return () => {
      RNIap.endConnection();
    };
  }, []);

  const initIAP = async () => {
    try {
      await RNIap.initConnection();
      const products = await RNIap.getProducts(['token_5_pack']);
      setProducts(products);
    } catch (error) {
      console.error('IAP initialization failed:', error);
    }
  };

  const fetchTokenBalance = async () => {
    try {
      const response = await api('GET', '/api/purchase/tokens/balance');
      if (response.success) {
        setUserTokens(response.balance);
      }
    } catch (error) {
      console.error('Failed to fetch token balance:', error);
    }
  };

  const handlePurchase = async () => {
    if (purchasing) return;
    
    setPurchasing(true);
    try {
      const purchase: PurchaseResult = await RNIap.requestPurchase({
        sku: 'token_5_pack',
      });

      // 서버에 영수증 전송
      await verifyPurchaseWithServer(purchase);
      
      // 성공 후 잔액 새로고침
      await fetchTokenBalance();
      
      showModal(
        '구매 완료',
        '5개의 토큰이 지급되었습니다!',
        'info'
      );

    } catch (error) {
      console.error('Purchase failed:', error);
      showModal(
        '구매 실패',
        '결제 처리 중 오류가 발생했습니다.',
        'warning'
      );
    } finally {
      setPurchasing(false);
    }
  };

  const verifyPurchaseWithServer = async (purchase: PurchaseResult) => {
    const platform = Platform.OS;
    const payload = {
      platform,
      ...(platform === 'ios' 
        ? { receiptData: purchase.transactionReceipt }
        : { purchaseToken: purchase.purchaseToken }
      )
    };

    const response = await api('POST', '/api/purchase/verify', payload);
    
    if (!response.success) {
      throw new Error('Purchase verification failed');
    }

    // 구매 완료 처리
    await RNIap.finishTransaction({ purchase });
  };
};
```

### 5.3 즉시면접 토큰 사용 로직

#### 즉시면접 예약 시 토큰 차감
```typescript
// instant-interview-selection.tsx 수정
const handleSlotSelection = async (slotId: string) => {
  try {
    // 1. 토큰 잔액 확인
    const balanceResponse = await api('GET', '/api/purchase/tokens/balance');
    if (balanceResponse.balance < 1) {
      showModal(
        '토큰 부족',
        '즉시면접 예약을 위해서는 토큰 1개가 필요합니다. 상점에서 토큰을 구매해주세요.',
        'warning'
      );
      return;
    }

    // 2. 즉시면접 예약 + 토큰 사용
    const applicationData = {
      // 기존 예약 데이터...
      useToken: true
    };

    const response = await api('POST', '/api/applications/instant-interview', applicationData);
    
    if (response.success) {
      showModal(
        '예약 완료',
        '즉시면접이 예약되었습니다. 토큰 1개가 사용되었습니다.',
        'info'
      );
      router.back();
    }
  } catch (error) {
    showModal('오류', '예약 처리 중 오류가 발생했습니다.', 'warning');
  }
};
```

## 6. 환경별 설정

### 6.1 개발 환경
- **Apple**: Sandbox 환경 사용
- **Google**: 테스트 트랙 사용
- **서버**: `IAP_ENVIRONMENT=sandbox`

### 6.2 프로덕션 환경
- **Apple**: 프로덕션 환경
- **Google**: 프로덕션 트랙
- **서버**: `IAP_ENVIRONMENT=production`

## 7. 보안 고려사항

### 7.1 중요 보안 규칙
1. **영수증 검증은 반드시 서버에서 수행**
2. **클라이언트 코드는 신뢰하지 않음**
3. **중복 처리 방지 로직 필수**
4. **모든 구매 시도 로깅**

### 7.2 모니터링
- 구매 실패율 추적
- 영수증 검증 실패 로그
- 토큰 사용 패턴 분석

## 8. 테스트 계획

### 8.1 단위 테스트
- 영수증 검증 로직
- 토큰 지급/차감 로직
- 중복 처리 방지

### 8.2 통합 테스트
- 전체 구매 플로우
- 에러 시나리오 테스트
- 플랫폼별 호환성

### 8.3 사용자 테스트
- Sandbox 환경에서 실제 구매 테스트
- 다양한 기기에서 동작 확인

## 9. 배포 단계

### Phase 1: 인프라 구축
1. 데이터베이스 테이블 생성
2. 서버 API 구현
3. 앱스토어 상품 등록

### Phase 2: 클라이언트 구현
1. IAP 라이브러리 통합
2. 상점 UI 구현
3. 토큰 시스템 연동

### Phase 3: 테스트 및 검증
1. Sandbox 환경 테스트
2. 보안 검증
3. 성능 테스트

### Phase 4: 프로덕션 배포
1. 앱 업데이트 배포
2. 프로덕션 환경 전환
3. 모니터링 시작

이 문서를 기반으로 단계적으로 구현하면 안전하고 신뢰할 수 있는 In-App Purchase 시스템을 구축할 수 있습니다.