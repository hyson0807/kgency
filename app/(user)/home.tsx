import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from "@/contexts/TranslationContext"
import { JobPostingCard } from "@/components/user_home/JobPostingCard"
import { useMatchedJobPostings } from '@/hooks/useMatchedJobPostings'
import {Header} from "@/components/common/Header";
import LoadingScreen from "@/components/common/LoadingScreen";
import { SuitabilityResult } from '@/lib/suitability';

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

// MatchedPosting 인터페이스에 suitability 추가
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
    suitability: SuitabilityResult // 추가
}

const Home = () => {
    const { t } = useTranslation()

    // 커스텀 훅에서 모든 데이터와 함수 가져오기
    const {
        matchedPostings,
        loading,
        refreshing,
        appliedPostings,
        onRefresh
    } = useMatchedJobPostings()



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
            <LoadingScreen />
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header/>

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