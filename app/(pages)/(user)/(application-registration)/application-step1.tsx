import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import Back from '@/components/back'
import { useProfile } from '@/hooks/useProfile'
import { useModal } from '@/hooks/useModal'
import { useTranslation } from "@/contexts/TranslationContext"
import { PersonalInformation } from "@/components/user/application-form/Personal-Information"
import { useApplicationFormStore } from '@/stores/applicationFormStore'
import { api } from '@/lib/api'
import CustomModal from '@/components/CustomModal'
import { useUserKeywords } from '@/hooks/useUserKeywords'
// Step 1: 기본 정보 입력 페이지
export default function ApplicationStep1() {
    const params = useLocalSearchParams()
    const { jobPostingId, companyId, companyName, jobTitle } = params
    const { profile, loading: profileLoading } = useProfile()
    const { keywords, loading: keywordsLoading } = useUserKeywords()
    
    // Zustand store 사용
    const step1Data = useApplicationFormStore(state => state.step1)
    const {
        setName,
        setAge,
        setGender,
        setVisa,
        resetAllData,
        isDataEmpty,
        loadFromProfile
    } = useApplicationFormStore()
    
    const [loading, setLoading] = useState(false)
    const [hasApplied, setHasApplied] = useState(false)
    const [showDraftModal, setShowDraftModal] = useState(false)
    const { showModal, ModalComponent } = useModal()
    const { t } = useTranslation()
    // 프로필 정보 로드
    useEffect(() => {
        if (profile) {
            loadFromProfile(profile)
        }
    }, [profile, loadFromProfile])
    // 중복 지원 확인
    useEffect(() => {
        const checkExistingApplication = async () => {
            if (profile?.id && jobPostingId) {
                try {
                    const response = await api('GET', `/api/applications/check-duplicate?jobPostingId=${jobPostingId}`)
                    
                    if (response.success) {
                        setHasApplied(response.isDuplicate)
                    }
                } catch (error) {
                }
            }
        }
        checkExistingApplication()
    }, [profile?.id, jobPostingId])
    // 컴포넌트 마운트 시 기존 작성 데이터 확인
    useEffect(() => {
        checkExistingDraft()
    }, [])
    const checkExistingDraft = () => {
        if (!isDataEmpty()) {
            setShowDraftModal(true)
        }
    }
    const validateForm = () => {
        if (!step1Data.name.trim()) {
            showModal(t('alert.notification', '알림'), t('apply.name_required', '이름은 필수 입력 항목입니다.'))
            return false
        }
        if (step1Data.age && (parseInt(step1Data.age) < 0 || parseInt(step1Data.age) > 100)) {
            showModal(t('alert.notification', '알림'), t('apply.invalid_age', '올바른 나이를 입력해주세요.'))
            return false
        }
        return true
    }
    const handleNext = async () => {
        if (!validateForm()) return
        setLoading(true)
        try {
            // Step 2로 이동 (데이터는 이미 Zustand에 저장됨)
            router.push({
                pathname: '/(pages)/(user)/(application-registration)/application-step2' as any,
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
    if (profileLoading || keywordsLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back onPress={() => {
                    if (!isDataEmpty()) {
                        showModal(
                            '확인',
                            '작성 중인 내용이 삭제됩니다. 정말 나가시겠습니까?',
                            'confirm',
                            () => {
                                resetAllData()
                                router.back()
                            },
                            true
                        )
                    } else {
                        router.back()
                    }
                }} />
                <Text className="text-lg font-bold ml-4">
                    {t('apply.title', '지원서 작성')} (1/3)
                </Text>
            </View>
            {/* 진행 상황 인디케이터 */}
            <View className="flex-row items-center px-6 py-4 bg-gray-50">
                <View className="flex-1 flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center">
                        <Text className="text-white font-bold text-sm">1</Text>
                    </View>
                    <View className="flex-1 h-0.5 bg-gray-300 mx-2" />
                    <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                        <Text className="text-gray-500 font-bold text-sm">2</Text>
                    </View>
                    <View className="flex-1 h-0.5 bg-gray-300 mx-2" />
                    <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                        <Text className="text-gray-500 font-bold text-sm">3</Text>
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
                        <Text className="text-xl font-bold mb-2">기본 정보를 입력해주세요</Text>
                        <Text className="text-gray-600 mb-6">지원자의 기본적인 정보를 작성해주세요.</Text>
                    </View>
                    {/* 지원 공고 정보 */}
                    <View className="mx-6 mb-6 p-4 bg-blue-50 rounded-xl">
                        <Text className="text-sm text-gray-600">{t('apply.applying_to', '지원 공고')}</Text>
                        <Text className="text-lg font-bold text-blue-600">{jobTitle || t('apply.job_posting', '채용 공고')}</Text>
                        <Text className="text-sm text-gray-600 mt-1">{companyName}</Text>
                        {hasApplied && (
                            <Text className="text-sm text-orange-600 mt-2">
                                ⚠️ {t('apply.already_applied_warning', '이미 지원한 공고입니다')}
                            </Text>
                        )}
                    </View>
                    
                    {/* 기본 정보 입력 폼 */}
                    <PersonalInformation
                        t={t}
                        name={step1Data.name}
                        setName={setName}
                        age={step1Data.age}
                        setAge={setAge}
                        gender={step1Data.gender}
                        setGender={setGender}
                        visa={step1Data.visa}
                        setVisa={setVisa}
                        keywords={keywords}
                    />
                </View>
            </ScrollView>
            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={loading}
                    className={`py-4 mb-4 rounded-xl ${
                        loading ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        {loading ? '다음...' : '다음 단계'}
                    </Text>
                </TouchableOpacity>
            </View>
            <ModalComponent />
            
            {/* 기존 작성 데이터 모달 */}
            <CustomModal
                visible={showDraftModal}
                onClose={() => {
                    // 취소 버튼 누르면 데이터 초기화
                    resetAllData()
                    setShowDraftModal(false)
                }}
                title="기존 작성 데이터"
                message="기존에 작성중인 지원서가 존재합니다. 이어서 작성하시겠습니까?"
                type="confirm"
                onConfirm={() => {
                    // 확인 버튼 누르면 기존 데이터 유지
                    setShowDraftModal(false)
                }}
                showCancel={true}
                confirmText="예"
                cancelText="아니요"
            />
        </SafeAreaView>
    )
}