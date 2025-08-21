// components/interview-calendar/TimeSlotGrid.tsx
import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
interface TimeSlotGridProps {
    timeSlots: string[]
    selectedTimes: string[]
    bookedSlots: string[]
    onTimeToggle: (time: string) => void
}
interface TimePeriod {
    id: string
    name: string
    icon: keyof typeof Ionicons.glyphMap
    times: string[]
}
export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
    timeSlots,
    selectedTimes,
    bookedSlots,
    onTimeToggle
}) => {
    const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null)
    const timePeriods: TimePeriod[] = [
        {
            id: 'dawn',
            name: '새벽',
            icon: 'moon',
            times: timeSlots.filter(time => {
                const hour = parseInt(time.split(':')[0])
                return (hour >= 0 && hour < 6)
            })
        },
        {
            id: 'morning',
            name: '오전',
            icon: 'sunny',
            times: timeSlots.filter(time => {
                const hour = parseInt(time.split(':')[0])
                return hour >= 6 && hour < 12
            })
        },
        {
            id: 'afternoon',
            name: '오후',
            icon: 'partly-sunny',
            times: timeSlots.filter(time => {
                const hour = parseInt(time.split(':')[0])
                return hour >= 12 && hour < 18
            })
        },
        {
            id: 'evening',
            name: '저녁',
            icon: 'moon-outline',  
            times: timeSlots.filter(time => {
                const hour = parseInt(time.split(':')[0])
                return hour >= 18 && hour <= 23
            })
        }
    ]
    const getSelectedCountForPeriod = (times: string[]) => {
        return times.filter(time => selectedTimes.includes(time)).length
    }
    const togglePeriod = (periodId: string) => {
        setExpandedPeriod(expandedPeriod === periodId ? null : periodId)
    }
    return (
        <View>
            <Text className="text-base font-medium mb-3">가능 시간 선택</Text>
            <View className="flex-row flex-wrap gap-3">
                {timePeriods.map((period) => {
                    const isExpanded = expandedPeriod === period.id
                    const selectedCount = getSelectedCountForPeriod(period.times)
                    const totalCount = period.times.length
                    return (
                        <View key={period.id} className={`rounded-lg overflow-hidden w-[48%] border-2 ${
                            isExpanded ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
                        }`}>
                            <TouchableOpacity
                                onPress={() => togglePeriod(period.id)}
                                className="p-4"
                            >
                                <View className="flex-row items-center gap-3">
                                    <View className={`w-10 h-10 rounded-full items-center justify-center ${
                                        isExpanded ? 'bg-blue-500' : 'bg-blue-100'
                                    }`}>
                                        <Ionicons 
                                            name={period.icon} 
                                            size={20} 
                                            color={isExpanded ? "#ffffff" : "#3b82f6"} 
                                        />
                                    </View>
                                    <View>
                                        <Text className={`text-lg font-semibold ${
                                            isExpanded ? 'text-blue-900' : 'text-gray-900'
                                        }`}>
                                            {period.name}
                                        </Text>
                                        <Text className={`text-sm ${
                                            isExpanded ? 'text-blue-600' : 'text-gray-500'
                                        }`}>
                                            {selectedCount}/{totalCount} 선택됨
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                })}
            </View>
            {/* 선택된 시간대의 시간들을 아래에 표시 */}
            {expandedPeriod && (
                <View className="mt-4">
                    {(() => {
                        const selectedPeriod = timePeriods.find(p => p.id === expandedPeriod)
                        if (!selectedPeriod) return null
                        return (
                            <View className="bg-white rounded-lg p-4 border border-gray-200">
                                <Text className="text-lg font-semibold text-gray-900 mb-3">
                                    {selectedPeriod.name} 시간대
                                </Text>
                                
                                {selectedPeriod.times.length > 0 ? (
                                    <View className="flex-row flex-wrap gap-2">
                                        {selectedPeriod.times.map((time) => {
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
                                ) : (
                                    <Text className="text-gray-500 text-center py-4">
                                        이 시간대에 가능한 시간이 없습니다
                                    </Text>
                                )}
                            </View>
                        )
                    })()}
                </View>
            )}
        </View>
    )
}