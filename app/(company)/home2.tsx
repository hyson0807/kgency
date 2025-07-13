import { View, Text, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import {SecondHeader} from "@/components/company_home(home2)/SecondHeader";
import {Header} from "@/components/common/Header";
import LoadingScreen from "@/components/common/LoadingScreen";
import {UserCard} from "@/components/company_home(home2)/UserCard";

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

const Home2 = () => {
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
        router.push({
            pathname: '/(pages)/(company)/job-seeker-detail',
            params: {
                userId: jobSeeker.id
            }
        })
    }


    if (loading) {
        return (
            <LoadingScreen />
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <Header />

            <FlatList
                data={matchedJobSeekers}
                keyExtractor={(item) => item.user.id}
                renderItem={({item}) => <UserCard item={item} onPress={handleJobSeekerPress}/>}
                ListHeaderComponent={() => <SecondHeader/> }
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

export default Home2