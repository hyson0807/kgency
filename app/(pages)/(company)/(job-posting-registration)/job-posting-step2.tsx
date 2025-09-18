import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { api } from "@/lib/core/api"
import Back from '@/components/shared/common/back'
import { useModal } from "@/lib/shared/ui/hooks/useModal";
import { useUserKeywords } from '@/lib/features/profile/hooks/useUserKeywords'
import { WorkLocationForm } from '@/components/company/job-postings/forms/WorkLocationForm'
import { WorkScheduleForm } from '@/components/company/job-postings/forms/WorkScheduleForm'
import { SalaryInfoForm } from '@/components/company/job-postings/forms/SalaryInfoForm'
import { useJobPostingStore } from '@/stores/jobPostingStore'
// Step 2: 근무 정보 입력 페이지
const JobPostingStep2 = () => {
    const { keywords, loading: keywordsLoading } = useUserKeywords()
    const scrollViewRef = useRef<ScrollView>(null)
    
    // Zustand store 사용
    const step1Data = useJobPostingStore(state => state.step1)
    const step2Data = useJobPostingStore(state => state.step2)
    const {
        setSelectedLocation,
        setWorkingHours,
        setWorkingHoursNegotiable,
        setWorkingDays,
        setWorkingDaysNegotiable,
        setSalaryType,
        setSalaryRange,
        setSalaryRangeNegotiable,
        setPayDay,
        setPayDayNegotiable
    } = useJobPostingStore()
    
    const [loading, setLoading] = useState(false)
    const { showModal, ModalComponent } = useModal()
    
    // 급여 입력창으로 스크롤하는 함수
    const scrollToSalarySection = () => {
        setTimeout(() => {
            if (scrollViewRef.current) {
                // 급여 섹션의 대략적인 위치로 스크롤
                scrollViewRef.current.scrollTo({
                    x: 0,
                    y: 400, // 급여 섹션의 대략적인 Y 위치
                    animated: true
                })
            }
        }, 100)
    }
    // 지역 옵션
    const locationOptions = keywords
        .filter(k => k.category === '지역')
        .map(location => ({
            label: location.keyword,
            value: location.id
        }))
    // 요일 선택/해제 토글
    const toggleWorkingDay = (day: string) => {
        const currentDays = step2Data.workingDays
        const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day]
        setWorkingDays(newDays)
    }
    // 편집 모드일 때 기존 데이터 로드
    useEffect(() => {
        if (step1Data.isEditMode && step1Data.jobPostingId && keywords.length > 0) {
            loadJobPostingStep2Data()
        }
    }, [step1Data.isEditMode, step1Data.jobPostingId, keywords])
    const loadJobPostingStep2Data = async () => {
        if (!step1Data.jobPostingId) return
        try {
            // 공고 기본 정보 조회
            const postingResponse = await api('GET', `/api/job-postings/${step1Data.jobPostingId}`)
            
            if (postingResponse.success && postingResponse.data) {
                const posting = postingResponse.data
                
                // Step 2 관련 데이터 설정
                setWorkingHours(posting.working_hours || '')
                setWorkingHoursNegotiable(posting.working_hours_negotiable || false)
                setWorkingDays(posting.working_days || [])
                setWorkingDaysNegotiable(posting.working_days_negotiable || false)
                setSalaryType(posting.salary_type || 'monthly')
                setSalaryRange(posting.salary_range || '')
                setSalaryRangeNegotiable(posting.salary_range_negotiable || false)
                setPayDay(posting.pay_day || '')
                setPayDayNegotiable(posting.pay_day_negotiable || false)
            }
            // 공고 키워드 조회 (지역 정보)
            const keywordResponse = await api('GET', `/api/job-posting-keyword/${step1Data.jobPostingId}`)
            
            if (keywordResponse.success && keywordResponse.data) {
                const jobPostingKeywords = keywordResponse.data
                
                // 지역 키워드 찾기
                const locationKeyword = jobPostingKeywords.find((jk: any) => 
                    keywords.find(k => k.id === jk.keyword_id && k.category === '지역')
                )
                if (locationKeyword) {
                    setSelectedLocation(locationKeyword.keyword_id)
                }
            }
        } catch (error) {
        }
    }
    // Step 2 데이터 저장 및 다음 단계로 이동
    const handleNext = async () => {
        // 유효성 검사
        if (!step2Data.selectedLocation) {
            showModal('알림', '근무지역을 선택해 주세요')
            return
        }
        
        if (step2Data.workingDays.length === 0) {
            showModal('알림', '근무일을 선택해 주세요')
            return
        }
        setLoading(true)
        try {
            // Step 3으로 이동 (데이터는 이미 Zustand에 저장됨)
            router.push('/job-posting-step3' as any)
        } catch (error) {
            showModal('오류', '다음 단계로 이동 중 문제가 발생했습니다.', 'warning')
        } finally {
            setLoading(false)
        }
    }
    if (keywordsLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <Text>로딩 중...</Text>
                </View>
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">
                    {step1Data.isEditMode ? '채용 공고 수정' : '채용 공고 등록'} (2/3)
                </Text>
            </View>
            {/* 진행 상황 인디케이터 */}
            <View className="flex-row items-center px-6 py-4 bg-gray-50">
                <View className="flex-1 flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
                        <Text className="text-white font-bold text-sm">✓</Text>
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
            <ScrollView
                ref={scrollViewRef}
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                automaticallyAdjustKeyboardInsets={true}
            >
                <View className="bg-white">
                    <View className="p-6">
                        <Text className="text-xl font-bold mb-2">근무 조건을 입력해주세요</Text>
                        <Text className="text-gray-600 mb-6">근무 위치, 시간, 급여 등 상세한 조건을 설정해주세요.</Text>
                    </View>
                    
                    <View className="px-6 space-y-6">
                        <WorkLocationForm
                            locationOptions={locationOptions}
                            selectedLocation={step2Data.selectedLocation}
                            setSelectedLocation={setSelectedLocation}
                        />
                        {step2Data.selectedLocation && (
                            <WorkScheduleForm
                                workingHours={step2Data.workingHours}
                                setWorkingHours={setWorkingHours}
                                workingHoursNegotiable={step2Data.workingHoursNegotiable}
                                setWorkingHoursNegotiable={setWorkingHoursNegotiable}
                                workingDays={step2Data.workingDays}
                                toggleWorkingDay={toggleWorkingDay}
                                setWorkingDays={setWorkingDays}
                                workingDaysNegotiable={step2Data.workingDaysNegotiable}
                                setWorkingDaysNegotiable={setWorkingDaysNegotiable}
                            />
                        )}
                        {step2Data.selectedLocation && 
                         (step2Data.workingHours.trim() || step2Data.workingHoursNegotiable) && 
                         step2Data.workingDays.length > 0 && (
                            <SalaryInfoForm
                                salaryType={step2Data.salaryType}
                                setSalaryType={setSalaryType}
                                salaryRange={step2Data.salaryRange}
                                setSalaryRange={setSalaryRange}
                                salaryRangeNegotiable={step2Data.salaryRangeNegotiable}
                                setSalaryRangeNegotiable={setSalaryRangeNegotiable}
                                payDay={step2Data.payDay}
                                setPayDay={setPayDay}
                                payDayNegotiable={step2Data.payDayNegotiable}
                                setPayDayNegotiable={setPayDayNegotiable}
                                onFocusSalary={scrollToSalarySection}
                            />
                        )}
                    </View>
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
export default JobPostingStep2