import {Text, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";
import React from "react";
import {useTranslation} from "@/contexts/TranslationContext";
import {SuitabilityResult} from "@/lib/suitability";


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
}