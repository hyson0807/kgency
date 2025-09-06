import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTabBar } from '@/contexts/TabBarContext';
import { useApplicationFormStore } from '@/stores/applicationFormStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';
import { useIAP } from '@/lib/features/payments/hooks/useIAP';
import { getProductId } from '@/lib/features/payments/types';

import { ApplicationMethodCard } from '@/components/user/application-registration';
import ChatApplicationPromotionModal from '@/components/user/application-registration/ChatApplicationPromotionModal';
import TokenPurchaseModal from '@/components/user/application-registration/TokenPurchaseModal';
import { useModal } from '@/lib/shared/ui/hooks/useModal';
import { useChatRoomNavigation } from '@/lib/features/chat/hooks/useChatRoomNavigation';

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
    const [showPromotionModal, setShowPromotionModal] = React.useState(false);
    const [showTokenPurchaseModal, setShowTokenPurchaseModal] = React.useState(false);
    const { showModal, ModalComponent } = useModal();
    const { createAndNavigateToChat } = useChatRoomNavigation();

    // IAP Hook 사용
    const {
        products,
        userTokens,
        isIAPAvailable,
        purchasing,
        purchaseProduct,
        fetchTokenBalance,
        handleMockPurchase,
        isUserCancellation,
    } = useIAP({
        productIds: [getProductId('token_5_pack')],
        autoInit: true,
    });

    // 페이지 진입/나가기시 TabBar 처리
    React.useEffect(() => {
        setIsTabBarVisible(false);
        return () => {
            setIsTabBarVisible(true);
        };
    }, [setIsTabBarVisible]);

    // 중복 지원 확인 공통 함수
    const checkDuplicateApplication = async (): Promise<boolean> => {
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
            return true;
        }
        return false;
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
            const isDuplicate = await checkDuplicateApplication();
            if (isDuplicate) return;

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
                    setIsTabBarVisible(true);
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

    // 토큰 구매 처리
    const handleTokenPurchase = async () => {
        if (purchasing) return;
        
        try {
            const tokenPackageId = getProductId('token_5_pack');
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
                    () => handleMockPurchaseFlow(),
                    true,
                    '모의 구매 진행',
                    '취소'
                );
                return;
            }
            
            // 실제 구매 진행
            await purchaseProduct(tokenPackageId);
            
            // 성공 후 처리
            await handleTokenPurchaseSuccess();
            
        } catch (error: any) {
            if (isUserCancellation(error)) {
                return; // 사용자 취소는 조용히 처리
            }
            
            console.error('토큰 구매 에러:', error);
            
            // Invalid product ID 에러인 경우 모의 구매로 대체
            if (error.message && error.message.includes('Invalid product ID')) {
                console.log('Invalid product ID 에러 - 모의 구매로 전환');
                showModal(
                    t('shop.devModeInfo', '개발 모드'),
                    `제품 ID를 찾을 수 없습니다.\n\n모의 구매로 진행하시겠습니까?\n\n에러: ${error.message}`,
                    'confirm',
                    () => handleMockPurchaseFlow(),
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
        }
    };

    // 모의 구매 플로우
    const handleMockPurchaseFlow = async () => {
        console.log('모의 구매 진행 중...');
        
        try {
            await handleMockPurchase(5);
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
        }
    };

    // 모의 구매 후 토큰 사용하지 않고 채팅 지원
    const handleMockChatApplication = async () => {
        setShowTokenPurchaseModal(false);
        setLoading(true);
        
        try {
            // 중복 지원 확인
            const isDuplicate = await checkDuplicateApplication();
            if (isDuplicate) return;

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

            // 채팅방 생성 및 이동
            await navigateToChatRoom(applicationResponse.data.id);

        } catch (error: any) {
            console.error('모의 채팅 지원 에러:', error);
            showModal(t('common.error', '오류'), t('application.error_message', '지원 처리 중 오류가 발생했습니다.'), 'warning');
        } finally {
            setLoading(false);
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
            const isDuplicate = await checkDuplicateApplication();
            if (isDuplicate) return;

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

            // 채팅방 생성 및 이동
            await navigateToChatRoom(applicationResponse.data.id);

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

    // 채팅방 생성 및 이동을 위한 래퍼 함수
    const navigateToChatRoom = async (applicationId: string) => {
        resetAllData();
        
        await createAndNavigateToChat({
            companyId: companyId,
            userId: user?.userId || '',
            jobPostingId: jobPostingId,
            applicationId: applicationId,
            initialMessage: isEditing === 'true' ? editedResume : resume,
            messageType: 'resume',
            fromApplication: true
        });
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
                loading={purchasing}
                products={products}
                isIAPAvailable={isIAPAvailable}
            />
            
            <ModalComponent />
        </SafeAreaView>
    );
}