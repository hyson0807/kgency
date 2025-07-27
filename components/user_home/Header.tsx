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
                </View>

            </View>

            {/* 옵션 1: 부드러운 보라색 그라데이션 */}
            <LinearGradient
                colors={['#6366F1', '#8B5CF6', '#A855F7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 24, marginBottom: 16 }}
            >
                <View className="items-center">
                    <Ionicons name="flash" size={32} color="#FDE047" />
                    <Text className="text-white text-xl font-bold text-center mt-2">
                        적합도 90% 이상 → 즉시 면접 확정!
                    </Text>
                    <Text className="text-white text-sm text-center mt-2 opacity-90">
                        AI 매칭으로 완벽한 일자리를 찾아드립니다
                    </Text>
                </View>
            </LinearGradient>

            {/* 옵션 1: 민트/그린 그라데이션 */}
            <LinearGradient
                colors={['#10B981', '#34D399', '#6EE7B7']}
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
                        <Text className="text-emerald-600 font-bold text-center">
                            프로필 업그레이드
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    )
}