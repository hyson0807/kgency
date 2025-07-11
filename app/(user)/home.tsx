import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { router } from "expo-router"
import Header_home from "@/components/user_home/Header_home"
import { supabase } from "@/lib/supabase"
import { Ionicons } from '@expo/vector-icons'
import {useTranslation} from "@/contexts/TranslationContext";
import {JobPostingCard} from "@/components/user_home/JobPostingCard";

interface JobPosting {
    id: string
    title: string
    description?: string
    salary_range?: string
    working_hours?: string
    benefits?: string[]
    hiring_count: number
    created_at: string
    job_address?: string // job_address 추가
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
            // 모든 활성 공고 가져오기 - job_address 추가
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
            <JobPostingCard
                handlePostingPress={handlePostingPress}
                posting={posting}
                hasApplied={hasApplied}
                translateDB={translateDB}
                hasMatches={hasMatches}
                matchedKeywords={matchedKeywords}
                t={t} />
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