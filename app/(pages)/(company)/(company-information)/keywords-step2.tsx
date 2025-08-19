import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { api } from '@/lib/api'
import { router } from 'expo-router'
import Back from '@/components/back'
import { MultiSelectKeywordSelector } from "@/components/common/MultiSelectKeywordSelector"
import { useCompanyKeywordsStore } from '@/stores/companyKeywordsStore'
interface Keyword {
    id: number;
    keyword: string;
    category: string;
}
const KeywordsStep2 = () => {
    const { user } = useAuth()
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [loading, setLoading] = useState(true)
    // Zustand store 사용
    const step2Data = useCompanyKeywordsStore(state => state.step2)
    const {
        addCountry,
        removeCountry,
        clearCountries,
        addGender,
        removeGender,
        clearGenders,
        addAge,
        removeAge,
        clearAges,
        addVisa,
        removeVisa,
        clearVisas
    } = useCompanyKeywordsStore()
    // 카테고리별 키워드 필터링 ('상관없음' 제외)
    const countryKeywords = keywords.filter(k => k.category === '국가' && k.keyword !== '상관없음')
    const genderKeywords = keywords.filter(k => k.category === '성별' && k.keyword !== '상관없음')
    const ageKeywords = keywords.filter(k => k.category === '나이대' && k.keyword !== '상관없음')
    const visaKeywords = keywords.filter(k => k.category === '비자' && k.keyword !== '상관없음')
    useEffect(() => {
        // step1에서 이미 데이터를 로드했으므로, 여기서는 키워드만 로드
        fetchKeywords()
    }, [])
    // 모든 키워드 가져오기
    const fetchKeywords = async () => {
        try {
            const response = await api('GET', '/api/user-keyword/keywords')
            if (!response.success) {
                throw new Error(response.error)
            }
            if (response.data) {
                setKeywords(response.data)
            }
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }
    const handleNext = () => {
        router.push('/keywords-step3')
    }
    const handleBack = () => {
        router.back()
    }
    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
                <Back onPress={handleBack} />
                <Text className="text-lg font-bold ml-4">회사 정보 설정 (2/3)</Text>
            </View>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
            >
                {/* 국가 선택 */}
                <MultiSelectKeywordSelector
                    title="선호하는 국가"
                    placeholder="국가를 선택하세요"
                    keywords={countryKeywords}
                    selectedIds={step2Data.countries}
                    onSelect={(item) => addCountry(item.value)}
                    onRemove={removeCountry}
                    onRemoveAll={clearCountries}
                    emptyText="선택된 국가가 없습니다 (저장 시 '상관없음'으로 설정됩니다)"
                    enableSearch={true}
                    showNoPreferenceOption={false}
                />
                {/* 성별 선택 */}
                <MultiSelectKeywordSelector
                    title="선호하는 성별"
                    placeholder="성별을 선택하세요"
                    keywords={genderKeywords}
                    selectedIds={step2Data.genders}
                    onSelect={(item) => addGender(item.value)}
                    onRemove={removeGender}
                    onRemoveAll={clearGenders}
                    emptyText="선택된 성별이 없습니다 (저장 시 '상관없음'으로 설정됩니다)"
                    showNoPreferenceOption={false}
                />
                {/* 나이대 선택 */}
                <MultiSelectKeywordSelector
                    title="선호하는 나이대"
                    placeholder="나이대를 선택하세요"
                    keywords={ageKeywords}
                    selectedIds={step2Data.ages}
                    onSelect={(item) => addAge(item.value)}
                    onRemove={removeAge}
                    onRemoveAll={clearAges}
                    emptyText="선택된 나이대가 없습니다 (저장 시 '상관없음'으로 설정됩니다)"
                    showNoPreferenceOption={false}
                />
                {/* 비자 선택 */}
                <MultiSelectKeywordSelector
                    title="선호하는 비자"
                    placeholder="비자를 선택하세요"
                    keywords={visaKeywords}
                    selectedIds={step2Data.visas}
                    onSelect={(item) => addVisa(item.value)}
                    onRemove={removeVisa}
                    onRemoveAll={clearVisas}
                    emptyText="선택된 비자가 없습니다 (저장 시 '상관없음'으로 설정됩니다)"
                    showNoPreferenceOption={false}
                />
            </ScrollView>
            {/* 다음 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-8">
                <TouchableOpacity
                    onPress={handleNext}
                    className="py-4 rounded-2xl shadow-sm bg-blue-500"
                >
                    <Text className="text-center text-white font-semibold text-base">
                        다음
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
export default KeywordsStep2