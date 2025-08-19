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


    const {t, translateDB} = useTranslation();


    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">
                {t('info.preferred_work_days', '희망근무 요일')}
            </Text>
            <View className="flex-row flex-wrap gap-2">
                {workDayKeywords.map((workDay) => (
                    <TouchableOpacity
                        key={workDay.id}
                        onPress={() => toggleWorkDay(workDay.id)}
                        className={`px-4 py-2.5 rounded-xl border ${
                            selectedWorkDays.includes(workDay.id)
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                        <Text className={`text-sm font-medium ${
                            selectedWorkDays.includes(workDay.id)
                                ? 'text-blue-700'
                                : 'text-gray-600'
                        }`}>
                            {translateDB('keyword', 'keyword', workDay.id.toString(), workDay.keyword)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}