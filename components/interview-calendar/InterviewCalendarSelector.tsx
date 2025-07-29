// components/interview-calendar/InterviewCalendarSelector.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { api } from '@/lib/api'
import { useModal } from '@/hooks/useModal'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// 한국어 캘린더 설정
LocaleConfig.locales['ko'] = {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘'
}
LocaleConfig.defaultLocale = 'ko'

interface TimeSlot {
    date: string
    startTime: string
    endTime: string
    interviewType: '대면' | '화상' | '전화'
}

interface InterviewCalendarSelectorProps {
    companyId: string
    onConfirm: (selectedDate: string, selectedTime: string, interviewType: string) => void
}

interface TimeSlotSelectorProps {
    timeSlots: string[]
    selectedTimes: string[]
    bookedSlots: string[]
    presetSlots: string[]
    onTimeToggle: (time: string) => void
}

interface TimePeriod {
    id: string
    name: string
    icon: keyof typeof Ionicons.glyphMap
    times: string[]
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
    timeSlots,
    selectedTimes,
    bookedSlots,
    presetSlots,
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
            <Text className="text-base font-medium mb-2">가능한 시간대 (여러 개 선택 가능)</Text>
            
            {/* 안내 메시지 */}
            {presetSlots.length > 0 && (
                <View className="bg-blue-50 p-3 rounded-lg mb-3">
                    <Text className="text-sm text-blue-800">
                        ✓ 표시된 시간은 면접 관리 탭에서 설정한 기본 시간대입니다.
                    </Text>
                </View>
            )}

            <View className="flex-row flex-wrap gap-3 mb-4">
                {timePeriods.map((period) => {
                    const isExpanded = expandedPeriod === period.id
                    const selectedCount = getSelectedCountForPeriod(period.times)
                    const totalCount = period.times.length

                    if (totalCount === 0) return null

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
                <View className="mb-4">
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
                                            const isPreset = presetSlots.includes(time)
                                            const isSelected = selectedTimes.includes(time)

                                            return (
                                                <TouchableOpacity
                                                    key={time}
                                                    onPress={() => !isBooked && onTimeToggle(time)}
                                                    disabled={isBooked}
                                                    className={`px-4 py-2 rounded-lg border ${
                                                        isBooked
                                                            ? 'bg-gray-100 border-gray-300'
                                                            : isPreset
                                                                ? 'bg-green-500 border-green-500'
                                                                : isSelected
                                                                    ? 'bg-blue-500 border-blue-500'
                                                                    : 'bg-white border-gray-300'
                                                    }`}
                                                >
                                                    <Text className={
                                                        isBooked
                                                            ? 'text-gray-400'
                                                            : isPreset || isSelected
                                                                ? 'text-white'
                                                                : 'text-gray-700'
                                                    }>
                                                        {isPreset && '✓ '}{time}
                                                        {isBooked && ' (예약됨)'}
                                                    </Text>
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
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)
    
    // 0시부터 24시까지 30분 간격의 시간 슬롯 생성
    const generateTimeSlots = () => {
        const slots = []
        for (let hour = 0; hour < 24; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`)
            slots.push(`${hour.toString().padStart(2, '0')}:30`)
        }
        return slots
    }
    
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
                        면접 제안 확정123
                    </Text>
                </TouchableOpacity>

                {/* 모든 날짜별 선택된 시간대 종합 요약 */}
                {Object.keys(dateTimeMap).length > 0 && (() => {
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
                })()}
            </View>

            <ModalComponent />
        </View>
    )
}