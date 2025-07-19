import {Text, View} from "react-native";
import WorkLocation from "@/components/posting-detail/WorkLocation";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {useTranslation} from "@/contexts/TranslationContext";

interface WorkConditionProps {
    posting: any,
    isTranslated: boolean,
    translatedData: any,
}

export const WorkCondition = ({posting, isTranslated, translatedData, }: WorkConditionProps) => {
    const { t } = useTranslation();
    
    // 요일 순서 정의
    const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
    
    // 근무일을 요일 순서대로 정렬하는 함수
    const sortWorkingDays = (days: string[]) => {
        return days.sort((a, b) => {
            const indexA = dayOrder.indexOf(a);
            const indexB = dayOrder.indexOf(b);
            return indexA - indexB;
        });
    };
    
    return (
        <View className="flex-1">
            <View className="p-6 border-b border-gray-100">
                <Text className="text-sm text-gray-600 mb-1">{posting.company.name}</Text>
                <Text className="text-2xl font-bold mb-3">
                    {isTranslated && translatedData?.title ? translatedData.title : posting.title}
                </Text>
            </View>

            {/* 주요 정보 */}
            <View className="p-6 border-b border-gray-100">
                <Text className="text-lg font-semibold mb-4">{t('posting_detail.work_conditions', '근무 조건')}</Text>

                {/* 근무지역 */}
                <WorkLocation
                    posting={posting}
                    isTranslated={isTranslated}
                    translatedData={translatedData}
                    t={t}
                />


                {/* 근무일 */}
                {posting.working_days && posting.working_days.length > 0 && (
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                            <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">{t('posting_detail.work_days', '근무일')}</Text>
                            <Text className="text-base text-gray-800">
                                {isTranslated && translatedData?.working_days
                                    ? sortWorkingDays(translatedData.working_days).join(', ')
                                    : sortWorkingDays(posting.working_days).join(', ')
                                }
                                {posting.working_days_negotiable && t('posting_detail.negotiable', ' (협의가능)')}
                            </Text>
                        </View>
                    </View>
                )}

                {/* 근무시간 */}
                {posting.working_hours && (
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                            <Ionicons name="time-outline" size={18} color="#3b82f6" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">{t('posting_detail.work_hours', '근무시간')}</Text>
                            <Text className="text-base text-gray-800">
                                {isTranslated && translatedData?.working_hours
                                    ? translatedData.working_hours
                                    : posting.working_hours
                                }
                                {posting.working_hours_negotiable && t('posting_detail.negotiable', ' (협의가능)')}
                            </Text>
                        </View>
                    </View>
                )}


                {/* 급여타입 & 급여 */}
                {(posting.salary_range) && (
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                            <Ionicons name="cash-outline" size={18} color="#3b82f6" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">{t('posting_detail.salary', '급여')}</Text>
                            <Text className="text-base text-gray-800">
                                {isTranslated && translatedData?.salary_range
                                    ? translatedData.salary_range
                                    : posting.salary_range
                                }
                                {posting.salary_range_negotiable && t('posting_detail.negotiable', ' (협의가능)')}
                            </Text>
                        </View>
                    </View>
                )}

                {/* 급여일 */}
                {posting.pay_day && (
                    <View className="flex-row items-center mb-3">
                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                            <Ionicons name="wallet-outline" size={18} color="#3b82f6" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">{t('posting_detail.pay_day', '급여일')}</Text>
                            <Text className="text-base text-gray-800">
                                {isTranslated && translatedData?.pay_day
                                    ? translatedData.pay_day
                                    : posting.pay_day
                                }
                                {posting.pay_day_negotiable && t('posting_detail.negotiable', ' (협의가능)')}
                            </Text>
                        </View>
                    </View>
                )}

                {posting.hiring_count && (
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                            <Ionicons name="people-outline" size={18} color="#3b82f6" />
                        </View>
                        <View className="ml-3">
                            <Text className="text-xs text-gray-500">{t('posting_detail.hiring_count', '모집인원')}</Text>
                            <Text className="text-base text-gray-800">{posting.hiring_count}{t('posting_detail.people', '명')}</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* 상세 설명 */}
            {posting.description && (
                <View className="p-6 border-b border-gray-100">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-semibold">
                            {t('posting_detail.detail_description', '상세 설명')}
                        </Text>
                    </View>
                    <Text className="text-gray-700 leading-6">
                        {isTranslated && translatedData?.description ? translatedData.description : posting.description}
                    </Text>
                </View>
            )}
        </View>
    )
}