import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Back from '@/components/back'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'

export default function Resume() {
    const params = useLocalSearchParams();
    // params가 배열일 수 있으므로 첫 번째 값을 가져옴
    const companyId = Array.isArray(params.companyId) ? params.companyId[0] : params.companyId;
    const companyName = Array.isArray(params.companyName) ? params.companyName[0] : params.companyName;
    const { user } = useAuth();

    const [resume, setResume] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sending, setSending] = useState(false);

    // 파라미터 확인
    useEffect(() => {
        console.log('Resume 페이지 params:', params);
        console.log('companyId:', companyId);
        console.log('companyName:', companyName);
        console.log('user:', user);
    }, [params, companyId, companyName, user]);

    // 컴포넌트 마운트 시 AI 이력서 생성
    useEffect(() => {
        if (companyId && user) {
            generateResume();
        } else if (!companyId) {
            setError('회사 정보가 없습니다.');
            setLoading(false);
        } else if (!user) {
            setError('로그인이 필요합니다.');
            setLoading(false);
        }
    }, [companyId, user]);

    const generateResume = async () => {
        if (!user) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // 디버깅을 위한 로그
            console.log('AI 이력서 생성 요청:', {
                user_id: user.userId,
                company_id: companyId
            });

            // AI 이력서 생성 API 호출
            const response = await axios.post('https://1232-production.up.railway.app/generate-resume', {
                user_id: user.userId,
                company_id: companyId
            });

            if (response.data.success) {
                setResume(response.data.resume);
            } else {
                setError(response.data.error || '이력서 생성에 실패했습니다.');
            }
        } catch (error: any) {
            console.error('이력서 생성 오류:', error);
            console.error('에러 상세:', error.response?.data);

            // 에러 메시지 개선
            if (error.response?.status === 400) {
                setError(error.response.data?.error || '요청 데이터가 올바르지 않습니다.');
            } else if (error.response?.status === 404) {
                setError('사용자 또는 회사 정보를 찾을 수 없습니다.');
            } else if (error.response?.status === 500) {
                setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            } else {
                setError('이력서를 생성하는 중 문제가 발생했습니다.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        Alert.alert(
            '이력서 전송',
            `${companyName}에 이력서를 전송하시겠습니까?`,
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
                                .eq('company_id', companyId)
                                .maybeSingle();

                            if (existingApp) {
                                Alert.alert(
                                    '이미 지원함',
                                    '이 회사에는 이미 지원하셨습니다.',
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
                                    subject: `입사 지원서`,
                                    content: resume
                                })
                                .select()
                                .single();

                            if (messageError) throw messageError;

                            // 지원 내역 저장
                            const { error: applicationError } = await supabase
                                .from('applications')
                                .insert({
                                    user_id: user?.userId,
                                    company_id: companyId,
                                    message_id: messageData.id,
                                    status: 'pending'
                                });

                            if (applicationError) {
                                // 중복 지원 에러인 경우
                                if (applicationError.code === '23505') {
                                    Alert.alert(
                                        '이미 지원함',
                                        '이 회사에는 이미 지원하셨습니다.',
                                        [
                                            {
                                                text: '확인',
                                                onPress: () => router.replace('/(user)/home')
                                            }
                                        ]
                                    );
                                } else {
                                    throw applicationError;
                                }
                            } else {
                                Alert.alert(
                                    '전송 완료',
                                    '이력서가 성공적으로 전송되었습니다!',
                                    [
                                        {
                                            text: '확인',
                                            onPress: () => {
                                                router.replace('/(user)/home');
                                            }
                                        }
                                    ]
                                );
                            }

                        } catch (error: any) {
                            console.error('이력서 전송 실패:', error);
                            Alert.alert('오류', '이력서 전송에 실패했습니다.');
                        } finally {
                            setSending(false);
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = () => {
        // Apply 페이지로 돌아가서 정보 수정
        router.back();
    };

    const handleRegenerate = () => {
        Alert.alert(
            '이력서 재생성',
            '새로운 이력서를 생성하시겠습니까?',
            [
                { text: '취소', style: 'cancel' },
                { text: '재생성', onPress: generateResume }
            ]
        );
    };

    // 로딩 화면
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center p-4 border-b border-gray-200">
                    <Back />
                    <Text className="text-lg font-bold ml-4">AI 이력서</Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="mt-4 text-gray-600">AI가 이력서를 작성하고 있습니다...</Text>
                    <Text className="mt-2 text-sm text-gray-500">잠시만 기다려주세요</Text>
                </View>
            </SafeAreaView>
        );
    }

    // 에러 화면
    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center p-4 border-b border-gray-200">
                    <Back />
                    <Text className="text-lg font-bold ml-4">AI 이력서</Text>
                </View>
                <View className="flex-1 justify-center items-center p-6">
                    <Ionicons name="alert-circle" size={80} color="#ef4444" />
                    <Text className="mt-4 text-lg text-gray-800 text-center">{error}</Text>
                    <TouchableOpacity
                        onPress={generateResume}
                        className="mt-6 bg-blue-500 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-medium">다시 시도</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // 이력서 화면
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <View className="flex-row items-center">
                    <Back />
                    <Text className="text-lg font-bold ml-4">AI 이력서</Text>
                </View>
                <TouchableOpacity onPress={handleRegenerate}>
                    <Ionicons name="refresh" size={24} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {/* 회사 정보 */}
            <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl">
                <View className="flex-row items-center">
                    <Ionicons name="business" size={20} color="#1e40af" />
                    <Text className="text-lg font-bold text-blue-900 ml-2">
                        {companyName}
                    </Text>
                </View>
                <Text className="text-sm text-blue-700 mt-1">
                    AI가 작성한 맞춤형 이력서
                </Text>
            </View>

            {/* 이력서 내용 */}
            <ScrollView className="flex-1 px-4 py-4">
                <View className="bg-gray-50 p-6 rounded-xl">
                    <Text className="text-base text-gray-800 leading-7">
                        {resume}
                    </Text>
                </View>

                {/* AI 생성 안내 */}
                <View className="mt-4 mb-6 p-4 bg-amber-50 rounded-xl">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={20} color="#f59e0b" />
                        <View className="ml-2 flex-1">
                            <Text className="text-sm font-medium text-amber-900">
                                AI가 작성한 이력서입니다
                            </Text>
                            <Text className="text-xs text-amber-700 mt-1">
                                프로필 정보를 기반으로 회사에 맞춤 작성되었습니다.
                                내용이 마음에 들지 않으면 재생성하거나 프로필을 수정해주세요.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="px-4 pb-4">
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={sending}
                    className={`py-4 rounded-xl items-center ${
                        sending ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                >
                    {sending ? (
                        <Text className="text-white font-bold text-lg">전송 중...</Text>
                    ) : (
                        <View className="flex-row items-center">
                            <Ionicons name="send" size={20} color="white" />
                            <Text className="text-white font-bold text-lg ml-2">
                                이력서 전송하기
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View className="flex-row gap-3 mt-3">
                    <TouchableOpacity
                        onPress={handleEdit}
                        className="flex-1 py-3 rounded-xl border border-gray-300"
                    >
                        <Text className="text-center text-gray-700 font-medium">
                            프로필 수정
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleRegenerate}
                        className="flex-1 py-3 rounded-xl border border-blue-500"
                    >
                        <Text className="text-center text-blue-500 font-medium">
                            다시 생성
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}