import React from 'react'
import {Ionicons} from "@expo/vector-icons";
import {Text, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";
interface EmptyProps {
    activeFilter: 'all' | 'user_initiated' | 'company_invited' | 'user_instant_interview'
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
}
export const Empty = ({activeFilter, t}: EmptyProps) => {
    return (
        <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="document-text-outline" size={80} color="#9ca3af" />
            <Text className="text-gray-500 text-lg mt-4">
                {activeFilter === 'all'
                    ? t('applications.no_applications', '아직 지원한 공고가 없습니다')
                    : activeFilter === 'user_initiated'
                        ? t('applications.no_user_initiated', '내가 지원한 공고가 없습니다')
                        : activeFilter === 'company_invited'
                            ? t('applications.no_company_invited', '회사에서 초대한 지원이 없습니다')
                            : t('applications.no_instant_interview', '즉석 면접 지원이 없습니다')}
            </Text>
            {activeFilter === 'all' && (
                <TouchableOpacity
                    onPress={() => router.push('/(user)/home')}
                    className="mt-4 px-6 py-3 bg-blue-500 rounded-xl"
                >
                    <Text className="text-white font-medium">{t('applications.go_to_postings', '공고 보러가기')}</Text>
                </TouchableOpacity>
            )}
        </View>
    )
}