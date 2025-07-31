import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { api } from '@/lib/api'
import { router } from 'expo-router'
import Back from '@/components/back'
import JobPreferencesSelector from '@/components/JobPreferencesSelector'
import {useModal} from "@/hooks/useModal";
import {LocationSelector} from "@/components/company_keyword(keywords)/Location";
import {MoveableSelector} from "@/components/company_keyword(keywords)/MoveableSelector";
import {MultiSelectKeywordSelector} from "@/components/common/MultiSelectKeywordSelector";
import {KoreanLevelSelector} from "@/components/company_keyword(keywords)/KoreanLevelSelector";
import {WorkDaySelector} from "@/components/company_keyword(keywords)/WorkDaySelector";

interface Keyword {
    id: number;
    keyword: string;
    category: string;
}

interface SelectedKeywords {
    location: number | null;
    moveable: number | null;
    countries: number[];
    genders: number[];
    ages: number[];
    visas: number[];
    jobs: number[];
    conditions: number[];
    workDays: number[];
    koreanLevel: number | null;
}

//회사 대표키워드 설정 페이지

const Keywords = () => {
    const { user } = useAuth()
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [companyKeywords, setCompanyKeywords] = useState<number[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // 통합된 선택 상태
    const [selectedKeywords, setSelectedKeywords] = useState<SelectedKeywords>({
        location: null,
        moveable: null,
        countries: [],
        genders: [],
        ages: [],
        visas: [],
        jobs: [],
        conditions: [],
        workDays: [],
        koreanLevel: null
    })
    
    const [isWorkDaysSelectLater, setIsWorkDaysSelectLater] = useState(false)

    const { showModal, ModalComponent} = useModal()

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
    const moveableKeyword = keywords.find(k => k.category === '지역이동')
    const workDayKeywords = keywords.filter(k => k.category === '근무요일')
    const koreanLevelKeywords = keywords.filter(k => k.category === '한국어수준')


    useEffect(() => {
        fetchKeywords()
        fetchCompanyKeywords()
    }, [user])

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
            console.error('키워드 조회 실패:', error)
        }
    }

    // 회사의 기존 키워드 가져오기
    const fetchCompanyKeywords = async () => {
        if (!user) return

        try {
            const response = await api('GET', '/api/company-keyword')

            if (!response.success) {
                throw new Error(response.error)
            }

            if (response.data) {
                const keywordIds = response.data.map((ck: any) => ck.keyword_id)
                setCompanyKeywords(keywordIds)
            }
        } catch (error) {
            console.error('회사 키워드 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    // 카테고리별로 키워드 필터링하는 헬퍼 함수
    const getKeywordsByCategory = (category: string) => {
        return keywords.filter(k => k.category === category)
    }

    // 기존 키워드 설정
    useEffect(() => {
        if (companyKeywords.length > 0 && keywords.length > 0) {
            const newSelectedKeywords: SelectedKeywords = {
                location: null,
                moveable: null,
                countries: [],
                genders: [],
                ages: [],
                visas: [],
                jobs: [],
                conditions: [],
                workDays: [],
                koreanLevel: null
            }

            // 각 카테고리별로 선택된 키워드 설정
            const categories = {
                '지역': (ids: number[]) => { if (ids.length > 0) newSelectedKeywords.location = ids[0] },
                '지역이동': (ids: number[]) => { if (ids.length > 0) newSelectedKeywords.moveable = ids[0] },
                '국가': (ids: number[]) => { newSelectedKeywords.countries = ids },
                '성별': (ids: number[]) => { newSelectedKeywords.genders = ids },
                '나이대': (ids: number[]) => { newSelectedKeywords.ages = ids },
                '비자': (ids: number[]) => { newSelectedKeywords.visas = ids },
                '직종': (ids: number[]) => { newSelectedKeywords.jobs = ids },
                '근무조건': (ids: number[]) => { newSelectedKeywords.conditions = ids },
                '근무요일': (ids: number[]) => { newSelectedKeywords.workDays = ids },
                '한국어수준': (ids: number[]) => { if (ids.length > 0) newSelectedKeywords.koreanLevel = ids[0] }
            }

            Object.entries(categories).forEach(([category, setter]) => {
                const categoryKeywords = keywords
                    .filter(k => k.category === category && companyKeywords.includes(k.id))
                    .map(k => k.id)
                setter(categoryKeywords)
            })

            setSelectedKeywords(newSelectedKeywords)
        }
    }, [companyKeywords, keywords])

    // 통합된 다중 선택 핸들러
    const handleMultiSelect = (category: keyof SelectedKeywords, item: any) => {
        if (item.value === 'all') {
            const allIds = getKeywordsByCategory(
                category === 'countries' ? '국가' :
                category === 'genders' ? '성별' :
                category === 'ages' ? '나이대' :
                category === 'visas' ? '비자' : ''
            ).map(k => k.id)
            
            setSelectedKeywords(prev => ({
                ...prev,
                [category]: allIds
            }))
        } else {
            const currentArray = selectedKeywords[category] as number[]
            if (!currentArray.includes(item.value)) {
                setSelectedKeywords(prev => ({
                    ...prev,
                    [category]: [...currentArray, item.value]
                }))
            }
        }
    }

    // 통합된 제거 핸들러
    const handleRemove = (category: keyof SelectedKeywords, id: number) => {
        setSelectedKeywords(prev => ({
            ...prev,
            [category]: (prev[category] as number[]).filter(itemId => itemId !== id)
        }))
    }

    // 전체 삭제 핸들러 (상관없음 해제용)
    const handleRemoveAll = (category: keyof SelectedKeywords) => {
        setSelectedKeywords(prev => ({
            ...prev,
            [category]: []
        }))
    }

    // 통합된 토글 핸들러
    const toggleKeyword = (category: keyof SelectedKeywords, id: number) => {
        const currentArray = selectedKeywords[category] as number[]
        setSelectedKeywords(prev => ({
            ...prev,
            [category]: currentArray.includes(id)
                ? currentArray.filter(itemId => itemId !== id)
                : [...currentArray, id]
        }))
    }

    // 단일 선택 핸들러
    const handleSingleSelect = (category: keyof SelectedKeywords, id: number | null) => {
        setSelectedKeywords(prev => ({
            ...prev,
            [category]: id
        }))
    }

    // 지역이동 가능 토글
    const toggleMoveable = () => {
        if (moveableKeyword) {
            handleSingleSelect('moveable', 
                selectedKeywords.moveable === moveableKeyword.id ? null : moveableKeyword.id
            )
        }
    }

    // 키워드 저장
    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        try {
            // 선택된 키워드들 모으기
            const allSelectedKeywords = [
                selectedKeywords.location,
                selectedKeywords.moveable,
                ...selectedKeywords.countries,
                ...selectedKeywords.genders,
                ...selectedKeywords.ages,
                ...selectedKeywords.visas,
                ...selectedKeywords.jobs,
                ...selectedKeywords.conditions,
                ...selectedKeywords.workDays,
                selectedKeywords.koreanLevel
            ].filter(Boolean) // null 제거

            // API를 통해 키워드 업데이트
            const response = await api('PUT', '/api/company-keyword', {
                keywordIds: allSelectedKeywords
            })

            if (!response.success) {
                throw new Error(response.error)
            }

            router.push('/')

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
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
                <Back />
                <Text className="text-lg font-bold ml-4">사장님과 가장 적합한 인재 찾아줄께요</Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
            >
                {/* 지역 선택 */}
                <LocationSelector 
                    locationOptions={locationOptions} 
                    selectedLocation={selectedKeywords.location} 
                    setSelectedLocation={(id) => handleSingleSelect('location', id)} 
                />

                {/*<MoveableSelector */}
                {/*    moveableKeyword={moveableKeyword} */}
                {/*    selectedMoveable={selectedKeywords.moveable} */}
                {/*    toggleMoveable={toggleMoveable} */}
                {/*/>*/}

                {/* 직종 선택 */}
                <JobPreferencesSelector
                    jobs={jobKeywords}
                    selectedJobs={selectedKeywords.jobs}
                    onToggle={(id) => toggleKeyword('jobs', id)}
                    title="모집 직종"
                />

                {/* 국가 선택 */}
                <MultiSelectKeywordSelector
                    title="선호하는 국가"
                    placeholder="국가를 선택하세요"
                    keywords={countryKeywords}
                    selectedIds={selectedKeywords.countries}
                    onSelect={(item) => handleMultiSelect('countries', item)}
                    onRemove={(id) => handleRemove('countries', id)}
                    onRemoveAll={() => handleRemoveAll('countries')}
                    emptyText="선택된 국가가 없습니다"
                    enableSearch={true}
                />

                {/* 성별 선택 */}
                <MultiSelectKeywordSelector
                    title="선호하는 성별"
                    placeholder="성별을 선택하세요"
                    keywords={genderKeywords}
                    selectedIds={selectedKeywords.genders}
                    onSelect={(item) => handleMultiSelect('genders', item)}
                    onRemove={(id) => handleRemove('genders', id)}
                    onRemoveAll={() => handleRemoveAll('genders')}
                    emptyText="선택된 성별이 없습니다"
                />

                {/* 나이대 선택 */}
                <MultiSelectKeywordSelector
                    title="선호하는 나이대"
                    placeholder="나이대를 선택하세요"
                    keywords={ageKeywords}
                    selectedIds={selectedKeywords.ages}
                    onSelect={(item) => handleMultiSelect('ages', item)}
                    onRemove={(id) => handleRemove('ages', id)}
                    onRemoveAll={() => handleRemoveAll('ages')}
                    emptyText="선택된 나이대가 없습니다"
                />

                {/* 비자 선택 */}
                <MultiSelectKeywordSelector
                    title="선호하는 비자"
                    placeholder="비자를 선택하세요"
                    keywords={visaKeywords}
                    selectedIds={selectedKeywords.visas}
                    onSelect={(item) => handleMultiSelect('visas', item)}
                    onRemove={(id) => handleRemove('visas', id)}
                    onRemoveAll={() => handleRemoveAll('visas')}
                    emptyText="선택된 비자가 없습니다"
                />

                {/* 한국어 수준 선택 */}
                <KoreanLevelSelector
                    selectedKoreanLevel={selectedKeywords.koreanLevel}
                    handleKoreanLevelSelect={(id) => handleSingleSelect('koreanLevel', id)}
                    koreanLevelKeywords={koreanLevelKeywords}
                />



                {/* 근무요일 선택 */}
                <WorkDaySelector 
                    workDayKeywords={workDayKeywords} 
                    selectedWorkDays={selectedKeywords.workDays} 
                    toggleWorkDay={(id) => toggleKeyword('workDays', id)}
                    onNegotiableClick={() => {
                        // 협의가능 클릭시 전체 요일 선택
                        const allWorkDayIds = workDayKeywords.map(day => day.id)
                        setSelectedKeywords(prev => ({
                            ...prev,
                            workDays: allWorkDayIds
                        }))
                        setIsWorkDaysSelectLater(false)
                    }}
                    onSelectLaterClick={() => {
                        // 나중에 선택 클릭시 전체 해제하고 비활성화
                        setSelectedKeywords(prev => ({
                            ...prev,
                            workDays: []
                        }))
                        setIsWorkDaysSelectLater(true)
                    }}
                    isSelectLater={isWorkDaysSelectLater}
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

export default Keywords