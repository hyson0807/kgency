// app/(pages)/(user)/posting-detail.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { useMatchedJobPostings } from '@/hooks/useMatchedJobPostings'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export default function PostingDetail() {
    const params = useLocalSearchParams()
    const { postingId, companyId, companyName } = params
    const { fetchPostingById, getPostingKeywords } = useMatchedJobPostings()
    const { user } = useAuth()

    const [posting, setPosting] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [hasApplied, setHasApplied] = useState(false)

    useEffect(() => {
        loadPostingDetail()
        checkApplicationStatus()
    }, [postingId])

    const loadPostingDetail = async () => {
        if (!postingId) return

        setLoading(true)
        try {
            const data = await fetchPostingById(postingId as string)
            if (data) {
                setPosting(data)
            }
        } catch (error) {
            console.error('공고 상세 로드 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const checkApplicationStatus = async () => {
        if (!user || !postingId) return

        try {
            const { data, error } = await supabase
                .from('applications')
                .select('id')
                .eq('user_id', user.userId)
                .eq('job_posting_id', postingId)
                .maybeSingle()

            if (!error && data) {
                setHasApplied(true)
            }
        } catch (error) {
            console.error('지원 상태 확인 실패:', error)
        }
    }

    const handleApply = () => {
        router.push({
            pathname: '/(pages)/(user)/apply',
            params: {
                jobPostingId: postingId,
                companyId: posting?.company.id || companyId,
                companyName: posting?.company.name || companyName,
                jobTitle: posting?.title
            }
        })
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

    if (!posting) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center p-4 border-b border-gray-200">
                    <Back />
                </View>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500">공고를 찾을 수 없습니다.</Text>
                </View>
            </SafeAreaView>
        )
    }

    const keywords = getPostingKeywords(posting)

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">채용 상세</Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 회사 정보 */}
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-sm text-gray-600 mb-1">{posting.company.name}</Text>
                    <Text className="text-2xl font-bold mb-3">{posting.title}</Text>

                    {posting.company.address && (
                        <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={16} color="#6b7280" />
                            <Text className="text-gray-600 ml-2">{posting.company.address}</Text>
                        </View>
                    )}
                </View>



                {/* 회사 소개 */}
                {posting.company.description && (
                    <View className="p-6 border-b border-gray-100">
                        <Text className="text-lg font-semibold mb-4">회사 소개</Text>
                        <Text className="text-gray-700 leading-6">{posting.company.description}</Text>
                    </View>
                )}

                {/* 주요 정보 */}
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">근무 조건</Text>

                    {/* 근무지역 */}
                    {keywords.location && keywords.location.length > 0 && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="location" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">근무지역</Text>
                                <Text className="text-base text-gray-800">
                                    {keywords.location.map(k => k.keyword).join(', ')}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 근무일 */}
                    {posting.working_days && posting.working_days.length > 0 && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">근무일</Text>
                                <Text className="text-base text-gray-800">
                                    {posting.working_days.join(', ')}
                                    {posting.working_days_negotiable && ' (협의가능)'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 근무시간 */}
                    {posting.working_hours && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="time-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">근무시간</Text>
                                <Text className="text-base text-gray-800">
                                    {posting.working_hours}
                                    {posting.working_hours_negotiable && ' (협의가능)'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 급여타입 & 급여 */}
                    {(posting.salary_type || posting.salary_range) && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="cash-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">급여</Text>
                                <Text className="text-base text-gray-800">
                                    {posting.salary_type && `${posting.salary_type} `}
                                    {posting.salary_range}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 급여일 */}
                    {posting.pay_day && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="wallet-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">급여일</Text>
                                <Text className="text-base text-gray-800">
                                    {posting.pay_day}
                                    {posting.pay_day_negotiable && ' (협의가능)'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {posting.hiring_count && (
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="people-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">모집인원</Text>
                                <Text className="text-base text-gray-800">{posting.hiring_count}명</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* 상세 설명 */}
                {posting.description && (
                    <View className="p-6 border-b border-gray-100">
                        <Text className="text-lg font-semibold mb-4">상세 설명</Text>
                        <Text className="text-gray-700 leading-6">{posting.description}</Text>
                    </View>
                )}



                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">회사의 강점!</Text>

                {keywords.conditions.length > 0 && (
                    <View className="mb-4">
                        <View className="flex-row flex-wrap gap-2">
                            {keywords.conditions.map((keyword) => (
                                <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full">
                                    <Text className="text-orange-700 text-sm">{keyword.keyword}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
                </View>







                {/* 채용 분야 */}
                {keywords && (
                    <View className="p-6">
                        <Text className="text-lg font-semibold mb-4">채용 분야</Text>

                        {keywords.countries.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-600 font-medium mb-2">대상 국가</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {keywords.countries.map((keyword) => (
                                        <View key={keyword.id} className="bg-purple-100 px-3 py-1 rounded-full">
                                            <Text className="text-purple-700 text-sm">{keyword.keyword}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {keywords.jobs.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-600 font-medium mb-2">모집 직종</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {keywords.jobs.map((keyword) => (
                                        <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full">
                                            <Text className="text-orange-700 text-sm">{keyword.keyword}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}


                    </View>
                )}
            </ScrollView>

            {/* 하단 지원 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-8 pt-2" >
                {hasApplied ? (
                    <View className="bg-gray-300 py-4 rounded-xl items-center">
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="#4b5563" />
                            <Text className="text-gray-700 font-bold text-lg ml-2">이미 지원한 공고</Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        className="bg-blue-500 py-4 rounded-xl items-center mx-4 my-2"
                        onPress={handleApply}
                    >
                        <Text className="text-white text-lg font-bold">지원하기</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    )
}