import { View, Text, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { api } from '@/lib/api'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import {SecondHeader} from "@/components/company_home(home2)/SecondHeader";
import {Header} from "@/components/common/Header";
import LoadingScreen from "@/components/common/LoadingScreen";
import {UserCard} from "@/components/company_home(home2)/UserCard";
import { SuitabilityCalculator } from '@/lib/suitability/calculator'
import { SuitabilityResult } from '@/lib/suitability/types'
import { registerForPushNotificationsAsync, savePushToken } from '@/lib/notifications';

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

interface CompanyKeyword {
    keyword: {
        id: number
        keyword: string
        category: string
    }
}

interface MatchedJobSeeker {
    user: JobSeeker
    matchedCount: number
    matchedKeywords: string[]
    suitability?: SuitabilityResult
}

interface CompanyKeywordResponse {
    keyword_id: number
    keyword: {
        id: number
        keyword: string
        category: string
    }
}

interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}

const Home2 = () => {
    const { user } = useAuth()
    const [matchedJobSeekers, setMatchedJobSeekers] = useState<MatchedJobSeeker[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [companyKeywordIds, setCompanyKeywordIds] = useState<number[]>([])
    const [companyKeywords, setCompanyKeywords] = useState<CompanyKeyword[]>([])
    const calculator = new SuitabilityCalculator()

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

    // 홈화면 진입 시 알림 권한 요청
    useEffect(() => {
        const requestNotificationPermission = async () => {
            if (user?.userId) {
                try {
                    const pushToken = await registerForPushNotificationsAsync();
                    if (pushToken) {
                        await savePushToken(user.userId, pushToken);
                    }
                } catch (error) {
                    console.log('알림 권한 설정 중 오류:', error);
                }
            }
        };

        requestNotificationPermission();
    }, [user?.userId]);

    // 회사의 키워드 가져오기
    const fetchCompanyKeywords = async () => {
        if (!user) return

        try {
            const response = await api<ApiResponse<CompanyKeywordResponse[]>>('GET', '/api/company-keyword')
            
            if (response.success && response.data) {
                setCompanyKeywordIds(response.data.map((ck: CompanyKeywordResponse) => ck.keyword_id))
                setCompanyKeywords(response.data.map((ck: CompanyKeywordResponse) => ({
                    keyword: ck.keyword
                })))
            }
        } catch (error) {
            console.error('회사 키워드 조회 실패:', error)
        }
    }

    // 활성화된 구직자 목록 가져오기
    const fetchJobSeekers = async () => {
        try {
            const response = await api<ApiResponse<JobSeeker[]>>('GET', '/api/profiles/job-seekers')
            
            if (response.success && response.data) {
                const jobSeekers = response.data
                // 매칭 점수 계산
                const matched = jobSeekers.map((jobSeeker: JobSeeker) => {
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

                    // 적합도 계산
                    let suitability: SuitabilityResult | undefined = undefined
                    if (companyKeywords.length > 0) {
                        // 회사 키워드를 적합도 계산기가 사용하는 형식으로 변환
                        const companyKeywordsForCalculator = companyKeywords.map(ck => ({
                            keyword: ck.keyword
                        }))
                        
                        suitability = calculator.calculate(userKeywordIds, companyKeywordsForCalculator)
                    }

                    return {
                        user: jobSeeker as JobSeeker,
                        matchedCount: matchedKeywordIds.length,
                        matchedKeywords,
                        suitability
                    }
                })

                // 적합도 점수 높은 순으로 정렬 (적합도가 없는 경우 매칭 카운트로 정렬)
                matched.sort((a: MatchedJobSeeker, b: MatchedJobSeeker) => {
                    const scoreA = a.suitability?.score || a.matchedCount
                    const scoreB = b.suitability?.score || b.matchedCount
                    return scoreB - scoreA
                })
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