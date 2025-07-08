import {View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useProfile} from "@/hooks/useProfile";
import {router} from "expo-router";
import { useModal } from '@/hooks/useModal'
import { supabase } from '@/lib/supabase'
import { Dropdown } from 'react-native-element-dropdown'
import { Ionicons } from '@expo/vector-icons'
import JobPreferencesSelector from '@/components/JobPreferencesSelector'
import WorkConditionsSelector from '@/components/WorkConditionsSelector'

interface Keyword {
    id: number;
    keyword: string;
    category: string;
}

const Register = () => {
    const { showModal, ModalComponent } = useModal()
    const { profile, updateProfile } = useProfile()
    const [companyName, setCompanyName] = useState('')
    const [address, setAddress] = useState('')
    const [description, setDescription] = useState('')

    // 키워드 관련 상태
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
    const [selectedMoveable, setSelectedMoveable] = useState<number | null>(null)
    const [selectedCountries, setSelectedCountries] = useState<number[]>([])
    const [selectedJobs, setSelectedJobs] = useState<number[]>([])
    const [selectedConditions, setSelectedConditions] = useState<number[]>([])

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

    // 국가 드롭다운 옵션 (상관없음 포함)
    const countryOptions = [
        { label: '상관없음', value: 'all' },
        ...countryKeywords.map(country => ({
            label: country.keyword,
            value: country.id
        }))
    ]

    // 프로필 정보 로드
    useEffect(() => {
        if (profile) {
            setCompanyName(profile.name || '')
            setAddress(profile.address || '')
            setDescription(profile.description || '')
        }
    }, [profile])

    // 키워드 데이터 로드
    useEffect(() => {
        fetchKeywords()
    }, [])

    // 기존 useEffect들 아래에 추가
    useEffect(() => {
        if (profile?.id && keywords.length > 0) {
            fetchCompanyKeywords()
        }
    }, [profile?.id, keywords.length])

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
        } finally {
            setLoading(false)
        }
    }

    // fetchKeywords 함수 아래에 추가
    const fetchCompanyKeywords = async () => {
        if (!profile?.id) return

        try {
            const { data, error } = await supabase
                .from('company_keyword')
                .select('keyword_id')
                .eq('company_id', profile.id)

            if (error) throw error

            if (data && keywords.length > 0) {
                const keywordIds = data.map(ck => ck.keyword_id)

                // 지역
                const location = keywords.find(k =>
                    k.category === '지역' && keywordIds.includes(k.id)
                )
                if (location) setSelectedLocation(location.id)

                // 지역이동
                if (moveableKeyword && keywordIds.includes(moveableKeyword.id)) {
                    setSelectedMoveable(moveableKeyword.id)
                }

                // 국가
                const countries = keywords
                    .filter(k => k.category === '국가' && keywordIds.includes(k.id))
                    .map(k => k.id)
                setSelectedCountries(countries)

                // 직종
                const jobs = keywords
                    .filter(k => k.category === '직종' && keywordIds.includes(k.id))
                    .map(k => k.id)
                setSelectedJobs(jobs)

                // 근무조건
                const conditions = keywords
                    .filter(k => k.category === '근무조건' && keywordIds.includes(k.id))
                    .map(k => k.id)
                setSelectedConditions(conditions)
            }
        } catch (error) {
            console.error('회사 키워드 조회 실패:', error)
        }
    }

    // 국가 선택 처리
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

    // 국가 제거
    const removeCountry = (countryId: number) => {
        setSelectedCountries(prev => prev.filter(id => id !== countryId))
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

    const handleSave = async () => {
        if(!companyName || !address) {
            showModal('알림', '필수 정보를 모두 입력해주세요', "info")
            return
        }


        try {
            // 1. 프로필 업데이트
            const result = await updateProfile({
                profile: {
                    name: companyName,
                    address: address,
                    onboarding_completed: true
                }
            })

            if(!result) {
                console.log('프로필 업데이트 실패', result);
                return
            }

            router.push('/(pages)/(company)/keywords')

        } catch (error) {
            console.error('저장 실패:', error)
            showModal('오류', '저장 중 문제가 발생했습니다.', 'warning')
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
        <SafeAreaView className="flex-1">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="flex-1 justify-start p-6">
                    {/* 회사 정보 섹션 */}
                    <Text className="text-xl font-bold mb-4">회사 정보</Text>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">회사명 *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="회사명을 입력하세요"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                    </View>

                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">주소 *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="예: 서울시 강남구"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-blue-500 py-4 rounded-xl items-center mx-4 my-2"
                >
                    <Text className="text-center text-white font-bold text-lg">
                        회사 정보 입력
                    </Text>
                </TouchableOpacity>
            </View>

            <ModalComponent />
        </SafeAreaView>
    )
}

export default Register