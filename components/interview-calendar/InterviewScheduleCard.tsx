// components/interview-calendar/InterviewScheduleCard.tsx
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { UserDetailModal } from './UserDetailModal'

interface InterviewScheduleCardProps {
    schedule: {
        id: string
        interview_slot: {
            start_time: string
            end_time: string
            location: string
            interview_type: string
        }
        proposal: {
            location: string,
            application: {
                user: {
                    id: string
                    name: string
                    phone_number: string
                }
                job_posting: {
                    title: string
                }
            }
        }
    }
    onCancel: () => void
}

export const InterviewScheduleCard = ({ schedule, onCancel }: InterviewScheduleCardProps) => {
    const [showUserModal, setShowUserModal] = useState(false)
    
    const formatTime = (dateString: string) => {
        return format(new Date(dateString), 'HH:mm')
    }

    const handleCall = () => {
        const phoneNumber = schedule.proposal.application.user.phone_number
        Linking.openURL(`tel:${phoneNumber}`)
    }

    const handleMessage = () => {
        const phoneNumber = schedule.proposal.application.user.phone_number
        Linking.openURL(`sms:${phoneNumber}`)
    }

    const getInterviewTypeIcon = (type: string) => {
        switch (type) {
            case '화상':
                return 'videocam-outline'
            case '전화':
                return 'call-outline'
            default:
                return 'people-outline'
        }
    }

    return (
        <View className="bg-white rounded-xl p-4 shadow-sm">
            {/* 시간 정보 */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={20} color="#3b82f6" />
                    <Text className="text-lg font-bold ml-2">
                        {formatTime(schedule.interview_slot.start_time)} - {formatTime(schedule.interview_slot.end_time)}
                    </Text>
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-600 text-sm">
                        {schedule.proposal.application.job_posting.title}
                    </Text>
                </View>
            </View>

            {/* 지원자 정보 */}
            <TouchableOpacity
                onPress={() => setShowUserModal(true)}
                className="flex-row items-center mb-2"
            >
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                    <Text className="text-base font-bold">
                        {schedule.proposal.application.user.name.charAt(0)}
                    </Text>
                </View>
                <View className="ml-3 flex-1">
                    <Text className="text-base font-semibold">
                        {schedule.proposal.application.user.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                        {schedule.proposal.application.user.phone_number}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>

            {/* 면접 정보 */}
            <View className="space-y-1 mb-3">
                <View className="flex-row items-center">
                    <Ionicons
                        name={getInterviewTypeIcon(schedule.interview_slot.interview_type)}
                        size={16}
                        color="#6b7280"
                    />
                    <Text className="text-sm text-gray-600 ml-2">
                        {schedule.interview_slot.interview_type} 면접
                    </Text>
                </View>
                {/* proposal의 location 사용 */}
                {schedule.proposal.location && (
                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2">
                            {schedule.proposal.location}
                        </Text>
                    </View>
                )}
            </View>

            {/* 액션 버튼들 */}
            <View className="flex-row gap-2 pt-3 border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleCall}
                    className="flex-1 flex-row items-center justify-center bg-green-50 py-2 rounded-lg"
                >
                    <Ionicons name="call-outline" size={18} color="#16a34a" />
                    <Text className="text-green-600 text-sm font-medium ml-1">전화</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleMessage}
                    className="flex-1 flex-row items-center justify-center bg-blue-50 py-2 rounded-lg"
                >
                    <Ionicons name="chatbubble-outline" size={18} color="#3b82f6" />
                    <Text className="text-blue-600 text-sm font-medium ml-1">문자</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onCancel}
                    className="flex-1 flex-row items-center justify-center bg-red-50 py-2 rounded-lg"
                >
                    <Ionicons name="close-circle-outline" size={18} color="#dc2626" />
                    <Text className="text-red-600 text-sm font-medium ml-1">취소</Text>
                </TouchableOpacity>
            </View>
            
            {/* User Detail Modal */}
            <UserDetailModal
                visible={showUserModal}
                onClose={() => setShowUserModal(false)}
                userId={schedule.proposal.application.user.id}
            />
        </View>
    )
}