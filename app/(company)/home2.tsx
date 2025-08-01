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

interface MatchedKeywordWithCategory {
    keyword: string
    category: string
}

interface MatchedJobSeeker {
    user: JobSeeker
    matchedCount: number
    matchedKeywords: string[]
    matchedKeywordsWithCategory?: MatchedKeywordWithCategory[]
    suitability?: SuitabilityResult
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

    useEffect(() => {
        if (user) {
            fetchMatchedJobSeekers()
        }
    }, [user])

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

    // 매칭된 구직자 목록 가져오기 (서버에서 적합도 계산)
    const fetchMatchedJobSeekers = async () => {
        if (!user) return
        
        setLoading(true)
        try {
            const response = await api<ApiResponse<MatchedJobSeeker[]>>('GET', '/api/job-seekers/matched')
            
            if (response.success && response.data) {
                setMatchedJobSeekers(response.data)
            }
        } catch (error) {
            console.error('매칭된 구직자 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await fetchMatchedJobSeekers()
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