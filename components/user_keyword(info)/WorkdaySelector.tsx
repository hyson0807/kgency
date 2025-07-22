import {Text, TouchableOpacity, View} from "react-native";
import React from "react";
import {useTranslation} from "@/contexts/TranslationContext";

interface WorkdaySelectorProps {
    workDayKeywords: { id: number, keyword: string }[];
    selectedWorkDays: number[];
    toggleWorkDay: (id: number) => void;
}

export const WorkdaySelector = ({
    workDayKeywords,
    selectedWorkDays,
    toggleWorkDay,
                                }: WorkdaySelectorProps) => {


    const {t} = useTranslation();


    return (
        <View className="p-4 border-t border-gray-100">
            <Text className="text-base font-semibold mb-3">
                {t('info.preferred_work_days', '희망근무 요일')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
                {workDayKeywords.map((workDay) => (
                    <TouchableOpacity
                        key={workDay.id}
                        onPress={() => toggleWorkDay(workDay.id)}
                        className={`px-4 py-2 rounded-full border ${
                            selectedWorkDays.includes(workDay.id)
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-300'
                        }`}
                    >
                        <Text className={`text-sm ${
                            selectedWorkDays.includes(workDay.id)
                                ? 'text-white font-medium'
                                : 'text-gray-700'
                        }`}>
                            {workDay.keyword}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}