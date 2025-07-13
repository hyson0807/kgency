import {Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

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

interface MatchedKeywords {
    countries: string[];
    jobs: string[];
    conditions: string[];
    location: string[];
    moveable: string[];
    gender: string[];
    age: string[];
    visa: string[];
}


interface JobPostingCardProps {
    handlePostingPress: (posting: JobPosting) => void;
    posting: JobPosting;
    hasApplied: boolean;
    translateDB: (table: string, column: string, id: string, defaultValue: string) => string;
    hasMatches: boolean;
    matchedKeywords: MatchedKeywords;
    t: (key: string, defaultValue: string, params?: Record<string, string>) => string;
}


export const JobPostingCard = ({

    handlePostingPress,
    posting,
    hasApplied,
    translateDB,
    hasMatches,
    matchedKeywords,
    t,

}: JobPostingCardProps) => (
    <TouchableOpacity
        onPress={() => handlePostingPress(posting)}
        className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm"
        activeOpacity={0.7}
    >
        {/* 지원 완료 뱃지 */}
        {hasApplied && (
            <View className="absolute top-4 right-4 bg-green-500 px-3 py-1 rounded-full flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color="white" />
                <Text className="text-white text-xs font-medium ml-1">
                    {t('home.applied', '지원완료')}
                </Text>
            </View>
        )}

        {/* 회사 정보 */}
        <View className="mb-2">
            <Text className="text-sm text-gray-600">{posting.company.name}</Text>
            <Text className="text-lg font-bold text-gray-800 pr-20">
                {translateDB('job_postings', 'title', posting.id, posting.title)}
            </Text>
        </View>

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
            {/* job_address 표시 - company.address 대신 사용 */}
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
                    {t('home.perfect_match', '나와 딱 맞는 조건')}
                </Text>

                <View className="flex-row flex-wrap gap-2">
                    {[
                        ...matchedKeywords.countries,
                        ...matchedKeywords.jobs,
                        ...matchedKeywords.conditions,
                        ...matchedKeywords.location,
                        ...matchedKeywords.moveable,
                        ...matchedKeywords.gender,
                        ...matchedKeywords.age,
                        ...matchedKeywords.visa,
                    ].map((keyword, index) => (
                        <View
                            key={index}
                            className="bg-green-100 px-4 py-2 rounded-3xl flex-row items-center justify-center"
                        >
                            <Text className="text-green-700 mr-1">✓</Text>
                            <Text className="text-green-700 text-sm font-bold" numberOfLines={1}>
                                {keyword}
                            </Text>
                        </View>
                    ))}
                </View>

                {matchedKeywords.countries.length > 0 && (
                    <View className="bg-blue-50 px-3 py-2 rounded-lg mt-3">
                        <Text className="text-blue-700 text-sm font-medium">
                            {t('home.company_prefers', '이 회사는 {{country}} 사람을 선호해요!', {
                                country: matchedKeywords.countries[0] || '',
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