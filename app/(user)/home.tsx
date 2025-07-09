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
        gender: string[]
        age: string[]
        visa: string[]
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
                        moveable: [] as string[],
                        gender: [] as string[],
                        age: [] as string[],
                        visa: [] as string[],
                    }

                    posting.job_posting_keywords?.forEach((jpk: any) => {
                        if (matchedKeywordIds.includes(jpk.keyword.id)) {
                            // DB에서 번역된 키워드 가져오기
                            const translatedKeyword = translateDB(
                                'keyword',
                                'keyword',
                                jpk.keyword.id?.toString() || '',
                                jpk.keyword.keyword || ''
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
                                    matchedKeywords.location.push(translatedKeyword)
                                    break
                                case '지역이동':
                                    matchedKeywords.moveable.push(translatedKeyword)
                                    break
                                case '성별':
                                    matchedKeywords.gender.push(translatedKeyword)
                                    break
                                case '나이대':
                                    matchedKeywords.age.push(translatedKeyword)
                                    break
                                case '비자':
                                    matchedKeywords.visa.push(translatedKeyword)
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
        const { posting, matchedCount, matchedKeywords } = item;
        const hasApplied = appliedPostings.includes(posting.id);
        const hasMatches = matchedCount > 0;

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

                {/* 매칭된 키워드 */}
                {hasMatches ? (
                    <View className="border-t border-gray-100 pt-3">
                        <Text className="text-sm text-gray-700 font-semibold mb-2">
                            {t('home.perfect_match', '나와 딱 맞는 조건')}
                        </Text>

                        <View className="flex-row flex-wrap gap-2">
                            {[
                                ...matchedKeywords.countries,
                                ...matchedKeywords.jobs,
                                ...matchedKeywords.conditions,
                                ...matchedKeywords.location,
                                ...matchedKeywords.moveable,
                                ...matchedKeywords.gender,
                                ...matchedKeywords.age,
                                ...matchedKeywords.visa,
                            ].map((keyword, index) => (
                                <View
                                    key={index}
                                    className="bg-green-100 px-4 py-2 rounded-3xl flex-row items-center justify-center"
                                >
                                    <Text className="text-green-700 mr-1">✓</Text>
                                    <Text className="text-green-700 text-sm font-bold" numberOfLines={1}>
                                        {keyword}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {matchedKeywords.countries.length > 0 && (
                            <View className="bg-blue-50 px-3 py-2 rounded-lg mt-3">
                                <Text className="text-blue-700 text-sm font-medium">
                                    {t('home.company_prefers', '이 회사는 {{country}} 사람을 선호해요!', {
                                        country: matchedKeywords.countries[0] || '',
                                    })}
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="border-t border-gray-100 pt-3">
                        <Text className="text-sm text-gray-500">
                            {t('home.no_matched_keywords', '매칭된 키워드가 없습니다')}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };


    const renderHeader = () => (
        <View className="bg-white p-4 mb-2">
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-lg font-bold text-gray-800">
                        {t('home.recommended_jobs', '추천 일자리')}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                        {t('home.total_postings', `총 ${matchedPostings.length}개의 공고`, {
                            count: matchedPostings.length
                        })}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/(pages)/(user)/info')}
                    className="bg-blue-100 px-4 py-2 rounded-lg"
                >
                    <Text className="text-blue-600 font-medium">{t('home.set_keywords', '대표 키워드 설정')}</Text>
                </TouchableOpacity>
            </View>
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