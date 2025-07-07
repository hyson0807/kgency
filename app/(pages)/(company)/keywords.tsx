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
    const jobKeywords = keywords.filter(k => k.category === '직종')
    const conditionKeywords = keywords.filter(k => k.category === '근무조건')
    const moveableKeyword = keywords.find(k => k.category === '지역이동')

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

    // 국가 선택/해제
    const toggleCountry = (countryId: number) => {
        setSelectedCountries(prev =>
            prev.includes(countryId)
                ? prev.filter(id => id !== countryId)
                : [...prev, countryId]
        )
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
                    <Text className="text-xl font-bold mb-4">희망 근무 지역</Text>
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

                        {/* 지역이동 가능 토글 */}
                        {moveableKeyword && (
                            <TouchableOpacity
                                onPress={toggleMoveable}
                                className="mt-4 flex-row items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200"
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

                {/* 국가 선택 */}
                <View className="p-6">
                    <Text className="text-xl font-bold mb-4">선호 국가</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {countryKeywords.map(country => (
                            <TouchableOpacity
                                key={country.id}
                                onPress={() => toggleCountry(country.id)}
                                className={`px-4 py-2 rounded-lg border-2 ${
                                    selectedCountries.includes(country.id)
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                                }`}
                            >
                                <Text className={`font-medium ${
                                    selectedCountries.includes(country.id)
                                        ? 'text-white'
                                        : 'text-gray-700'
                                }`}>
                                    {country.keyword}
                                </Text>
                            </TouchableOpacity>
                        ))}
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