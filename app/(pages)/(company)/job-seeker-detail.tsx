// app/(pages)/(company)/job-seeker-detail.tsx
import {View, Text, ScrollView, TouchableOpacity} from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {router, useLocalSearchParams} from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/hooks/useModal'
import LoadingScreen from "@/components/common/LoadingScreen";
import {Info} from "@/components/job-seeker-detail/Info";
import {UserKeywords} from "@/components/job-seeker-detail/UserKeywords";

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


    useEffect(() => {
        if (userId) {
            fetchJobSeekerDetail()
        }
    }, [userId])


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
                    onPress={() => {
                        router.push({
                            pathname: '/(pages)/(company)/interview-request',
                            params: {
                                userId: userId
                            }
                        })
                    }}
                    className="bg-blue-500 py-4 rounded-xl mx-4 my-2"
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="calendar" size={20} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">면접 제안하기</Text>
                    </View>
                </TouchableOpacity>
            </View>


            <ModalComponent />
        </SafeAreaView>
    )
}