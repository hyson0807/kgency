import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTabBar } from '@/contexts/TabBarContext';
import { useApplicationFormStore } from '@/stores/applicationFormStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/core/api';

import { ApplicationMethodCard } from '@/components/user/application-method';
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
        jobTitle,
        companyName,
        audioUrl
    } = params as {
        resume: string;
        editedResume: string;
        isEditing: string;
        companyId: string;
        jobPostingId: string;
        jobTitle: string;
        companyName: string;
        audioUrl: string;
    };
    
    const { resetAllData } = useApplicationFormStore();
    const [loading, setLoading] = React.useState(false);
    const { showModal, ModalComponent } = useModal();
    const { createAndNavigateToChat } = useChatRoomNavigation();

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

    // 채팅 지원 버튼 클릭 처리 (이제 무료)
    const handleChatApplicationClick = async () => {
        setLoading(true);
        try {
            // 중복 지원 확인
            const isDuplicate = await checkDuplicateApplication();
            if (isDuplicate) return;

            // 음성 메시지 먼저 전송
            if (audioUrl) {
                const audioMessageResponse = await api('POST', '/api/resume/save', {
                    receiverId: companyId,
                    subject: `${jobTitle} 면접 음성`,
                    content: audioUrl,
                    messageType: 'audio'
                });

                if (!audioMessageResponse.success) {
                    showModal(t('common.error', '오류'), '음성 전송에 실패했습니다.', 'warning');
                    return;
                }
            }

            // 이력서 저장 (이력서 전송)
            const messageResponse = await api('POST', '/api/resume/save', {
                receiverId: companyId,
                subject: `${jobTitle} 입사 지원서`,
                content: isEditing === 'true' ? editedResume : resume,
                messageType: 'resume'
            });

            if (!messageResponse.success) {
                showModal(t('common.error', '오류'), t('application.send_failed', '지원서 전송에 실패했습니다.'), 'warning');
                return;
            }

            // 지원 내역 저장 (토큰 사용하지 않음)
            const applicationResponse = await api('POST', '/api/applications', {
                companyId: companyId,
                jobPostingId: jobPostingId,
                messageId: messageResponse.data.id,
                useToken: false // 채팅 지원 무료화
            });

            if (!applicationResponse.success) {
                showModal(t('common.error', '오류'), t('application.save_failed', '지원 내역 저장에 실패했습니다.'), 'warning');
                return;
            }

            // 채팅방 생성 및 이동
            await navigateToChatRoom(applicationResponse.data.id);

        } catch (error: any) {
            console.error('채팅 지원 에러:', error);
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
            fromApplication: true,
            audioUrl: audioUrl || undefined
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
                    />
                </View>

                {/* 하단 정보 */}
                <View className="bg-white mx-4 rounded-xl p-4 mb-4">
                    <Text className="text-center text-xs text-gray-500">
                        💡 {t('application.success_stats', '지난 주 채팅 지원 선택자 78%가 24시간 내 면접 일정을 잡았습니다')}
                    </Text>
                </View>
            </ScrollView>
            
            
            <ModalComponent />
        </SafeAreaView>
    );
}