import {Text, View} from "react-native";
import React from "react";
import {useTranslation} from "@/contexts/TranslationContext";
import {SuitabilityResult} from "@/lib/suitability";
import { HeaderCarousel } from './HeaderCarousel';
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
            <HeaderCarousel />
        </View>
    )
}