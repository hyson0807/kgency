import {Text, TouchableOpacity, View} from "react-native";
import React from "react";


interface props {
    koreanLevelKeywords: { id: number, keyword: string }[];
    selectedKoreanLevel: number | null;
    handleKoreanLevelSelect: (id: number) => void;
}

export const KoreanLevelSelector = ({
    koreanLevelKeywords,
    selectedKoreanLevel,
    handleKoreanLevelSelect,

                                    }: props) => {
    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">한국어 수준 요구사항</Text>
            <View className="flex-row flex-wrap gap-3">
                {koreanLevelKeywords.map(level => (
                    <TouchableOpacity
                        key={level.id}
                        onPress={() => handleKoreanLevelSelect(level.id)}
                        className={`px-4 py-2.5 rounded-xl border ${
                            selectedKoreanLevel === level.id
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                        <Text className={`text-sm font-medium ${
                            selectedKoreanLevel === level.id
                                ? 'text-blue-700'
                                : 'text-gray-600'
                        }`}>
                            {level.keyword}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {selectedKoreanLevel === null && (
                <Text className="text-sm text-gray-500 mt-3 text-center">
                    선택된 한국어 수준이 없습니다
                </Text>
            )}
        </View>
    )
}