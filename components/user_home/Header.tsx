import {Text, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";
import React from "react";
import {useTranslation} from "@/contexts/TranslationContext";
import {SuitabilityResult} from "@/lib/suitability";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';


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

interface HeaderProps {
    matchedPostings: MatchedPosting[]
}


export const Header_Home = ({matchedPostings}: HeaderProps) => {
    const {t} = useTranslation();

    return (
        <View className="bg-white p-4 mb-2">
            {/* 헤더 타이틀 */}
            <View className="flex-row items-center justify-between mb-4">
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

            {/* 첫 번째 카드 - 즉시 면접 확정 */}
            <LinearGradient
                colors={['#FF6B6B', '#FF8E8E', '#FF5757']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 24, marginBottom: 16 }}
            >
                <View className="items-center">
                    <Ionicons name="flash" size={32} color="#FFD700" />
                    <Text className="text-white text-xl font-bold text-center mt-2">
                        적합도 90% 이상 → 즉시 면접 확정!
                    </Text>
                    <Text className="text-white text-sm text-center mt-2 opacity-90">
                        AI 매칭으로 완벽한 일자리를 찾아드립니다
                    </Text>
                </View>
            </LinearGradient>

            {/* 두 번째 카드 - 적합도 90% 돌파하기 */}
            <LinearGradient
                colors={['#667EEA', '#764BA2', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 24 }}
            >
                <View className="items-center">
                    <Text className="text-white text-xl font-bold text-center mt-2">
                        🚀 적합도 90% 돌파하기
                    </Text>
                    <Text className="text-white text-sm text-center mt-2 opacity-90">
                        프로필 완성도를 높이고
                    </Text>
                    <Text className="text-white text-sm text-center opacity-90">
                        즉시 면접의 기회를 잡으세요!
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(pages)/(user)/info')}
                        className="bg-white rounded-full px-6 py-3 mt-4"
                    >
                        <Text className="text-blue-600 font-bold text-center">
                            프로필 업그레이드
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    )
}