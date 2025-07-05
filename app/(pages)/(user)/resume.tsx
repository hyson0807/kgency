import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import Back from '@/components/back'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import axios from 'axios'

export default function Resume() {
    const params = useLocalSearchParams();
    // params가 배열일 수 있으므로 첫 번째 값을 가져옴
    const jobPostingId = Array.isArray(params.jobPostingId) ? params.jobPostingId[0] : params.jobPostingId;
    const companyId = Array.isArray(params.companyId) ? params.companyId[0] : params.companyId;
    const companyName = Array.isArray(params.companyName) ? params.companyName[0] : params.companyName;
    const jobTitle = Array.isArray(params.jobTitle) ? params.jobTitle[0] : params.jobTitle;
    const question = Array.isArray(params.question) ? params.question[0] : params.question;
    const { user } = useAuth();

    const [resume, setResume] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editedResume, setEditedResume] = useState('')
    const [sending, setSending] = useState(false)
    const [regenerating, setRegenerating] = useState(false)

    // 컴포넌트 마운트 시 AI 이력서 생성
    useEffect(() => {
        if (jobPostingId && companyId && user) {
            generateResume();
        } else if (!jobPostingId) {
            setError('공고 정보가 없습니다.');
            setLoading(false);
        } else if (!companyId) {
            setError('회사 정보가 없습니다.');
            setLoading(false);
        } else if (!user) {
            setError('로그인이 필요합니다.');
            setLoading(false);
        }
    }, [jobPostingId, companyId, user]);

    const generateResume = async () => {
        setLoading(true);
        setError(null);

        try {
            // 디버깅을 위한 로그
            console.log('AI 이력서 생성 요청:', {
                user_id: user?.userId,
                job_posting_id: jobPostingId,
                company_id: companyId
            });

            // AI 이력서 생성 API 호출 (job_posting_id 추가)
            const response = await axios.post('https://kgencyserver-production.up.railway.app/generate-resume-for-posting', {
                user_id: user?.userId,
                job_posting_id: jobPostingId,
                company_id: companyId,
                question: question,
            });

            console.log('AI 이력서 생성 응답:', response.data);

            if (response.data.success && response.data.resume) {
                setResume(response.data.resume);
                setEditedResume(response.data.resume);
            } else {
                throw new Error(response.data.error || 'AI 이력서 생성에 실패했습니다.');
            }
        } catch (error: any) {
            console.error('AI 이력서 생성 오류:', error);
            setError(error.response?.data?.error || error.message || 'AI 이력서 생성 중 오류가 발생했습니다.');

            // 오류 발생 시 기본 이력서 템플릿 제공
            const fallbackResume = `안녕하세요, ${companyName} 채용 담당자님

${jobTitle || '귀사의 채용 공고'}에 지원하게 되어 기쁩니다.

저는 성실하고 책임감 있는 지원자로서, 귀사에서 열심히 일할 준비가 되어 있습니다.

주어진 업무를 성실히 수행하며, 동료들과 협력하여 회사의 발전에 기여하고 싶습니다.

감사합니다.`;

            setResume(fallbackResume);
            setEditedResume(fallbackResume);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        Alert.alert(
            '이력서 전송',
            `${jobTitle || '채용 공고'}에 이력서를 전송하시겠습니까?`,
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '전송',
                    onPress: async () => {
                        setSending(true);
                        try {
                            // 먼저 중복 지원 확인
                            const { data: existingApp } = await supabase
                                .from('applications')
                                .select('id')
                                .eq('user_id', user?.userId)
                                .eq('job_posting_id', jobPostingId)
                                .maybeSingle();

                            if (existingApp) {
                                Alert.alert(
                                    '이미 지원함',
                                    '이 공고에는 이미 지원하셨습니다.',
                                    [
                                        {
                                            text: '확인',
                                            onPress: () => router.replace('/(user)/home')
                                        }
                                    ]
                                );
                                setSending(false);
                                return;
                            }

                            // 메시지 전송
                            const { data: messageData, error: messageError } = await supabase
                                .from('messages')
                                .insert({
                                    sender_id: user?.userId,
                                    receiver_id: companyId,
                                    subject: `[${jobTitle}] 입사 지원서`,
                                    content: isEditing ? editedResume : resume
                                })
                                .select()
                                .single();

                            if (messageError) throw messageError;

                            // 지원 내역 저장 (job_posting_id 추가)
                            const { error: applicationError } = await supabase
                                .from('applications')
                                .insert({
                                    user_id: user?.userId,
                                    company_id: companyId,
                                    job_posting_id: jobPostingId,
                                    message_id: messageData.id,
                                    status: 'pending'
                                });

                            if (applicationError) throw applicationError;

                            Alert.alert(
                                '전송 완료',
                                '이력서가 성공적으로 전송되었습니다!',
                                [
                                    {
                                        text: '확인',
                                        onPress: () => router.replace('/(user)/home')
                                    }
                                ]
                            );
                        } catch (error) {
                            console.error('이력서 전송 오류:', error);
                            Alert.alert('오류', '이력서 전송 중 문제가 발생했습니다.');
                        } finally {
                            setSending(false);
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        if (isEditing) {
            // 저장
            setResume(editedResume);
        } else {
            // 편집 시작
            setEditedResume(resume);
        }
        setIsEditing(!isEditing);
    };

    const handleRegenerate = async () => {
        Alert.alert(
            'AI 이력서 재생성',
            '현재 작성된 내용이 사라집니다. 계속하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                {
                    text: '재생성',
                    onPress: async () => {
                        setRegenerating(true);
                        await generateResume();
                        setRegenerating(false);
                        setIsEditing(false);
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">AI가 이력서를 작성 중입니다...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <View className="flex-row items-center">
                    <Back />
                    <Text className="text-lg font-bold ml-4">AI 이력서</Text>
                </View>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={handleRegenerate}
                        disabled={regenerating}
                        className="px-3 py-1 rounded-lg bg-gray-100"
                    >
                        <Ionicons
                            name="refresh"
                            size={20}
                            color={regenerating ? "#9ca3af" : "#374151"}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleEdit}
                        className={`px-3 py-1 rounded-lg ${isEditing ? 'bg-blue-500' : 'bg-gray-100'}`}
                    >
                        <Ionicons
                            name={isEditing ? "checkmark" : "create"}
                            size={20}
                            color={isEditing ? "white" : "#374151"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1">
                {/* 공고 정보 */}
                <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl">
                    <View className="flex-row items-center">
                        <Ionicons name="document-text" size={20} color="#1e40af" />
                        <Text className="text-lg font-bold text-blue-900 ml-2">
                            {jobTitle || '채용 공고'}
                        </Text>
                    </View>
                    <Text className="text-sm text-blue-700 mt-1">
                        {companyName} | AI가 작성한 맞춤형 이력서
                    </Text>
                </View>

                {/* 에러 메시지 */}
                {error && (
                    <View className="bg-red-50 mx-4 mt-4 p-4 rounded-xl">
                        <View className="flex-row items-start">
                            <Ionicons name="alert-circle" size={20} color="#dc2626" />
                            <Text className="text-sm text-red-700 ml-2 flex-1">{error}</Text>
                        </View>
                    </View>
                )}

                {/* 이력서 내용 */}
                <View className="p-4">
                    {isEditing ? (
                        <TextInput
                            className="bg-gray-50 p-4 rounded-xl text-base min-h-[400px]"
                            multiline
                            value={editedResume}
                            onChangeText={setEditedResume}
                            placeholder="이력서 내용을 입력하세요..."
                            textAlignVertical="top"
                        />
                    ) : (
                        <View className="bg-gray-50 p-4 rounded-xl">
                            <Text className="text-base text-gray-800 leading-7">
                                {resume}
                            </Text>
                        </View>
                    )}
                </View>

                {/* AI 안내 */}
                <View className="mx-4 mb-4 p-4 bg-amber-50 rounded-xl">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={20} color="#f59e0b" />
                        <View className="ml-2 flex-1">
                            <Text className="text-sm font-medium text-amber-900">
                                AI가 작성한 이력서입니다
                            </Text>
                            <Text className="text-xs text-amber-700 mt-1">
                                내용을 검토하고 필요시 수정할 수 있습니다.
                                수정하려면 상단의 편집 버튼을 누르세요.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="p-4 border-t border-gray-200">
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={sending || isEditing}
                    className={`py-4 rounded-xl ${
                        sending || isEditing ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        {sending ? '전송 중...' : isEditing ? '편집을 완료하세요' : '이력서 전송'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}