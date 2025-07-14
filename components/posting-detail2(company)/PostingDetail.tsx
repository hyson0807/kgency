import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";

interface Keyword {
    id: number;
    keyword: string;
    category: string;
}

interface Keywords {
    conditions: Keyword[];
    countries: Keyword[];
    jobs: Keyword[];
    gender: Keyword[];
    age: Keyword[];
    visa: Keyword[];
}

interface PostingDetailProps {
    keywords: Keywords;
    postingId: string;
    posting: any;
}

export const PostingDetail = ({
                                  keywords,
                                  postingId,
                                  posting,
                              }: PostingDetailProps) => {
    return (
        <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
            {/* 공고 상태 */}
            <View className="p-6 border-b border-gray-100">
                <View className="flex-row items-center justify-between">
                    <Text className="text-lg font-semibold">공고 상태</Text>
                    <View className={`px-3 py-1 rounded-full ${
                        posting?.is_active ? 'bg-green-100' : 'bg-gray-200'
                    }`}>
                        <Text className={`text-sm font-medium ${
                            posting?.is_active ? 'text-green-600' : 'text-gray-600'
                        }`}>
                            {posting?.is_active ? '모집중' : '마감'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* 근무 조건 */}
            <View className="p-6 border-b border-gray-100">
                <Text className="text-lg font-semibold mb-4">근무 조건</Text>

                {/* 가게 주소 */}
                {posting?.job_address && (
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="business-outline" size={20} color="#6b7280" />
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">가게 주소</Text>
                            <Text className="text-gray-700">{posting.job_address}</Text>
                        </View>
                    </View>
                )}

                {/* 근무일 */}
                {posting?.working_days && posting.working_days.length > 0 && (
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">근무일</Text>
                            <Text className="text-gray-700">
                                {posting.working_days.join(', ')}
                                {posting.working_days_negotiable && ' (협의가능)'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* 근무시간 */}
                {posting?.working_hours && (
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="time-outline" size={20} color="#6b7280" />
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">근무시간</Text>
                            <Text className="text-gray-700">
                                {posting.working_hours}
                                {posting.working_hours_negotiable && ' (협의가능)'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* 급여 */}
                {posting?.salary_range && (
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="cash-outline" size={20} color="#6b7280" />
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">급여</Text>
                            <Text className="text-gray-700">
                                {posting.salary_range}
                                {posting.salary_range_negotiable && ' (협의가능)'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* 급여일 */}
                {posting?.pay_day && (
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="wallet-outline" size={20} color="#6b7280" />
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">급여일</Text>
                            <Text className="text-gray-700">
                                {posting.pay_day}
                                {posting.pay_day_negotiable && ' (협의가능)'}
                            </Text>
                        </View>
                    </View>
                )}

                {/* 모집인원 */}
                {posting?.hiring_count && (
                    <View className="flex-row items-center">
                        <Ionicons name="people-outline" size={20} color="#6b7280" />
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">모집인원</Text>
                            <Text className="text-gray-700">{posting.hiring_count}명</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* 복지/혜택 */}
            {posting?.benefits && posting.benefits.length > 0 && (
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">복지/혜택</Text>
                    <View className="flex-row flex-wrap">
                        {posting.benefits.map((benefit: string, index: number) => (
                            <View key={index} className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
                                <Text className="text-blue-700">{benefit}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* 상세 설명 */}
            {posting?.description && (
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">상세 설명</Text>
                    <Text className="text-gray-700 leading-6">{posting.description}</Text>
                </View>
            )}

            {/* 회사의 강점 */}
            {keywords.conditions && keywords.conditions.length > 0 && (
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">회사의 강점!</Text>
                    <View className="flex-row flex-wrap">
                        {keywords.conditions.map((keyword) => (
                            <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full mr-2 mb-2">
                                <Text className="text-orange-700 text-sm">{keyword.keyword}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* 채용 분야 */}
            <View className="p-6">
                <Text className="text-lg font-semibold mb-4">채용 분야</Text>

                {keywords.countries && keywords.countries.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-gray-600 font-medium mb-2">대상 국가</Text>
                        <View className="flex-row flex-wrap">
                            {keywords.countries.map((keyword) => (
                                <View key={keyword.id} className="bg-purple-100 px-3 py-1 rounded-full mr-2 mb-2">
                                    <Text className="text-purple-700 text-sm">{keyword.keyword}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {keywords.jobs && keywords.jobs.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-gray-600 font-medium mb-2">모집 직종</Text>
                        <View className="flex-row flex-wrap">
                            {keywords.jobs.map((keyword) => (
                                <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full mr-2 mb-2">
                                    <Text className="text-orange-700 text-sm">{keyword.keyword}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {keywords.gender && keywords.gender.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-gray-600 font-medium mb-2">모집 성별</Text>
                        <View className="flex-row flex-wrap">
                            {keywords.gender.map((keyword) => (
                                <View key={keyword.id} className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
                                    <Text className="text-blue-700 text-sm">{keyword.keyword}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {keywords.age && keywords.age.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-gray-600 font-medium mb-2">모집 나이대</Text>
                        <View className="flex-row flex-wrap">
                            {keywords.age.map((keyword) => (
                                <View key={keyword.id} className="bg-green-100 px-3 py-1 rounded-full mr-2 mb-2">
                                    <Text className="text-green-700 text-sm">{keyword.keyword}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {keywords.visa && keywords.visa.length > 0 && (
                    <View className="mb-4">
                        <Text className="text-gray-600 font-medium mb-2">지원 가능한 비자</Text>
                        <View className="flex-row flex-wrap">
                            {keywords.visa.map((keyword) => (
                                <View key={keyword.id} className="bg-yellow-100 px-3 py-1 rounded-full mr-2 mb-2">
                                    <Text className="text-yellow-700 text-sm">{keyword.keyword}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}
            </View>

            {/* 수정/삭제 버튼 */}
            <View className="p-6">
                <TouchableOpacity
                    onPress={() => router.push({
                        pathname: '/(pages)/(company)/info2',
                        params: { jobPostingId: postingId }
                    })}
                    className="bg-blue-500 py-3 rounded-xl mb-3"
                >
                    <Text className="text-center text-white font-bold">공고 수정</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};