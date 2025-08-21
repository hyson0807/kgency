import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, router } from 'expo-router'
import Back from "@/components/back"
import { useModal } from "@/hooks/useModal"
import { useTranslation } from "@/contexts/TranslationContext"
import { CareerInformation } from "@/components/user/profile/keywords/CareerInformation"
import { useProfile } from "@/hooks/useProfile"
import LoadingScreen from "@/components/shared/common/LoadingScreen"
const InstantInterviewCareer = () => {
    const params = useLocalSearchParams()
    const { t } = useTranslation()
    const { showModal, ModalComponent } = useModal()
    const { profile, updateProfile, loading } = useProfile()
    
    // 라우팅 파라미터
    const jobPostingId = params.jobPostingId as string
    const companyId = params.companyId as string
    const companyName = params.companyName as string
    const jobTitle = params.jobTitle as string
    const jobAddress = params.jobAddress as string
    const interviewLocation = params.interviewLocation as string
    const specialNotes = params.specialNotes as string
    // 경력 정보 상태
    const [howLong, setHowLong] = useState<string | null>(null)
    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [selectedTimes, setSelectedTimes] = useState<string[]>([])
    const [experience, setExperience] = useState<string | null>(null)
    const [experienceContent, setExperienceContent] = useState('')
    // 프로필에서 기존 경력 정보 로드
    useEffect(() => {
        if (profile?.user_info) {
            setHowLong(profile.user_info.how_long || null)
            setExperience(profile.user_info.experience || null)
            setExperienceContent(profile.user_info.experience_content || '')
            setSelectedDays(profile.user_info.preferred_days || [])
            setSelectedTimes(profile.user_info.preferred_times || [])
        }
    }, [profile])
    // 경력 정보 핸들러들
    const toggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        )
    }
    const toggleTime = (time: string) => {
        setSelectedTimes(prev =>
            prev.includes(time)
                ? prev.filter(t => t !== time)
                : [...prev, time]
        )
    }
    const validateForm = () => {
        if (!howLong) {
            showModal(
                t('alert.notification', '알림'),
                t('instant_interview.select_work_period', '희망 근무 기간을 선택해주세요.')
            )
            return false
        }
        if (selectedDays.length === 0) {
            showModal(
                t('alert.notification', '알림'),
                t('instant_interview.select_work_days', '희망 근무 요일을 하나 이상 선택해주세요.')
            )
            return false
        }
        if (selectedTimes.length === 0) {
            showModal(
                t('alert.notification', '알림'),
                t('instant_interview.select_work_times', '희망 시간대를 하나 이상 선택해주세요.')
            )
            return false
        }
        if (!experience) {
            showModal(
                t('alert.notification', '알림'),
                t('instant_interview.select_experience', '관련 경력을 선택해주세요.')
            )
            return false
        }
        if (!experienceContent || experienceContent.trim().length === 0) {
            showModal(
                t('alert.notification', '알림'),
                t('instant_interview.enter_experience_content', '경력 내용을 입력해주세요.')
            )
            return false
        }
        return true
    }
    const handleNext = async () => {
        // 폼 유효성 검사
        if (!validateForm()) {
            return
        }
        // 경력 정보 저장
        try {
            const updated = await updateProfile({
                userInfo: {
                    how_long: howLong,
                    experience: experience,
                    experience_content: experienceContent,
                    preferred_days: selectedDays,
                    preferred_times: selectedTimes
                }
            })
            if (updated) {
                // 면접 일정 선택 페이지로 이동
                router.push({
                    pathname: '/instant-interview-selection',
                    params: {
                        jobPostingId,
                        companyId,
                        companyName,
                        jobTitle,
                        jobAddress,
                        interviewLocation,
                        specialNotes
                    }
                })
            } else {
                showModal(
                    t('alert.error', '오류'),
                    t('alert.save_failed', '저장에 실패했습니다. 다시 시도해주세요.')
                )
            }
        } catch (error) {
            showModal(
                t('alert.error', '오류'),
                t('alert.save_failed', '저장에 실패했습니다. 다시 시도해주세요.')
            )
        }
    }
    if (loading) return <LoadingScreen />
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
                <View className="p-4 border-b border-gray-200">
                    <View className="flex-row items-center">
                        <Back />
                        <Text className="text-lg font-bold ml-4">
                            {t('instant_interview.career_info', '경력 정보 입력')}
                        </Text>
                    </View>
                </View>
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
                >
                    {/* 안내 메시지 */}
                    <View className="mx-4 mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                        <Text className="text-green-800 font-semibold mb-1">
                            {t('instant_interview.perfect_match', '완벽한 매칭입니다!')}
                        </Text>
                        <Text className="text-green-700 text-sm">
                            {t('instant_interview.career_info_required', '면접 확정을 위해 경력 정보를 모두 입력해주세요.')}
                        </Text>
                    </View>
                    {/* 경력 정보 컴포넌트 */}
                    <CareerInformation
                        t={t}
                        formData={{
                            howLong,
                            selectedDays,
                            selectedTimes,
                            experience,
                            experienceContent
                        }}
                        handlers={{
                            setHowLong,
                            toggleDay,
                            setSelectedDays,
                            toggleTime,
                            setSelectedTimes,
                            setExperience,
                            setExperienceContent
                        }}
                    />
                </ScrollView>
                {/* 하단 버튼 */}
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-8">
                    <TouchableOpacity
                        className="w-full bg-blue-500 items-center justify-center py-4 rounded-2xl shadow-sm"
                        onPress={handleNext}
                    >
                        <Text className="font-semibold text-base text-white">
                            {t('instant_interview.complete_and_next', '작성 완료 후 면접 일정 선택')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ModalComponent />
        </SafeAreaView>
    )
}
export default InstantInterviewCareer