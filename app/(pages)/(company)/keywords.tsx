import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { Dropdown } from 'react-native-element-dropdown'
import JobPreferencesSelector from '@/components/JobPreferencesSelector'
import WorkConditionsSelector from '@/components/WorkConditionsSelector'
import {useModal} from "@/hooks/useModal";

interface Keyword {
    id: number;
    keyword: string;
    category: string;
}

const Keywords = () => {
    const { user } = useAuth()
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [companyKeywords, setCompanyKeywords] = useState<number[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // 선택된 키워드들
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
    const [selectedMoveable, setSelectedMoveable] = useState<number | null>(null)
    const [selectedCountries, setSelectedCountries] = useState<number[]>([])
    const [selectedGenders, setSelectedGenders] = useState<number[]>([])
    const [selectedAges, setSelectedAges] = useState<number[]>([])
    const [selectedVisas, setSelectedVisas] = useState<number[]>([])
    const [selectedJobs, setSelectedJobs] = useState<number[]>([])
    const [selectedConditions, setSelectedConditions] = useState<number[]>([])

    const { showModal, ModalComponent, hideModal} = useModal()

    // 카테고리별 키워드 필터링
    const locationOptions = keywords
        .filter(k => k.category === '지역')
        .map(location => ({
            label: location.keyword,
            value: location.id
        }))

    const countryKeywords = keywords.filter(k => k.category === '국가')
    const genderKeywords = keywords.filter(k => k.category === '성별')
    const ageKeywords = keywords.filter(k => k.category === '나이대')
    const visaKeywords = keywords.filter(k => k.category === '비자')
    const jobKeywords = keywords.filter(k => k.category === '직종')
    const conditionKeywords = keywords.filter(k => k.category === '근무조건')
    const moveableKeyword = keywords.find(k => k.category === '지역이동')

    // 국가 드롭다운 옵션 (상관없음 포함)
    const countryOptions = [
        { label: '상관없음', value: 'all' },
        ...countryKeywords.map(country => ({
            label: country.keyword,
            value: country.id
        }))
    ]

    // 성별 드롭다운 옵션 (상관없음 포함)
    const genderOptions = [
        { label: '상관없음', value: 'all' },
        ...genderKeywords.map(gender => ({
            label: gender.keyword,
            value: gender.id
        }))
    ]

    // 나이대 드롭다운 옵션 (상관없음 포함)
    const ageOptions = [
        { label: '상관없음', value: 'all' },
        ...ageKeywords.map(age => ({
            label: age.keyword,
            value: age.id
        }))
    ]

    // 비자 드롭다운 옵션 (상관없음 포함)
    const visaOptions = [
        { label: '상관없음', value: 'all' },
        ...visaKeywords.map(visa => ({
            label: visa.keyword,
            value: visa.id
        }))
    ]

    useEffect(() => {
        fetchKeywords()
        fetchCompanyKeywords()
    }, [user])

    // 모든 키워드 가져오기
    const fetchKeywords = async () => {
        try {
            const { data, error } = await supabase
                .from('keyword')
                .select('*')
                .order('keyword', { ascending: true })

            if (error) throw error
            if (data) {
                setKeywords(data)
            }
        } catch (error) {
            console.error('키워드 조회 실패:', error)
        }
    }

    // 회사의 기존 키워드 가져오기
    const fetchCompanyKeywords = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('company_keyword')
                .select('keyword_id')
                .eq('company_id', user.userId)

            if (error) throw error

            if (data) {
                const keywordIds = data.map(ck => ck.keyword_id)
                setCompanyKeywords(keywordIds)
            }
        } catch (error) {
            console.error('회사 키워드 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    // 기존 키워드 설정
    useEffect(() => {
        if (companyKeywords.length > 0 && keywords.length > 0) {
            // 지역
            const location = keywords.find(k =>
                k.category === '지역' && companyKeywords.includes(k.id)
            )
            if (location) setSelectedLocation(location.id)

            // 지역이동
            if (moveableKeyword && companyKeywords.includes(moveableKeyword.id)) {
                setSelectedMoveable(moveableKeyword.id)
            }

            // 국가
            const countries = keywords
                .filter(k => k.category === '국가' && companyKeywords.includes(k.id))
                .map(k => k.id)
            setSelectedCountries(countries)

            // 성별
            const genders = keywords
                .filter(k => k.category === '성별' && companyKeywords.includes(k.id))
                .map(k => k.id)
            setSelectedGenders(genders)

            // 나이대
            const ages = keywords
                .filter(k => k.category === '나이대' && companyKeywords.includes(k.id))
                .map(k => k.id)
            setSelectedAges(ages)

            // 비자
            const visas = keywords
                .filter(k => k.category === '비자' && companyKeywords.includes(k.id))
                .map(k => k.id)
            setSelectedVisas(visas)

            // 직종
            const jobs = keywords
                .filter(k => k.category === '직종' && companyKeywords.includes(k.id))
                .map(k => k.id)
            setSelectedJobs(jobs)

            // 근무조건
            const conditions = keywords
                .filter(k => k.category === '근무조건' && companyKeywords.includes(k.id))
                .map(k => k.id)
            setSelectedConditions(conditions)
        }
    }, [companyKeywords, keywords, moveableKeyword])

    // 국가 선택 처리
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

    // 성별 선택 처리
    const handleGenderSelect = (item: any) => {
        if (item.value === 'all') {
            const allGenderIds = genderKeywords.map(k => k.id)
            setSelectedGenders(allGenderIds)
        } else {
            if (!selectedGenders.includes(item.value)) {
                setSelectedGenders([...selectedGenders, item.value])
            }
        }
    }

    // 나이대 선택 처리
    const handleAgeSelect = (item: any) => {
        if (item.value === 'all') {
            const allAgeIds = ageKeywords.map(k => k.id)
            setSelectedAges(allAgeIds)
        } else {
            if (!selectedAges.includes(item.value)) {
                setSelectedAges([...selectedAges, item.value])
            }
        }
    }

    // 비자 선택 처리
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

    // 국가 제거
    const removeCountry = (countryId: number) => {
        setSelectedCountries(prev => prev.filter(id => id !== countryId))
    }

    // 성별 제거
    const removeGender = (genderId: number) => {
        setSelectedGenders(prev => prev.filter(id => id !== genderId))
    }

    // 나이대 제거
    const removeAge = (ageId: number) => {
        setSelectedAges(prev => prev.filter(id => id !== ageId))
    }

    // 비자 제거
    const removeVisa = (visaId: number) => {
        setSelectedVisas(prev => prev.filter(id => id !== visaId))
    }

    // 직종 선택/해제
    const toggleJob = (jobId: number) => {
        setSelectedJobs(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        )
    }

    // 근무조건 선택/해제
    const toggleCondition = (conditionId: number) => {
        setSelectedConditions(prev =>
            prev.includes(conditionId)
                ? prev.filter(id => id !== conditionId)
                : [...prev, conditionId]
        )
    }

    // 지역이동 가능 토글
    const toggleMoveable = () => {
        if (moveableKeyword) {
            if (selectedMoveable === moveableKeyword.id) {
                setSelectedMoveable(null)
            } else {
                setSelectedMoveable(moveableKeyword.id)
            }
        }
    }

    // 키워드 저장
    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        try {
            // 기존 키워드 모두 삭제
            await supabase
                .from('company_keyword')
                .delete()
                .eq('company_id', user.userId)

            // 선택된 키워드들 모으기
            const allSelectedKeywords = [
                selectedLocation,
                selectedMoveable,
                ...selectedCountries,
                ...selectedGenders,
                ...selectedAges,
                ...selectedVisas,
                ...selectedJobs,
                ...selectedConditions
            ].filter(Boolean) // null 제거

            // 새로운 키워드 추가
            if (allSelectedKeywords.length > 0) {
                const inserts = allSelectedKeywords.map(keywordId => ({
                    company_id: user.userId,
                    keyword_id: keywordId
                }))

                const { error } = await supabase
                    .from('company_keyword')
                    .insert(inserts)

                if (error) throw error
            }

            router.back()

        } catch (error) {
            console.error('키워드 저장 실패:', error)
            showModal('알림', '키워드 저장 실패', 'warning')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">대표 키워드 설정</Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 지역 선택 */}
                <View className="p-6">
                    <Text className="text-xl font-bold mb-4">사장님 회사 위치!</Text>
                    <View className="p-4 bg-gray-50 rounded-xl">
                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 2,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                backgroundColor: 'white',
                            }}
                            placeholderStyle={{
                                fontSize: 16,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 16,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 16,
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
                            placeholder="지역을 선택하세요"
                            searchPlaceholder="검색..."
                            value={selectedLocation}
                            onChange={item => {
                                setSelectedLocation(item.value)
                            }}
                        />


                    </View>
                </View>

                <View className="p-6">
                    <Text className="text-xl font-bold mb-4">지역이동 가능자 선호</Text>
                    <View className="p-4 bg-gray-50 rounded-xl">

                    {/* 지역이동 가능 토글 */}
                    {moveableKeyword && (
                        <TouchableOpacity
                            onPress={toggleMoveable}
                            className=" flex-row items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200"
                        >
                            <Text className="text-base text-gray-700">
                                {moveableKeyword.keyword}
                            </Text>
                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                                selectedMoveable === moveableKeyword.id
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-gray-300'
                            }`}>
                                {selectedMoveable === moveableKeyword.id && (
                                    <Ionicons name="checkmark" size={16} color="white" />
                                )}
                            </View>
                        </TouchableOpacity>
                    )}
                    </View>
                    </View>

                {/* 국가 선택 - 드롭다운으로 변경 */}
                <View className="p-6">
                    <Text className="text-xl font-bold mb-4">선호하는 국가</Text>
                    <View className="p-4 bg-gray-50 rounded-xl">
                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 2,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                backgroundColor: 'white',
                            }}
                            placeholderStyle={{
                                fontSize: 16,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 16,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 16,
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
                            value={null} // 드롭다운 자체는 선택 값을 유지하지 않음
                            onChange={handleCountrySelect}
                        />

                        {/* 선택된 국가들 태그로 표시 */}
                        {selectedCountries.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mt-4">
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
                        )}

                        {selectedCountries.length === 0 && (
                            <Text className="text-sm text-gray-500 mt-3 text-center">
                                선택된 국가가 없습니다
                            </Text>
                        )}
                    </View>
                </View>

                {/* 성별 선택 */}
                <View className="p-6">
                    <Text className="text-xl font-bold mb-4">선호하는 성별</Text>
                    <View className="p-4 bg-gray-50 rounded-xl">
                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 2,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                backgroundColor: 'white',
                            }}
                            placeholderStyle={{
                                fontSize: 16,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 16,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 16,
                            }}
                            iconStyle={{
                                width: 20,
                                height: 20,
                            }}
                            data={genderOptions}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="성별을 선택하세요"
                            value={null}
                            onChange={handleGenderSelect}
                        />

                        {/* 선택된 성별들 태그로 표시 */}
                        {selectedGenders.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mt-4">
                                {selectedGenders.map(genderId => {
                                    const gender = genderKeywords.find(k => k.id === genderId)
                                    return gender ? (
                                        <View
                                            key={genderId}
                                            className="flex-row items-center bg-purple-500 px-3 py-2 rounded-full"
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
                        )}

                        {selectedGenders.length === 0 && (
                            <Text className="text-sm text-gray-500 mt-3 text-center">
                                선택된 성별이 없습니다
                            </Text>
                        )}
                    </View>
                </View>

                {/* 나이대 선택 */}
                <View className="p-6">
                    <Text className="text-xl font-bold mb-4">선호하는 나이대</Text>
                    <View className="p-4 bg-gray-50 rounded-xl">
                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 2,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                backgroundColor: 'white',
                            }}
                            placeholderStyle={{
                                fontSize: 16,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 16,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 16,
                            }}
                            iconStyle={{
                                width: 20,
                                height: 20,
                            }}
                            data={ageOptions}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="나이대를 선택하세요"
                            value={null}
                            onChange={handleAgeSelect}
                        />

                        {/* 선택된 나이대들 태그로 표시 */}
                        {selectedAges.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mt-4">
                                {selectedAges.map(ageId => {
                                    const age = ageKeywords.find(k => k.id === ageId)
                                    return age ? (
                                        <View
                                            key={ageId}
                                            className="flex-row items-center bg-green-500 px-3 py-2 rounded-full"
                                        >
                                            <Text className="text-white text-sm font-medium mr-2">
                                                {age.keyword}
                                            </Text>
                                            <TouchableOpacity onPress={() => removeAge(ageId)}>
                                                <Ionicons name="close-circle" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : null
                                })}
                            </View>
                        )}

                        {selectedAges.length === 0 && (
                            <Text className="text-sm text-gray-500 mt-3 text-center">
                                선택된 나이대가 없습니다
                            </Text>
                        )}
                    </View>
                </View>

                {/* 비자 선택 */}
                <View className="p-6">
                    <Text className="text-xl font-bold mb-4">선호 비자</Text>
                    <View className="p-4 bg-gray-50 rounded-xl">
                        <Dropdown
                            style={{
                                height: 50,
                                borderColor: '#d1d5db',
                                borderWidth: 2,
                                borderRadius: 12,
                                paddingHorizontal: 16,
                                backgroundColor: 'white',
                            }}
                            placeholderStyle={{
                                fontSize: 16,
                                color: '#9ca3af'
                            }}
                            selectedTextStyle={{
                                fontSize: 16,
                            }}
                            inputSearchStyle={{
                                height: 40,
                                fontSize: 16,
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
                        {selectedVisas.length > 0 && (
                            <View className="flex-row flex-wrap gap-2 mt-4">
                                {selectedVisas.map(visaId => {
                                    const visa = visaKeywords.find(k => k.id === visaId)
                                    return visa ? (
                                        <View
                                            key={visaId}
                                            className="flex-row items-center bg-orange-500 px-3 py-2 rounded-full"
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
                        )}

                        {selectedVisas.length === 0 && (
                            <Text className="text-sm text-gray-500 mt-3 text-center">
                                선택된 비자가 없습니다
                            </Text>
                        )}
                    </View>
                </View>

                {/* 직종 선택 */}
                <JobPreferencesSelector
                    jobs={jobKeywords}
                    selectedJobs={selectedJobs}
                    onToggle={toggleJob}
                    title="모집 직종"
                />

                {/* 근무조건 선택 */}
                <WorkConditionsSelector
                    conditions={conditionKeywords}
                    selectedConditions={selectedConditions}
                    onToggle={toggleCondition}
                    title="제공 조건"
                />

                {/* 선택된 키워드 요약 */}
                <View className="mx-6 p-4 bg-blue-50 rounded-xl">
                    <Text className="text-sm font-medium text-blue-900 mb-2">선택된 키워드</Text>
                    <Text className="text-xs text-blue-700">
                        총 {[
                        selectedLocation,
                        selectedMoveable,
                        ...selectedCountries,
                        ...selectedGenders,
                        ...selectedAges,
                        ...selectedVisas,
                        ...selectedJobs,
                        ...selectedConditions
                    ].filter(Boolean).length}개
                    </Text>
                </View>
            </ScrollView>

            {/* 저장 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`py-4 rounded-xl ${
                        saving ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        {saving ? '저장 중...' : '키워드 저장'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ModalComponent/>
        </SafeAreaView>
    )
}

export default Keywords