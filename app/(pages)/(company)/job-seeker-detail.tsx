// app/(pages)/(company)/job-seeker-detail.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/hooks/useModal'
import Clipboard from '@react-native-clipboard/clipboard'

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
        visa: []
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
                        visa: []
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

    const handleCopyPhone = () => {
        if (jobSeeker?.phone_number) {
            Clipboard.setString(jobSeeker.phone_number)
            showModal(
                '복사 완료',
                `${jobSeeker.name}님의 전화번호가 복사되었습니다.\n${jobSeeker.phone_number}`,
                'info'
            )
        }
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </SafeAreaView>
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
                <View className="p-6 border-b border-gray-100">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-2xl font-bold text-gray-800">
                                {jobSeeker.name || '이름 미등록'}
                            </Text>
                            <View className="flex-row items-center mt-2">
                                <View className={`px-2 py-1 rounded-full ${
                                    jobSeeker.job_seeking_active ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                    <Text className={`text-xs font-medium ${
                                        jobSeeker.job_seeking_active ? 'text-green-600' : 'text-gray-600'
                                    }`}>
                                        {jobSeeker.job_seeking_active ? '구직중' : '구직중지'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleCopyPhone}
                            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
                        >
                            <Ionicons name="call" size={16} color="white" />
                            <Text className="text-white font-medium ml-2">전화번호 복사</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 기본 정보 그리드 */}
                    <View className="flex-row flex-wrap gap-4 mt-4">
                        {jobSeeker.user_info?.age && (
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                    <Ionicons name="person-outline" size={16} color="#3b82f6" />
                                </View>
                                <View className="ml-2">
                                    <Text className="text-xs text-gray-500">나이</Text>
                                    <Text className="text-sm font-medium">{jobSeeker.user_info.age}세</Text>
                                </View>
                            </View>
                        )}

                        {jobSeeker.user_info?.gender && (
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                                    <Ionicons name="male-female-outline" size={16} color="#9333ea" />
                                </View>
                                <View className="ml-2">
                                    <Text className="text-xs text-gray-500">성별</Text>
                                    <Text className="text-sm font-medium">{jobSeeker.user_info.gender}</Text>
                                </View>
                            </View>
                        )}

                        {jobSeeker.user_info?.visa && (
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                                    <Ionicons name="document-text-outline" size={16} color="#16a34a" />
                                </View>
                                <View className="ml-2">
                                    <Text className="text-xs text-gray-500">비자</Text>
                                    <Text className="text-sm font-medium">{jobSeeker.user_info.visa}</Text>
                                </View>
                            </View>
                        )}

                        {jobSeeker.user_info?.korean_level && (
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
                                    <Ionicons name="language-outline" size={16} color="#ea580c" />
                                </View>
                                <View className="ml-2">
                                    <Text className="text-xs text-gray-500">한국어</Text>
                                    <Text className="text-sm font-medium">{jobSeeker.user_info.korean_level}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </View>

                {/* 희망 근무지역 */}
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">희망 근무지역</Text>

                    {groupedKeywords.location.length > 0 ? (
                        <View className="space-y-2">
                            <View className="flex-row flex-wrap gap-2">
                                {groupedKeywords.location.map((location, index) => (
                                    <View key={index} className="bg-blue-100 px-3 py-2 rounded-full">
                                        <Text className="text-blue-700 font-medium">{location}</Text>
                                    </View>
                                ))}
                            </View>

                            {groupedKeywords.moveable && (
                                <View className="flex-row items-center mt-2">
                                    <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                                    <Text className="text-green-600 ml-2 font-medium">지역이동 가능</Text>
                                </View>
                            )}
                        </View>
                    ) : (
                        <Text className="text-gray-500">등록된 지역이 없습니다</Text>
                    )}
                </View>

                {/* 국가 */}
                {groupedKeywords.country.length > 0 && (
                    <View className="p-6 border-b border-gray-100">
                        <Text className="text-lg font-semibold mb-4">국가</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {groupedKeywords.country.map((country, index) => (
                                <View key={index} className="bg-purple-100 px-3 py-2 rounded-full">
                                    <Text className="text-purple-700 font-medium">{country}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 희망 직종 */}
                {groupedKeywords.jobs.length > 0 && (
                    <View className="p-6 border-b border-gray-100">
                        <Text className="text-lg font-semibold mb-4">희망 직종</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {groupedKeywords.jobs.map((job, index) => (
                                <View key={index} className="bg-orange-100 px-3 py-2 rounded-full">
                                    <Text className="text-orange-700 font-medium">{job}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 원하는 혜택 */}
                {groupedKeywords.conditions.length > 0 && (
                    <View className="p-6">
                        <Text className="text-lg font-semibold mb-4">원하는 혜택</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {groupedKeywords.conditions.map((condition, index) => (
                                <View key={index} className="bg-green-100 px-3 py-2 rounded-full">
                                    <Text className="text-green-700 font-medium">{condition}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* 연락처 정보 */}
                <View className="mx-6 mb-6 p-4 bg-gray-50 rounded-xl">
                    <View className="flex-row items-center">
                        <Ionicons name="information-circle" size={20} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2">
                            전화번호: {jobSeeker.phone_number}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleCopyPhone}
                    className="bg-blue-500 py-4 rounded-xl"
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons name="call" size={20} color="white" />
                        <Text className="text-white font-bold text-lg ml-2">연락하기</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ModalComponent />
        </SafeAreaView>
    )
}