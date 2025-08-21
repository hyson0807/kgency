import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { api } from '@/lib/api'
import { router } from 'expo-router'
import Back from '@/components/back'
import { useModal } from "@/hooks/useModal"
import { KoreanLevelSelector } from "@/components/company/profile/keywords/KoreanLevelSelector"
import { WorkDaySelector } from "@/components/company/profile/keywords/WorkDaySelector"
import { useCompanyKeywordsStore } from '@/stores/companyKeywordsStore'
interface Keyword {
    id: number;
    keyword: string;
    category: string;
}
const KeywordsStep3 = () => {
    const { user } = useAuth()
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    // Zustand store 사용
    const step3Data = useCompanyKeywordsStore(state => state.step3)
    const {
        setKoreanLevel,
        toggleWorkDay,
        setAllWorkDays,
        clearWorkDays,
        setWorkDaysSelectLater,
        getAllSelectedKeywords,
        resetAllData
    } = useCompanyKeywordsStore()
    const { showModal, ModalComponent } = useModal()
    // 카테고리별 키워드 필터링
    const koreanLevelKeywords = keywords.filter(k => k.category === '한국어수준' && k.keyword !== '상관없음')
    const anyKoreanLevelKeyword = keywords.find(k => k.category === '한국어수준' && k.keyword === '상관없음')
    const workDayKeywords = keywords.filter(k => k.category === '근무요일')
    // 상관없음 키워드들
    const anyCountryKeyword = keywords.find(k => k.category === '국가' && k.keyword === '상관없음')
    const anyGenderKeyword = keywords.find(k => k.category === '성별' && k.keyword === '상관없음')
    const anyAgeKeyword = keywords.find(k => k.category === '나이대' && k.keyword === '상관없음')
    const anyVisaKeyword = keywords.find(k => k.category === '비자' && k.keyword === '상관없음')
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
    // 키워드 저장
    const handleSave = async () => {
        if (!user) return
        setSaving(true)
        try {
            // 모든 선택된 키워드들 가져오기
            const allSelectedKeywords = getAllSelectedKeywords()
            
            // Step 2 데이터 가져오기
            const step1Data = useCompanyKeywordsStore.getState().step1
            const step2Data = useCompanyKeywordsStore.getState().step2
            // 국가가 선택되지 않았으면 상관없음 추가
            const countriesToSave = step2Data.countries.length === 0 && anyCountryKeyword
                ? [anyCountryKeyword.id]
                : step2Data.countries
            
            // 성별이 선택되지 않았으면 상관없음 추가
            const gendersToSave = step2Data.genders.length === 0 && anyGenderKeyword
                ? [anyGenderKeyword.id]
                : step2Data.genders
                
            // 나이대가 선택되지 않았으면 상관없음 추가
            const agesToSave = step2Data.ages.length === 0 && anyAgeKeyword
                ? [anyAgeKeyword.id]
                : step2Data.ages
                
            // 비자가 선택되지 않았으면 상관없음 추가
            const visasToSave = step2Data.visas.length === 0 && anyVisaKeyword
                ? [anyVisaKeyword.id]
                : step2Data.visas
                
            // 한국어수준이 선택되지 않았으면 상관없음 추가
            const koreanLevelToSave = step3Data.koreanLevel === null && anyKoreanLevelKeyword
                ? anyKoreanLevelKeyword.id
                : step3Data.koreanLevel
            
            // 최종 선택된 키워드들 모으기
            const finalSelectedKeywords = [
                step1Data.location,
                ...step1Data.jobs,
                ...countriesToSave,
                ...gendersToSave,
                ...agesToSave,
                ...visasToSave,
                koreanLevelToSave,
                ...step3Data.workDays
            ].filter(Boolean) // null 제거
            // API를 통해 키워드 업데이트
            const response = await api('PUT', '/api/company-keyword', {
                keywordIds: finalSelectedKeywords
            })
            if (!response.success) {
                throw new Error(response.error)
            }
            // 성공 시 스토어 초기화 후 홈으로 이동
            resetAllData()
            router.push('/')
        } catch (error) {
            showModal('알림', '키워드 저장 실패', 'warning')
        } finally {
            setSaving(false)
        }
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
                <Text className="text-lg font-bold ml-4">회사 정보 설정 (3/3)</Text>
            </View>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
            >
                {/* 한국어 수준 선택 */}
                <KoreanLevelSelector
                    selectedKoreanLevel={step3Data.koreanLevel}
                    handleKoreanLevelSelect={setKoreanLevel}
                    koreanLevelKeywords={koreanLevelKeywords}
                />
                {/* 근무요일 선택 */}
                <WorkDaySelector 
                    workDayKeywords={workDayKeywords} 
                    selectedWorkDays={step3Data.workDays} 
                    toggleWorkDay={toggleWorkDay}
                    onNegotiableClick={() => {
                        // 협의가능 클릭시 전체 요일 선택
                        const allWorkDayIds = workDayKeywords.map(day => day.id)
                        setAllWorkDays(allWorkDayIds)
                    }}
                    onSelectLaterClick={() => {
                        // 나중에 선택 클릭시 전체 해제하고 비활성화
                        clearWorkDays()
                    }}
                    isSelectLater={step3Data.isWorkDaysSelectLater}
                />
            </ScrollView>
            {/* 저장 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-8">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    className={`py-4 rounded-2xl shadow-sm ${
                        saving ? 'bg-gray-400' : 'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-semibold text-base">
                        {saving ? '저장 중...' : '키워드 저장'}
                    </Text>
                </TouchableOpacity>
            </View>
            <ModalComponent/>
        </SafeAreaView>
    )
}
export default KeywordsStep3