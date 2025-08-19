import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import Back from '@/components/back'
export default function ViewMyResume() {
    const params = useLocalSearchParams()
    const { applicationId, companyName, jobTitle, resume, appliedAt } = params
    const formatDate = (dateString: string | string[]) => {
        const date = new Date(Array.isArray(dateString) ? dateString[0] : dateString)
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">제출한 이력서</Text>
            </View>
            {/* 공고 정보 */}
            <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl">
                <View>
                    <Text className="text-sm text-gray-600">지원 공고</Text>
                    <Text className="text-lg font-bold text-blue-900">
                        {Array.isArray(jobTitle) ? jobTitle[0] : jobTitle}
                    </Text>
                    <Text className="text-sm text-gray-600 mt-1">
                        {Array.isArray(companyName) ? companyName[0] : companyName}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-2">
                        지원일: {formatDate(appliedAt)}
                    </Text>
                </View>
            </View>
            {/* 이력서 내용 */}
            <ScrollView className="flex-1 px-4 py-4">
                <View className="bg-gray-50 p-6 rounded-xl">
                    <Text className="text-base text-gray-800 leading-7">
                        {Array.isArray(resume) ? resume[0] : resume}
                    </Text>
                </View>
            </ScrollView>
            {/* 하단 버튼 */}
            <View className="px-4 pb-4">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="py-3 rounded-xl bg-gray-100"
                >
                    <Text className="text-center text-gray-700 font-medium">
                        돌아가기
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}