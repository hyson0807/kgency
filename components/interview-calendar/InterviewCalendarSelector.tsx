import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { api } from '@/lib/api'
import { useModal } from '@/hooks/useModal'
import { TimeSlot, InterviewCalendarSelectorProps } from './types'
import { TimeSlotSelector } from './TimeSlotSelector'
import { InterviewSlotsSummary } from './InterviewSlotsSummary'
import { setupCalendarLocale } from './config/calendarLocale'
import { generateTimeSlots } from './utils'

// 캘린더 로케일 설정
setupCalendarLocale()

export const InterviewCalendarSelector: React.FC<InterviewCalendarSelectorProps> = ({
    companyId,
    onConfirm
}) => {
    const { showModal, ModalComponent } = useModal()
    
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [selectedTimes, setSelectedTimes] = useState<string[]>([])
    const [interviewType] = useState<'대면' | '화상' | '전화'>('대면')
    const [loading, setLoading] = useState(true)
    const [dateTimeMap, setDateTimeMap] = useState<Record<string, TimeSlot[]>>({})
    const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({})
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [presetSlots, setPresetSlots] = useState<string[]>([])  // 미리 설정된 시간대
    
    const allTimeSlots = generateTimeSlots()

    useEffect(() => {
        fetchSlots()
    }, [companyId])

    useEffect(() => {
        // 선택된 날짜의 슬롯 필터링
        if (selectedDate && dateTimeMap[selectedDate]) {
            const slots = dateTimeMap[selectedDate]
            const bookedTimes = bookedSlots[selectedDate] || []
            const available = slots.filter(slot => !bookedTimes.includes(slot.startTime))
            setAvailableSlots(available)
            
            // 이미 설정된 시간대를 presetSlots에 저장
            const availableTimes = available.map(slot => slot.startTime)
            setPresetSlots(availableTimes)
            
            // 선택된 시간에 preset 시간 포함
            setSelectedTimes(availableTimes)
        } else {
            setAvailableSlots([])
            setPresetSlots([])
            setSelectedTimes([])
        }
    }, [selectedDate, dateTimeMap, bookedSlots])

    const fetchSlots = async () => {
        try {
            setLoading(true)
            const result = await api('GET', `/api/company/interview-slots?companyId=${companyId}`)

            if (result?.data && Array.isArray(result.data)) {
                const groupedSlots: Record<string, TimeSlot[]> = {}
                const bookedSlotsMap: Record<string, string[]> = {}

                result.data.forEach((slot: any) => {
                    const startDateTime = new Date(slot.start_time)
                    const date = startDateTime.toISOString().split('T')[0]
                    const startTime = startDateTime.toTimeString().slice(0, 5)

                    const endDateTime = new Date(slot.end_time)
                    const endTime = endDateTime.toTimeString().slice(0, 5)

                    const timeSlot: TimeSlot = {
                        date: date,
                        startTime: startTime,
                        endTime: endTime,
                        interviewType: slot.interview_type
                    }

                    if (!groupedSlots[date]) {
                        groupedSlots[date] = []
                        bookedSlotsMap[date] = []
                    }

                    groupedSlots[date].push(timeSlot)

                    // 예약된 슬롯이면 기록
                    if (slot.is_booked) {
                        bookedSlotsMap[date].push(startTime)
                    }
                })

                setDateTimeMap(groupedSlots)
                setBookedSlots(bookedSlotsMap)
            }
        } catch (error) {
            console.error('Failed to fetch slots:', error)
            showModal('오류', '면접 시간대를 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleDayPress = (day: any) => {
        const today = new Date()
        const selectedDay = new Date(day.dateString)
        
        // 오늘 날짜의 자정으로 설정하여 비교
        today.setHours(0, 0, 0, 0)
        selectedDay.setHours(0, 0, 0, 0)
        
        // 과거 날짜는 선택 불가
        if (selectedDay < today) {
            return
        }
        
        setSelectedDate(day.dateString)
    }

    const handleTimeSelect = (time: string) => {
        // 미리 설정된 시간대는 선택 해제 불가
        if (presetSlots.includes(time)) {
            return
        }
        
        if (selectedTimes.includes(time)) {
            // 이미 선택된 시간이면 제거
            setSelectedTimes(selectedTimes.filter(t => t !== time))
        } else {
            // 선택되지 않은 시간이면 추가
            setSelectedTimes([...selectedTimes, time])
        }
    }

    const handleConfirm = () => {
        if (!selectedDate || selectedTimes.length === 0) {
            showModal('알림', '날짜와 시간을 모두 선택해주세요.')
            return
        }

        onConfirm(selectedDate, selectedTimes.join(','), interviewType)
    }

    const getMarkedDates = () => {
        const marked: any = {}

        // 시간대가 있는 날짜 표시
        Object.keys(dateTimeMap).forEach(date => {
            const hasAvailable = dateTimeMap[date].some(slot => 
                !bookedSlots[date]?.includes(slot.startTime)
            )
            
            if (hasAvailable) {
                marked[date] = {
                    marked: true,
                    dotColor: '#3b82f6'
                }
            }
        })

        // 선택된 날짜 표시
        marked[selectedDate] = {
            ...marked[selectedDate],
            selected: true,
            selectedColor: '#3b82f6'
        }

        return marked
    }

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, 'M월 d일 (E)', { locale: ko })
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        )
    }

    return (
        <View className="flex-1">
            {/* 캘린더 */}
            <View className="bg-white">
                <Calendar
                    current={selectedDate}
                    onDayPress={handleDayPress}
                    markedDates={getMarkedDates()}
                    minDate={format(new Date(), 'yyyy-MM-dd')}
                    theme={{
                        backgroundColor: '#ffffff',
                        calendarBackground: '#ffffff',
                        selectedDayBackgroundColor: '#3b82f6',
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: '#3b82f6',
                        dayTextColor: '#2d3748',
                        textDisabledColor: '#cbd5e0',
                        dotColor: '#3b82f6',
                        monthTextColor: '#1a202c',
                        textMonthFontWeight: 'bold',
                        textDayFontSize: 16,
                        textMonthFontSize: 18,
                        textDayHeaderFontSize: 14
                    }}
                />
            </View>

            {/* 선택된 날짜의 시간대 */}
            <View className="p-4">
                <Text className="text-lg font-bold mb-3">
                    {formatDateHeader(selectedDate)}
                </Text>


                {/* 시간 선택 */}
                <TimeSlotSelector
                    timeSlots={allTimeSlots}
                    selectedTimes={selectedTimes}
                    bookedSlots={bookedSlots[selectedDate] || []}
                    presetSlots={presetSlots}
                    onTimeToggle={handleTimeSelect}
                />

                {/* 모든 날짜별 선택된 시간대 종합 요약 */}
                {Object.keys(dateTimeMap).length > 0 && (
                    <InterviewSlotsSummary
                        dateTimeMap={dateTimeMap}
                        bookedSlots={bookedSlots}
                    />
                )}


                {/* 확인 버튼 */}
                <TouchableOpacity
                    onPress={handleConfirm}
                    disabled={selectedTimes.length === 0}
                    className={`mt-6 py-4 rounded-lg ${
                        selectedTimes.length > 0
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                    }`}
                >
                    <Text className="text-center text-white font-semibold">
                        면접 제안
                    </Text>
                </TouchableOpacity>


            </View>

            <ModalComponent />
        </View>
    )
}