import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'

interface UserKeyword {
    keyword: {
        id: number
        keyword: string
        category: string
    }
}

interface JobSeeker {
    id: string
    name: string
    phone_number: string
    job_seeking_active: boolean
    created_at: string
    user_info?: {
        age?: number
        gender?: string
        visa?: string
        korean_level?: string
    }
    user_keywords?: UserKeyword[]
}

interface MatchedJobSeeker {
    user: JobSeeker
    matchedCount: number
    matchedKeywords: string[]
}

const Home = () => {
    const { user } = useAuth()
    const [matchedJobSeekers, setMatchedJobSeekers] = useState<MatchedJobSeeker[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [companyKeywordIds, setCompanyKeywordIds] = useState<number[]>([])

    useEffect(() => {
        if (user) {
            fetchCompanyKeywords()
        }
    }, [user])

    useEffect(() => {
        if (companyKeywordIds.length >= 0) {
            fetchJobSeekers()
        }
    }, [companyKeywordIds])

    // 회사의 키워드 가져오기
    const fetchCompanyKeywords = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('company_keyword')
                .select('keyword_id')
                .eq('company_id', user.userId)

            if (error) throw error

            if (data) {
                setCompanyKeywordIds(data.map(ck => ck.keyword_id))
            }
        } catch (error) {
            console.error('회사 키워드 조회 실패:', error)
        }
    }

    // 활성화된 구직자 목록 가져오기
    const fetchJobSeekers = async () => {
        try {
            const { data: jobSeekers, error } = await supabase
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
                        keyword:keyword_id (
                            id,
                            keyword,
                            category
                        )
                    )
                `)
                .eq('user_type', 'user')
                .eq('job_seeking_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error

            if (jobSeekers) {
                // 매칭 점수 계산
                const matched = jobSeekers.map(jobSeeker => {
                    const userKeywordIds = jobSeeker.user_keywords?.map(
                        (uk: any) => uk.keyword.id
                    ) || []

                    // 매칭된 키워드 찾기
                    const matchedKeywordIds = companyKeywordIds.filter(ckId =>
                        userKeywordIds.includes(ckId)
                    )

                    // 매칭된 키워드 텍스트 가져오기
                    const matchedKeywords = jobSeeker.user_keywords
                        ?.filter((uk: any) => matchedKeywordIds.includes(uk.keyword.id))
                        .map((uk: any) => uk.keyword.keyword) || []

                    return {
                        user: jobSeeker as JobSeeker,
                        matchedCount: matchedKeywordIds.length,
                        matchedKeywords
                    }
                })

                // 매칭 점수 높은 순으로 정렬
                matched.sort((a, b) => b.matchedCount - a.matchedCount)
                setMatchedJobSeekers(matched)
            }
        } catch (error) {
            console.error('구직자 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await Promise.all([
            fetchCompanyKeywords(),
            fetchJobSeekers()
        ])
        setRefreshing(false)
    }, [user])

    const handleJobSeekerPress = (jobSeeker: JobSeeker) => {
        // TODO: 구직자 상세 페이지로 이동 또는 모달 열기
        console.log('구직자 선택:', jobSeeker.name)
    }

    const renderJobSeeker = ({ item }: { item: MatchedJobSeeker }) => {
        const { user: jobSeeker, matchedCount, matchedKeywords } = item
        const hasMatches = matchedCount > 0

        // 모든 키워드를 한 줄로
        const allKeywords = jobSeeker.user_keywords?.map(uk => uk.keyword.keyword).join(', ') || ''

        return (
            <TouchableOpacity
                onPress={() => handleJobSeekerPress(jobSeeker)}
                className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm"
                activeOpacity={0.7}
            >
                {/* 매칭 뱃지 */}
                {hasMatches && (
                    <View className="absolute top-4 right-4 bg-blue-500 px-3 py-1 rounded-full">
                        <Text className="text-white text-xs font-medium">매칭 {matchedCount}개</Text>
                    </View>
                )}

                {/* 기본 정보 */}
                <View className="mb-3">
                    <Text className="text-lg font-bold text-gray-800 pr-20">
                        {jobSeeker.name || '이름 미등록'}
                    </Text>

                    <View className="flex-row flex-wrap gap-3 mt-2">
                        {jobSeeker.user_info?.age && (
                            <View className="flex-row items-center">
                                <Ionicons name="person-outline" size={14} color="#6b7280" />
                                <Text className="text-sm text-gray-600 ml-1">
                                    {jobSeeker.user_info.age}세
                                </Text>
                            </View>
                        )}

                        {jobSeeker.user_info?.gender && (
                            <Text className="text-sm text-gray-600">
                                {jobSeeker.user_info.gender}
                            </Text>
                        )}

                        {jobSeeker.user_info?.visa && (
                            <View className="flex-row items-center">
                                <Ionicons name="document-text-outline" size={14} color="#6b7280" />
                                <Text className="text-sm text-gray-600 ml-1">
                                    {jobSeeker.user_info.visa}
                                </Text>
                            </View>
                        )}

                        {jobSeeker.user_info?.korean_level && (
                            <View className="flex-row items-center">
                                <Ionicons name="language-outline" size={14} color="#6b7280" />
                                <Text className="text-sm text-gray-600 ml-1">
                                    한국어 {jobSeeker.user_info.korean_level}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* 키워드 표시 */}
                <View className="border-t border-gray-100 pt-3">
                    {allKeywords ? (
                        <>
                            <Text className="text-sm text-gray-500 mb-1">희망 조건</Text>
                            <Text className="text-sm text-gray-700" numberOfLines={2}>
                                {allKeywords}
                            </Text>

                            {hasMatches && (
                                <View className="mt-2 bg-blue-50 p-2 rounded-lg">
                                    <Text className="text-xs text-blue-600">
                                        매칭 키워드: {matchedKeywords.join(', ')}
                                    </Text>
                                </View>
                            )}
                        </>
                    ) : (
                        <Text className="text-sm text-gray-500">
                            등록된 키워드가 없습니다
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        )
    }

    const renderHeader = () => (
        <View className="bg-white p-4 mb-2">
            <Text className="text-lg font-bold text-gray-800">구직자 목록</Text>
            <Text className="text-sm text-gray-600 mt-1">
                총 {matchedJobSeekers.length}명의 구직자
            </Text>
        </View>
    )

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-600 mt-2">로딩 중...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-2xl font-bold">홈</Text>
            </View>

            <FlatList
                data={matchedJobSeekers}
                keyExtractor={(item) => item.user.id}
                renderItem={renderJobSeeker}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3b82f6']}
                        tintColor="#3b82f6"
                    />
                }
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-8 mt-20">
                        <Ionicons name="people-outline" size={80} color="#9ca3af" />
                        <Text className="text-gray-500 text-lg mt-4 text-center">
                            현재 구직 중인 지원자가 없습니다
                        </Text>
                        <Text className="text-gray-400 text-sm mt-2 text-center">
                            지원자들이 구직공고를 활성화하면{'\n'}여기에 표시됩니다
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    )
}

export default Home