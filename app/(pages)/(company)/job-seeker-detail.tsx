// app/(pages)/(company)/job-seeker-detail.tsx
import {View, Text, ScrollView, TouchableOpacity, TextInput} from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {router, useLocalSearchParams} from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/hooks/useModal'
import Clipboard from '@react-native-clipboard/clipboard'
import LoadingScreen from "@/components/common/LoadingScreen";
import {Info} from "@/components/job-seeker-detail/Info";
import {UserKeywords} from "@/components/job-seeker-detail/UserKeywords";
import {useAuth} from "@/contexts/AuthContext";
import {api} from "@/lib/api";

interface UserInfo {
    age?: number
    gender?: string
    visa?: string
    korean_level?: string
}

interface UserKeyword {
    keyword_id: number
    keyword: {
        id: number
        keyword: string
        category: string
    }
}

interface JobSeekerDetail {
    id: string
    name: string
    phone_number: string
    job_seeking_active: boolean
    created_at: string
    user_info?: UserInfo
    user_keywords?: UserKeyword[]
}

interface GroupedKeywords {
    location: string[]
    moveable: boolean
    country: string[]
    jobs: string[]
    conditions: string[]
    gender?: string[]
    age?: string[]
    visa?: string[]
    workDays?: string[]
    koreanLevel?: string[]
}

export default function JobSeekerDetail() {
    const params = useLocalSearchParams()
    const { userId } = params
    const { showModal, ModalComponent } = useModal()
    const { user } = useAuth()

    const [jobSeeker, setJobSeeker] = useState<JobSeekerDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [groupedKeywords, setGroupedKeywords] = useState<GroupedKeywords>({
        location: [],
        moveable: false,
        country: [],
        jobs: [],
        conditions: [],
        gender: [],
        age: [],
        visa: [],
        workDays: [],
        koreanLevel: []
    })

    const [showLocationModal, setShowLocationModal] = useState(false)
    const [interviewLocation, setInterviewLocation] = useState('')
    const [selectedJobPostingId, setSelectedJobPostingId] = useState<string>('')
    const [companyJobPostings, setCompanyJobPostings] = useState<any[]>([])
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (userId) {
            fetchJobSeekerDetail()
        }
    }, [userId])

    // 회사의 공고 목록 가져오기
    useEffect(() => {
        if (user?.userId) {
            fetchCompanyJobPostings()
        }
    }, [user?.userId])

    const fetchCompanyJobPostings = async () => {
        try {
            const { data, error } = await supabase
                .from('job_postings')
                .select('id, title')
                .eq('company_id', user?.userId)
                .eq('is_active', true)
                .is('deleted_at', null)

            if (error) throw error
            setCompanyJobPostings(data || [])
        } catch (error) {
            console.error('공고 조회 실패:', error)
        }
    }

    const fetchJobSeekerDetail = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    user_info!user_info_user_id_fkey (
                        age,
                        gender,
                        visa,
                        korean_level
                    ),
                    user_keywords:user_keyword (
                        keyword_id,
                        keyword:keyword_id (
                            id,
                            keyword,
                            category
                        )
                    )
                `)
                .eq('id', userId)
                .single()

            if (error) throw error

            if (data) {
                setJobSeeker(data as JobSeekerDetail)

                // 키워드 분류
                if (data.user_keywords) {
                    const keywords = data.user_keywords as UserKeyword[]
                    const grouped: GroupedKeywords = {
                        location: [],
                        moveable: false,
                        country: [],
                        jobs: [],
                        conditions: [],
                        gender: [],
                        age: [],
                        visa: [],
                        workDays: [],
                        koreanLevel: []
                    }

                    keywords.forEach(uk => {
                        if (uk.keyword) {
                            switch (uk.keyword.category) {
                                case '지역':
                                    grouped.location.push(uk.keyword.keyword)
                                    break
                                case '지역이동':
                                    grouped.moveable = true
                                    break
                                case '국가':
                                    grouped.country.push(uk.keyword.keyword)
                                    break
                                case '직종':
                                    grouped.jobs.push(uk.keyword.keyword)
                                    break
                                case '근무조건':
                                    grouped.conditions.push(uk.keyword.keyword)
                                    break
                                case '성별':
                                    grouped.conditions.push(uk.keyword.keyword)
                                    break
                                case '나이대':
                                    grouped.conditions.push(uk.keyword.keyword)
                                    break
                                case '비자':
                                    grouped.conditions.push(uk.keyword.keyword)
                                    break
                                case '근무요일':
                                    grouped.workDays!.push(uk.keyword.keyword)
                                    break
                                case '한국어수준':
                                    grouped.koreanLevel!.push(uk.keyword.keyword)
                                    break
                            }
                        }
                    })

                    setGroupedKeywords(grouped)
                }
            }
        } catch (error) {
            console.error('구직자 정보 조회 실패:', error)
            showModal('오류', '구직자 정보를 불러오는데 실패했습니다.', 'warning')
        } finally {
            setLoading(false)
        }
    }


    // handleInterviewProposal 함수의 try-catch 부분 수정

    const handleInterviewProposal = async () => {
        if (!selectedJobPostingId) {
            showModal('알림', '면접 제안할 공고를 선택해주세요.')
            return
        }

        if (!interviewLocation.trim()) {
            showModal('알림', '면접 장소를 입력해주세요.')
            return
        }

        setSubmitting(true)
        try {
            // 1. 먼저 초대형 지원서 생성
            const { data: application, error: appError } = await supabase
                .from('applications')
                .insert({
                    user_id: userId,
                    company_id: user?.userId,
                    job_posting_id: selectedJobPostingId,
                    type: 'company_invited',
                    status: 'invited'
                })
                .select()
                .single()

            if (appError) {
                // 중복 키 에러 체크
                if (appError.code === '23505' && appError.message.includes('unique_user_job_posting_application')) {
                    showModal('알림', '해당 구직자는 이미 이 공고에 지원했습니다.')
                    setShowLocationModal(false)
                    return
                }
                throw appError
            }

            // 2. 면접 제안 생성
            const response = await api('POST', '/api/interview-proposals/company', {
                applicationId: application.id,
                companyId: user?.userId,
                location: interviewLocation.trim()
            })

            if (response?.success) {
                showModal('성공', '면접 제안이 전송되었습니다.', 'info')
                setShowLocationModal(false)
                setInterviewLocation('')

                // 공고 상세 페이지로 이동
                router.push({
                    pathname: '/(pages)/(company)/posting-detail2',
                    params: {
                        postingId: selectedJobPostingId,
                        refresh: 'true'
                    }
                })
            }
        } catch (error) {
            console.error('면접 제안 실패:', error)
            showModal('오류', '면접 제안에 실패했습니다.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <LoadingScreen />
        )
    }

    if (!jobSeeker) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center p-4 border-b border-gray-200">
                    <Back />
                </View>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500">구직자 정보를 찾을 수 없습니다.</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">구직자 상세 정보</Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 기본 정보 */}
                <Info jobSeeker={jobSeeker} />

                <UserKeywords groupedKeywords={groupedKeywords} />
                
                
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={() => setShowLocationModal(true)}
                    className="bg-blue-500 py-4 rounded-xl"
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="calendar" size={20} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">면접 제안하기</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* 면접 장소 입력 모달 */}
            {showLocationModal && (
                <View className="absolute inset-0 bg-black/50 flex-1 justify-center items-center p-4">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-xl font-bold mb-4">면접 제안하기</Text>

                        {/* 공고 선택 */}
                        <Text className="text-base font-semibold mb-2">공고 선택</Text>
                        {companyJobPostings.length === 0 ? (
                            <Text className="text-gray-500 text-sm mb-4">
                                활성화된 공고가 없습니다.
                            </Text>
                        ) : (
                            <ScrollView
                                className="max-h-40 mb-4 border border-gray-200 rounded-lg"
                                showsVerticalScrollIndicator={true}
                            >
                                {companyJobPostings.map((posting) => (
                                    <TouchableOpacity
                                        key={posting.id}
                                        onPress={() => setSelectedJobPostingId(posting.id)}
                                        className={`p-3 border-b border-gray-100 ${
                                            selectedJobPostingId === posting.id ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <Text className={
                                            selectedJobPostingId === posting.id
                                                ? 'text-blue-600 font-medium'
                                                : 'text-gray-700'
                                        }>
                                            {posting.title}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {/* 면접 장소 입력 */}
                        <Text className="text-base font-semibold mb-2">면접 장소</Text>
                        <TextInput
                            value={interviewLocation}
                            onChangeText={setInterviewLocation}
                            placeholder="예: 서울시 강남구 테헤란로 123 5층"
                            className="border border-gray-300 rounded-lg px-4 py-3 mb-6"
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />

                        {/* 버튼들 */}
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setShowLocationModal(false)
                                    setInterviewLocation('')
                                    setSelectedJobPostingId('')
                                }}
                                className="flex-1 py-3 border border-gray-300 rounded-lg"
                            >
                                <Text className="text-center text-gray-700 font-medium">취소</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleInterviewProposal}
                                disabled={submitting || !selectedJobPostingId || !interviewLocation.trim()}
                                className={`flex-1 py-3 rounded-lg ${
                                    submitting || !selectedJobPostingId || !interviewLocation.trim()
                                        ? 'bg-gray-300'
                                        : 'bg-blue-500'
                                }`}
                            >
                                <Text className="text-center text-white font-medium">
                                    {submitting ? '처리중...' : '제안하기'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}

            <ModalComponent />
        </SafeAreaView>
    )
}