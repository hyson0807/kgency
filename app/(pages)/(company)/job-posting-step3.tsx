import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { api } from '@/lib/api'
import Back from '@/components/back'
import { useModal } from "@/hooks/useModal";
import { useUserKeywords } from '@/hooks/useUserKeywords'
import JobPreferencesSelector from '@/components/JobPreferencesSelector'
import WorkConditionsSelector from '@/components/WorkConditionsSelector'
import { MultiSelectKeywordSelector } from '@/components/common/MultiSelectKeywordSelector';
import { useJobPostingStore } from '@/stores/jobPostingStore'

// Step 3: 인재 선호 정보 입력 및 최종 저장 페이지
const JobPostingStep3 = () => {
    const { keywords, loading: keywordsLoading } = useUserKeywords()
    
    // Zustand store 사용
    const step1Data = useJobPostingStore(state => state.step1)
    const step2Data = useJobPostingStore(state => state.step2)
    const step3Data = useJobPostingStore(state => state.step3)
    const {
        setSelectedCountries,
        setSelectedJobs,
        setSelectedConditions,
        setSelectedAgeRanges,
        setSelectedGenders,
        setSelectedVisas,
        setSelectedKoreanLevels,
        setIsPostingActive,
        resetAllData
    } = useJobPostingStore()
    
    const [loading, setLoading] = useState(false)
    const { showModal, ModalComponent, hideModal } = useModal()

    // 카테고리별 키워드 필터링
    const countryKeywords = keywords.filter(k => k.category === '국가')
    const jobKeywords = keywords.filter(k => k.category === '직종')
    const conditionKeywords = keywords.filter(k => k.category === '근무조건')
    const ageRangeKeywords = keywords.filter(k => k.category === '나이대')
    const visaKeywords = keywords.filter(k => k.category === '비자')
    const genderKeywords = keywords.filter(k => k.category === '성별')
    const koreanLevelKeywords = keywords.filter(k => k.category === '한국어수준')
    const workDayKeywords = keywords.filter(k => k.category === '근무요일')

    // 키워드 선택 핸들러들
    const handleCountrySelect = (item: any) => {
        if (item.value === 'all') {
            const allCountryIds = countryKeywords.map(k => k.id)
            setSelectedCountries(allCountryIds)
        } else {
            if (!step3Data.selectedCountries.includes(item.value)) {
                setSelectedCountries([...step3Data.selectedCountries, item.value])
            }
        }
    }

    const removeCountry = (countryId: number) => {
        setSelectedCountries(step3Data.selectedCountries.filter(id => id !== countryId))
    }

    const handleAgeRangeSelect = (item: any) => {
        if (item.value === 'all') {
            const allAgeRangeIds = ageRangeKeywords.map(k => k.id)
            setSelectedAgeRanges(allAgeRangeIds)
        } else {
            if (!step3Data.selectedAgeRanges.includes(item.value)) {
                setSelectedAgeRanges([...step3Data.selectedAgeRanges, item.value])
            }
        }
    }

    const removeAgeRange = (ageRangeId: number) => {
        setSelectedAgeRanges(step3Data.selectedAgeRanges.filter(id => id !== ageRangeId))
    }

    const handleGenderSelect = (item: any) => {
        if(item.value === 'all') {
            const allGenderIds = genderKeywords.map(k => k.id)
            setSelectedGenders(allGenderIds)
        } else {
            if(!step3Data.selectedGenders.includes(item.value)) {
                setSelectedGenders([...step3Data.selectedGenders, item.value])
            }
        }
    }

    const removeGender = (genderId: number) => {
        setSelectedGenders(step3Data.selectedGenders.filter(id => id !== genderId))
    }

    const handleVisaSelect = (item: any) => {
        if (item.value === 'all') {
            const allVisaIds = visaKeywords.map(k => k.id)
            setSelectedVisas(allVisaIds)
        } else {
            if (!step3Data.selectedVisas.includes(item.value)) {
                setSelectedVisas([...step3Data.selectedVisas, item.value])
            }
        }
    }

    const removeVisa = (visaId: number) => {
        setSelectedVisas(step3Data.selectedVisas.filter(id => id !== visaId))
    }

    const handleKoreanLevelSelect = (item: any) => {
        if (item.value === 'all') {
            const allKoreanLevelIds = koreanLevelKeywords.map(k => k.id)
            setSelectedKoreanLevels(allKoreanLevelIds)
        } else {
            if (!step3Data.selectedKoreanLevels.includes(item.value)) {
                setSelectedKoreanLevels([...step3Data.selectedKoreanLevels, item.value])
            }
        }
    }

    const removeKoreanLevel = (koreanLevelId: number) => {
        setSelectedKoreanLevels(step3Data.selectedKoreanLevels.filter(id => id !== koreanLevelId))
    }

    // 직종 선택/해제 토글
    const toggleJob = (jobId: number) => {
        const currentJobs = step3Data.selectedJobs
        const newJobs = currentJobs.includes(jobId)
            ? currentJobs.filter(id => id !== jobId)
            : [...currentJobs, jobId]
        setSelectedJobs(newJobs)
    }

    // 근무조건 선택/해제 토글
    const toggleCondition = (conditionId: number) => {
        const currentConditions = step3Data.selectedConditions
        const newConditions = currentConditions.includes(conditionId)
            ? currentConditions.filter(id => id !== conditionId)
            : [...currentConditions, conditionId]
        setSelectedConditions(newConditions)
    }

    // Zustand에서 데이터를 자동으로 관리하므로 별도의 로드 불필요

    // 이전 단계로 돌아가기
    const handlePrevious = () => {
        router.back()
    }

    // 최종 저장 및 완료
    const handleSubmit = async () => {
        // 유효성 검사
        if (step3Data.selectedCountries.length === 0 || step3Data.selectedJobs.length === 0) {
            showModal('알림', '필수 정보를 모두 선택해주세요. (선호 국가, 모집 직종)')
            return
        }

        setLoading(true)
        try {
            // Zustand에서 모든 단계의 데이터를 가져옴

            // 공고 저장/업데이트
            const jobPostingData = {
                title: step1Data.jobTitle,
                description: step1Data.jobDescription,
                hiring_count: parseInt(step1Data.hiringCount) || 1,
                working_hours: step2Data.workingHours,
                working_hours_negotiable: step2Data.workingHoursNegotiable,
                working_days: step2Data.workingDays,
                working_days_negotiable: step2Data.workingDaysNegotiable,
                salary_type: step2Data.salaryType,
                salary_range: step2Data.salaryRange,
                salary_range_negotiable: step2Data.salaryRangeNegotiable,
                pay_day: step2Data.payDay,
                pay_day_negotiable: step2Data.payDayNegotiable,
                job_address: step1Data.jobAddress,
                interview_location: step1Data.interviewLocation,
                special_notes: step1Data.specialNotes,
                is_active: step3Data.isPostingActive
            }

            let savedPostingId = step1Data.jobPostingId
            let postingResponse: any

            if (step1Data.isEditMode && step1Data.jobPostingId) {
                // 기존 공고 업데이트
                postingResponse = await api('PUT', `/api/job-postings/${step1Data.jobPostingId}`, jobPostingData)
            } else {
                // 새 공고 생성
                postingResponse = await api('POST', '/api/job-postings', jobPostingData)
                if (postingResponse.success && postingResponse.data) {
                    savedPostingId = postingResponse.data.id
                }
            }

            if (!postingResponse.success) {
                throw new Error(postingResponse.message || '공고 저장에 실패했습니다.')
            }

            // 키워드 업데이트
            if (savedPostingId) {
                const selectedWorkDayKeywordIds = step2Data.workingDays
                    ?.map((day: string) => {
                        const keyword = workDayKeywords.find(k => k.keyword === day)
                        return keyword?.id
                    })
                    .filter((id: number | undefined): id is number => id !== undefined) || []

                // 모든 선택된 키워드 통합
                const allSelectedKeywords = [
                    ...step3Data.selectedCountries,
                    ...step3Data.selectedJobs,
                    ...step3Data.selectedConditions,
                    ...(step2Data.selectedLocation ? [step2Data.selectedLocation] : []),
                    ...step3Data.selectedAgeRanges,
                    ...step3Data.selectedVisas,
                    ...step3Data.selectedGenders,
                    ...step3Data.selectedKoreanLevels,
                    ...selectedWorkDayKeywordIds
                ].filter(Boolean)

                // 키워드 업데이트 API 호출
                const keywordResponse = await api('POST', `/api/job-posting-keyword/${savedPostingId}`, {
                    keywordIds: allSelectedKeywords
                })

                if (!keywordResponse.success) {
                    throw new Error(keywordResponse.message || '키워드 저장에 실패했습니다.')
                }
            }

            // 저장된 데이터 정리
            resetAllData()

            showModal(
                '성공',
                step1Data.isEditMode ? '공고가 성공적으로 수정되었습니다. 면접 가능 시간대를 추가해주세요' : '공고가 성공적으로 등록되었습니다. 면접 가능 시간대를 추가해주세요',
                'confirm',
                () => {
                    hideModal()
                    router.replace('/(company)/interview-calendar?tab=slots')
                }
            )

        } catch (error) {
            console.error('저장 실패:', error)
            showModal('오류', '저장 중 문제가 발생했습니다.', 'warning')
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
                    채용 공고 등록 (3/3)
                </Text>
            </View>

            {/* 진행 상황 인디케이터 */}
            <View className="flex-row items-center px-6 py-4 bg-gray-50">
                <View className="flex-1 flex-row items-center">
                    <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
                        <Text className="text-white font-bold text-sm">✓</Text>
                    </View>
                    <View className="flex-1 h-0.5 bg-green-500 mx-2" />
                    <View className="w-8 h-8 rounded-full bg-green-500 items-center justify-center">
                        <Text className="text-white font-bold text-sm">✓</Text>
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
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                <View className="bg-white">
                    <View className="p-6">
                        <Text className="text-xl font-bold mb-2">원하는 인재상을 선택해주세요</Text>
                        <Text className="text-gray-600 mb-6">공고에 적합한 인재를 찾아드리겠습니다.</Text>
                    </View>

                    <MultiSelectKeywordSelector
                        title="선호 국가 *"
                        placeholder="국가를 선택하세요"
                        keywords={countryKeywords}
                        selectedIds={step3Data.selectedCountries}
                        onSelect={handleCountrySelect}
                        onRemove={removeCountry}
                        emptyText="선택된 국가가 없습니다"
                        showNoPreferenceOption={true}
                        enableSearch={true}
                    />

                    <MultiSelectKeywordSelector
                        title="선호 나이대"
                        placeholder="나이대를 선택하세요"
                        keywords={ageRangeKeywords}
                        selectedIds={step3Data.selectedAgeRanges}
                        onSelect={handleAgeRangeSelect}
                        onRemove={removeAgeRange}
                        emptyText="선택된 나이대가 없습니다"
                        showNoPreferenceOption={true}
                        enableSearch={true}
                    />

                    <MultiSelectKeywordSelector
                        title="선호 성별"
                        placeholder="선호 성별을 선택하세요"
                        keywords={genderKeywords}
                        selectedIds={step3Data.selectedGenders}
                        onSelect={handleGenderSelect}
                        onRemove={removeGender}
                        emptyText="선택된 성별이 없습니다"
                        showNoPreferenceOption={true}
                        enableSearch={false}
                    />

                    <MultiSelectKeywordSelector
                        title="선호 비자"
                        placeholder="비자를 선택하세요"
                        keywords={visaKeywords}
                        selectedIds={step3Data.selectedVisas}
                        onSelect={handleVisaSelect}
                        onRemove={removeVisa}
                        emptyText="선택된 비자가 없습니다"
                        showNoPreferenceOption={true}
                        enableSearch={true}
                    />

                    <MultiSelectKeywordSelector
                        title="선호 한국어 수준"
                        placeholder="한국어 수준을 선택하세요"
                        keywords={koreanLevelKeywords}
                        selectedIds={step3Data.selectedKoreanLevels}
                        onSelect={handleKoreanLevelSelect}
                        onRemove={removeKoreanLevel}
                        emptyText="선택된 한국어 수준이 없습니다"
                        showNoPreferenceOption={true}
                        enableSearch={true}
                    />

                    {/* 직종 선택 */}
                    <JobPreferencesSelector
                        jobs={jobKeywords}
                        selectedJobs={step3Data.selectedJobs}
                        onToggle={toggleJob}
                        title="모집 직종 *"
                    />

                    {/* 근무조건 선택 */}
                    <WorkConditionsSelector
                        conditions={conditionKeywords}
                        selectedConditions={step3Data.selectedConditions}
                        onToggle={toggleCondition}
                        title="제공 조건"
                    />

                    {/* 공고 상태 */}
                    <View className="p-6">
                        <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <Text className="text-lg font-medium">공고 활성화</Text>
                            <Switch
                                value={step3Data.isPostingActive}
                                onValueChange={setIsPostingActive}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={step3Data.isPostingActive ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>
                        <Text className="text-sm text-gray-600 mt-2 px-1">
                            적합도가 90% 이상이면 자동면접 확정에 동의합니다
                        </Text>
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
                        onPress={handleSubmit}
                        disabled={loading}
                        className={`flex-1 py-4 rounded-xl ${
                            loading ? 'bg-gray-400' : 'bg-blue-500'
                        }`}
                    >
                        <Text className="text-center text-white font-bold text-lg">
                            {loading ? '저장 중...' : '공고 등록'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ModalComponent/>
        </SafeAreaView>
    )
}

export default JobPostingStep3