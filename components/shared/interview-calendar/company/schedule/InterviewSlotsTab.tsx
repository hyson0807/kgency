// components/interview-calendar/InterviewSlotsTab.tsx
import React, { useState, useMemo } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { TimeSlotManager, TimeSlot as ManagerTimeSlot } from '../slots/TimeSlotManager'

interface TimeSlot {
    date: string
    startTime: string
    endTime: string
    interviewType: '대면' | '화상' | '전화'
    maxCapacity?: number
    currentCapacity?: number
}

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
    onSaveForDate: (slots: ManagerTimeSlot[]) => void
    dateTimeMap: Record<string, TimeSlot[]>
    allBookedSlots: Record<string, string[]>
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
    onSaveForDate,
    dateTimeMap,
    allBookedSlots
}) => {
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
    const [currentSlots, setCurrentSlots] = useState<ManagerTimeSlot[]>([])

    // 기존 TimeSlot을 ManagerTimeSlot으로 변환 (예약 정보 포함)
    const initialSlots: ManagerTimeSlot[] = useMemo(() => {
        const existingSlots = dateTimeMap[selectedDate] || []
        
        // 각 시간대별 예약 수 계산
        const bookingCounts: Record<string, number> = {}
        if (bookedSlots.length > 0) {
            bookedSlots.forEach(time => {
                bookingCounts[time] = (bookingCounts[time] || 0) + 1
            })
        }
        
        return existingSlots.map((slot, index) => ({
            id: `${selectedDate}-${slot.startTime}-${index}`,
            time: slot.startTime,
            maxCapacity: slot.maxCapacity || 1,
            currentBookings: slot.currentCapacity || 0
        }))
    }, [selectedDate, dateTimeMap, bookedSlots])

    const handleSlotsChange = (slots: ManagerTimeSlot[]) => {
        setCurrentSlots(slots)
    }

    const handleSave = () => {
        onSaveForDate(currentSlots)
    }
    
    return (
        <View className="flex-1">
            <View className="flex-row items-center justify-between mb-3 px-4">
                <Text className="text-lg font-bold">
                    면접 시간대 설정
                </Text>
                <TouchableOpacity
                    onPress={onRefresh}
                    className="p-2"
                >
                    <Ionicons name="refresh" size={20} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {selectedDate && (
                <View className="flex-1">
                    {/* 예약된 시간이 있으면 안내 메시지 */}
                    {bookedSlots.length > 0 && (
                        <View className="bg-yellow-50 p-3 rounded-lg mb-3 mx-4">
                            <Text className="text-sm text-yellow-800">
                                ⚠️ 이미 예약된 시간대는 변경할 수 없습니다.
                            </Text>
                        </View>
                    )}

                    <View className="bg-white rounded-xl mx-4 p-4">
                        <TimeSlotManager
                            selectedDate={selectedDate}
                            formatDateHeader={formatDateHeader}
                            initialSlots={initialSlots}
                            bookedSlots={bookedSlots}
                            onSlotsChange={handleSlotsChange}
                            onSave={handleSave}
                        />

                        {/* 모든 날짜별 선택된 시간대 종합 요약 */}
                        {Object.keys(dateTimeMap).length > 0 && (() => {
                            const now = new Date()
                            const allValidSlots: Array<{ date: string, time: string, isBooked: boolean, capacity?: number }> = []
                            
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
                                        const isBooked = allBookedSlots[date]?.includes(slot.startTime) || false
                                        allValidSlots.push({
                                            date: date,
                                            time: slot.startTime,
                                            isBooked: isBooked,
                                            capacity: slot.maxCapacity || 1
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

                            const totalCapacity = allValidSlots.reduce((sum, slot) => sum + (slot.capacity || 1), 0)

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
                                                전체 면접 가능 시간대 ({allValidSlots.length}개, 총 {totalCapacity}명)
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
                                                                    {slot.time} ({slot.capacity || 1}명)
                                                                    {slot.isBooked ? ' (예약됨)' : ''}
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
                        })()}
                    </View>
                </View>
            )}
        </View>
    )
}