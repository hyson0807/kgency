import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/contexts/AuthContext"
import { router, useLocalSearchParams } from "expo-router"
import { supabase } from '@/lib/supabase'
import Back from '@/components/back'
import JobPreferencesSelector from '@/components/JobPreferencesSelector'
import WorkConditionsSelector from '@/components/WorkConditionsSelector'
import { useUserKeywords } from '@/hooks/useUserKeywords'
import { Dropdown } from 'react-native-element-dropdown'

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
    const [breakTime, setBreakTime] = useState('')
    const [salaryRange, setSalaryRange] = useState('')
    const [holidaySystem, setHolidaySystem] = useState('')
    const [benefits, setBenefits] = useState('')
    const [requirements, setRequirements] = useState('')
    const [hiringCount, setHiringCount] = useState('1')

    // 키워드 선택 상태
    const [selectedCountry, setSelectedCountry] = useState<number | null>(null)
    const [selectedJobs, setSelectedJobs] = useState<number[]>([])
    const [selectedConditions, setSelectedConditions] = useState<number[]>([])

    // 공고 활성화 상태
    const [isPostingActive, setIsPostingActive] = useState(true)
    const [loading, setLoading] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)

    // 카테고리별 키워드 필터링
    const countryOptions = keywords
        .filter(k => k.category === '국가')
        .map(country => ({
            label: country.keyword,
            value: country.id
        }))

    const jobKeywords = keywords.filter(k => k.category === '직종')
    const conditionKeywords = keywords.filter(k => k.category === '근무조건')



    // 수정 모드인 경우 기존 공고 데이터 로드
    useEffect(() => {
        if (jobPostingId) {
            setIsEditMode(true)
            loadJobPosting()
        }
    }, [jobPostingId])

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
                setRequirements(posting.requirements || '')
                setHiringCount(posting.hiring_count?.toString() || '1')
                setWorkingHours(posting.working_hours || '')
                setBreakTime(posting.break_time || '')
                setSalaryRange(posting.salary_range || '')
                setHolidaySystem(posting.holiday_system || '')
                setIsPostingActive(posting.is_active)

                if (posting.benefits) {
                    setBenefits(posting.benefits.join(', '))
                }
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
                keywords.forEach(keyword => {
                    if (keywordIds.includes(keyword.id)) {
                        if (keyword.category === '국가') {
                            setSelectedCountry(keyword.id)
                        } else if (keyword.category === '직종') {
                            setSelectedJobs(prev => [...prev, keyword.id])
                        } else if (keyword.category === '근무조건') {
                            setSelectedConditions(prev => [...prev, keyword.id])
                        }
                    }
                })
            }
        } catch (error) {
            console.error('공고 로드 실패:', error)
            Alert.alert('오류', '공고 정보를 불러오는데 실패했습니다.')
        }
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

    // 공고 저장
    const handleSave = async () => {
        // 유효성 검사
        if (!jobTitle || !selectedCountry || selectedJobs.length === 0) {
            Alert.alert('알림', '필수 정보를 모두 입력해주세요.')
            return
        }

        setLoading(true)
        try {
            // 공고 저장/업데이트
            const jobPostingData = {
                company_id: user?.userId,
                title: jobTitle,
                description: jobDescription,
                requirements: requirements,
                hiring_count: parseInt(hiringCount) || 1,
                working_hours: workingHours,
                break_time: breakTime,
                salary_range: salaryRange,
                holiday_system: holidaySystem,
                benefits: benefits ? benefits.split(',').map(b => b.trim()) : [],
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

            // 3. 키워드 업데이트
            if (savedPostingId) {
                // 기존 키워드 삭제
                await supabase
                    .from('job_posting_keyword')
                    .delete()
                    .eq('job_posting_id', savedPostingId)

                // 새 키워드 추가
                const allSelectedKeywords = [
                    selectedCountry,
                    ...selectedJobs,
                    ...selectedConditions
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

            Alert.alert('성공', isEditMode ? '공고가 수정되었습니다!' : '공고가 등록되었습니다!', [
                {
                    text: '확인',
                    onPress: () => router.replace('/(company)/home')
                }
            ])

        } catch (error) {
            console.error('저장 실패:', error)
            Alert.alert('오류', '저장 중 문제가 발생했습니다.')
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
                        <Text className="text-gray-700 mb-2">상세 설명</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="업무 내용을 자세히 설명해주세요"
                            value={jobDescription}
                            onChangeText={setJobDescription}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-gray-700 mb-2">근무시간</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                placeholder="예: 09:00-18:00"
                                value={workingHours}
                                onChangeText={setWorkingHours}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-700 mb-2">휴게시간</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                placeholder="예: 1시간"
                                value={breakTime}
                                onChangeText={setBreakTime}
                            />
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
                        <Text className="text-gray-700 mb-2">휴무</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="예: 주 1회 휴무"
                            value={holidaySystem}
                            onChangeText={setHolidaySystem}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">복지/혜택</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="예: 4대보험, 식사제공, 기숙사"
                            value={benefits}
                            onChangeText={setBenefits}
                            multiline
                            numberOfLines={2}
                        />
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

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">자격요건</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="필요한 자격요건을 입력하세요"
                            value={requirements}
                            onChangeText={setRequirements}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* 채용 분야 선택 */}
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-xl font-bold mb-4">채용 분야</Text>

                    {/* 국가 선택 */}
                    <View className="mb-6">
                        <Text className="text-lg font-semibold mb-3">대상 국가 *</Text>
                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 1,
                                borderRadius: 8,
                                paddingHorizontal: 12,
                            }}
                            placeholderStyle={{ fontSize: 14, color: '#9ca3af' }}
                            selectedTextStyle={{ fontSize: 14 }}
                            data={countryOptions}
                            search
                            labelField="label"
                            valueField="value"
                            placeholder="국가를 선택하세요"
                            searchPlaceholder="검색..."
                            value={selectedCountry}
                            onChange={item => setSelectedCountry(item.value)}
                        />
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
            <View className="absolute bottom-4 left-2 right-2 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    className={`py-4 rounded-2xl ${
                        loading ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        {loading ? '저장 중...' : isEditMode ? '공고 수정' : '공고 등록'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

export default Info