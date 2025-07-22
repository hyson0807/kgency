import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from '@/lib/supabase'
import { router } from 'expo-router'
import Back from '@/components/back'
import JobPreferencesSelector from '@/components/JobPreferencesSelector'
import {useModal} from "@/hooks/useModal";
import {LocationSelector} from "@/components/company_keyword(keywords)/Location";
import {MoveableSelector} from "@/components/company_keyword(keywords)/MoveableSelector";
import {CountrySelector} from "@/components/company_keyword(keywords)/CountrySelector";
import {GenderSelector} from "@/components/company_keyword(keywords)/GenderSelector";
import {AgeSelector} from "@/components/company_keyword(keywords)/AgeSelector";
import {VisaSelector} from "@/components/company_keyword(keywords)/VisaSelector";
import {KoreanLevelSelector} from "@/components/company_keyword(keywords)/KoreanLevelSelector";
import {WorkDaySelector} from "@/components/company_keyword(keywords)/WorkDaySelector";

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
    const [selectedWorkDays, setSelectedWorkDays] = useState<number[]>([])
    const [selectedKoreanLevel, setSelectedKoreanLevel] = useState<number | null>(null)

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

            // 근무요일
            const workDays = keywords
                .filter(k => k.category === '근무요일' && companyKeywords.includes(k.id))
                .map(k => k.id)
            setSelectedWorkDays(workDays)

            // 한국어수준
            const koreanLevel = keywords.find(k =>
                k.category === '한국어수준' && companyKeywords.includes(k.id)
            )
            if (koreanLevel) setSelectedKoreanLevel(koreanLevel.id)
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



    // 근무요일 선택/해제
    const toggleWorkDay = (dayId: number) => {
        setSelectedWorkDays(prev =>
            prev.includes(dayId)
                ? prev.filter(id => id !== dayId)
                : [...prev, dayId]
        )
    }

    // 한국어 수준 선택
    const handleKoreanLevelSelect = (levelId: number) => {
        setSelectedKoreanLevel(levelId)
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
                ...selectedConditions,
                ...selectedWorkDays,
                selectedKoreanLevel
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
                <Text className="text-lg font-bold ml-4">대표 키워드 설정</Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingBottom: 120 }}
            >
                {/* 지역 선택 */}
                <LocationSelector locationOptions={locationOptions} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} />

                <MoveableSelector moveableKeyword={moveableKeyword} selectedMoveable={selectedMoveable} toggleMoveable={toggleMoveable} />

                {/* 국가 선택 */}
                <CountrySelector  selectedCountries={selectedCountries} handleCountrySelect={handleCountrySelect} countryKeywords={countryKeywords} removeCountry={removeCountry} />

                {/* 성별 선택 */}
                <GenderSelector selectedGenders={selectedGenders} handleGenderSelect={handleGenderSelect} genderKeywords={genderKeywords} removeGender={removeGender} />

                {/* 나이대 선택 */}
                <AgeSelector selectedAges={selectedAges} handleAgeSelect={handleAgeSelect} ageKeywords={ageKeywords} removeAge={removeAge} />

                {/* 비자 선택 */}
                <VisaSelector selectedVisas={selectedVisas} handleVisaSelect={handleVisaSelect} visaKeywords={visaKeywords} removeVisa={removeVisa} />

                {/* 직종 선택 */}
                <JobPreferencesSelector jobs={jobKeywords} selectedJobs={selectedJobs} onToggle={toggleJob} title="모집 직종"/>

                {/* 근무요일 선택 */}
                <WorkDaySelector workDayKeywords={workDayKeywords} selectedWorkDays={selectedWorkDays} toggleWorkDay={toggleWorkDay} />

                {/* 한국어 수준 선택 */}
                <KoreanLevelSelector selectedKoreanLevel={selectedKoreanLevel} handleKoreanLevelSelect={handleKoreanLevelSelect} koreanLevelKeywords={koreanLevelKeywords} />


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