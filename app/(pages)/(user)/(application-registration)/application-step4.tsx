import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import Back from '@/components/shared/common/back'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/lib/shared/ui/hooks/useModal'
import { useTranslation } from "@/contexts/TranslationContext"
import {api} from "@/lib/core/api"
export default function ApplicationStep4() {
    const params = useLocalSearchParams();
    const jobPostingId = Array.isArray(params.jobPostingId) ? params.jobPostingId[0] : params.jobPostingId;
    const companyId = Array.isArray(params.companyId) ? params.companyId[0] : params.companyId;
    const companyName = Array.isArray(params.companyName) ? params.companyName[0] : params.companyName;
    const jobTitle = Array.isArray(params.jobTitle) ? params.jobTitle[0] : params.jobTitle;
    const question = Array.isArray(params.question) ? params.question[0] : params.question;
    const { user } = useAuth();
    const { t } = useTranslation()
    const { showModal, ModalComponent, hideModal } = useModal()
    const [resume, setResume] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editedResume, setEditedResume] = useState('')
    const [regenerating, setRegenerating] = useState(false)
    // 컴포넌트 마운트 시 AI 이력서 생성
    useEffect(() => {
        if (jobPostingId && companyId && user) {
            generateResume();
        } else if (!jobPostingId) {
            setError(t('resume.no_posting_info', '공고 정보가 없습니다.'));
            setLoading(false);
        } else if (!companyId) {
            setError(t('resume.no_company_info', '회사 정보가 없습니다.'));
            setLoading(false);
        } else if (!user) {
            setError(t('resume.login_required', '로그인이 필요합니다.'));
            setLoading(false);
        }
    }, [jobPostingId, companyId, user]);
    const generateResume = async () => {
        setLoading(true);
        setError(null);
        try {
            const selectedDays = params.selectedDays as string;
            const daysNegotiable = params.daysNegotiable as string;
            const selectedTimes = params.selectedTimes as string;
            const timesNegotiable = params.timesNegotiable as string;
            // 근무 요일 문자열 생성
            let workDaysString = '';
            if (selectedDays && selectedDays.trim()) {
                workDaysString = selectedDays;
                if (daysNegotiable === 'true') {
                    workDaysString += ` (${t('apply.negotiable', '협의가능')})`;
                }
            } else if (daysNegotiable === 'true') {
                workDaysString = t('apply.negotiable', '협의가능');
            } else {
                workDaysString = t('common.none', '없음');
            }
            // 시간대 문자열 생성
            let workTimesString = '';
            if (selectedTimes && selectedTimes.trim()) {
                workTimesString = selectedTimes;
                if (timesNegotiable === 'true') {
                    workTimesString += ` (${t('apply.negotiable', '협의가능')})`;
                }
            } else if (timesNegotiable === 'true') {
                workTimesString = t('apply.negotiable', '협의가능');
            } else {
                workTimesString = t('common.none', '없음');
            }
            
            const response = await api('POST', '/api/resume/generate', {
                user_id: user?.userId,
                job_posting_id: jobPostingId,
                company_id: companyId,
                question: question,
                workDaysString: workDaysString,    // 완성된 문자열로 전송
                workTimesString: workTimesString   // 완성된 문자열로 전송
            });
            if (response.success && response.resume) {
                setResume(response.resume);
                setEditedResume(response.resume);
            } else {
                const errorMessage = response.error || t('resume.ai_generation_failed', 'AI 이력서 생성에 실패했습니다.');
                setError(errorMessage);
                
                // 오류 발생 시 기본 이력서 템플릿 제공
                const fallbackResume = t('resume.fallback_template', `안녕하세요, ${companyName} 채용 담당자님
${jobTitle || '귀사의 채용 공고'}에 지원하게 되어 기쁩니다.
저는 성실하고 책임감 있는 지원자로서, 귀사에서 열심히 일할 준비가 되어 있습니다.
주어진 업무를 성실히 수행하며, 동료들과 협력하여 회사의 발전에 기여하고 싶습니다.
감사합니다.`);
                setResume(fallbackResume);
                setEditedResume(fallbackResume);
            }
        } catch (error: any) {
            setError(error.response?.error || error.message || t('resume.ai_generation_error', 'AI 이력서 생성 중 오류가 발생했습니다.'));
            // 오류 발생 시 기본 이력서 템플릿 제공
            const fallbackResume = t('resume.fallback_template', `안녕하세요, ${companyName} 채용 담당자님
${jobTitle || '귀사의 채용 공고'}에 지원하게 되어 기쁩니다.
저는 성실하고 책임감 있는 지원자로서, 귀사에서 열심히 일할 준비가 되어 있습니다.
주어진 업무를 성실히 수행하며, 동료들과 협력하여 회사의 발전에 기여하고 싶습니다.
감사합니다.`);
            setResume(fallbackResume);
            setEditedResume(fallbackResume);
        } finally {
            setLoading(false);
        }
    };
    const handleSend = async () => {
        // 지원 방식 선택 페이지로 이동
        router.push({
            pathname: '/(pages)/(user)/(application-registration)/application-method',
            params: {
                resume: resume,
                editedResume: editedResume,
                isEditing: isEditing.toString(),
                companyId: companyId,
                jobPostingId: jobPostingId,
                jobTitle: jobTitle || t('apply.job_posting', '채용 공고')
            }
        });
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
        showModal(
            t('resume.regenerate_modal_title', '이력서 재생성'),
            t('resume.regenerate_modal_message', '현재 작성된 내용이 사라집니다. 계속하시겠습니까?'),
            'warning',
            async () => {
                hideModal();
                setRegenerating(true);
                await generateResume();
                setRegenerating(false);
                setIsEditing(false);
            },
            true
        );
    };
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-4 text-gray-600">{t('resume.creating', '이력서를 작성 중입니다...')}</Text>
            </SafeAreaView>
        );
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <View className="flex-row items-center">
                    <Back />
                    <Text className="text-lg font-bold ml-4">{t('resume.title', '이력서')}</Text>
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
                </View>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1">
                {/* 공고 정보 */}
                <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl">
                    <View className="flex-row items-center">
                        <Ionicons name="document-text" size={20} color="#1e40af" />
                        <Text className="text-lg font-bold text-blue-900 ml-2">
                            {jobTitle || t('resume.job_posting', '채용 공고')}
                        </Text>
                    </View>
                    <Text className="text-sm text-blue-700 mt-1">
                        {companyName} | {t('resume.customized_resume', '맞춤형 이력서')}
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
                            placeholder={t('resume.enter_content', '이력서 내용을 입력하세요...')}
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
                                {t('resume.ai_info', '입력하신 정보에 기반하여 작성된 이력서입니다')}
                            </Text>
                            <Text className="text-xs text-amber-700 mt-1">
                                {t('resume.grammar_check', '문법적으로 완벽하지 않을 수도 있으니 확인해 보시고 수정 가능합니다.')}
                            </Text>
                        </View>
                    </View>
                </View>
                
                {/* 수정하기 버튼 */}
                <View className="px-4 mb-4">
                    <TouchableOpacity
                        onPress={handleEdit}
                        className={`py-3 rounded-xl border ${
                            isEditing ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                        }`}
                    >
                        <Text className={`text-center font-medium ${
                            isEditing ? 'text-white' : 'text-gray-700'
                        }`}>
                            {isEditing ? t('resume.save_edit', '수정 완료') : t('resume.edit_resume', '이력서 수정하기')}
                        </Text>
                    </TouchableOpacity>
                </View>
                </ScrollView>
                {/* 하단 버튼 */}
                <View className="p-4 border-t border-gray-200">
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={isEditing}
                    className={`py-4 rounded-xl ${
                        isEditing ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        {isEditing ? t('resume.complete_edit', '편집을 완료하세요') : t('resume.send_resume', '이력서 전송')}
                    </Text>
                </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
            {/* useModal로 생성되는 모달 */}
            <ModalComponent />
        </SafeAreaView>
    );
}