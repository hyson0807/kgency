import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from "expo-router"
import { api } from '@/lib/api'
import Back from '@/components/back'
import { useModal } from "@/hooks/useModal";
import { JobBasicInfoForm } from '@/components/register_jobPosting(info2)/JobBasicInfoForm'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Step 1: 채용공고 기본 정보 등록 페이지
const JobPostingStep1 = () => {
    const params = useLocalSearchParams()
    const jobPostingId = params.jobPostingId as string | undefined

    // Step 1: 기본 정보 상태
    const [jobTitle, setJobTitle] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [hiringCount, setHiringCount] = useState('1')
    const [jobAddress, setJobAddress] = useState('')
    const [interviewLocation, setInterviewLocation] = useState('')
    const [specialNotes, setSpecialNotes] = useState('')
    
    const [loading, setLoading] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)
    const { showModal, ModalComponent, hideModal } = useModal()



    // Step 1에서 데이터 로드
    const loadStep1Data = async () => {
        const saved = await AsyncStorage.getItem('job_posting_step1')
        if (saved) {
            const data = JSON.parse(saved)
            setJobTitle(data.jobTitle || '')
            setJobDescription(data.jobDescription || '')
            setHiringCount(data.hiringCount || '1')
            setJobAddress(data.jobAddress || '')
            setInterviewLocation(data.interviewLocation || '')
            setSpecialNotes(data.specialNotes || '')
        }
    }

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadStep1Data()
        if (jobPostingId) {
            setIsEditMode(true)
            loadJobPosting()
        }
    }, [jobPostingId])

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
        if (!jobTitle.trim()) {
            showModal('알림', '공고 제목을 입력해주세요.')
            return
        }

        setLoading(true)
        try {
            // Step 1 데이터를 AsyncStorage에 저장
            const step1Data = {
                jobTitle,
                jobDescription,
                hiringCount,
                jobAddress,
                interviewLocation,
                specialNotes,
                isEditMode,
                jobPostingId
            }
            
            await AsyncStorage.setItem('job_posting_step1', JSON.stringify(step1Data))
            
            // Step 2로 이동
            router.push('/job-posting-step2' as any)
        } catch (error) {
            console.error('데이터 저장 실패:', error)
            showModal('오류', '데이터 저장 중 문제가 발생했습니다.', 'warning')
        } finally {
            setLoading(false)
        }
    }


    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">
                    {isEditMode ? '채용 공고 수정' : '채용 공고 등록'} (1/3)
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
                        jobTitle={jobTitle}
                        setJobTitle={setJobTitle}
                        jobDescription={jobDescription}
                        setJobDescription={setJobDescription}
                        jobAddress={jobAddress}
                        setJobAddress={setJobAddress}
                        hiringCount={hiringCount}
                        setHiringCount={setHiringCount}
                        interviewLocation={interviewLocation}
                        setInterviewLocation={setInterviewLocation}
                        specialNotes={specialNotes}
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
        </SafeAreaView>
    )
}

export default JobPostingStep1