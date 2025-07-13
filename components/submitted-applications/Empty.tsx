import React from 'react'
import {Ionicons} from "@expo/vector-icons";
import {Text, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";

interface EmptyProps {
    activeFilter: 'all' | 'pending' | 'reviewed'
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
}

export const Empty = ({activeFilter, t}: EmptyProps) => {

    return (
        <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="document-text-outline" size={80} color="#9ca3af" />
            <Text className="text-gray-500 text-lg mt-4">
                {activeFilter === 'all'
                    ? t('applications.no_applications', '아직 지원한 공고가 없습니다')
                    : activeFilter === 'pending'
                        ? t('applications.no_pending', '검토중인 지원이 없습니다')
                        : t('applications.no_reviewed', '검토 완료된 지원이 없습니다')}
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