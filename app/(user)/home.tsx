import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from "@/contexts/TranslationContext"
import { JobPostingCard } from "@/components/user_home/JobPostingCard"
import { useMatchedJobPostings } from '@/hooks/useMatchedJobPostings'
import {Header} from "@/components/common/Header";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SuitabilityResult } from '@/lib/suitability';
import {Header_Home} from "@/components/user_home/Header";
import { useAuth } from "@/contexts/AuthContext";
import { registerForPushNotificationsAsync, savePushToken } from '@/lib/notifications';
import { useTabBarVisibility } from '@/hooks/useTabBarVisibility';

// 타입은 hooks/useMatchedJobPostings에서 import
interface JobPosting {
    id: string
    title: string
    description?: string
    salary_range?: string
    working_hours?: string
    benefits?: string[]
    hiring_count: number
    created_at: string
    job_address?: string
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

interface MatchedKeyword {
    id: number
    keyword: string
    category: string
}

// MatchedPosting 인터페이스에 suitability 추가
interface MatchedPosting {
    posting: JobPosting
    matchedCount: number
    matchedKeywords: {
        countries: MatchedKeyword[]
        jobs: MatchedKeyword[]
        conditions: MatchedKeyword[]
        location: MatchedKeyword[]
        moveable: MatchedKeyword[]
        gender: MatchedKeyword[]
        age: MatchedKeyword[]
        visa: MatchedKeyword[]
        koreanLevel: MatchedKeyword[]
        workDay: MatchedKeyword[]
    }
    suitability: SuitabilityResult // 추가
}

const Home = () => {
    const { t } = useTranslation()
    const { user } = useAuth()
    const { isTabBarVisible, handleScroll } = useTabBarVisibility()

    // 커스텀 훅에서 모든 데이터와 함수 가져오기
    const {
        matchedPostings,
        loading,
        refreshing,
        appliedPostings,
        onRefresh
    } = useMatchedJobPostings()

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



    const renderPosting = ({ item }: { item: MatchedPosting }) => {
        const { posting, matchedCount, matchedKeywords, suitability } = item
        const hasApplied = appliedPostings.includes(posting.id)
        const hasMatches = matchedCount > 0

        return (
            <JobPostingCard
                posting={posting}
                hasApplied={hasApplied}
                hasMatches={hasMatches}
                matchedKeywords={matchedKeywords}
                suitability={suitability} // 추가
            />
        )
    }


    if (loading) {
        return (
            <LoadingScreen />
        )
    }

    return (
        <View className="flex-1 bg-gray-50" style={{paddingTop: 44}}>
            <Header/>

            <FlatList
                data={matchedPostings}
                keyExtractor={(item) => item.posting.id}
                renderItem={renderPosting}
                ListHeaderComponent={<Header_Home matchedPostings={matchedPostings}/>}
                ItemSeparatorComponent={() => <View className="h-2" />}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingTop: 2 }}
                showsVerticalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
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
                            onPress={() => router.push('/(pages)/(user)/(user-information)/info')}
                            className="mt-4 px-6 py-3 bg-blue-500 rounded-xl"
                        >
                            <Text className="text-white font-medium">
                                {t('home.set_preferences', '조건 설정하기')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    )
}

export default Home