import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuth } from '@/contexts/AuthContext';
import { useApplicationFormStore } from '@/stores/applicationFormStore';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

export default function ApplicationMethodScreen() {
    const router = useRouter();
    const { t } = useTranslation();
    const { user } = useAuth();
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

    // 일반 지원 처리
    const handleRegularApplication = async () => {
        setLoading(true);
        try {
            // 중복 지원 확인
            const checkDuplicateResponse = await api('GET', `/api/applications/check-duplicate?jobPostingId=${jobPostingId}`);
            
            if (checkDuplicateResponse.isDuplicate) {
                Alert.alert(
                    t('application.duplicate_title', '이미 지원함'),
                    t('application.duplicate_message', '이미 이 공고에 지원하셨습니다.'),
                    [{ 
                        text: t('common.confirm', '확인'), 
                        onPress: () => {
                            resetAllData();
                            router.replace('/(user)/home');
                        }
                    }]
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
                Alert.alert(t('common.error', '오류'), t('application.send_failed', '지원서 전송에 실패했습니다.'));
                return;
            }

            // 지원 내역 저장
            const applicationResponse = await api('POST', '/api/applications', {
                companyId: companyId,
                jobPostingId: jobPostingId,
                messageId: messageResponse.data.id
            });

            if (!applicationResponse.success) {
                Alert.alert(t('common.error', '오류'), t('application.save_failed', '지원 내역 저장에 실패했습니다.'));
                return;
            }

            Alert.alert(
                t('application.success_title', '지원 완료'),
                t('application.success_message', '지원서가 성공적으로 전송되었습니다.'),
                [{ 
                    text: t('common.confirm', '확인'), 
                    onPress: () => {
                        resetAllData();
                        router.replace('/(user)/applications');
                    }
                }]
            );

        } catch (error) {
            console.error('일반 지원 에러:', error);
            Alert.alert(t('common.error', '오류'), t('application.error_message', '지원 처리 중 오류가 발생했습니다.'));
        } finally {
            setLoading(false);
        }
    };

    // 채팅 지원 처리
    const handleChatApplication = async () => {
        setLoading(true);
        try {
            // 중복 지원 확인
            const checkDuplicateResponse = await api('GET', `/api/applications/check-duplicate?jobPostingId=${jobPostingId}`);
            
            if (checkDuplicateResponse.isDuplicate) {
                Alert.alert(
                    t('application.duplicate_title', '이미 지원함'),
                    t('application.duplicate_message', '이미 이 공고에 지원하셨습니다.'),
                    [{ 
                        text: t('common.confirm', '확인'), 
                        onPress: () => {
                            resetAllData();
                            router.replace('/(user)/home');
                        }
                    }]
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
                Alert.alert(t('common.error', '오류'), t('application.send_failed', '지원서 전송에 실패했습니다.'));
                return;
            }

            // 지원 내역 저장
            const applicationResponse = await api('POST', '/api/applications', {
                companyId: companyId,
                jobPostingId: jobPostingId,
                messageId: messageResponse.data.id
            });

            if (!applicationResponse.success) {
                Alert.alert(t('common.error', '오류'), t('application.save_failed', '지원 내역 저장에 실패했습니다.'));
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
                    // 홈으로 이동한 후 채팅방으로 자동 이동 (네비게이션 스택 정리)
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
                    Alert.alert(t('common.error', '오류'), t('chat.room_access_failed', '채팅방 접근에 실패했습니다.'));
                }
            }

        } catch (error) {
            console.error('채팅 지원 에러:', error);
            Alert.alert(t('common.error', '오류'), t('application.error_message', '지원 처리 중 오류가 발생했습니다.'));
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
            
            <View className="flex-1 p-5">
                <Text className="text-lg font-semibold text-gray-800 mb-2">
                    {jobTitle}
                </Text>
                <Text className="text-base text-gray-600 mb-8">
                    {t('application.method_description', '원하시는 지원 방식을 선택해주세요')}
                </Text>

                {/* 일반 지원 버튼 */}
                <TouchableOpacity
                    className="bg-white p-6 rounded-2xl mb-4 shadow-sm border border-gray-100"
                    onPress={handleRegularApplication}
                    disabled={loading}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
                            <Ionicons name="document-text" size={24} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-800 mb-1">
                                {t('application.regular_title', '일반 지원')}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                {t('application.regular_description', '이력서를 전송하고 기업의 연락을 기다립니다')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>

                {/* 채팅 지원 버튼 */}
                <TouchableOpacity
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                    onPress={handleChatApplication}
                    disabled={loading}
                    activeOpacity={0.7}
                >
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mr-4">
                            <Ionicons name="chatbubbles" size={24} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-semibold text-gray-800 mb-1">
                                {t('application.chat_title', '채팅 지원')}
                            </Text>
                            <Text className="text-sm text-gray-600">
                                {t('application.chat_description', '이력서를 전송하고 바로 채팅으로 소통합니다')}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </View>
                </TouchableOpacity>

                {/* 추가 안내 */}
                <View className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginTop: 2, marginRight: 8 }} />
                        <View className="flex-1">
                            <Text className="text-sm text-blue-800 leading-5">
                                {t('application.chat_notice', '채팅 지원을 선택하시면 기업 담당자와 실시간으로 대화할 수 있는 채팅방이 개설됩니다.')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}