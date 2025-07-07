import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { router } from "expo-router"
import Header_home from "@/components/Header_home"
import { supabase } from "@/lib/supabase"
import { Ionicons } from '@expo/vector-icons'
import {useTranslation} from "@/contexts/TranslationContext";

interface JobPosting {
    id: string
    title: string
    description?: string
    salary_range?: string
    working_hours?: string
    benefits?: string[]
    hiring_count: number
    created_at: string
    company: {
        id: string
        name: string
        address?: string
        description?: string
    }
    job_posting_keywords?: {
        keyword: {
            id: number
            keyword: string
            category: string
        }
    }[]
}

interface MatchedPosting {
    posting: JobPosting
    matchedCount: number
    matchedKeywords: {
        countries: string[]
        jobs: string[]
        conditions: string[]
        location: string[]
        moveable: string[]
    }
}

const Home = () => {
    const { t, translateDB } = useTranslation();
    const { user } = useAuth()
    const [matchedPostings, setMatchedPostings] = useState<MatchedPosting[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [appliedPostings, setAppliedPostings] = useState<string[]>([])
    const [userKeywordIds, setUserKeywordIds] = useState<number[]>([])

    useEffect(() => {
        if (user) {
            fetchUserKeywords()
            fetchAppliedPostings()
        }
    }, [user])

    useEffect(() => {
        if (userKeywordIds.length > 0) {
            fetchMatchedPostings()
        }
    }, [userKeywordIds])

    const fetchUserKeywords = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('user_keyword')
                .select('keyword_id')
                .eq('user_id', user.userId)

            if (error) throw error

            if (data) {
                setUserKeywordIds(data.map(uk => uk.keyword_id))
            }
        } catch (error) {
            console.error('사용자 키워드 조회 실패:', error)
        }
    }

    const fetchAppliedPostings = async () => {
        if (!user) return

        try {
            const { data, error } = await supabase
                .from('applications')
                .select('job_posting_id')
                .eq('user_id', user.userId)

            if (error) throw error

            if (data) {
                const postingIds = data.map(app => app.job_posting_id).filter(Boolean)
                setAppliedPostings(postingIds)
            }
        } catch (error) {
            console.error('지원 내역 조회 실패:', error)
        }
    }

    const fetchMatchedPostings = async () => {
        try {
            // 모든 활성 공고 가져오기
            const { data: postings, error } = await supabase
                .from('job_postings')
                .select(`
                    *,
                    company:company_id (
                        id,
                        name,
                        address,
                        description
                    ),
                    job_posting_keywords:job_posting_keyword (
                        keyword:keyword_id (
                            id,
                            keyword,
                            category
                        )
                    )
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false })

            if (error) throw error

            if (postings) {
                // 매칭 점수 계산
                const matched = postings.map(posting => {
                    const postingKeywordIds = posting.job_posting_keywords?.map(
                        (jpk: any) => jpk.keyword.id
                    ) || []

                    // 매칭된 키워드 찾기
                    const matchedKeywordIds = userKeywordIds.filter(ukId =>
                        postingKeywordIds.includes(ukId)
                    )

                    // 카테고리별로 분류
                    const matchedKeywords = {
                        countries: [] as string[],
                        jobs: [] as string[],
                        conditions: [] as string[],
                        location: [] as string[],
                        moveable: [] as string[]
                    }

                    posting.job_posting_keywords?.forEach((jpk: any) => {
                        if (matchedKeywordIds.includes(jpk.keyword.id)) {
                            // DB에서 번역된 키워드 가져오기
                            const translatedKeyword = translateDB(
                                'keyword',
                                'keyword',
                                jpk.keyword.id.toString(),
                                jpk.keyword.keyword
                            )

                            switch (jpk.keyword.category) {
                                case '국가':
                                    matchedKeywords.countries.push(translatedKeyword)
                                    break
                                case '직종':
                                    matchedKeywords.jobs.push(translatedKeyword)
                                    break
                                case '근무조건':
                                    matchedKeywords.conditions.push(translatedKeyword)
                                    break
                                case '지역':
                                    matchedKeywords.countries.push(translatedKeyword)
                                    break
                                case '지역이동':
                                    matchedKeywords.countries.push(translatedKeyword)
                                    break
                            }
                        }
                    })

                    return {
                        posting,
                        matchedCount: matchedKeywordIds.length,
                        matchedKeywords
                    }
                })

                // 매칭 점수 높은 순으로 정렬
                matched.sort((a, b) => b.matchedCount - a.matchedCount)
                setMatchedPostings(matched)
            }
        } catch (error) {
            console.error('공고 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await Promise.all([
            fetchUserKeywords(),
            fetchAppliedPostings()
        ])
        setRefreshing(false)
    }, [user])

    const handlePostingPress = (posting: JobPosting) => {
        router.push({
            pathname: '/(pages)/(user)/posting-detail',
            params: {
                postingId: posting.id,
                companyId: posting.company.id,
                companyName: posting.company.name
            }
        })
    }

    const renderPosting = ({ item }: { item: MatchedPosting }) => {
        const { posting, matchedCount, matchedKeywords } = item
        const hasApplied = appliedPostings.includes(posting.id)
        const hasMatches = matchedCount > 0

        return (
            <TouchableOpacity
                onPress={() => handlePostingPress(posting)}
                className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm"
                activeOpacity={0.7}
            >
                {/* 지원 완료 뱃지 */}
                {hasApplied && (
                    <View className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full flex-row items-center">
                        <Ionicons name="checkmark-circle" size={16} color="white" />
                        <Text className="text-white text-xs font-medium ml-1">
                            {t('home.applied', '지원완료')}
                        </Text>
                    </View>
                )}

                {/* 회사 정보 */}
                <View className="mb-2">
                    <Text className="text-sm text-gray-600">{posting.company.name}</Text>
                    <Text className="text-lg font-bold text-gray-800 pr-20">
                        {translateDB('job_postings', 'title', posting.id, posting.title)}
                    </Text>
                </View>

                {/* 공고 정보 */}
                <View className="mb-3">
                    {posting.salary_range && (
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="cash-outline" size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">{posting.salary_range}</Text>
                        </View>
                    )}
                    {posting.working_hours && (
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="time-outline" size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">{posting.working_hours}</Text>
                        </View>
                    )}
                    {posting.company.address && (
                        <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">{posting.company.address}</Text>
                        </View>
                    )}
                </View>

                {/* 복지/혜택 */}
                {posting.benefits && posting.benefits.length > 0 && (
                    <View className="flex-row flex-wrap gap-1 mb-3">
                        {posting.benefits.slice(0, 3).map((benefit, index) => (
                            <View key={index} className="bg-gray-100 px-2 py-1 rounded">
                                <Text className="text-xs text-gray-700">{benefit}</Text>
                            </View>
                        ))}
                        {posting.benefits.length > 3 && (
                            <View className="bg-gray-100 px-2 py-1 rounded">
                                <Text className="text-xs text-gray-700">+{posting.benefits.length - 3}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* 매칭된 키워드 */}
                {hasMatches ? (
                    <View className="border-t border-gray-100 pt-3">
                        <Text className="text-sm text-blue-600 font-semibold mb-2">
                            {t('home.matched_keywords', `매칭된 키워드 (${matchedCount}개)`, {
                                count: matchedCount
                            })}
                        </Text>

                        <View className="space-y-1">
                            {matchedKeywords.countries.length > 0 && (
                                <View className="flex-row items-center">
                                    <Ionicons name="globe-outline" size={16} color="#3b82f6" />
                                    <Text className="text-sm text-gray-700 ml-2">
                                        {matchedKeywords.countries.join(', ')}
                                    </Text>
                                </View>
                            )}

                            {matchedKeywords.jobs.length > 0 && (
                                <View className="flex-row items-start">
                                    <Ionicons name="briefcase-outline" size={16} color="#3b82f6" />
                                    <Text className="text-sm text-gray-700 ml-2 flex-1">
                                        {matchedKeywords.jobs.join(', ')}
                                    </Text>
                                </View>
                            )}

                            {matchedKeywords.conditions.length > 0 && (
                                <View className="flex-row items-start">
                                    <Ionicons name="time-outline" size={16} color="#3b82f6" />
                                    <Text className="text-sm text-gray-700 ml-2 flex-1">
                                        {matchedKeywords.conditions.join(', ')}
                                    </Text>
                                </View>
                            )}
                            {matchedKeywords.location.length > 0 && (
                                <View className="flex-row items-center">
                                    <Ionicons name="globe-outline" size={16} color="#3b82f6" />
                                    <Text className="text-sm text-gray-700 ml-2">
                                        {matchedKeywords.location.join(', ')}
                                    </Text>
                                </View>
                            )}
                            {matchedKeywords.moveable.length > 0 && (
                                <View className="flex-row items-center">
                                    <Ionicons name="globe-outline" size={16} color="#3b82f6" />
                                    <Text className="text-sm text-gray-700 ml-2">
                                        {matchedKeywords.moveable.join(', ')}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                ) : (
                    <View className="border-t border-gray-100 pt-3">
                        <Text className="text-sm text-gray-500">
                            {t('home.no_matched_keywords', '매칭된 키워드가 없습니다')}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        )
    }

    const renderHeader = () => (
        <View className="bg-white p-4 mb-2">
            <Text className="text-lg font-bold text-gray-800">
                {t('home.recommended_jobs', '추천 일자리')}
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
                {t('home.total_postings', `총 ${matchedPostings.length}개의 공고`, {
                    count: matchedPostings.length
                })}
            </Text>
        </View>
    )

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header_home />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-600 mt-2">{t('home.loading', '로딩 중...')}</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header_home />

            <FlatList
                data={matchedPostings}
                keyExtractor={(item) => item.posting.id}
                renderItem={renderPosting}
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
                    <View className="flex-1 justify-center items-center p-8">
                        <Ionicons name="document-text-outline" size={80} color="#9ca3af" />
                        <Text className="text-gray-500 text-lg mt-4">
                            {t('home.no_matching_postings', '매칭되는 공고가 없습니다')}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.replace('/(pages)/(user)/info')}
                            className="mt-4 px-6 py-3 bg-blue-500 rounded-xl"
                        >
                            <Text className="text-white font-medium">
                                {t('home.set_preferences', '조건 설정하기')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />

        </SafeAreaView>
    )
}

export default Home