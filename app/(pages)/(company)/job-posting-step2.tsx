import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import Back from '@/components/back'
import { useModal } from "@/hooks/useModal";
import { useUserKeywords } from '@/hooks/useUserKeywords'
import { WorkLocationForm } from '@/components/register_jobPosting(info2)/WorkLocationForm'
import { WorkScheduleForm } from '@/components/register_jobPosting(info2)/WorkScheduleForm'
import { SalaryInfoForm } from '@/components/register_jobPosting(info2)/SalaryInfoForm'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Step 2: 근무 정보 입력 페이지
const JobPostingStep2 = () => {
    const { keywords, loading: keywordsLoading } = useUserKeywords()
    
    // Step 2: 근무 정보 상태
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
    const [workingHours, setWorkingHours] = useState('')
    const [workingHoursNegotiable, setWorkingHoursNegotiable] = useState(false)
    const [workingDays, setWorkingDays] = useState<string[]>([])
    const [workingDaysNegotiable, setWorkingDaysNegotiable] = useState(false)
    const [salaryRange, setSalaryRange] = useState('')
    const [salaryRangeNegotiable, setSalaryRangeNegotiable] = useState(false)
    const [payDay, setPayDay] = useState('')
    const [payDayNegotiable, setPayDayNegotiable] = useState(false)
    
    const [loading, setLoading] = useState(false)
    const { showModal, ModalComponent } = useModal()

    // 지역 옵션
    const locationOptions = keywords
        .filter(k => k.category === '지역')
        .map(location => ({
            label: location.keyword,
            value: location.id
        }))

    // 요일 선택/해제 토글
    const toggleWorkingDay = (day: string) => {
        setWorkingDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        )
    }

    // Step 2 데이터 로드
    const loadStep2Data = async () => {
        const saved = await AsyncStorage.getItem('job_posting_step2')
        if (saved) {
            const data = JSON.parse(saved)
            setSelectedLocation(data.selectedLocation || null)
            setWorkingHours(data.workingHours || '')
            setWorkingHoursNegotiable(data.workingHoursNegotiable || false)
            setWorkingDays(data.workingDays || [])
            setWorkingDaysNegotiable(data.workingDaysNegotiable || false)
            setSalaryRange(data.salaryRange || '')
            setSalaryRangeNegotiable(data.salaryRangeNegotiable || false)
            setPayDay(data.payDay || '')
            setPayDayNegotiable(data.payDayNegotiable || false)
        }
    }

    // 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        loadStep2Data()
    }, [])

    // 이전 단계로 돌아가기
    const handlePrevious = () => {
        router.back()
    }

    // Step 2 데이터 저장 및 다음 단계로 이동
    const handleNext = async () => {
        // 유효성 검사
        if (workingDays.length === 0) {
            showModal('알림', '근무일을 선택해 주세요')
            return
        }

        setLoading(true)
        try {
            // Step 2 데이터를 AsyncStorage에 저장
            const step2Data = {
                selectedLocation,
                workingHours,
                workingHoursNegotiable,
                workingDays,
                workingDaysNegotiable,
                salaryRange,
                salaryRangeNegotiable,
                payDay,
                payDayNegotiable
            }
            
            await AsyncStorage.setItem('job_posting_step2', JSON.stringify(step2Data))
            
            // Step 3으로 이동
            router.push('/job-posting-step3' as any)
        } catch (error) {
            console.error('데이터 저장 실패:', error)
            showModal('오류', '데이터 저장 중 문제가 발생했습니다.', 'warning')
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
                    채용 공고 등록 (2/3)
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
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className="bg-white">
                    <View className="p-6">
                        <Text className="text-xl font-bold mb-2">근무 조건을 입력해주세요</Text>
                        <Text className="text-gray-600 mb-6">근무 위치, 시간, 급여 등 상세한 조건을 설정해주세요.</Text>
                    </View>
                    
                    <View className="px-6 space-y-6">
                        <WorkLocationForm
                            locationOptions={locationOptions}
                            selectedLocation={selectedLocation}
                            setSelectedLocation={setSelectedLocation}
                        />

                        <WorkScheduleForm
                            workingHours={workingHours}
                            setWorkingHours={setWorkingHours}
                            workingHoursNegotiable={workingHoursNegotiable}
                            setWorkingHoursNegotiable={setWorkingHoursNegotiable}
                            workingDays={workingDays}
                            toggleWorkingDay={toggleWorkingDay}
                            workingDaysNegotiable={workingDaysNegotiable}
                            setWorkingDaysNegotiable={setWorkingDaysNegotiable}
                        />

                        <SalaryInfoForm
                            salaryRange={salaryRange}
                            setSalaryRange={setSalaryRange}
                            salaryRangeNegotiable={salaryRangeNegotiable}
                            setSalaryRangeNegotiable={setSalaryRangeNegotiable}
                            payDay={payDay}
                            setPayDay={setPayDay}
                            payDayNegotiable={payDayNegotiable}
                            setPayDayNegotiable={setPayDayNegotiable}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <View className="flex-row space-x-3">
                    <TouchableOpacity
                        onPress={handlePrevious}
                        className="flex-1 py-4 rounded-xl border border-gray-300 bg-white"
                    >
                        <Text className="text-center text-gray-700 font-bold text-lg">
                            이전
                        </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={loading}
                        className={`flex-1 py-4 rounded-xl ${
                            loading ? 'bg-gray-400' : 'bg-blue-500'
                        }`}
                    >
                        <Text className="text-center text-white font-bold text-lg">
                            {loading ? '저장 중...' : '다음 단계'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ModalComponent/>
        </SafeAreaView>
    )
}

export default JobPostingStep2