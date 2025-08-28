import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { api } from "@/lib/api"
import { router } from 'expo-router'
import Back from '@/components/shared/common/back'
import JobPreferencesSelector from '@/components/shared/keyword/JobPreferencesSelector'
import { LocationSelector } from "@/components/company/profile/keywords/Location"
import { useCompanyKeywordsStore } from '@/stores/companyKeywordsStore'
interface Keyword {
    id: number;
    keyword: string;
    category: string;
}
const KeywordsStep1 = () => {
    const { user } = useAuth()
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [loading, setLoading] = useState(true)
    const [dataInitialized, setDataInitialized] = useState(false)
    // Zustand store 사용
    const step1Data = useCompanyKeywordsStore(state => state.step1)
    const {
        setLocation,
        toggleJob,
        resetAllData,
        setInitialData
    } = useCompanyKeywordsStore()
    // 카테고리별 키워드 필터링
    const locationOptions = keywords
        .filter(k => k.category === '지역')
        .map(location => ({
            label: location.keyword,
            value: location.id
        }))
    const jobKeywords = keywords.filter(k => k.category === '직종')
    useEffect(() => {
        // 첫 마운트 시에만 초기화 및 데이터 로드
        if (!dataInitialized) {
            resetAllData()
            fetchInitialData()
        }
    }, [user])
    // 초기 데이터 로드 (키워드 + 회사 키워드)
    const fetchInitialData = async () => {
        try {
            // 모든 키워드 가져오기
            const keywordsResponse = await api('GET', '/api/user-keyword/keywords')
            if (!keywordsResponse.success) {
                throw new Error(keywordsResponse.error)
            }
            const allKeywords = keywordsResponse.data || []
            setKeywords(allKeywords)
            // 회사의 기존 키워드 가져오기
            if (user) {
                const companyKeywordsResponse = await api('GET', '/api/company-keyword')
                if (companyKeywordsResponse.success && companyKeywordsResponse.data) {
                    const keywordIds = companyKeywordsResponse.data.map((ck: any) => ck.keyword_id)
                    // store에 초기 데이터 설정
                    setInitialData(keywordIds, allKeywords)
                }
            }
            
            setDataInitialized(true)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }
    const handleNext = () => {
        // 지역 선택 확인
        if (!step1Data.location) {
            Alert.alert(
                '필수 항목',
                '지역을 선택해주세요.',
                [{ text: '확인' }]
            )
            return
        }
        // 직종 선택 확인 (최소 1개 이상)
        if (step1Data.jobs.length === 0) {
            Alert.alert(
                '필수 항목',
                '최소 하나 이상의 직종을 선택해주세요.',
                [{ text: '확인' }]
            )
            return
        }
        router.push('/keywords-step2')
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
                <Back />
                <Text className="text-lg font-bold ml-4">회사 정보 설정 (1/3)</Text>
            </View>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
            >
                {/* 지역 선택 - 필수 */}
                <View>
                    <View className="px-4 mb-2">
                        <Text className="text-red-500 text-xs">* 필수 선택</Text>
                    </View>
                    <LocationSelector 
                        locationOptions={locationOptions} 
                        selectedLocation={step1Data.location} 
                        setSelectedLocation={setLocation} 
                    />
                </View>
                {/* 직종 선택 - 필수 */}
                <View>
                    <View className="px-4 mb-2">
                        <Text className="text-red-500 text-xs">* 필수 선택 (최소 1개)</Text>
                    </View>
                    <JobPreferencesSelector
                        jobs={jobKeywords}
                        selectedJobs={step1Data.jobs}
                        onToggle={toggleJob}
                        title="모집 직종"
                    />
                </View>
            </ScrollView>
            {/* 다음 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-8">
                <TouchableOpacity
                    onPress={handleNext}
                    className={`py-4 rounded-2xl shadow-sm ${
                        step1Data.location && step1Data.jobs.length > 0 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                    }`}
                    disabled={!step1Data.location || step1Data.jobs.length === 0}
                >
                    <Text className="text-center text-white font-semibold text-base">
                        {!step1Data.location || step1Data.jobs.length === 0
                            ? '필수 항목을 선택해주세요'
                            : '다음'
                        }
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}
export default KeywordsStep1