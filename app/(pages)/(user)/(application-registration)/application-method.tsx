import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTabBar } from '@/contexts/TabBarContext';
import { useApplicationFormStore } from '@/stores/applicationFormStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
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
import { ApplicationMethodCard } from '@/components/user/application-registration';
import ChatApplicationPromotionModal from '@/components/user/application-registration/ChatApplicationPromotionModal';
import TokenPurchaseModal from '@/components/user/application-registration/TokenPurchaseModal';
import { useModal } from '@/hooks/useModal';

export default function ApplicationMethodScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth();
    const { setIsTabBarVisible } = useTabBar();
    const params = useLocalSearchParams();
    
    // URL 파라미터에서 데이터 가져오기
    const { 
        resume, 
        editedResume, 
        isEditing, 
        companyId, 
        jobPostingId, 
        jobTitle 
    } = params as {
        resume: string;
        editedResume: string;
        isEditing: string;
        companyId: string;
        jobPostingId: string;
        jobTitle: string;
    };
    
    const { resetAllData } = useApplicationFormStore();
    const [loading, setLoading] = React.useState(false);
    const [userTokens, setUserTokens] = React.useState(0);
    const [showPromotionModal, setShowPromotionModal] = React.useState(false);
    const [showTokenPurchaseModal, setShowTokenPurchaseModal] = React.useState(false);
    const [purchaseLoading, setPurchaseLoading] = React.useState(false);
    const [products, setProducts] = React.useState<any[]>([]);
    const { showModal, ModalComponent } = useModal();

    // 토큰 잔액 조회 및 IAP 초기화
    React.useEffect(() => {
        const initializeAsync = async () => {
            await fetchTokenBalance();
            await initIAP();
        };
        
        initializeAsync();
        
        // 페이지 진입시 TabBar 숨기기 (pages 레이아웃이므로)
        setIsTabBarVisible(false);
        
        return () => {
            if (isIAPAvailable && RNIap && typeof RNIap.endConnection === 'function') {
                try {
                    RNIap.endConnection();
                } catch (error) {
                    // IAP 연결 종료 에러 무시
                }
            }
            // 페이지 나갈 때 TabBar 다시 보이기
            setIsTabBarVisible(true);
        };
    }, []);

    const fetchTokenBalance = async () => {
        if (!user) return;
        
        try {
            const response = await api('GET', '/api/purchase/tokens/balance');
            if (response?.success) {
                setUserTokens(response.balance || 0);
            } else {
                setUserTokens(0);
            }
        } catch (error) {
            setUserTokens(0);
        }
    };

    const initIAP = async () => {
        console.log('🔄 IAP 초기화 시작...');
        
        try {
            if (!isIAPAvailable) {
                console.log('❌ IAP 사용 불가능');
                return;
            }
            
            console.log('🔌 IAP 연결 중...');
            await RNIap.initConnection();
            console.log('✅ IAP 연결 완료');
            
            // 앱 시작 시 미소비 구매 확인 및 처리 (Android용)
            if (Platform.OS === 'android') {
                console.log('📱 Android 미소비 구매 확인 중...');
                try {
                    const purchases = await RNIap.getAvailablePurchases();
                    console.log('구매 목록:', purchases?.length || 0, '개');
                    
                    if (purchases && purchases.length > 0) {
                        for (const purchase of purchases) {
                            if ((purchase.productId === 'token_5_pack' || purchase.productId === 'token_5_pack_android') && purchase.purchaseToken) {
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
            
            const productIds = [
                Platform.OS === 'android' ? 'token_5_pack_android' : 'token_5_pack'
            ];
            
            console.log('🛍️ 제품 정보 요청 중...', productIds);
            const products = await RNIap.getProducts({ skus: productIds });
            console.log('📦 제품 응답 받음:', products);
            
            setProducts(products);
            
            console.log('제품 로딩 결과:', {
                requestedIds: productIds,
                loadedProducts: products?.map((p: any) => ({ id: p.productId, title: p.title })) || [],
                rawProducts: products
            });
            
        } catch (error: any) {
            console.error('🚨 IAP 초기화 에러:', error);
            console.error('에러 세부사항:', {
                message: error?.message,
                code: error?.code,
                stack: error?.stack
            });
        }
    };

    // 일반 지원 버튼 클릭 처리 (프로모션 모달 표시)
    const handleRegularApplicationClick = () => {
        setShowPromotionModal(true);
    };

    // 일반 지원 처리
    const handleRegularApplication = async () => {
        setShowPromotionModal(false);
        setLoading(true);
        try {
            // 중복 지원 확인
            const checkDuplicateResponse = await api('GET', `/api/applications/check-duplicate?jobPostingId=${jobPostingId}`);
            
            if (checkDuplicateResponse.isDuplicate) {
                showModal(
                    t('application.duplicate_title', '이미 지원함'),
                    t('application.duplicate_message', '이미 이 공고에 지원하셨습니다.'),
                    'warning',
                    () => {
                        resetAllData();
                        router.replace('/(user)/home');
                    },
                    false,
                    t('common.confirm', '확인')
                );
                return;
            }

            // 메시지 전송
            const messageResponse = await api('POST', '/api/messages', {
                receiverId: companyId,
                subject: `${jobTitle} 입사 지원서`,
                content: isEditing === 'true' ? editedResume : resume
            });

            if (!messageResponse.success) {
                showModal(t('common.error', '오류'), t('application.send_failed', '지원서 전송에 실패했습니다.'), 'warning');
                return;
            }

            // 지원 내역 저장
            const applicationResponse = await api('POST', '/api/applications', {
                companyId: companyId,
                jobPostingId: jobPostingId,
                messageId: messageResponse.data.id
            });

            if (!applicationResponse.success) {
                showModal(t('common.error', '오류'), t('application.save_failed', '지원 내역 저장에 실패했습니다.'), 'warning');
                return;
            }

            showModal(
                t('application.success_title', '지원 완료'),
                t('application.success_message', '지원서가 성공적으로 전송되었습니다.'),
                'info',
                () => {
                    resetAllData();
                    setIsTabBarVisible(true); // TabBar 다시 보이기
                    router.replace('/(user)/applications');
                },
                false,
                t('common.confirm', '확인')
            );

        } catch (error) {
            console.error('일반 지원 에러:', error);
            showModal(t('common.error', '오류'), t('application.error_message', '지원 처리 중 오류가 발생했습니다.'), 'warning');
        } finally {
            setLoading(false);
        }
    };

    // 실제 IAP 구매 처리
    const handleTokenPurchase = async () => {
        if (purchaseLoading) return;
        
        setPurchaseLoading(true);
        try {
            // IAP 사용 가능성과 제품 로딩 상태 체크
            const tokenPackageId = Platform.OS === 'android' ? 'token_5_pack_android' : 'token_5_pack';
            const availableProduct = products.find(p => p.productId === tokenPackageId);
            
            console.log('IAP 상태:', { 
                isIAPAvailable, 
                productsCount: products.length, 
                targetProductId: tokenPackageId,
                availableProduct: availableProduct?.productId 
            });
            
            if (!isIAPAvailable || !availableProduct) {
                // 개발 환경이거나 제품을 찾을 수 없는 경우 모의 구매 처리
                console.log('모의 구매 모드로 진행:', { isIAPAvailable, hasProduct: !!availableProduct });
                
                showModal(
                    t('shop.devModeInfo', '개발 모드'),
                    t('shop.devModeNotice', `현재 Expo Go에서 실행 중이거나 IAP가 설치되지 않았습니다.\n\n제품 상태: ${availableProduct ? '로드됨' : '미로드'}\n\n모의 구매로 진행합니다.`),
                    'confirm',
                    () => handleMockPurchase(),
                    true,
                    '모의 구매 진행',
                    '취소'
                );
                return;
            }
            
            let purchase: any;
            
            if (Platform.OS === 'android') {
                purchase = await RNIap.requestPurchase({ 
                    skus: [availableProduct.productId]
                });
            } else {
                purchase = await RNIap.requestPurchase({ 
                    sku: availableProduct.productId 
                });
            }
            
            if (!purchase) {
                throw new Error('Purchase object not received');
            }
            
            // 서버에 영수증 전송 및 토큰 지급
            await verifyPurchaseWithServer(purchase);
            
            // 성공 후 처리
            await handleTokenPurchaseSuccess();
            
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
                return; // 에러 메시지를 표시하지 않음
            }
            
            console.error('토큰 구매 에러:', error);
            
            // Invalid product ID 에러인 경우 모의 구매로 대체
            if (error.message && error.message.includes('Invalid product ID')) {
                console.log('Invalid product ID 에러 - 모의 구매로 전환');
                showModal(
                    t('shop.devModeInfo', '개발 모드'),
                    `제품 ID를 찾을 수 없습니다.\n\n모의 구매로 진행하시겠습니까?\n\n에러: ${error.message}`,
                    'confirm',
                    () => handleMockPurchase(),
                    true,
                    '모의 구매 진행',
                    '취소'
                );
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
        } finally {
            setPurchaseLoading(false);
        }
    };

    // 모의 구매 처리 (개발 환경용)
    const handleMockPurchase = async () => {
        console.log('모의 구매 진행 중...');
        setPurchaseLoading(true);
        
        try {
            // 0.5초 지연으로 실제 구매 과정 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 모의로 토큰 5개 추가
            setUserTokens(prevTokens => prevTokens + 5);
            console.log('모의 구매로 토큰 5개 추가됨');
            
            // 모의 구매 성공 처리 (토큰 사용하지 않고)
            await handleMockChatApplication();
            
        } catch (error) {
            console.error('모의 구매 에러:', error);
            showModal(
                t('common.error', '오류'), 
                '모의 구매 중 오류가 발생했습니다.', 
                'warning'
            );
        } finally {
            setPurchaseLoading(false);
        }
    };

    // 모의 구매 후 토큰 사용하지 않고 채팅 지원
    const handleMockChatApplication = async () => {
        setShowTokenPurchaseModal(false);
        setLoading(true);
        
        try {
            // 중복 지원 확인
            const checkDuplicateResponse = await api('GET', `/api/applications/check-duplicate?jobPostingId=${jobPostingId}`);
            
            if (checkDuplicateResponse.isDuplicate) {
                showModal(
                    t('application.duplicate_title', '이미 지원함'),
                    t('application.duplicate_message', '이미 이 공고에 지원하셨습니다.'),
                    'warning',
                    () => {
                        resetAllData();
                        router.replace('/(user)/home');
                    },
                    false,
                    t('common.confirm', '확인')
                );
                return;
            }

            // 메시지 전송 (이력서 전송)
            const messageResponse = await api('POST', '/api/messages', {
                receiverId: companyId,
                subject: `${jobTitle} 입사 지원서`,
                content: isEditing === 'true' ? editedResume : resume
            });

            if (!messageResponse.success) {
                showModal(t('common.error', '오류'), t('application.send_failed', '지원서 전송에 실패했습니다.'), 'warning');
                return;
            }

            // 지원 내역 저장 (토큰 사용하지 않음 - 모의 구매)
            const applicationResponse = await api('POST', '/api/applications', {
                companyId: companyId,
                jobPostingId: jobPostingId,
                messageId: messageResponse.data.id,
                useToken: false // 모의 구매에서는 토큰 사용 안 함
            });

            if (!applicationResponse.success) {
                showModal(t('common.error', '오류'), t('application.save_failed', '지원 내역 저장에 실패했습니다.'), 'warning');
                return;
            }

            // 기존 채팅방 확인 또는 새 채팅방 생성
            if (user?.userId) {
                // 먼저 동일한 회사와의 기존 채팅방이 있는지 확인
                const existingRoomResponse = await api('GET', `/api/chat/find-existing-room?user_id=${user.userId}&company_id=${companyId}`);
                
                let roomId = null;
                
                if (existingRoomResponse.success && existingRoomResponse.data?.roomId) {
                    // 기존 채팅방이 있으면 재사용
                    roomId = existingRoomResponse.data.roomId;
                    console.log('기존 채팅방 재사용:', roomId);
                } else {
                    // 기존 채팅방이 없으면 새로 생성
                    const chatRoomResponse = await api('POST', '/api/chat/create-room', {
                        application_id: applicationResponse.data.id,
                        user_id: user.userId,
                        company_id: companyId,
                        job_posting_id: jobPostingId
                    });
                    
                    if (chatRoomResponse.success && chatRoomResponse.data?.id) {
                        roomId = chatRoomResponse.data.id;
                        console.log('새 채팅방 생성:', roomId);
                    }
                }

                if (roomId) {
                    console.log('✅ 채팅방 이동 준비:', roomId);
                    resetAllData();
                    
                    // 바로 채팅방으로 이동
                    router.replace({
                        pathname: '/chat/[roomId]',
                        params: {
                            roomId: roomId,
                            initialMessage: isEditing === 'true' ? editedResume : resume,
                            messageType: 'resume',
                            fromApplication: 'true'
                        }
                    });
                    
                    console.log('🚀 채팅방 이동 실행됨');
                } else {
                    showModal(t('common.error', '오류'), t('chat.room_access_failed', '채팅방 접근에 실패했습니다.'), 'warning');
                }
            }

        } catch (error: any) {
            console.error('모의 채팅 지원 에러:', error);
            showModal(t('common.error', '오류'), t('application.error_message', '지원 처리 중 오류가 발생했습니다.'), 'warning');
        } finally {
            setLoading(false);
        }
    };

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
                        console.error('Android consume error:', error);
                    }
                }
            }
        }
    };

    // 토큰 구매 성공 후 채팅 지원 진행
    const handleTokenPurchaseSuccess = async () => {
        try {
            // 토큰 잔액 새로고침
            await fetchTokenBalance();
            setShowTokenPurchaseModal(false);
            
            // 구매 후 바로 채팅 지원 진행
            await handleChatApplicationWithTokens();
            
            showModal(
                t('shop.purchaseComplete', '구매 완료'),
                t('shop.purchaseSuccess', '5개의 토큰이 지급되었습니다! 이제 채팅 지원이 진행됩니다.'),
                'info'
            );
        } catch (error) {
            console.error('구매 후 처리 에러:', error);
            showModal(t('common.error', '오류'), t('token.purchase_failed', '토큰 구매에 실패했습니다.'), 'warning');
        }
    };

    // 프로모션 모달에서 채팅 지원 선택
    const handlePromotionChatApplication = async () => {
        setShowPromotionModal(false);
        await handleChatApplicationClick();
    };

    // 채팅 지원 버튼 클릭 처리
    const handleChatApplicationClick = async () => {
        if (userTokens < 1) {
            setShowTokenPurchaseModal(true);
            return;
        }
        await handleChatApplicationWithTokens();
    };

    // 토큰이 있는 상태에서 채팅 지원 처리
    const handleChatApplicationWithTokens = async () => {

        setLoading(true);
        try {
            // 중복 지원 확인
            const checkDuplicateResponse = await api('GET', `/api/applications/check-duplicate?jobPostingId=${jobPostingId}`);
            
            if (checkDuplicateResponse.isDuplicate) {
                showModal(
                    t('application.duplicate_title', '이미 지원함'),
                    t('application.duplicate_message', '이미 이 공고에 지원하셨습니다.'),
                    'warning',
                    () => {
                        resetAllData();
                        router.replace('/(user)/home');
                    },
                    false,
                    t('common.confirm', '확인')
                );
                return;
            }

            // 메시지 전송 (이력서 전송)
            const messageResponse = await api('POST', '/api/messages', {
                receiverId: companyId,
                subject: `${jobTitle} 입사 지원서`,
                content: isEditing === 'true' ? editedResume : resume
            });

            if (!messageResponse.success) {
                showModal(t('common.error', '오류'), t('application.send_failed', '지원서 전송에 실패했습니다.'), 'warning');
                return;
            }

            // 토큰 잔액 업데이트
            await fetchTokenBalance();

            // 지원 내역 저장 (토큰 사용 플래그 포함)
            const applicationResponse = await api('POST', '/api/applications', {
                companyId: companyId,
                jobPostingId: jobPostingId,
                messageId: messageResponse.data.id,
                useToken: true // 채팅 지원은 토큰 사용
            });

            if (!applicationResponse.success) {
                if (applicationResponse?.error === '토큰이 부족합니다. 상점에서 토큰을 구매해주세요.') {
                    showModal(
                        t('application.insufficient_tokens_title', '토큰 부족'),
                        t('application.insufficient_tokens_message', '채팅 지원을 위해서는 토큰 1개가 필요합니다. 상점에서 토큰을 구매해주세요.'),
                        'warning',
                        () => {
                            router.push('/(pages)/(user)/(shop)/shop');
                        },
                        true,
                        t('application.go_to_shop', '상점으로 가기'),
                        t('common.cancel', '취소')
                    );
                    return;
                }
                showModal(t('common.error', '오류'), t('application.save_failed', '지원 내역 저장에 실패했습니다.'), 'warning');
                return;
            }

            // 기존 채팅방 확인 또는 새 채팅방 생성
            if (user?.userId) {
                // 먼저 동일한 회사와의 기존 채팅방이 있는지 확인
                const existingRoomResponse = await api('GET', `/api/chat/find-existing-room?user_id=${user.userId}&company_id=${companyId}`);
                
                let roomId = null;
                
                if (existingRoomResponse.success && existingRoomResponse.data?.roomId) {
                    // 기존 채팅방이 있으면 재사용
                    roomId = existingRoomResponse.data.roomId;
                    console.log('기존 채팅방 재사용:', roomId);
                } else {
                    // 기존 채팅방이 없으면 새로 생성
                    const chatRoomResponse = await api('POST', '/api/chat/create-room', {
                        application_id: applicationResponse.data.id,
                        user_id: user.userId,
                        company_id: companyId,
                        job_posting_id: jobPostingId
                    });
                    
                    if (chatRoomResponse.success && chatRoomResponse.data?.id) {
                        roomId = chatRoomResponse.data.id;
                        console.log('새 채팅방 생성:', roomId);
                    }
                }

                if (roomId) {
                    resetAllData();
                    router.replace({
                        pathname: '/chat/[roomId]',
                        params: {
                            roomId: roomId,
                            initialMessage: isEditing === 'true' ? editedResume : resume,
                            messageType: 'resume',
                            fromApplication: 'true'
                        }
                    })

                } else {
                    showModal(t('common.error', '오류'), t('chat.room_access_failed', '채팅방 접근에 실패했습니다.'), 'warning');
                }
            }

        } catch (error: any) {
            console.error('채팅 지원 에러:', error);
            console.error('에러 세부사항:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method
            });
            showModal(t('common.error', '오류'), t('application.error_message', '지원 처리 중 오류가 발생했습니다.'), 'warning');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-3">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-gray-900">
                    {t('application.method_title', '지원 방식 선택')}
                </Text>
            </View>
            
            <ScrollView className="flex-1">
                {/* Job Title Section */}
                <View className="bg-white px-5 py-4 border-b border-gray-100">
                    <Text className="text-center text-base font-medium text-gray-900 mb-2">
                        {t('application.method_title', '지원 방식 선택')}
                    </Text>
                    {/*<Text className="text-center text-sm text-gray-600 mb-1">*/}
                    {/*    {jobTitle}*/}
                    {/*</Text>*/}
                </View>



                <View className="p-4">

                    {/* 채팅 지원 카드 */}
                    <ApplicationMethodCard
                        type="chat"
                        onPress={handleChatApplicationClick}
                        disabled={loading}
                        userTokens={userTokens}
                    />
                    {/* 일반 지원 카드 */}
                    <ApplicationMethodCard 
                        type="regular"
                        onPress={handleRegularApplicationClick}
                        disabled={loading}
                        userTokens={userTokens}
                    />


                </View>

                {/* 하단 정보 */}
                <View className="bg-white mx-4 rounded-xl p-4 mb-4">
                    <Text className="text-center text-xs text-gray-500">
                        💡 {t('application.success_stats', '지난 주 채팅 지원 선택자 78%가 24시간 내 면접 일정을 잡았습니다')}
                    </Text>
                </View>
            </ScrollView>
            
            {/* 채팅 지원 프로모션 모달 */}
            <ChatApplicationPromotionModal
                visible={showPromotionModal}
                onClose={() => setShowPromotionModal(false)}
                onChatApplication={handlePromotionChatApplication}
                onRegularApplication={handleRegularApplication}
                userTokens={userTokens}
            />

            {/* 토큰 구매 모달 */}
            <TokenPurchaseModal
                visible={showTokenPurchaseModal}
                onClose={() => setShowTokenPurchaseModal(false)}
                onPurchaseSuccess={handleTokenPurchaseSuccess}
                onPurchase={handleTokenPurchase}
                loading={purchaseLoading}
                products={products}
                isIAPAvailable={isIAPAvailable}
            />
            
            <ModalComponent />
        </SafeAreaView>
    );
}