import {Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

interface GroupedKeywords {
    location: string[]
    moveable: boolean
    country: string[]
    jobs: string[]
    conditions: string[]
    gender?: string[]
    age?: string[]
    visa?: string[]
    workDays?: string[]
    koreanLevel?: string[]
}

interface UserKeywordsProps {
    groupedKeywords: GroupedKeywords,
}

export const UserKeywords = ({
    groupedKeywords,
                             }: UserKeywordsProps) => {
    return (
        <View className="flex-1">

            {/* 희망 근무지역 */}
            <View className="p-6 border-b border-gray-100">
                <Text className="text-lg font-semibold mb-4">희망 근무지역</Text>

                {groupedKeywords.location.length > 0 ? (
                    <View className="space-y-2">
                        <View className="flex-row flex-wrap gap-2">
                            {groupedKeywords.location.map((location, index) => (
                                <View key={index} className="bg-blue-100 px-3 py-2 rounded-full">
                                    <Text className="text-blue-700 font-medium">{location}</Text>
                                </View>
                            ))}
                        </View>

                        {groupedKeywords.moveable && (
                            <View className="flex-row items-center mt-2">
                                <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                                <Text className="text-green-600 ml-2 font-medium">지역이동 가능</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <Text className="text-gray-500">등록된 지역이 없습니다</Text>
                )}
            </View>

            {/* 국가 */}
            {groupedKeywords.country.length > 0 && (
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">국가</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {groupedKeywords.country.map((country, index) => (
                            <View key={index} className="bg-purple-100 px-3 py-2 rounded-full">
                                <Text className="text-purple-700 font-medium">{country}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* 희망 직종 */}
            {groupedKeywords.jobs.length > 0 && (
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">희망 직종</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {groupedKeywords.jobs.map((job, index) => (
                            <View key={index} className="bg-orange-100 px-3 py-2 rounded-full">
                                <Text className="text-orange-700 font-medium">{job}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}


            {/* 한국어 수준 */}
            {groupedKeywords.koreanLevel && groupedKeywords.koreanLevel.length > 0 && (
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">한국어 수준</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {groupedKeywords.koreanLevel.map((level, index) => (
                            <View key={index} className="bg-teal-100 px-3 py-2 rounded-full">
                                <Text className="text-teal-700 font-medium">{level}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* 원하는 혜택 */}
            {groupedKeywords.conditions.length > 0 && (
                <View className="p-6">
                    <Text className="text-lg font-semibold mb-4">원하는 혜택</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {groupedKeywords.conditions.map((condition, index) => (
                            <View key={index} className="bg-green-100 px-3 py-2 rounded-full">
                                <Text className="text-green-700 font-medium">{condition}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    )
}