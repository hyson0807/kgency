// components/interview-calendar/TimeSlotGrid.tsx
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

interface TimeSlotGridProps {
    timeSlots: string[]
    selectedTimes: string[]
    bookedSlots: string[]
    onTimeToggle: (time: string) => void
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
    timeSlots,
    selectedTimes,
    bookedSlots,
    onTimeToggle
}) => {
    return (
        <View>
            <Text className="text-base font-medium mb-3">가능 시간 선택</Text>
            <View className="flex-row flex-wrap gap-2">
                {timeSlots.map((time) => {
                    const isBooked = bookedSlots.includes(time)
                    const isSelected = selectedTimes.includes(time)

                    return (
                        <TouchableOpacity
                            key={time}
                            onPress={() => onTimeToggle(time)}
                            disabled={isBooked}
                            className={`px-4 py-2 rounded-lg border relative ${
                                isBooked
                                    ? 'bg-gray-100 border-gray-300'
                                    : isSelected
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                            }`}
                        >
                            <Text className={
                                isBooked
                                    ? 'text-gray-400'
                                    : isSelected
                                        ? 'text-white'
                                        : 'text-gray-700'
                            }>
                                {time}
                            </Text>
                            {isBooked && (
                                <Text className="text-xs text-gray-400 absolute -bottom-2">
                                    예약됨
                                </Text>
                            )}
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}