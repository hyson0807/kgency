// app/(pages)/(company)/view-resume.tsx
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { supabase } from '@/lib/supabase'

export default function ViewResume() {
    const params = useLocalSearchParams()
    const { applicationId, userName, resume } = params

    useEffect(() => {
        markAsRead()
    }, [applicationId])

    const markAsRead = async () => {
        if (!applicationId) return

        try {
            // application의 message_id를 통해 메시지를 읽음 표시
            const { data: application } = await supabase
                .from('applications')
                .select('message_id')
                .eq('id', applicationId)
                .single()

            if (application?.message_id) {
                await supabase
                    .from('messages')
                    .update({ is_read: true })
                    .eq('id', application.message_id)
            }
        } catch (error) {
            console.error('읽음 표시 실패:', error)
        }
    }

    const handleContact = () => {
        Alert.alert(
            '지원자 연락',
            `${userName}님에게 연락하시겠습니까?`,
            [
                { text: '취소', style: 'cancel' },
                { text: '확인', onPress: () => router.back() }
            ]
        )
    }

    const handleSaveResume = () => {
        Alert.alert('알림', '이력서가 저장되었습니다.')
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <View className="flex-row items-center">
                    <Back />
                    <Text className="text-lg font-bold ml-4">이력서</Text>
                </View>
                <TouchableOpacity onPress={handleSaveResume}>
                    <Ionicons name="bookmark-outline" size={24} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {/* 지원자 정보 */}
            <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-sm text-gray-600">지원자</Text>
                        <Text className="text-lg font-bold text-blue-900">{userName}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleContact}
                        className="bg-blue-500 px-4 py-2 rounded-lg"
                    >
                        <Text className="text-white font-medium">연락하기</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 이력서 내용 */}
            <ScrollView className="flex-1 px-4 py-4">
                <View className="bg-gray-50 p-6 rounded-xl">
                    <Text className="text-base text-gray-800 leading-7">
                        {resume}
                    </Text>
                </View>

                {/* AI 생성 안내 */}
                <View className="mt-4 mb-6 p-4 bg-amber-50 rounded-xl">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={20} color="#f59e0b" />
                        <View className="ml-2 flex-1">
                            <Text className="text-sm font-medium text-amber-900">
                                AI가 작성한 이력서입니다
                            </Text>
                            <Text className="text-xs text-amber-700 mt-1">
                                지원자의 프로필 정보를 기반으로 귀사의 채용 공고에 맞춰 작성되었습니다.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* 하단 액션 버튼 */}
            <View className="px-4 pb-4">
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="flex-1 py-3 rounded-xl border border-gray-300"
                    >
                        <Text className="text-center text-gray-700 font-medium">
                            목록으로
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleContact}
                        className="flex-1 py-3 rounded-xl bg-blue-500"
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="call" size={20} color="white" />
                            <Text className="text-white font-medium ml-2">
                                지원자 연락
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}