// app/(pages)/(user)/interview-details.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useTranslation } from '@/contexts/TranslationContext'
import Back from '@/components/back'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { formatKoreanDate, formatTime24 } from '@/lib/dateUtils'

interface InterviewDetails {
    id: string
    interview_location: string
    interview_time_slots: any  // 임시로 any 타입 사용
    job_postings: any  // 임시로 any 타입 사용
}

export default function InterviewDetails() {
    const { applicationId } = useLocalSearchParams()
    const { t } = useTranslation()
    const [interview, setInterview] = useState<InterviewDetails | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadInterviewDetails()
    }, [])

    const loadInterviewDetails = async () => {
        try {
            const response = await api('GET', `/api/interview-proposals/confirmed/${applicationId}`);
            
            if (!response.success) {
                throw new Error(response.error);
            }
            
            console.log('User interview details raw data:', response.data)
            setInterview(response.data)
        } catch (error) {
            console.error('Error loading interview details:', error)
        } finally {
            setLoading(false)
        }
    }


    const addToCalendar = () => {
        // 캘린더 추가 기능은 나중에 구현
        // 일단 alert로 대체
        alert('캘린더에 추가하기 기능은 추후 제공될 예정입니다.')
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        )
    }

    if (!interview) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center p-4 border-b border-gray-200">
                    <Back />
                    <Text className="text-lg font-bold ml-4">면접 정보</Text>
                </View>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500">면접 정보를 찾을 수 없습니다.</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 정보</Text>
            </View>

            <ScrollView className="flex-1">
                {/* 상태 표시 */}
                <View className="bg-green-50 p-4 mx-4 mt-4 rounded-xl">
                    <View className="flex-row items-center">
                        <View className="bg-green-500 p-2 rounded-full mr-3">
                            <Ionicons name="checkmark" size={20} color="white" />
                        </View>
                        <Text className="text-green-700 font-semibold text-lg">
                            면접이 확정되었습니다
                        </Text>
                    </View>
                </View>

                {/* 회사 정보 */}
                <View className="p-4 mx-4 mt-4 bg-gray-50 rounded-xl">
                    <Text className="text-sm text-gray-600 mb-1">회사</Text>
                    <Text className="text-lg font-semibold">
                        {interview.job_postings.company.name}
                    </Text>
                    <Text className="text-base text-gray-700 mt-1">
                        {interview.job_postings.title}
                    </Text>
                </View>

                {/* 면접 일시 */}
                <View className="p-4 mx-4 mt-4 bg-blue-50 rounded-xl">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="calendar" size={20} color="#3b82f6" />
                        <Text className="text-sm text-gray-600 ml-2">면접 일시</Text>
                    </View>
                    <Text className="text-lg font-semibold text-blue-600">
                        {formatKoreanDate(interview.interview_time_slots?.interview_date || interview.interview_time_slots?.[0]?.interview_date)}
                    </Text>
                    <Text className="text-lg text-blue-600 mt-1">
                        {formatTime24(interview.interview_time_slots.start_time)} - {formatTime24(interview.interview_time_slots.end_time)}
                    </Text>
                </View>

                {/* 면접 장소 */}
                <View className="p-4 mx-4 mt-4 bg-gray-50 rounded-xl">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="location" size={20} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2">면접 장소</Text>
                    </View>
                    <Text className="text-base font-medium">
                        {interview.interview_location}
                    </Text>
                </View>

                {/* 연락처 */}
                <View className="p-4 mx-4 mt-4 bg-gray-50 rounded-xl">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="call" size={20} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2">회사 연락처</Text>
                    </View>
                    <Text className="text-base font-medium">
                        {interview.job_postings.company.phone_number}
                    </Text>
                </View>

                {/* 주의사항 */}
                <View className="p-4 mx-4 mt-4 mb-4 bg-yellow-50 rounded-xl">
                    <View className="flex-row items-start">
                        <Ionicons name="information-circle" size={20} color="#f59e0b" />
                        <View className="ml-2 flex-1">
                            <Text className="text-sm font-semibold text-yellow-700 mb-1">
                                면접 준비사항
                            </Text>
                            <Text className="text-sm text-yellow-700">
                                • 면접 10분 전까지 도착해주세요{'\n'}
                                • 신분증을 꼭 지참해주세요{'\n'}
                                • 복장은 단정하게 준비해주세요
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 캘린더 추가 버튼 */}
                <View className="px-4 mb-8">
                    <TouchableOpacity
                        onPress={addToCalendar}
                        className="bg-blue-500 py-4 rounded-xl flex-row items-center justify-center"
                    >
                        <Ionicons name="calendar-outline" size={20} color="white" />
                        <Text className="text-white font-semibold ml-2">
                            캘린더에 추가하기
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}