import { View, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { router, useLocalSearchParams } from "expo-router"
import Back from '@/components/shared/common/back'
import { useModal } from '@/lib/shared/ui/hooks/useModal'
import { useTranslation } from "@/contexts/TranslationContext"
import { WorkExperienceInformation } from "@/components/user/application-form/WorkExperience-Information"
import { useApplicationFormStore } from '@/stores/applicationFormStore'
// Step 2: 경력 및 정보 입력 페이지
export default function ApplicationStep2() {
    const params = useLocalSearchParams()
    const { jobPostingId, companyId, companyName, jobTitle } = params

    // Zustand store 사용
    const step1Data = useApplicationFormStore(state => state.step1)
    const step2Data = useApplicationFormStore(state => state.step2)
    const {
        setHowLong,
        setExperience,
        setExperienceContent,
        setSelectedDays,
        setDaysNegotiable,
        setSelectedTimes,
        setTimesNegotiable,
        resetAllData,
        isDataEmpty
    } = useApplicationFormStore()
    
    const [loading, setLoading] = useState(false)
    const { showModal, ModalComponent } = useModal()
    const { t } = useTranslation()
    // 요일 선택 토글
    const toggleDay = (dayValue: string) => {
        if (step2Data.selectedDays.includes(dayValue)) {
            setSelectedDays(step2Data.selectedDays.filter(d => d !== dayValue))
        } else {
            setSelectedDays([...step2Data.selectedDays, dayValue])
        }
    }
    // 시간대 선택 토글
    const toggleTime = (timeValue: string) => {
        if (step2Data.selectedTimes.includes(timeValue)) {
            setSelectedTimes(step2Data.selectedTimes.filter(t => t !== timeValue))
        } else {
            setSelectedTimes([...step2Data.selectedTimes, timeValue])
        }
    }
    const handleNext = async () => {
        setLoading(true)
        try {
            // Step 3으로 이동 (데이터는 이미 Zustand에 저장됨)
            router.push({
                pathname: '/(pages)/(user)/(application-registration)/application-step3' as any,
                params: {
                    jobPostingId: String(jobPostingId),
                    companyId: String(companyId),
                    companyName: String(companyName),
                    jobTitle: String(jobTitle)
                }
            })
        } catch (error) {
            showModal('오류', '다음 단계로 이동 중 문제가 발생했습니다.', 'warning')
        } finally {
            setLoading(false)
        }
    }
    const handleBack = () => {
        router.back()
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
                {/* 헤더 */}
                <View className="flex-row items-center p-4 border-b border-gray-200">
                    <Back onPress={handleBack} />
                    <Text className="text-lg font-bold ml-4">
                        {t('apply.title', '지원서 작성')} (2/3)
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
                        <View className="flex-1 h-0.5 bg-gray-300 mx-2" />
                        <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                            <Text className="text-gray-500 font-bold text-sm">3</Text>
                        </View>
                    </View>
                </View>
                <KeyboardAwareScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    keyboardShouldPersistTaps="handled"
                    extraScrollHeight={100}
                    enableOnAndroid={true}
                    enableAutomaticScroll={true}
                    keyboardOpeningTime={0}
                >
                <View className="bg-white">
                    <View className="p-6">
                        <Text className="text-xl font-bold mb-2">경력 및 추가 정보를 입력해주세요</Text>
                        <Text className="text-gray-600 mb-6">더 나은 매칭을 위한 상세 정보를 작성해주세요.</Text>
                    </View>
                    {/* 지원 공고 정보 */}
                    <View className="mx-6 mb-6 p-4 bg-blue-50 rounded-xl">
                        <Text className="text-sm text-gray-600">{t('apply.applying_to', '지원 공고')}</Text>
                        <Text className="text-lg font-bold text-blue-600">{jobTitle || t('apply.job_posting', '채용 공고')}</Text>
                        <Text className="text-sm text-gray-600 mt-1">{companyName}</Text>
                    </View>
                    
                    {/* 경력 및 정보 입력 폼 */}
                    <WorkExperienceInformation
                        t={t}
                        formData={{
                            howLong: step2Data.howLong,
                            selectedDays: step2Data.selectedDays,
                            daysNegotiable: step2Data.daysNegotiable,
                            selectedTimes: step2Data.selectedTimes,
                            timesNegotiable: step2Data.timesNegotiable,
                            experience: step2Data.experience,
                            experienceContent: step2Data.experienceContent
                        }}
                        handlers={{
                            setHowLong,
                            toggleDay,
                            setDaysNegotiable,
                            setSelectedDays,
                            toggleTime,
                            setTimesNegotiable,
                            setSelectedTimes,
                            setExperience,
                            setExperienceContent
                        }}
                    />
                </View>
                </KeyboardAwareScrollView>
                {/* 하단 버튼 - flex 사용 */}
                <View className="bg-white border-t border-gray-200 p-4">
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={loading}
                        className={`py-4 rounded-xl ${
                            loading ? 'bg-gray-400' : 'bg-blue-500'
                        }`}
                    >
                        <Text className="text-center text-white font-bold text-lg">
                            {loading ? '다음...' : '다음 단계'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ModalComponent />
        </SafeAreaView>
    )
}