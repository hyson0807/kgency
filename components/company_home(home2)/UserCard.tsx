import {Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

interface UserKeyword {
    keyword: {
        id: number;
        keyword: string;
        category: string;
    };
}

interface JobSeeker {
    id: string;
    name: string;
    phone_number: string;
    job_seeking_active: boolean;
    created_at: string;
    user_info?: {
        age?: number;
        gender?: string;
        visa?: string;
        korean_level?: string;
    };
    user_keywords?: UserKeyword[];
}


interface MatchedJobSeeker {
    user: JobSeeker
    matchedCount: number
    matchedKeywords: string[]
}

interface UserCardProps {
    item: MatchedJobSeeker
    onPress: (jobSeeker: JobSeeker) => void
}

export const UserCard = ({
    item,
    onPress,
                         }: UserCardProps) => {

    const { user: jobSeeker, matchedCount, matchedKeywords } = item
    const hasMatches = matchedCount > 0

    return (
        <TouchableOpacity
            onPress={() => onPress(jobSeeker)}
            className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm"
            activeOpacity={0.7}
        >
            {/* 매칭 뱃지 */}
            {hasMatches && (
                <View className="absolute top-4 right-4 bg-blue-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-medium">매칭 {matchedCount}개</Text>
                </View>
            )}

            {/* 기본 정보 */}
            <View className="mb-3">
                <Text className="text-lg font-bold text-gray-800 pr-20">
                    {jobSeeker.name || '이름 미등록'}
                </Text>

                <View className="flex-row flex-wrap gap-3 mt-2">
                    {jobSeeker.user_info?.age && (
                        <View className="flex-row items-center">
                            <Ionicons name="person-outline" size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-1">
                                {jobSeeker.user_info.age}세
                            </Text>
                        </View>
                    )}

                    {jobSeeker.user_info?.gender && (
                        <Text className="text-sm text-gray-600">
                            {jobSeeker.user_info.gender}
                        </Text>
                    )}

                    {jobSeeker.user_info?.visa && (
                        <View className="flex-row items-center">
                            <Ionicons name="document-text-outline" size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-1">
                                {jobSeeker.user_info.visa}
                            </Text>
                        </View>
                    )}

                    {jobSeeker.user_info?.korean_level && (
                        <View className="flex-row items-center">
                            <Ionicons name="language-outline" size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-1">
                                한국어 {jobSeeker.user_info.korean_level}
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* 키워드 표시 */}
            <View className="border-t border-gray-100 pt-3">
                {hasMatches ? (
                    <>
                        <Text className="text-sm text-gray-700 font-semibold mb-2">
                            🎯 우리 회사와 딱 맞는 조건
                        </Text>

                        <View className="flex-row flex-wrap gap-2">
                            {matchedKeywords.map((keyword, index) => (
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
                    </>
                ) : (
                    <Text className="text-sm text-gray-500">
                        매칭된 키워드가 없습니다
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    )
}