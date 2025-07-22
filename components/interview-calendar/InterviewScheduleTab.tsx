// components/interview-calendar/InterviewScheduleTab.tsx
import React from 'react'
import { View, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { InterviewScheduleCard } from './InterviewScheduleCard'

interface InterviewSchedule {
    id: string
    interview_slot: {
        id: string
        start_time: string
        end_time: string
        location: string
        interview_type: string
    }
    proposal: {
        id: string
        location: string
        application: {
            id: string
            user: {
                id: string
                name: string
                phone_number: string
                address?: string
            }
            job_posting: {
                id: string
                title: string
                salary_range?: string
                working_hours?: string
            }
        }
    }
}

interface InterviewScheduleTabProps {
    selectedDate: string
    selectedDateSchedules: InterviewSchedule[]
    formatDateHeader: (dateString: string) => string
    onCancelInterview: (scheduleId: string) => void
}

export const InterviewScheduleTab: React.FC<InterviewScheduleTabProps> = ({
    selectedDate,
    selectedDateSchedules,
    formatDateHeader,
    onCancelInterview
}) => {
    return (
        <View className="mt-4 px-4">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold">
                    {formatDateHeader(selectedDate)}
                </Text>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-600 text-sm font-medium">
                        {selectedDateSchedules.length}건
                    </Text>
                </View>
            </View>

            {selectedDateSchedules.length === 0 ? (
                <View className="bg-white rounded-xl p-8 items-center">
                    <Ionicons name="calendar-outline" size={60} color="#cbd5e0" />
                    <Text className="text-gray-500 mt-4">
                        예정된 면접이 없습니다
                    </Text>
                </View>
            ) : (
                <View className="space-y-3">
                    {selectedDateSchedules.map((schedule) => (
                        <InterviewScheduleCard
                            key={schedule.id}
                            schedule={schedule}
                            onCancel={() => onCancelInterview(schedule.id)}
                        />
                    ))}
                </View>
            )}
        </View>
    )
}