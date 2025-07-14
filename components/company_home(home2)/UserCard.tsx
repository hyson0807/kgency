import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

interface MatchedKeywordWithCategory {
    keyword: string;
    category: string;
}

interface MatchedJobSeeker {
    user: JobSeeker;
    matchedCount: number;
    matchedKeywords: string[];
    matchedKeywordsWithCategory?: MatchedKeywordWithCategory[]; // 카테고리 정보를 포함한 키워드
}

interface UserCardProps {
    item: MatchedJobSeeker;
    onPress: (jobSeeker: JobSeeker) => void;
}

export const UserCard = ({ item, onPress }: UserCardProps) => {
    const { user: jobSeeker, matchedCount, matchedKeywords, matchedKeywordsWithCategory } = item;
    const hasMatches = matchedCount > 0;

    // 카테고리별 색상 설정
    const getCategoryColor = (category: string) => {
        switch (category) {
            case '국가':
                return 'bg-purple-100 text-purple-700';
            case '직종':
                return 'bg-orange-100 text-orange-700';
            case '근무조건':
                return 'bg-blue-100 text-blue-700';
            case '지역':
                return 'bg-green-100 text-green-700';
            case '지역이동':
                return 'bg-teal-100 text-teal-700';
            case '성별':
                return 'bg-pink-100 text-pink-700';
            case '나이대':
                return 'bg-yellow-100 text-yellow-700';
            case '비자':
                return 'bg-indigo-100 text-indigo-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // matchedKeywordsWithCategory가 없는 경우를 대비한 처리
    // 기존 matchedKeywords 배열에서 카테고리 정보 추출 시도
    const getKeywordsWithCategory = () => {
        if (matchedKeywordsWithCategory) {
            return matchedKeywordsWithCategory;
        }

        // jobSeeker의 user_keywords에서 매칭된 키워드 찾아서 카테고리 정보 추출
        if (jobSeeker.user_keywords) {
            return matchedKeywords.map(keyword => {
                const found = jobSeeker.user_keywords?.find(uk => uk.keyword.keyword === keyword);
                return {
                    keyword,
                    category: found?.keyword.category || ''
                };
            });
        }

        // 카테고리 정보를 찾을 수 없는 경우 기본값 반환
        return matchedKeywords.map(keyword => ({
            keyword,
            category: ''
        }));
    };

    const keywordsWithCategory = getKeywordsWithCategory();

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
            <View className="flex-row mb-3 gap-3">
                <View className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full">
                    <Text className="text-2xl font-bold">{item.user.name.charAt(0)}</Text>
                </View>

                <View>
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
            </View>

            {/* 키워드 표시 */}
            <View className="border-t border-gray-100 pt-3">
                {hasMatches ? (
                    <>
                        <Text className="text-sm text-gray-700 font-semibold mb-2">
                            해당 지원자는 사장님이 선택하신 아래 조건들을 선택했습니다
                        </Text>

                        <View className="flex-row flex-wrap gap-2">
                            {keywordsWithCategory.map((item, index) => (
                                <View
                                    key={index}
                                    className={`px-3 py-1 rounded-3xl flex-row items-center justify-center ${
                                        getCategoryColor(item.category)
                                    }`}
                                >
                                    <Text className="mr-1">✓</Text>
                                    <Text className="text-xs font-bold" numberOfLines={1}>
                                        {item.keyword}
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
    );
};