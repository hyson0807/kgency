import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import Back from '@/components/back'
import { useProfile } from '@/hooks/useProfile'
import { useModal } from '@/hooks/useModal'
import { useTranslation } from "@/contexts/TranslationContext"
import { useApplicationFormStore } from '@/stores/applicationFormStore'
// Step 3: 한국어 실력 및 질문 입력 페이지
export default function ApplicationStep3() {
    const params = useLocalSearchParams()
    const { jobPostingId, companyId, companyName, jobTitle } = params
    const { profile, updateProfile } = useProfile()
    
    // Zustand store 사용
    const step1Data = useApplicationFormStore(state => state.step1)
    const step2Data = useApplicationFormStore(state => state.step2)
    const step3Data = useApplicationFormStore(state => state.step3)
    const {
        setKoreanLevel,
        setTopic,
        setQuestion,
        resetAllData,
        isDataEmpty
    } = useApplicationFormStore()
    
    const [loading, setLoading] = useState(false)
    const { showModal, ModalComponent } = useModal()
    const { t } = useTranslation()
    const koreanLevelOptions = [
        { label: t('apply.korean_beginner', '초급'), value: '초급' },
        { label: t('apply.korean_intermediate', '중급'), value: '중급' },
        { label: t('apply.korean_advanced', '고급'), value: '고급' }
    ]
    
    const topicOptions = [
        { label: t('apply.topik_1', '1급'), value: '1급' },
        { label: t('apply.topik_2', '2급'), value: '2급' },
        { label: t('apply.topik_3plus', '3급이상'), value: '3급이상' }
    ]
    const handleSubmit = async () => {
        setLoading(true)
        try {
            // userInfo 객체 생성 - 타입 안전하게 처리
            const userInfoData: any = {}
            // Step 1 데이터 처리
            if (step1Data.age) userInfoData.age = parseInt(step1Data.age)
            if (step1Data.gender) userInfoData.gender = step1Data.gender
            if (step1Data.visa) userInfoData.visa = step1Data.visa
            
            // Step 2 데이터 처리
            userInfoData.how_long = step2Data.howLong
            userInfoData.experience = step2Data.experience
            if (step2Data.experienceContent) userInfoData.experience_content = step2Data.experienceContent
            
            // Step 3 데이터 처리
            if (step3Data.koreanLevel) userInfoData.korean_level = step3Data.koreanLevel
            if (step3Data.topic) userInfoData.topic = step3Data.topic
            // 프로필 업데이트
            const updated = await updateProfile({
                profile: {
                    name: step1Data.name,
                },
                userInfo: userInfoData
            })
            if (updated) {
                // Resume 페이지로 이동
                router.push({
                    pathname: '/resume',
                    params: {
                        jobPostingId: String(jobPostingId),
                        companyId: String(companyId),
                        companyName: String(companyName),
                        jobTitle: String(jobTitle),
                        question: String(step3Data.question),
                        selectedDays: step2Data.selectedDays.join(','),
                        daysNegotiable: String(step2Data.daysNegotiable),
                        selectedTimes: step2Data.selectedTimes.join(','),
                        timesNegotiable: String(step2Data.timesNegotiable)
                    }
                })
                
                // 이력서 전송 완료 후에 데이터 초기화하도록 변경
            } else {
                showModal(t('alert.error', '오류'), t('apply.save_failed', '정보 저장에 실패했습니다.'), 'warning')
            }
        } catch (error) {
            showModal(t('alert.error', '오류'), t('apply.save_error', '정보 저장 중 문제가 발생했습니다.'), 'warning')
        } finally {
            setLoading(false)
        }
    }
    const handleBack = () => {
        router.back()
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back onPress={handleBack} />
                <Text className="text-lg font-bold ml-4">
                    {t('apply.title', '지원서 작성')} (3/3)
                </Text>
            </View>
            {/* 진행 상황 인디케이터 */}
            <View className="flex-row items-center px-6 py-4 bg-gray-50">
                <View className="flex-1 flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
                        <Text className="text-white font-bold text-sm">1</Text>
                    </View>
                    <View className="flex-1 h-0.5 bg-blue-500 mx-2" />
                    <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
                        <Text className="text-white font-bold text-sm">2</Text>
                    </View>
                    <View className="flex-1 h-0.5 bg-blue-500 mx-2" />
                    <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
                        <Text className="text-white font-bold text-sm">3</Text>
                    </View>
                </View>
            </View>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="bg-white">
                    <View className="p-6">
                        <Text className="text-xl font-bold mb-2">한국어 실력과 질문을 입력해주세요</Text>
                        <Text className="text-gray-600 mb-6">마지막 단계입니다. 한국어 실력과 궁금한 점을 작성해주세요.</Text>
                    </View>
                    {/* 지원 공고 정보 */}
                    <View className="mx-6 mb-6 p-4 bg-blue-50 rounded-xl">
                        <Text className="text-sm text-gray-600">{t('apply.applying_to', '지원 공고')}</Text>
                        <Text className="text-lg font-bold text-blue-600">{jobTitle || t('apply.job_posting', '채용 공고')}</Text>
                        <Text className="text-sm text-gray-600 mt-1">{companyName}</Text>
                    </View>
                    
                    {/* 한국어 실력 및 질문 입력 폼 */}
                    <View className="p-6">
                        {/* 한국어 실력 */}
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-4">{t('apply.korean_level', '한국어 실력')}</Text>
                            <View className="flex-row gap-2">
                                {koreanLevelOptions.map((level) => (
                                    <TouchableOpacity
                                        key={level.value}
                                        onPress={() => setKoreanLevel(level.value)}
                                        className={`flex-1 py-3 rounded-lg border items-center ${
                                            step3Data.koreanLevel === level.value
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={`font-medium ${
                                            step3Data.koreanLevel === level.value ? 'text-white' : 'text-gray-700'
                                        }`}>{level.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        {/* 토픽 급수 */}
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-4">{t('apply.topik_level', '토픽 급수')}</Text>
                            <View className="flex-row gap-2">
                                {topicOptions.map((grade) => (
                                    <TouchableOpacity
                                        key={grade.value}
                                        onPress={() => setTopic(step3Data.topic === grade.value ? null : grade.value)}
                                        className={`flex-1 py-3 rounded-lg border items-center ${
                                            step3Data.topic === grade.value
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={`font-medium ${
                                            step3Data.topic === grade.value ? 'text-white' : 'text-gray-700'
                                        }`}>{grade.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        {/* 질문 내용 */}
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-4">{t('apply.questions', '사장님께 물어보고 싶은 내용')}</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 h-24"
                                placeholder={t('apply.questions_placeholder', '질문사항')}
                                value={step3Data.question}
                                onChangeText={setQuestion}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`py-4 mb-4 rounded-xl ${
                        loading ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        {loading ? t('apply.saving', '저장 중...') : t('apply.create_resume', '이력서 자동으로 만들어줄게!')}
                    </Text>
                </TouchableOpacity>
            </View>
            <ModalComponent />
        </SafeAreaView>
    )
}