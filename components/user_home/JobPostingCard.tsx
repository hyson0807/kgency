import {Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {useTranslation} from "@/contexts/TranslationContext";
import { SuitabilityResult } from '@/lib/suitability';
import {router} from "expo-router";
import { sortMatchedKeywords } from '@/lib/utils/keywordUtils';

interface Company {
    id: string;
    name: string;
    address?: string;
    description?: string;
}

interface JobPosting {
    id: string;
    title: string;
    description?: string;
    salary_range?: string;
    working_hours?: string;
    benefits?: string[];
    hiring_count: number;
    created_at: string;
    job_address?: string;
    company: Company;
    job_posting_keywords?: {
        keyword: {
            id: number;
            keyword: string;
            category: string;
        }
    }[];
}

interface MatchedKeyword {
    id: number;
    keyword: string;
    category: string;
}

interface MatchedKeywords {
    countries: MatchedKeyword[];
    jobs: MatchedKeyword[];
    conditions: MatchedKeyword[];
    location: MatchedKeyword[];
    moveable: MatchedKeyword[];
    gender: MatchedKeyword[];
    age: MatchedKeyword[];
    visa: MatchedKeyword[];
    koreanLevel: MatchedKeyword[];
    workDay: MatchedKeyword[];
}

interface JobPostingCardProps {
    posting: JobPosting;
    hasApplied: boolean;
    hasMatches: boolean;
    matchedKeywords: MatchedKeywords;
    suitability: SuitabilityResult; // 추가
}

export const JobPostingCard = ({
                                   posting,
                                   hasApplied,
                                   hasMatches,
                                   matchedKeywords,
                                   suitability, // 추가
                               }: JobPostingCardProps) => {
    const {t, translateDB} = useTranslation();

    const handlePostingPress = (posting: JobPosting) => {
        router.push({
            pathname: '/(pages)/(user)/posting-detail',
            params: {
                postingId: posting.id,
                companyId: posting.company.id,
                companyName: posting.company.name,
                suitability: suitability?.level || 'low',
            }
        })
    }

    // 적합도 레벨에 따른 색상 설정
    const getSuitabilityColor = () => {
        if (!suitability) {
            return { bg: 'bg-gray-400', text: 'text-white' };
        }
        
        switch (suitability.level) {
            case 'perfect':
                return { bg: 'bg-green-500', text: 'text-white' };
            case 'excellent':
                return { bg: 'bg-blue-500', text: 'text-white' };
            case 'good':
                return { bg: 'bg-yellow-400', text: 'text-gray-800' };
            case 'fair':
                return { bg: 'bg-orange-400', text: 'text-white' };
            default:
                return { bg: 'bg-gray-400', text: 'text-white' };
        }
    };

    const suitabilityColors = getSuitabilityColor();

    return (
        <TouchableOpacity
            onPress={() => handlePostingPress(posting)}
            className="bg-white mx-4 p-4 rounded-2xl shadow-sm"
            activeOpacity={0.7}
        >
            {/* 상단 뱃지 영역 */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row gap-2">
                    {/* 지원 완료 뱃지 */}
                    {hasApplied && (
                        <View className="bg-green-500 px-3 py-1 rounded-full flex-row items-center">
                            <Ionicons name="checkmark-circle" size={16} color="white" />
                            <Text className="text-white text-xs font-medium ml-1">
                                {t('home.applied', '지원완료')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 적합도 뱃지 */}
                <View className={`${suitabilityColors.bg} px-3 py-1 rounded-full`}>
                    <Text className={`${suitabilityColors.text} text-sm font-bold`}>
                        {suitability?.score || 0}%
                    </Text>
                </View>
            </View>

            {/* 회사 정보 */}
            <View className="mb-2">
                <Text className="text-sm text-gray-600">{posting.company.name}</Text>
                <Text className="text-lg font-bold text-gray-800">
                    {translateDB('job_postings', 'title', posting.id, posting.title)}
                </Text>
            </View>

            {/* 적합도 프로그레스바 */}
            <View className="mb-3">
                <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-xs text-gray-600">{t('suitability.label', '적합도')}</Text>
                    <Text className="text-xs font-medium text-gray-700">
                        {suitability?.level === 'perfect' && t('suitability.perfect', '완벽한 매칭')}
                        {suitability?.level === 'excellent' && t('suitability.excellent', '매우 적합')}
                        {suitability?.level === 'good' && t('suitability.good', '적합')}
                        {suitability?.level === 'fair' && t('suitability.fair', '보통')}
                        {suitability?.level === 'low' && t('suitability.low', '낮음')}
                        {!suitability && t('suitability.low', '낮음')}
                    </Text>
                </View>
                <View className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <View
                        className={`h-full ${suitabilityColors.bg}`}
                        style={{ width: `${suitability?.score || 0}%` }}
                    />
                </View>
            </View>

            {/* 즉시 면접 가능 표시 */}
            {suitability?.level === 'perfect' && (
                <View className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                    <View className="flex-row items-center">
                        <Ionicons name="sparkles" size={16} color="#10b981" />
                        <Text className="text-sm text-green-700 font-medium ml-1">
                            {t('suitability.instant_interview', '즉시 면접 가능')}
                        </Text>
                    </View>
                </View>
            )}

            {/* 공고 정보 */}
            <View className="mb-3">
                {posting.salary_range && (
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="cash-outline" size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2">{posting.salary_range}</Text>
                    </View>
                )}
                {posting.working_hours && (
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="time-outline" size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2">{posting.working_hours}</Text>
                    </View>
                )}
                {posting.job_address && (
                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2">{posting.job_address}</Text>
                    </View>
                )}
            </View>

            {/* 매칭된 키워드 */}
            {hasMatches ? (
                <View className="border-t border-gray-100 pt-3">
                    <Text className="text-sm text-gray-700 font-semibold mb-2">
                        {t('suitability.company_keyword_match', '해당 회사는 고객님이랑 동일한 키워드를 선택했습니다')}
                    </Text>

                    <View className="flex-row flex-wrap gap-2">
                        {(() => {
                            const allKeywords = sortMatchedKeywords([
                                ...matchedKeywords.countries,
                                ...matchedKeywords.jobs,
                                ...matchedKeywords.conditions,
                                ...matchedKeywords.location,
                                ...matchedKeywords.moveable,
                                ...matchedKeywords.gender,
                                ...matchedKeywords.age,
                                ...matchedKeywords.visa,
                                ...matchedKeywords.koreanLevel,
                                ...matchedKeywords.workDay,
                            ]);
                            
                            // 디버깅: 실제 표시되는 키워드들 확인
                            console.log(`===== 공고 ${posting.id} 매칭된 키워드 표시 =====`);
                            console.log('지역 키워드:', matchedKeywords.location);
                            console.log('지역이동 키워드:', matchedKeywords.moveable);
                            console.log('모든 키워드:', allKeywords);
                            
                            return allKeywords;
                        })().map((keyword, index) => (
                            <View
                                key={`${keyword.id}-${index}`}
                                className="bg-green-100 px-4 py-2 rounded-3xl flex-row items-center justify-center"
                            >
                                <Text className="text-green-700 mr-1">✓</Text>
                                <Text className="text-green-700 text-sm font-bold" numberOfLines={1}>
                                    {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* 보너스 포인트 표시 */}
                    {suitability?.details?.bonusPoints > 0 && (
                        <View className="mt-2 flex-row items-center">
                            <Ionicons name="add-circle-outline" size={14} color="#10b981" />
                            <Text className="text-xs text-green-600 ml-1">
                                {t('suitability.bonus_applied', '보너스 {{points}}점 적용', {
                                    points: suitability?.details?.bonusPoints || 0
                                })}
                            </Text>
                        </View>
                    )}

                    {matchedKeywords.countries.length > 0 && (
                        <View className="bg-blue-50 px-3 py-2 rounded-lg mt-3">
                            <Text className="text-blue-700 text-sm font-medium">
                                {t('home.company_prefers', '이 회사는 {{country}} 사람을 선호해요!', {
                                    country: translateDB('keyword', 'keyword', 
                                        matchedKeywords.countries[0].id.toString(), 
                                        matchedKeywords.countries[0].keyword) || '',
                                })}
                            </Text>
                        </View>
                    )}
                </View>
            ) : (
                <View className="border-t border-gray-100 pt-3">
                    <Text className="text-sm text-gray-500">
                        {t('home.no_matched_keywords', '매칭된 키워드가 없습니다')}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    )
}