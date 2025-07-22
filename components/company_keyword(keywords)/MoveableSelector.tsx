import {Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

interface MoveableSelectorProps {
    moveableKeyword: { id: number, keyword: string, category: string } | undefined;
    selectedMoveable: number | null;
    toggleMoveable: () => void;
}

export const MoveableSelector = ({
    moveableKeyword,
    selectedMoveable,
    toggleMoveable,

                                 }: MoveableSelectorProps) => {



    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">지역이동 가능자 선호</Text>

            {/* 지역이동 가능 토글 */}
            {moveableKeyword && (
                <TouchableOpacity
                    onPress={toggleMoveable}
                    className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                    <Text className="text-base text-gray-700">
                        {moveableKeyword.keyword}
                    </Text>
                    <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                        selectedMoveable === moveableKeyword.id
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300'
                    }`}>
                        {selectedMoveable === moveableKeyword.id && (
                            <Ionicons name="checkmark" size={16} color="white" />
                        )}
                    </View>
                </TouchableOpacity>
            )}
        </View>
    )
}