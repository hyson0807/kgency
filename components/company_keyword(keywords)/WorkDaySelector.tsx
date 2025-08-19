import {Text, TouchableOpacity, View} from "react-native";
import React from "react";
interface WorkDaySelectorProps {
    workDayKeywords: { id: number, keyword: string }[];
    selectedWorkDays: number[];
    toggleWorkDay: (id: number) => void;
    onNegotiableClick?: () => void;
    onSelectLaterClick?: () => void;
    isSelectLater?: boolean;
}
export const WorkDaySelector = ({
    workDayKeywords,
    selectedWorkDays,
    toggleWorkDay,
    onNegotiableClick,
    onSelectLaterClick,
    isSelectLater = false,
                                }: WorkDaySelectorProps) => {
    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-lg font-semibold text-gray-900">사람이 필요한 근무요일</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={onNegotiableClick}
                        className="px-3 py-1.5 rounded-lg bg-blue-500"
                    >
                        <Text className="text-sm font-medium text-white">협의가능</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={onSelectLaterClick}
                        className={`px-3 py-1.5 rounded-lg ${
                            isSelectLater ? 'bg-gray-600' : 'bg-gray-500'
                        }`}
                    >
                        <Text className="text-sm font-medium text-white">나중에 선택</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex-row justify-between gap-1">
                {workDayKeywords
                    .sort((a, b) => {
                        const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
                        return dayOrder.indexOf(a.keyword) - dayOrder.indexOf(b.keyword);
                    })
                    .map(day => (
                        <TouchableOpacity
                            key={day.id}
                            onPress={() => !isSelectLater && toggleWorkDay(day.id)}
                            disabled={isSelectLater}
                            className={`px-2 py-2.5 rounded-xl border flex-1 ${
                                isSelectLater
                                    ? 'bg-gray-100 border-gray-200 opacity-50'
                                    : selectedWorkDays.includes(day.id)
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                            <Text className={`text-sm font-medium text-center ${
                                isSelectLater
                                    ? 'text-gray-400'
                                    : selectedWorkDays.includes(day.id)
                                    ? 'text-blue-700'
                                    : 'text-gray-600'
                            }`}>
                                {day.keyword}
                            </Text>
                        </TouchableOpacity>
                    ))}
            </View>
            {selectedWorkDays.length === 0 && !isSelectLater && (
                <Text className="text-sm text-gray-500 mt-3 text-center">
                    선택된 근무요일이 없습니다
                </Text>
            )}
            {isSelectLater && (
                <Text className="text-sm text-gray-500 mt-3 text-center">
                    나중에 선택으로 설정되었습니다
                </Text>
            )}
        </View>
    )
}