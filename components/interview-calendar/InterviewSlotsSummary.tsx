import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { TimeSlot } from './types'

interface InterviewSlotsSummaryProps {
    dateTimeMap: Record<string, TimeSlot[]>
    bookedSlots: Record<string, string[]>
}

export const InterviewSlotsSummary: React.FC<InterviewSlotsSummaryProps> = ({
    dateTimeMap,
    bookedSlots
}) => {
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, 'M월 d일 (E)', { locale: ko })
    }

    const now = new Date()
    const allValidSlots: Array<{ date: string, time: string, isBooked: boolean }> = []

    // 모든 날짜의 시간대를 수집하고 현재 시간 이후만 필터링
    Object.entries(dateTimeMap).forEach(([date, slots]) => {
        const dateObj = new Date(date)
        const isToday = dateObj.toDateString() === now.toDateString()

        slots.forEach(slot => {
            const [hour, minute] = slot.startTime.split(':')
            const slotDateTime = new Date(date)
            slotDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0)

            // 오늘인 경우 현재 시간 이후만, 미래 날짜는 모두 포함
            const isValidTime = isToday ? slotDateTime >= now : dateObj > now

            if (isValidTime) {
                const isBooked = bookedSlots[date]?.includes(slot.startTime) || false
                allValidSlots.push({
                    date: date,
                    time: slot.startTime,
                    isBooked: isBooked
                })
            }
        })
    })

    // 날짜별, 시간별로 정렬
    allValidSlots.sort((a, b) => {
        if (a.date !== b.date) {
            return a.date.localeCompare(b.date)
        }
        const [aHour, aMin] = a.time.split(':').map(Number)
        const [bHour, bMin] = b.time.split(':').map(Number)
        return (aHour * 60 + aMin) - (bHour * 60 + bMin)
    })

    if (allValidSlots.length === 0) return null

    return (
        <View className="mt-6 bg-green-50 rounded-lg border border-green-200">
            {/* 접기/펼치기 헤더 */}
            <TouchableOpacity
                onPress={() => setIsSummaryExpanded(!isSummaryExpanded)}
                className="flex-row items-center justify-between p-4"
            >
                <View className="flex-row items-center gap-2">
                    <Ionicons name="calendar" size={20} color="#16a34a" />
                    <Text className="text-lg font-semibold text-green-900">
                        전체 면접 가능 시간대 ({allValidSlots.length}개)
                    </Text>
                </View>
                <Ionicons
                    name={isSummaryExpanded ? "chevron-up" : "chevron-down"}
                    size={20}
                    color="#16a34a"
                />
            </TouchableOpacity>

            {/* 접을 수 있는 내용 */}
            {isSummaryExpanded && (
                <View className="px-4 pb-4">
                    {/* 날짜별로 그룹화하여 표시 */}
                    {Object.entries(
                        allValidSlots.reduce((acc, slot) => {
                            if (!acc[slot.date]) acc[slot.date] = []
                            acc[slot.date].push(slot)
                            return acc
                        }, {} as Record<string, typeof allValidSlots>)
                    ).map(([date, slots]) => (
                        <View key={date} className="mb-3">
                            <Text className="text-sm font-medium text-green-800 mb-2">
                                {formatDateHeader(date)}
                            </Text>
                            <View className="flex-row flex-wrap gap-2 pl-2">
                                {slots.map((slot) => (
                                    <View
                                        key={`${slot.date}-${slot.time}`}
                                        className={`px-3 py-1.5 rounded-full border ${
                                            slot.isBooked
                                                ? 'bg-gray-100 border-gray-300'
                                                : 'bg-green-100 border-green-300'
                                        }`}
                                    >
                                        <Text className={`text-sm font-medium ${
                                            slot.isBooked ? 'text-gray-600' : 'text-green-800'
                                        }`}>
                                            {slot.time}{slot.isBooked ? ' (예약됨)' : ''}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}

                    <View className="mt-2 pt-2 border-t border-green-200">
                        <Text className="text-xs text-green-600 text-center">
                            💡 현재 시간 이후의 모든 면접 가능 시간대입니다
                        </Text>
                    </View>
                </View>
            )}
        </View>
    )
}