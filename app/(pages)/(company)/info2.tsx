import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { router, useLocalSearchParams } from "expo-router"
import { api } from '@/lib/api'
import Back from '@/components/back'
import JobPreferencesSelector from '@/components/JobPreferencesSelector'
import WorkConditionsSelector from '@/components/WorkConditionsSelector'
import { useUserKeywords } from '@/hooks/useUserKeywords'
import {useModal} from "@/hooks/useModal";
import { MultiSelectKeywordSelector } from '@/components/common/MultiSelectKeywordSelector';
import { JobBasicInfoForm } from '@/components/register_jobPosting(info2)/JobBasicInfoForm'
import { WorkScheduleForm } from '@/components/register_jobPosting(info2)/WorkScheduleForm'
import { SalaryInfoForm } from '@/components/register_jobPosting(info2)/SalaryInfoForm'
import { WorkLocationForm } from '@/components/register_jobPosting(info2)/WorkLocationForm'

//채용공고 등록 페이지
const Info2 = () => {
    const { user } = useAuth()
    const { keywords, loading: keywordsLoading } = useUserKeywords()
    const params = useLocalSearchParams()
    const jobPostingId = params.jobPostingId as string | undefined



    // 공고 정보 상태
    const [jobTitle, setJobTitle] = useState('')
    const [jobDescription, setJobDescription] = useState('')
    const [workingHours, setWorkingHours] = useState('')
    const [workingDays, setWorkingDays] = useState<string[]>([])
    const [salaryRange, setSalaryRange] = useState('')
    const [hiringCount, setHiringCount] = useState('1')
    const [jobAddress, setJobAddress] = useState('')

    // 키워드 선택 상태 - 국가도 배열로 변경
    const [selectedCountries, setSelectedCountries] = useState<number[]>([])
    const [selectedJobs, setSelectedJobs] = useState<number[]>([])
    const [selectedConditions, setSelectedConditions] = useState<number[]>([])
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
    const [selectedAgeRanges, setSelectedAgeRanges] = useState<number[]>([])
    const [selectedGenders, setSelectedGenders] = useState<number[]>([])
    const [selectedVisas, setSelectedVisas] = useState<number[]>([])
    const [selectedKoreanLevels, setSelectedKoreanLevels] = useState<number[]>([])

    // 공고 활성화 상태
    const [isPostingActive, setIsPostingActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)

    const [workingHoursNegotiable, setWorkingHoursNegotiable] = useState(false)
    const [payDay, setPayDay] = useState('')
    const [payDayNegotiable, setPayDayNegotiable] = useState(false)
    const [workingDaysNegotiable, setWorkingDaysNegotiable] = useState(false)
    const [salaryRangeNegotiable, setSalaryRangeNegotiable] = useState(false)

    const { showModal, ModalComponent, hideModal} = useModal()



    // 카테고리별 키워드 필터링
    const countryKeywords = keywords.filter(k => k.category === '국가')
    const jobKeywords = keywords.filter(k => k.category === '직종')
    const conditionKeywords = keywords.filter(k => k.category === '근무조건')
    const ageRangeKeywords = keywords.filter(k => k.category === '나이대')
    const visaKeywords = keywords.filter(k => k.category === '비자')
    const genderKeywords = keywords.filter(k => k.category === '성별')
    const koreanLevelKeywords = keywords.filter(k => k.category === '한국어수준')
    const workDayKeywords = keywords.filter(k => k.category === '근무요일')  // 추가


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

    // 키워드 선택 핸들러들
    const handleCountrySelect = (item: any) => {
        if (item.value === 'all') {
            const allCountryIds = countryKeywords.map(k => k.id)
            setSelectedCountries(allCountryIds)
        } else {
            if (!selectedCountries.includes(item.value)) {
                setSelectedCountries([...selectedCountries, item.value])
            }
        }
    }

    const removeCountry = (countryId: number) => {
        setSelectedCountries(prev => prev.filter(id => id !== countryId))
    }

    const handleAgeRangeSelect = (item: any) => {
        if (item.value === 'all') {
            const allAgeRangeIds = ageRangeKeywords.map(k => k.id)
            setSelectedAgeRanges(allAgeRangeIds)
        } else {
            if (!selectedAgeRanges.includes(item.value)) {
                setSelectedAgeRanges([...selectedAgeRanges, item.value])
            }
        }
    }

    const removeAgeRange = (ageRangeId: number) => {
        setSelectedAgeRanges(prev => prev.filter(id => id !== ageRangeId))
    }

    const handleGenderSelect = (item: any) => {
        if(item.value === 'all') {
            const allGenderIds = genderKeywords.map(k => k.id)
            setSelectedGenders(allGenderIds)
        } else {
            if(!selectedGenders.includes(item.value)) {
                setSelectedGenders([...selectedGenders, item.value])
            }
        }
    }

    const removeGender = (genderId: number) => {
        setSelectedGenders(prev => prev.filter(id => id !== genderId))
    }

    const handleVisaSelect = (item: any) => {
        if (item.value === 'all') {
            const allVisaIds = visaKeywords.map(k => k.id)
            setSelectedVisas(allVisaIds)
        } else {
            if (!selectedVisas.includes(item.value)) {
                setSelectedVisas([...selectedVisas, item.value])
            }
        }
    }

    const removeVisa = (visaId: number) => {
        setSelectedVisas(prev => prev.filter(id => id !== visaId))
    }

    const handleKoreanLevelSelect = (item: any) => {
        if (item.value === 'all') {
            const allKoreanLevelIds = koreanLevelKeywords.map(k => k.id)
            setSelectedKoreanLevels(allKoreanLevelIds)
        } else {
            if (!selectedKoreanLevels.includes(item.value)) {
                setSelectedKoreanLevels([...selectedKoreanLevels, item.value])
            }
        }
    }

    const removeKoreanLevel = (koreanLevelId: number) => {
        setSelectedKoreanLevels(prev => prev.filter(id => id !== koreanLevelId))
    }

    // 직종 선택/해제 토글
    const toggleJob = (jobId: number) => {
        setSelectedJobs(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        )
    }

    // 근무조건 선택/해제 토글
    const toggleCondition = (conditionId: number) => {
        setSelectedConditions(prev =>
            prev.includes(conditionId)
                ? prev.filter(id => id !== conditionId)
                : [...prev, conditionId]
        )
    }

    // 수정 모드인 경우 기존 공고 데이터 로드
    useEffect(() => {
        if (jobPostingId && keywords.length > 0) {
            setIsEditMode(true)
            loadJobPosting()
        }
    }, [jobPostingId, keywords])

    const loadJobPosting = async () => {
        if (!jobPostingId) return

        try {
            // 공고 정보 로드
            const response = await api('GET', `/api/job-postings/${jobPostingId}`)
            
            if (response.success && response.data) {
                const posting = response.data
                setJobTitle(posting.title)
                setJobDescription(posting.description || '')
                setHiringCount(posting.hiring_count?.toString() || '1')
                setWorkingHours(posting.working_hours || '')
                setWorkingDays(posting.working_days || [])
                setWorkingDaysNegotiable(posting.working_days_negotiable || false)
                setSalaryRange(posting.salary_range || '')
                setSalaryRangeNegotiable(posting.salary_range_negotiable || false)
                setIsPostingActive(posting.is_active)
                setWorkingHoursNegotiable(posting.working_hours_negotiable || false)
                setPayDay(posting.pay_day || '')
                setPayDayNegotiable(posting.pay_day_negotiable || false)
                setJobAddress(posting.job_address || '')

                // 키워드 정보는 job posting response에 포함되어 있음
                if (posting.job_posting_keywords && posting.job_posting_keywords.length > 0) {
                    const keywordIds = posting.job_posting_keywords.map((jk: any) => jk.keyword.id)

                    // 카테고리별로 분류
                    const tempCountries: number[] = []
                    const tempJobs: number[] = []
                    const tempConditions: number[] = []
                    const tempAgeRanges: number[] = []
                    const tempVisas: number[] = []
                    const tempGenders: number[] = []
                    const tempKoreanLevels: number[] = []
                    const tempWorkDays: string[] = []  // 요일 문자열 배열

                    posting.job_posting_keywords.forEach((jk: any) => {
                        const keyword = jk.keyword
                        if (keyword.category === '국가') {
                            tempCountries.push(keyword.id)
                        } else if (keyword.category === '직종') {
                            tempJobs.push(keyword.id)
                        } else if (keyword.category === '근무조건') {
                            tempConditions.push(keyword.id)
                        } else if (keyword.category === '지역') {
                            setSelectedLocation(keyword.id)
                        } else if (keyword.category === '나이대') {
                            tempAgeRanges.push(keyword.id)
                        } else if (keyword.category === '비자') {
                            tempVisas.push(keyword.id)
                        } else if (keyword.category === '성별') {
                            tempGenders.push(keyword.id)
                        } else if (keyword.category === '한국어수준') {
                            tempKoreanLevels.push(keyword.id)
                        } else if (keyword.category === '근무요일') {  // 추가
                            tempWorkDays.push(keyword.keyword)  // keyword 값(월,화,수...)을 배열에 추가
                        }
                    })

                    setSelectedCountries(tempCountries)
                    setSelectedJobs(tempJobs)
                    setSelectedConditions(tempConditions)
                    setSelectedAgeRanges(tempAgeRanges)
                    setSelectedVisas(tempVisas)
                    setSelectedGenders(tempGenders)
                    setSelectedKoreanLevels(tempKoreanLevels)
                }
            } else {
                throw new Error('공고 정보를 찾을 수 없습니다.')
            }
        } catch (error) {
            console.error('공고 로드 실패:', error)
            showModal('오류', '공고 정보를 불러오는데 실패했습니다.', 'warning')
        }
    }

    // 공고 저장
    const handleSave = async () => {
        // 유효성 검사
        if (!jobTitle || selectedCountries.length === 0 || selectedJobs.length === 0) {
            showModal('알림', '필수 정보를 모두 입력해주세요.')
            return
        }

        if (workingDays.length === 0) {
            showModal('알림', '근무일을 선택해 주세요')
            return
        }

        setLoading(true)
        try {
            // 공고 저장/업데이트
            const jobPostingData = {
                title: jobTitle,
                description: jobDescription,
                hiring_count: parseInt(hiringCount) || 1,
                working_hours: workingHours,
                working_hours_negotiable: workingHoursNegotiable,
                working_days: workingDays,
                working_days_negotiable: workingDaysNegotiable,
                salary_range: salaryRange,
                salary_range_negotiable: salaryRangeNegotiable,
                pay_day: payDay,
                pay_day_negotiable: payDayNegotiable,
                job_address: jobAddress,
                is_active: isPostingActive
            }

            let savedPostingId = jobPostingId
            let postingResponse: any

            if (isEditMode && jobPostingId) {
                // 기존 공고 업데이트
                postingResponse = await api('PUT', `/api/job-postings/${jobPostingId}`, jobPostingData)
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
                const selectedWorkDayKeywordIds = workingDays
                    .map(day => {
                        const keyword = workDayKeywords.find(k => k.keyword === day)
                        return keyword?.id
                    })
                    .filter((id): id is number => id !== undefined)

                // 새 키워드 추가
                const allSelectedKeywords = [
                    ...selectedCountries,
                    ...selectedJobs,
                    ...selectedConditions,
                    ...(selectedLocation ? [selectedLocation] : []),
                    ...selectedAgeRanges,
                    ...selectedVisas,
                    ...selectedGenders,
                    ...selectedKoreanLevels,
                    ...selectedWorkDayKeywordIds  // 근무요일 키워드 ID 추가
                ].filter(Boolean)

                // 키워드 업데이트 API 호출

                const keywordResponse = await api('POST', `/api/job-posting-keyword/${savedPostingId}`, {
                    keywordIds: allSelectedKeywords
                })

                if (!keywordResponse.success) {
                    throw new Error(keywordResponse.message || '키워드 저장에 실패했습니다.')
                }
            }

            showModal(
                '성공',
                isEditMode ? '공고가 수정되었습니다!' : '공고가 등록되었습니다!',
                'confirm',
                () => {
                    hideModal()
                    router.replace('/(company)/myJobPostings')
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
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">
                    {isEditMode ? '채용 공고 수정' : '채용 공고 등록'}
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="bg-white">
                    <JobBasicInfoForm
                        jobTitle={jobTitle}
                        setJobTitle={setJobTitle}
                        jobDescription={jobDescription}
                        setJobDescription={setJobDescription}
                        jobAddress={jobAddress}
                        setJobAddress={setJobAddress}
                        hiringCount={hiringCount}
                        setHiringCount={setHiringCount}
                    />

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

                <View className="h-2 bg-gray-50" />

                {/* 채용 분야 선택 */}
                <View className=" border-b border-gray-100">
                    <Text className="text-xl font-bold p-6">사장님이 원하시는 인재 찾아드릴께요!</Text>

                    <MultiSelectKeywordSelector
                        title="선호 국가 *"
                        placeholder="국가를 선택하세요"
                        keywords={countryKeywords}
                        selectedIds={selectedCountries}
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
                        selectedIds={selectedAgeRanges}
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
                        selectedIds={selectedGenders}
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
                        selectedIds={selectedVisas}
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
                        selectedIds={selectedKoreanLevels}
                        onSelect={handleKoreanLevelSelect}
                        onRemove={removeKoreanLevel}
                        emptyText="선택된 한국어 수준이 없습니다"
                        showNoPreferenceOption={true}
                        enableSearch={true}
                    />

                    {/* 직종 선택 */}
                    <JobPreferencesSelector
                        jobs={jobKeywords}
                        selectedJobs={selectedJobs}
                        onToggle={toggleJob}
                        title="모집 직종 *"
                    />

                    {/* 근무조건 선택 */}
                    <WorkConditionsSelector
                        conditions={conditionKeywords}
                        selectedConditions={selectedConditions}
                        onToggle={toggleCondition}
                        title="제공 조건"
                    />
                </View>

                {/* 공고 상태 */}
                <View className="p-6">
                    <View className="flex-row items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <Text className="text-lg font-medium">공고 활성화</Text>
                        <Switch
                            value={isPostingActive}
                            onValueChange={setIsPostingActive}
                            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                            thumbColor={isPostingActive ? '#ffffff' : '#f3f4f6'}
                        />
                    </View>
                    <Text className="text-sm text-gray-600 mt-2 px-1">
                        비활성화하면 구직자들에게 공고가 표시되지 않습니다.
                    </Text>
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    className={`py-4 mb-4 rounded-xl ${
                        loading ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        {loading ? '저장 중...' : isEditMode ? '공고 수정' : '공고 등록'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ModalComponent/>
        </SafeAreaView>
    )
}

export default Info2