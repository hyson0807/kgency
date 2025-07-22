// components/interview-calendar/InterviewSlotsTab.tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TimeSlotGrid } from './TimeSlotGrid'

interface InterviewSlotsTabProps {
    selectedDate: string
    formatDateHeader: (dateString: string) => string
    onRefresh: () => void
    bookedSlots: string[]
    interviewType: '대면' | '화상' | '전화'
    onInterviewTypeChange: (type: '대면' | '화상' | '전화') => void
    timeSlots: string[]
    selectedTimes: string[]
    onTimeToggle: (time: string) => void
    onSaveForDate: () => void
}

export const InterviewSlotsTab: React.FC<InterviewSlotsTabProps> = ({
    selectedDate,
    formatDateHeader,
    onRefresh,
    bookedSlots,
    interviewType,
    onInterviewTypeChange,
    timeSlots,
    selectedTimes,
    onTimeToggle,
    onSaveForDate
}) => {
    return (
        <View className="px-4 mt-4">
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-lg font-bold">
                    {formatDateHeader(selectedDate)}
                </Text>
                <TouchableOpacity
                    onPress={onRefresh}
                    className="p-2"
                >
                    <Ionicons name="refresh" size={20} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {selectedDate && (
                <View>
                    {/* 예약된 시간이 있으면 안내 메시지 */}
                    {bookedSlots.length > 0 && (
                        <View className="bg-yellow-50 p-3 rounded-lg mb-3">
                            <Text className="text-sm text-yellow-800">
                                ⚠️ 이미 예약된 시간대는 변경할 수 없습니다.
                            </Text>
                        </View>
                    )}

                    <View className="bg-white rounded-xl p-4">


                        <TimeSlotGrid
                            timeSlots={timeSlots}
                            selectedTimes={selectedTimes}
                            bookedSlots={bookedSlots}
                            onTimeToggle={onTimeToggle}
                        />

                        {/* 저장 버튼 */}
                        <TouchableOpacity
                            onPress={onSaveForDate}
                            className="mt-4 py-3 bg-blue-500 rounded-lg"
                        >
                            <Text className="text-center text-white font-semibold">
                                {selectedDate} 시간대 저장
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    )
}