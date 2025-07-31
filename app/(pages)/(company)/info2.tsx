import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import { api } from '@/lib/api'
import Back from '@/components/back'
import { useModal } from "@/hooks/useModal";
import CustomModal from '@/components/CustomModal'
import { JobBasicInfoForm } from '@/components/register_jobPosting(info2)/JobBasicInfoForm'
import { useJobPostingStore } from '@/stores/jobPostingStore'

// Step 1: 채용공고 기본 정보 등록 페이지
const JobPostingStep1 = () => {
    const params = useLocalSearchParams()
    const jobPostingId = params.jobPostingId as string | undefined

    // Zustand store 사용
    const step1Data = useJobPostingStore(state => state.step1)
    const {
        setJobTitle,
        setJobDescription,
        setHiringCount,
        setJobAddress,
        setInterviewLocation,
        setSpecialNotes,
        setEditMode,
        resetAllData,
        isDataEmpty
    } = useJobPostingStore()
    
    const [loading, setLoading] = useState(false)
    const { showModal, ModalComponent } = useModal()



    // 컴포넌트 마운트 시 데이터 로드 및 기존 작성 데이터 확인
    useEffect(() => {
        if (jobPostingId) {
            setEditMode(true, jobPostingId)
            loadJobPosting()
        } else {
            // 새로운 공고 작성 시 기존 작성 중인 데이터가 있는지 확인
            checkExistingDraft()
        }
    }, [jobPostingId])

    // 기존 작성 중인 공고 데이터 확인
    const checkExistingDraft = () => {
        if (!isDataEmpty()) {
            setModalConfigForDraft(true)
        }
    }

    // 모달 상태 관리를 위한 상태
    const [showDraftModal, setShowDraftModal] = useState(false)

    const setModalConfigForDraft = (show: boolean) => {
        setShowDraftModal(show)
    }

    // 기존 작성 데이터 모달 컴포넌트
    const DraftModalComponent = () => (
        <CustomModal
            visible={showDraftModal}
            onClose={() => {
                // 취소 버튼 누르면 데이터 초기화
                resetAllData()
                setShowDraftModal(false)
            }}
            title="기존 작성 데이터"
            message="기존에 작성중인 공고가 존재합니다. 이어서 작성하시겠습니까?"
            type="confirm"
            onConfirm={() => {
                // 확인 버튼 누르면 기존 데이터 유지
                console.log('기존 데이터로 이어서 작성')
                setShowDraftModal(false)
            }}
            showCancel={true}
            confirmText="예"
            cancelText="아니요"
        />
    )

    const loadJobPosting = async () => {
        if (!jobPostingId) return

        try {
            const response = await api('GET', `/api/job-postings/${jobPostingId}`)
            
            if (response.success && response.data) {
                const posting = response.data
                setJobTitle(posting.title)
                setJobDescription(posting.description || '')
                setHiringCount(posting.hiring_count?.toString() || '1')
                setJobAddress(posting.job_address || '')
                setInterviewLocation(posting.interview_location || '')
                setSpecialNotes(posting.special_notes || '')
            } else {
                throw new Error('공고 정보를 찾을 수 없습니다.')
            }
        } catch (error) {
            console.error('공고 로드 실패:', error)
            showModal('오류', '공고 정보를 불러오는데 실패했습니다.', 'warning')
        }
    }

    // Step 1 데이터 저장 및 다음 단계로 이동
    const handleNext = async () => {
        // 유효성 검사
        if (!step1Data.jobTitle.trim()) {
            showModal('알림', '공고 제목을 입력해주세요.')
            return
        }

        setLoading(true)
        try {
            // Step 2로 이동 (데이터는 이미 Zustand에 저장됨)
            router.push('/job-posting-step2' as any)
        } catch (error) {
            console.error('네비게이션 실패:', error)
            showModal('오류', '다음 단계로 이동 중 문제가 발생했습니다.', 'warning')
        } finally {
            setLoading(false)
        }
    }


    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back onPress={() => {
                    // 데이터가 있으면 확인 모달 표시
                    if (!isDataEmpty()) {
                        showModal(
                            '확인',
                            '작성 중인 내용이 삭제됩니다. 정말 나가시겠습니까?',
                            'confirm',
                            () => {
                                resetAllData()
                                router.back()
                            }
                        )
                    } else {
                        router.back()
                    }
                }} />
                <Text className="text-lg font-bold ml-4">
                    {step1Data.isEditMode ? '채용 공고 수정' : '채용 공고 등록'} (1/3)
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
                        <Text className="text-gray-600 mb-6">채용공고의 기본적인 정보를 작성해주세요.</Text>
                    </View>
                    
                    <JobBasicInfoForm
                        jobTitle={step1Data.jobTitle}
                        setJobTitle={setJobTitle}
                        jobDescription={step1Data.jobDescription}
                        setJobDescription={setJobDescription}
                        jobAddress={step1Data.jobAddress}
                        setJobAddress={setJobAddress}
                        hiringCount={step1Data.hiringCount}
                        setHiringCount={setHiringCount}
                        interviewLocation={step1Data.interviewLocation}
                        setInterviewLocation={setInterviewLocation}
                        specialNotes={step1Data.specialNotes}
                        setSpecialNotes={setSpecialNotes}
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
                        {loading ? '저장 중...' : '다음 단계'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ModalComponent/>
            <DraftModalComponent/>
        </SafeAreaView>
    )
}

export default JobPostingStep1