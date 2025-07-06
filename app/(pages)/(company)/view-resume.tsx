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
    const {
        applicationId,
        messageId,
        userName,
        userPhone,
        resume,
        subject,
        createdAt
    } = params

    useEffect(() => {
        if (messageId) {
            markAsRead()
        }
    }, [messageId])

    const markAsRead = async () => {
        if (!messageId) return

        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId)
        } catch (error) {
            console.error('읽음 표시 실패:', error)
        }
    }

    const handleContact = () => {
        const phone = Array.isArray(userPhone) ? userPhone[0] : userPhone
        const name = Array.isArray(userName) ? userName[0] : userName

        if (phone) {
            Alert.alert(
                '지원자 연락처',
                `${name}님의 연락처:\n${phone}`,
                [
                    { text: '닫기', style: 'cancel' },
                    {
                        text: '복사',
                        onPress: () => {
                            // 실제 앱에서는 Clipboard API 사용
                            Alert.alert('알림', '전화번호가 복사되었습니다.')
                        }
                    }
                ]
            )
        } else {
            Alert.alert('알림', '연락처 정보가 없습니다.')
        }
    }

    const handleSaveResume = () => {
        Alert.alert('알림', '이력서가 저장되었습니다.')
    }

    const formatDate = (dateString: string | string[]) => {
        const date = new Date(Array.isArray(dateString) ? dateString[0] : dateString)
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
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
                        <Text className="text-lg font-bold text-blue-900">
                            {Array.isArray(userName) ? userName[0] : userName}
                        </Text>
                        {subject && (
                            <Text className="text-sm text-gray-600 mt-1">
                                {Array.isArray(subject) ? subject[0] : subject}
                            </Text>
                        )}
                        {createdAt && (
                            <Text className="text-xs text-gray-500 mt-1">
                                수신일: {formatDate(createdAt)}
                            </Text>
                        )}
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
                        {Array.isArray(resume) ? resume[0] : resume}
                    </Text>
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