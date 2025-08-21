import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { api } from '@/lib/api'
import Back from '@/components/back'
import { useModal } from "@/hooks/useModal";
import { useUserKeywords } from '@/hooks/useUserKeywords'
import JobPreferencesSelector from '@/components/JobPreferencesSelector'
import WorkConditionsSelector from '@/components/WorkConditionsSelector'
import { BaseKeywordSelector } from '@/components/shared/common/BaseKeywordSelector';
import { useKeywordSelection } from '@/hooks/useKeywordSelection';
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
    const countryKeywords = keywords.filter(k => k.category === '국가' && k.keyword !== '상관없음')
    const anyCountryKeyword = keywords.find(k => k.category === '국가' && k.keyword === '상관없음')
    const jobKeywords = keywords.filter(k => k.category === '직종')
    const conditionKeywords = keywords.filter(k => k.category === '근무조건')
    const ageRangeKeywords = keywords.filter(k => k.category === '나이대' && k.keyword !== '상관없음')
    const anyAgeKeyword = keywords.find(k => k.category === '나이대' && k.keyword === '상관없음')
    const visaKeywords = keywords.filter(k => k.category === '비자' && k.keyword !== '상관없음')
    const anyVisaKeyword = keywords.find(k => k.category === '비자' && k.keyword === '상관없음')
    const genderKeywords = keywords.filter(k => k.category === '성별' && k.keyword !== '상관없음')
    const anyGenderKeyword = keywords.find(k => k.category === '성별' && k.keyword === '상관없음')
    const koreanLevelKeywords = keywords.filter(k => k.category === '한국어수준' && k.keyword !== '상관없음')
    const anyKoreanLevelKeyword = keywords.find(k => k.category === '한국어수준' && k.keyword === '상관없음')
    const workDayKeywords = keywords.filter(k => k.category === '근무요일')
    // 커스텀 훅을 사용한 키워드 선택 로직 (기존 핸들러들을 대체)
    const { handleToggle: toggleJob } = useKeywordSelection({
        keywords: jobKeywords,
        selectedIds: step3Data.selectedJobs,
        onSelectionChange: setSelectedJobs
    })
    const { handleToggle: toggleCondition } = useKeywordSelection({
        keywords: conditionKeywords,
        selectedIds: step3Data.selectedConditions,
        onSelectionChange: setSelectedConditions
    })
    // 직종 및 근무조건 토글은 위의 useKeywordSelection 훅에서 처리됨
    // 편집 모드일 때 기존 데이터 로드
    useEffect(() => {
        if (step1Data.isEditMode && step1Data.jobPostingId && keywords.length > 0) {
            loadJobPostingStep3Data()
        }
    }, [step1Data.isEditMode, step1Data.jobPostingId, keywords])
    const loadJobPostingStep3Data = async () => {
        if (!step1Data.jobPostingId) return
        try {
            // 공고 키워드 조회
            const keywordResponse = await api('GET', `/api/job-posting-keyword/${step1Data.jobPostingId}`)
            
            if (keywordResponse.success && keywordResponse.data) {
                const jobPostingKeywords = keywordResponse.data
                
                // 카테고리별로 키워드 분류
                const countries: number[] = []
                const jobs: number[] = []
                const conditions: number[] = []
                const ageRanges: number[] = []
                const genders: number[] = []
                const visas: number[] = []
                const koreanLevels: number[] = []
                
                jobPostingKeywords.forEach((jk: any) => {
                    const keyword = keywords.find(k => k.id === jk.keyword_id)
                    if (!keyword) return
                    
                    switch (keyword.category) {
                        case '국가':
                            if (keyword.keyword !== '상관없음') {
                                countries.push(jk.keyword_id)
                            }
                            break
                        case '직종':
                            jobs.push(jk.keyword_id)
                            break
                        case '근무조건':
                            conditions.push(jk.keyword_id)
                            break
                        case '나이대':
                            if (keyword.keyword !== '상관없음') {
                                ageRanges.push(jk.keyword_id)
                            }
                            break
                        case '성별':
                            if (keyword.keyword !== '상관없음') {
                                genders.push(jk.keyword_id)
                            }
                            break
                        case '비자':
                            if (keyword.keyword !== '상관없음') {
                                visas.push(jk.keyword_id)
                            }
                            break
                        case '한국어수준':
                            if (keyword.keyword !== '상관없음') {
                                koreanLevels.push(jk.keyword_id)
                            }
                            break
                    }
                })
                
                // Zustand store에 데이터 설정
                setSelectedCountries(countries)
                setSelectedJobs(jobs)
                setSelectedConditions(conditions)
                setSelectedAgeRanges(ageRanges)
                setSelectedGenders(genders)
                setSelectedVisas(visas)
                setSelectedKoreanLevels(koreanLevels)
            }
        } catch (error) {
        }
    }
    // 최종 저장 및 완료
    const handleSubmit = async () => {
        // 유효성 검사 - 국가는 비어있어도 됨 (자동으로 상관없음 추가)
        if (step3Data.selectedJobs.length === 0) {
            showModal('알림', '필수 정보를 모두 선택해주세요. (모집 직종)')
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
                // 선택되지 않은 카테고리에 상관없음 추가
                const countriesToSave = step3Data.selectedCountries.length === 0 && anyCountryKeyword
                    ? [anyCountryKeyword.id]
                    : step3Data.selectedCountries
                    
                const agesToSave = step3Data.selectedAgeRanges.length === 0 && anyAgeKeyword
                    ? [anyAgeKeyword.id]
                    : step3Data.selectedAgeRanges
                    
                const gendersToSave = step3Data.selectedGenders.length === 0 && anyGenderKeyword
                    ? [anyGenderKeyword.id]
                    : step3Data.selectedGenders
                    
                const visasToSave = step3Data.selectedVisas.length === 0 && anyVisaKeyword
                    ? [anyVisaKeyword.id]
                    : step3Data.selectedVisas
                    
                const koreanLevelsToSave = step3Data.selectedKoreanLevels.length === 0 && anyKoreanLevelKeyword
                    ? [anyKoreanLevelKeyword.id]
                    : step3Data.selectedKoreanLevels
                // 모든 선택된 키워드 통합
                const allSelectedKeywords = [
                    ...countriesToSave,
                    ...step3Data.selectedJobs,
                    ...step3Data.selectedConditions,
                    ...(step2Data.selectedLocation ? [step2Data.selectedLocation] : []),
                    ...agesToSave,
                    ...visasToSave,
                    ...gendersToSave,
                    ...koreanLevelsToSave,
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
                '"정해둔 시간에만 면접신청이 들어옵니다"',
                '적합도 90% 이상 인재들이 사장님의 일정에 맞춰 신청합니다. 시간을 미리 선택해주세요',
                'confirm',
                () => {
                    hideModal()
                    router.replace('/(company)/interview-calendar?tab=slots')
                }
            )
        } catch (error) {
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
                    {step1Data.isEditMode ? '채용 공고 수정' : '채용 공고 등록'} (3/3)
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
                    {/* 6. 직종 선택 (필수) */}
                    <JobPreferencesSelector
                        jobs={jobKeywords}
                        selectedJobs={step3Data.selectedJobs}
                        onToggle={toggleJob}
                        title="모집 직종 *"
                    />
                    {/* 1. 선호 국가 선택 (필수) */}
                    <BaseKeywordSelector
                        title="선호 국가"
                        placeholder="국가를 선택하세요"
                        keywords={countryKeywords}
                        selectedIds={step3Data.selectedCountries}
                        onSelectionChange={setSelectedCountries}
                        emptyText="선택된 국가가 없습니다 (저장 시 '상관없음'으로 설정됩니다)"
                        showNoPreferenceOption={false}
                        enableSearch={true}
                        required={false}
                    />
                    {/* 2. 선호 나이대 */}
                    <BaseKeywordSelector
                        title="선호 나이대"
                        placeholder="나이대를 선택하세요"
                        keywords={ageRangeKeywords}
                        selectedIds={step3Data.selectedAgeRanges}
                        onSelectionChange={setSelectedAgeRanges}
                        emptyText="선택된 나이대가 없습니다 (저장 시 '상관없음'으로 설정됩니다)"
                        showNoPreferenceOption={false}
                        enableSearch={true}
                    />
                    {/* 3. 선호 성별 */}
                    <BaseKeywordSelector
                        title="선호 성별"
                        placeholder="선호 성별을 선택하세요"
                        keywords={genderKeywords}
                        selectedIds={step3Data.selectedGenders}
                        onSelectionChange={setSelectedGenders}
                        emptyText="선택된 성별이 없습니다 (저장 시 '상관없음'으로 설정됩니다)"
                        showNoPreferenceOption={false}
                        enableSearch={false}
                    />
                    {/* 4. 선호 비자 */}
                    <BaseKeywordSelector
                        title="선호 비자"
                        placeholder="비자를 선택하세요"
                        keywords={visaKeywords}
                        selectedIds={step3Data.selectedVisas}
                        onSelectionChange={setSelectedVisas}
                        emptyText="선택된 비자가 없습니다 (저장 시 '상관없음'으로 설정됩니다)"
                        showNoPreferenceOption={false}
                        enableSearch={true}
                    />
                    {/* 5. 선호 한국어 수준 */}
                    <BaseKeywordSelector
                        title="선호 한국어 수준"
                        placeholder="한국어 수준을 선택하세요"
                        keywords={koreanLevelKeywords}
                        selectedIds={step3Data.selectedKoreanLevels}
                        onSelectionChange={setSelectedKoreanLevels}
                        emptyText="선택된 한국어 수준이 없습니다 (저장 시 '상관없음'으로 설정됩니다)"
                        showNoPreferenceOption={false}
                        enableSearch={true}
                    />
                    {/* 7. 근무조건 선택 */}
                    <WorkConditionsSelector
                        conditions={conditionKeywords}
                        selectedConditions={step3Data.selectedConditions}
                        onToggle={toggleCondition}
                        title="제공 조건"
                    />
                    {/* 8. 공고 상태 (필수 항목 완료 후 표시) */}
                    {step3Data.selectedJobs.length > 0 && (
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
                    )}
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
                        {loading ? '저장 중...' : (step1Data.isEditMode ? '공고 수정' : '공고 등록')}
                    </Text>
                </TouchableOpacity>
            </View>
            <ModalComponent/>
        </SafeAreaView>
    )
}
export default JobPostingStep3