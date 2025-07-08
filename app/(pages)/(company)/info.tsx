import { View, Text, ScrollView, TextInput, TouchableOpacity, Switch, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { router, useLocalSearchParams } from "expo-router"
import { supabase } from '@/lib/supabase'
import Back from '@/components/back'
import JobPreferencesSelector from '@/components/JobPreferencesSelector'
import WorkConditionsSelector from '@/components/WorkConditionsSelector'
import { useUserKeywords } from '@/hooks/useUserKeywords'
import {Dropdown} from "react-native-element-dropdown";
import {useModal} from "@/hooks/useModal";
import {Ionicons} from "@expo/vector-icons";

//채용공고 등록 페이지
const Info = () => {
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

    // 키워드 선택 상태 - 국가도 배열로 변경
    const [selectedCountries, setSelectedCountries] = useState<number[]>([])
    const [selectedJobs, setSelectedJobs] = useState<number[]>([])
    const [selectedConditions, setSelectedConditions] = useState<number[]>([])
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
    const [selectedAgeRanges, setSelectedAgeRanges] = useState<number[]>([])
    const [selectedGenders, setSelectedGenders] = useState<number[]>([])
    const [selectedVisas, setSelectedVisas] = useState<number[]>([])

    // 공고 활성화 상태
    const [isPostingActive, setIsPostingActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)

    const [workingHoursNegotiable, setWorkingHoursNegotiable] = useState(false)
    const [payDay, setPayDay] = useState('')
    const [payDayNegotiable, setPayDayNegotiable] = useState(false)
    const [salaryType, setSalaryType] = useState('')
    const [workingDaysNegotiable, setWorkingDaysNegotiable] = useState(false)

    const { showModal, ModalComponent, hideModal} = useModal()



    // 카테고리별 키워드 필터링
    const countryKeywords = keywords.filter(k => k.category === '국가')
    const jobKeywords = keywords.filter(k => k.category === '직종')
    const conditionKeywords = keywords.filter(k => k.category === '근무조건')
    const ageRangeKeywords = keywords.filter(k => k.category === '나이대')
    const visaKeywords = keywords.filter(k => k.category === '비자')
    const genderKeywords = keywords.filter(k => k.category === '성별')



    const locationOptions = keywords
        .filter(k => k.category === '지역')
        .map(location => ({
            label: location.keyword,
            value: location.id
        }))

    // 국가 드롭다운 옵션 추가
    const countryOptions = [
        { label: '상관없음', value: 'all' },
        ...countryKeywords.map(country => ({
            label: country.keyword,
            value: country.id
        }))
    ]

    // 나이대 드롭다운 옵션 추가
    const ageRangeOptions = [
        { label: '상관없음', value: 'all' },
        ...ageRangeKeywords.map(age => ({
            label: age.keyword,
            value: age.id
        }))
    ]

    const genderOptions = [
        { label: '상관없음', value: 'all' },
        ...genderKeywords.map(gender => ({
            label: gender.keyword,
            value: gender.id
        }))
    ]

    // 비자 드롭다운 옵션 추가
    const visaOptions = [
        { label: '상관없음', value: 'all' },
        ...visaKeywords.map(visa => ({
            label: visa.keyword,
            value: visa.id
        }))
    ]

    // 요일 데이터
    const weekDays = [
        { label: '월', value: '월' },
        { label: '화', value: '화' },
        { label: '수', value: '수' },
        { label: '목', value: '목' },
        { label: '금', value: '금' },
        { label: '토', value: '토' },
        { label: '일', value: '일' }
    ]

    // 급여 타입 데이터
    const salaryTypes = [
        { label: '시급', value: '시급' },
        { label: '일급', value: '일급' },
        { label: '월급', value: '월급' },
        { label: '연봉', value: '연봉' }
    ]

    // 요일 선택/해제 토글
    const toggleWorkingDay = (day: string) => {
        setWorkingDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        )
    }

    // 국가 선택/해제 토글
    const toggleCountry = (countryId: number) => {
        setSelectedCountries(prev =>
            prev.includes(countryId)
                ? prev.filter(id => id !== countryId)
                : [...prev, countryId]
        )
    }

    // 국가 선택 처리 함수 추가
    const handleCountrySelect = (item: any) => {
        if (item.value === 'all') {
            // "상관없음" 선택 시 모든 국가 선택
            const allCountryIds = countryKeywords.map(k => k.id)
            setSelectedCountries(allCountryIds)
        } else {
            // 개별 국가 선택
            if (!selectedCountries.includes(item.value)) {
                setSelectedCountries([...selectedCountries, item.value])
            }
        }
    }

    // 국가 제거 함수 추가
    const removeCountry = (countryId: number) => {
        setSelectedCountries(prev => prev.filter(id => id !== countryId))
    }

    // 나이대 선택 처리 함수 추가
    const handleAgeRangeSelect = (item: any) => {
        if (item.value === 'all') {
            // "상관없음" 선택 시 모든 나이대 선택
            const allAgeRangeIds = ageRangeKeywords.map(k => k.id)
            setSelectedAgeRanges(allAgeRangeIds)
        } else {
            // 개별 나이대 선택
            if (!selectedAgeRanges.includes(item.value)) {
                setSelectedAgeRanges([...selectedAgeRanges, item.value])
            }
        }
    }

    // 나이대 제거 함수 추가
    const removeAgeRange = (ageRangeId: number) => {
        setSelectedAgeRanges(prev => prev.filter(id => id !== ageRangeId))
    }

    const handleGenderSelect = (item: any) => {
        if(item.value === 'all') {
            const allGenderIds = genderKeywords.map(k => k.id)
            setSelectedGenders(allGenderIds)
        }else {
            if(!selectedGenders.includes(item.value)) {
                setSelectedGenders([...selectedGenders, item.value])
            }
        }
    }
    const removeGender = (genderId: number) => {
        setSelectedGenders(prev => prev.filter(id => id !== genderId))
    }

    // 비자 선택 처리 함수 추가
    const handleVisaSelect = (item: any) => {
        if (item.value === 'all') {
            // "상관없음" 선택 시 모든 비자 선택
            const allVisaIds = visaKeywords.map(k => k.id)
            setSelectedVisas(allVisaIds)
        } else {
            // 개별 비자 선택
            if (!selectedVisas.includes(item.value)) {
                setSelectedVisas([...selectedVisas, item.value])
            }
        }
    }

    // 비자 제거 함수 추가
    const removeVisa = (visaId: number) => {
        setSelectedVisas(prev => prev.filter(id => id !== visaId))
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
            const { data: posting, error: postingError } = await supabase
                .from('job_postings')
                .select('*')
                .eq('id', jobPostingId)
                .single()

            if (postingError) throw postingError

            if (posting) {
                setJobTitle(posting.title)
                setJobDescription(posting.description || '')
                setHiringCount(posting.hiring_count?.toString() || '1')
                setWorkingHours(posting.working_hours || '')
                setWorkingDays(posting.working_days || [])
                setWorkingDaysNegotiable(posting.working_days_negotiable || false)
                setSalaryRange(posting.salary_range || '')
                setIsPostingActive(posting.is_active)
                setWorkingHoursNegotiable(posting.working_hours_negotiable || false)
                setPayDay(posting.pay_day || '')
                setPayDayNegotiable(posting.pay_day_negotiable || false)
                setSalaryType(posting.salary_type || '')
            }

            // 공고 키워드 로드
            const { data: postingKeywords, error: keywordError } = await supabase
                .from('job_posting_keyword')
                .select('keyword_id')
                .eq('job_posting_id', jobPostingId)

            if (keywordError) throw keywordError

            if (postingKeywords) {
                const keywordIds = postingKeywords.map(k => k.keyword_id)

                // 카테고리별로 분류
                const tempCountries: number[] = []
                const tempJobs: number[] = []
                const tempConditions: number[] = []
                const tempAgeRanges: number[] = []
                const tempVisas: number[] = []
                const tempGenders: number[] = []

                keywords.forEach(keyword => {
                    if (keywordIds.includes(keyword.id)) {
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
                        }
                    }
                })

                setSelectedCountries(tempCountries)
                setSelectedJobs(tempJobs)
                setSelectedConditions(tempConditions)
                setSelectedAgeRanges(tempAgeRanges)
                setSelectedVisas(tempVisas)
                setSelectedGenders(tempGenders)
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
                company_id: user?.userId,
                title: jobTitle,
                description: jobDescription,
                hiring_count: parseInt(hiringCount) || 1,
                working_hours: workingHours,
                working_hours_negotiable: workingHoursNegotiable,
                working_days: workingDays,
                working_days_negotiable: workingDaysNegotiable,
                salary_range: salaryRange,
                salary_type: salaryType,
                pay_day: payDay,
                pay_day_negotiable: payDayNegotiable,
                is_active: isPostingActive,
                updated_at: new Date().toISOString()
            }

            let savedPostingId = jobPostingId

            if (isEditMode && jobPostingId) {
                // 기존 공고 업데이트
                const { error: updateError } = await supabase
                    .from('job_postings')
                    .update(jobPostingData)
                    .eq('id', jobPostingId)

                if (updateError) throw updateError
            } else {
                // 새 공고 생성
                const { data: newPosting, error: insertError } = await supabase
                    .from('job_postings')
                    .insert(jobPostingData)
                    .select()
                    .single()

                if (insertError) throw insertError
                savedPostingId = newPosting.id
            }

            // 키워드 업데이트
            if (savedPostingId) {
                // 기존 키워드 삭제
                await supabase
                    .from('job_posting_keyword')
                    .delete()
                    .eq('job_posting_id', savedPostingId)

                // 새 키워드 추가
                const allSelectedKeywords = [
                    ...selectedCountries,
                    ...selectedJobs,
                    ...selectedConditions,
                    ...(selectedLocation ? [selectedLocation] : []),
                    ...selectedAgeRanges,
                    ...selectedVisas,
                    ...selectedGenders
                ].filter(Boolean)

                if (allSelectedKeywords.length > 0) {
                    const keywordInserts = allSelectedKeywords.map(keywordId => ({
                        job_posting_id: savedPostingId,
                        keyword_id: keywordId
                    }))

                    const { error: keywordError } = await supabase
                        .from('job_posting_keyword')
                        .insert(keywordInserts)

                    if (keywordError) throw keywordError
                }
            }

            showModal(
                '성공',
                isEditMode ? '공고가 수정되었습니다!' : '공고가 등록되었습니다!',
                'confirm',
                () => {
                    hideModal()
                    router.replace('/(company)/home')
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
                {/* 채용 정보 */}
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-xl font-bold mb-4">채용 정보</Text>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">채용 제목 *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="예: 주방 보조 직원 모집"
                            value={jobTitle}
                            onChangeText={setJobTitle}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">업무 내용</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 min-h-[100px]"
                            placeholder="업무 내용을 간단히 알려주세요!"
                            value={jobDescription}
                            onChangeText={setJobDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">근무 지역</Text>
                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingHorizontal: 12,
                            }}
                            placeholderStyle={{
                                fontSize: 14,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 14,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 14,
                            }}
                            iconStyle={{
                                width: 20,
                                height: 20,
                            }}
                            data={locationOptions}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="근무 지역을 선택하세요"
                            searchPlaceholder="검색..."
                            value={selectedLocation}
                            onChange={item => {
                                setSelectedLocation(item.value);
                            }}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">근무시간</Text>
                        <View className="flex-row items-center gap-2">
                            <TextInput
                                className="flex-1 border border-gray-300 rounded-lg p-3"
                                placeholder="예: 09:00-18:00"
                                value={workingHours}
                                onChangeText={setWorkingHours}
                            />
                            <TouchableOpacity
                                onPress={() => setWorkingHoursNegotiable(!workingHoursNegotiable)}
                                className="flex-row items-center gap-2"
                            >
                                <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                                    workingHoursNegotiable
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                                }`}>
                                    {workingHoursNegotiable && (
                                        <Text className="text-white text-xs">✓</Text>
                                    )}
                                </View>
                                <Text className="text-gray-700">협의가능</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">근무일 *</Text>
                        <View className="flex-row flex-wrap gap-3 items-center">
                            {weekDays.map(day => (
                                <TouchableOpacity
                                    key={day.value}
                                    onPress={() => toggleWorkingDay(day.value)}
                                    className={`px-2 py-2 rounded-lg border-2 ${
                                        workingDays.includes(day.value)
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-white border-gray-300'
                                    }`}
                                >
                                    <Text className={`font-medium ${
                                        workingDays.includes(day.value)
                                            ? 'text-white'
                                            : 'text-gray-700'
                                    }`}>
                                        {day.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                onPress={() => setWorkingDaysNegotiable(!workingDaysNegotiable)}
                                className="flex-row items-center gap-2 mt-3"
                            >
                                <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                                    workingDaysNegotiable
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                                }`}>
                                    {workingDaysNegotiable && (
                                        <Text className="text-white text-xs">✓</Text>
                                    )}
                                </View>
                                <Text className="text-gray-700">협의가능</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">급여 타입</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {salaryTypes.map(type => (
                                <TouchableOpacity
                                    key={type.value}
                                    onPress={() => setSalaryType(type.value)}
                                    className={`px-4 py-2 rounded-lg border-2 ${
                                        salaryType === type.value
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-white border-gray-300'
                                    }`}
                                >
                                    <Text className={`font-medium ${
                                        salaryType === type.value
                                            ? 'text-white'
                                            : 'text-gray-700'
                                    }`}>
                                        {type.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">급여</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="예: 월 200-250만원"
                            value={salaryRange}
                            onChangeText={setSalaryRange}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">급여일</Text>
                        <View className="flex-row items-center gap-2">
                            <TextInput
                                className="flex-1 border border-gray-300 rounded-lg p-3"
                                placeholder="예: 매월 10일"
                                value={payDay}
                                onChangeText={setPayDay}
                            />
                            <TouchableOpacity
                                onPress={() => setPayDayNegotiable(!payDayNegotiable)}
                                className="flex-row items-center gap-2"
                            >
                                <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                                    payDayNegotiable
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                                }`}>
                                    {payDayNegotiable && (
                                        <Text className="text-white text-xs">✓</Text>
                                    )}
                                </View>
                                <Text className="text-gray-700">협의가능</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">모집인원</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="예: 2"
                            value={hiringCount}
                            onChangeText={setHiringCount}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* 채용 분야 선택 */}
                <View className=" border-b border-gray-100">
                    <Text className="text-xl font-bold p-6">사장님이 원하시는 인재 찾아드릴께요!</Text>

                    {/* 국가 선택 - 다중 선택 가능 */}
                    <View className="mb-6 p-6">
                        <Text className="text-lg font-semibold mb-3">선호 국가 *</Text>
                        <Text className="text-sm text-gray-500 mb-3">여러 국가를 선택할 수 있습니다</Text>

                        {/* 드롭다운 추가 */}
                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                backgroundColor: 'white',
                                marginBottom: 12,
                            }}
                            placeholderStyle={{
                                fontSize: 14,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 14,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 14,
                            }}
                            iconStyle={{
                                width: 20,
                                height: 20,
                            }}
                            data={countryOptions}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="국가를 선택하세요"
                            searchPlaceholder="검색..."
                            value={null}
                            onChange={handleCountrySelect}
                        />

                        {/* 선택된 국가들 태그로 표시 */}
                        {selectedCountries.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                                {selectedCountries.map(countryId => {
                                    const country = countryKeywords.find(k => k.id === countryId)
                                    return country ? (
                                        <View
                                            key={countryId}
                                            className="flex-row items-center bg-blue-500 px-3 py-2 rounded-full"
                                        >
                                            <Text className="text-white text-sm font-medium mr-2">
                                                {country.keyword}
                                            </Text>
                                            <TouchableOpacity onPress={() => removeCountry(countryId)}>
                                                <Ionicons name="close-circle" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null
                                })}
                            </View>
                        ) : (
                            <Text className="text-sm text-gray-500 text-center">
                                선택된 국가가 없습니다
                            </Text>
                        )}

                        {selectedCountries.length > 0 && (
                            <Text className="text-sm text-gray-500 mt-2">
                                {selectedCountries.length}개 국가 선택됨
                            </Text>
                        )}
                    </View>

                    {/* 나이대 선택 - 추가 */}
                    <View className="mb-6 p-6">
                        <Text className="text-lg font-semibold mb-3">선호 나이대</Text>
                        <Text className="text-sm text-gray-500 mb-3">여러 나이대를 선택할 수 있습니다</Text>

                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                backgroundColor: 'white',
                                marginBottom: 12,
                            }}
                            placeholderStyle={{
                                fontSize: 14,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 14,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 14,
                            }}
                            iconStyle={{
                                width: 20,
                                height: 20,
                            }}
                            data={ageRangeOptions}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="나이대를 선택하세요"
                            searchPlaceholder="검색..."
                            value={null}
                            onChange={handleAgeRangeSelect}
                        />

                        {/* 선택된 나이대들 태그로 표시 */}
                        {selectedAgeRanges.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                                {selectedAgeRanges.map(ageRangeId => {
                                    const ageRange = ageRangeKeywords.find(k => k.id === ageRangeId)
                                    return ageRange ? (
                                        <View
                                            key={ageRangeId}
                                            className="flex-row items-center bg-blue-500 px-3 py-2 rounded-full"
                                        >
                                            <Text className="text-white text-sm font-medium mr-2">
                                                {ageRange.keyword}
                                            </Text>
                                            <TouchableOpacity onPress={() => removeAgeRange(ageRangeId)}>
                                                <Ionicons name="close-circle" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null
                                })}
                            </View>
                        ) : (
                            <Text className="text-sm text-gray-500 text-center">
                                선택된 나이대가 없습니다
                            </Text>
                        )}


                        {selectedAgeRanges.length > 0 && (
                            <Text className="text-sm text-gray-500 mt-2">
                                {selectedAgeRanges.length}개 나이대 선택됨
                            </Text>
                        )}
                    </View>

                    <View className="mb-6 p-6">
                        <Text className="text-lg font-semibold mb-3">선호 성별</Text>
                        <Text className="text-sm text-gray-500 mb-3">여러 성별을 선택할 수 있습니다</Text>

                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                backgroundColor: 'white',
                                marginBottom: 12,
                            }}
                            placeholderStyle={{
                                fontSize: 14,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 14,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 14,
                            }}
                            iconStyle={{
                                width: 20,
                                height: 20,
                            }}
                            data={genderOptions}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="선호 성별을 선택하세요"
                            searchPlaceholder="검색..."
                            value={null}
                            onChange={handleGenderSelect}
                        />

                        {/* 선택된 성별 태그로 표시 */}
                        {selectedGenders.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                                {selectedGenders.map(genderId => {
                                    const gender = genderKeywords.find(k => k.id === genderId)
                                    return gender ? (
                                        <View
                                            key={genderId}
                                            className="flex-row items-center bg-blue-500 px-3 py-2 rounded-full"
                                        >
                                            <Text className="text-white text-sm font-medium mr-2">
                                                {gender.keyword}
                                            </Text>
                                            <TouchableOpacity onPress={() => removeGender(genderId)}>
                                                <Ionicons name="close-circle" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null
                                })}
                            </View>
                        ) : (
                            <Text className="text-sm text-gray-500 text-center">
                                선택된 성별이 없습니다
                            </Text>
                        )}

                    </View>

                    {/* 비자 선택 - 추가 */}
                    <View className="mb-6 p-6">
                        <Text className="text-lg font-semibold mb-3">선호 비자</Text>
                        <Text className="text-sm text-gray-500 mb-3">여러 비자 타입을 선택할 수 있습니다</Text>

                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                backgroundColor: 'white',
                                marginBottom: 12,
                            }}
                            placeholderStyle={{
                                fontSize: 14,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 14,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 14,
                            }}
                            iconStyle={{
                                width: 20,
                                height: 20,
                            }}
                            data={visaOptions}
                            search
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="비자를 선택하세요"
                            searchPlaceholder="검색..."
                            value={null}
                            onChange={handleVisaSelect}
                        />

                        {/* 선택된 비자들 태그로 표시 */}
                        {selectedVisas.length > 0 ? (
                            <View className="flex-row flex-wrap gap-2">
                                {selectedVisas.map(visaId => {
                                    const visa = visaKeywords.find(k => k.id === visaId)
                                    return visa ? (
                                        <View
                                            key={visaId}
                                            className="flex-row items-center bg-blue-500 px-3 py-2 rounded-full"
                                        >
                                            <Text className="text-white text-sm font-medium mr-2">
                                                {visa.keyword}
                                            </Text>
                                            <TouchableOpacity onPress={() => removeVisa(visaId)}>
                                                <Ionicons name="close-circle" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null
                                })}
                            </View>
                        ) : (
                            <Text className="text-sm text-gray-500 text-center">
                                선택된 비자가 없습니다
                            </Text>
                        )}

                        {selectedVisas.length > 0 && (
                            <Text className="text-sm text-gray-500 mt-2">
                                {selectedVisas.length}개 비자 선택됨
                            </Text>
                        )}
                    </View>

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

export default Info