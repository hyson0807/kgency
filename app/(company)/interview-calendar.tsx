// app/(company)/interview-calendar.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { useLocalSearchParams } from 'expo-router'

// Components
import { InterviewScheduleTab } from '@/components/interview-calendar/InterviewScheduleTab'
import { InterviewSlotsTab } from '@/components/interview-calendar/InterviewSlotsTab'

// Hooks & Utils
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/hooks/useModal'

// 한국어 캘린더 설정
LocaleConfig.locales['ko'] = {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘'
}
LocaleConfig.defaultLocale = 'ko'

// Types
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

interface TimeSlot {
    date: string
    startTime: string
    endTime: string
    interviewType: '대면' | '화상' | '전화'
}

export default function InterviewCalendar() {
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()
    const { tab } = useLocalSearchParams<{ tab?: string }>()

    // ==================== State ====================
    const [activeTab, setActiveTab] = useState<'schedule' | 'slots'>('schedule')
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'))
    const [schedules, setSchedules] = useState<InterviewSchedule[]>([])
    const [groupedSchedules, setGroupedSchedules] = useState<Record<string, InterviewSchedule[]>>({})
    const [selectedDateSchedules, setSelectedDateSchedules] = useState<InterviewSchedule[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // 시간대 설정을 위한 state
    const [selectedTimes, setSelectedTimes] = useState<string[]>([])
    const [interviewType, setInterviewType] = useState<'대면' | '화상' | '전화'>('대면')
    const [dateTimeMap, setDateTimeMap] = useState<Record<string, TimeSlot[]>>({})
    const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({})

    // ==================== Effects ====================
    useEffect(() => {
        // URL 파라미터에 따라 탭 설정
        if (tab === 'slots') {
            setActiveTab('slots')
        }
    }, [tab])

    useEffect(() => {
        if (user?.userId) {
            if (activeTab === 'schedule') {
                fetchMonthSchedules(currentMonth)
            } else {
                fetchSlots()
            }
        }
    }, [user?.userId, currentMonth, activeTab])

    useEffect(() => {
        // 선택된 날짜의 일정 필터링
        const daySchedules = groupedSchedules[selectedDate] || []
        setSelectedDateSchedules(daySchedules)
    }, [selectedDate, groupedSchedules])

    useEffect(() => {
        // 시간대 설정 탭에서 날짜 선택 시 기존 시간들 로드
        if (activeTab === 'slots' && selectedDate) {
            const existingSlots = dateTimeMap[selectedDate] || []
            const bookedTimesForDate = bookedSlots[selectedDate] || []
            const allExistingTimes = existingSlots.map(slot => slot.startTime)
            setSelectedTimes(allExistingTimes)
            
            if (existingSlots.length > 0) {
                setInterviewType(existingSlots[0].interviewType || '대면')
            } else {
                setInterviewType('대면')
            }
        }
    }, [selectedDate, dateTimeMap, bookedSlots, activeTab])

    // ==================== API Functions ====================
    const fetchMonthSchedules = async (month: string) => {
        try {
            setLoading(true)
            const response = await api('GET', `/api/interview-schedules/company?companyId=${user?.userId}&month=${month}`)

            if (response?.success) {
                setSchedules(response.data.schedules || [])
                setGroupedSchedules(response.data.groupedSchedules || {})
            }
        } catch (error) {
            console.error('Failed to fetch schedules:', error)
            showModal('오류', '면접 일정을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const fetchSlots = async () => {
        const result = await api('GET', '/api/company/interview-slots?companyId=' + user?.userId)

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

            // 현재 선택된 날짜가 있다면 해당 날짜의 시간들을 다시 설정
            if (selectedDate && groupedSlots[selectedDate]) {
                const updatedTimes = groupedSlots[selectedDate].map(slot => slot.startTime)
                setSelectedTimes(updatedTimes)
            }
        }
    }

    const handleCancelInterview = async (scheduleId: string) => {
        showModal(
            '면접 취소',
            '정말로 이 면접을 취소하시겠습니까?',
            'confirm',
            async () => {
                try {
                    const response = await api('PUT', `/api/interview-schedules/company/${scheduleId}/cancel`, {
                        companyId: user?.userId
                    })

                    if (response?.success) {
                        await fetchMonthSchedules(currentMonth)
                    }
                } catch (error) {
                    console.error('Failed to cancel interview:', error)
                    showModal('오류', '면접 취소에 실패했습니다.')
                }
            },
            true
        )
    }

    // 시간대 설정 관련 핸들러들
    const timeSlots = []
    for (let hour = 10; hour < 18; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
        timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    const handleTimeToggle = (time: string) => {
        // 예약된 시간은 선택 불가
        if (bookedSlots[selectedDate]?.includes(time)) {
            showModal('알림', '이미 예약된 시간대입니다.')
            return
        }

        if (selectedTimes.includes(time)) {
            setSelectedTimes(selectedTimes.filter(t => t !== time))
        } else {
            setSelectedTimes([...selectedTimes, time])
        }
    }

    const handleSaveForDate = async () => {
        if (!selectedDate) {
            showModal('알림', '날짜를 선택해주세요.')
            return
        }

        const bookedTimesForDate = bookedSlots[selectedDate] || []
        const mustIncludeBookedTimes = [...bookedTimesForDate]
        const newlySelectedTimes = selectedTimes.filter(time => !bookedTimesForDate.includes(time))
        const finalTimes = [...new Set([...mustIncludeBookedTimes, ...newlySelectedTimes])]

        if (finalTimes.length === 0) {
            if (dateTimeMap[selectedDate] && dateTimeMap[selectedDate].length > 0) {
                if (bookedTimesForDate.length > 0) {
                    showModal('알림', '예약된 시간대가 있어 모든 시간을 삭제할 수 없습니다.')
                    return
                }

                showModal(
                    '확인',
                    `${selectedDate}의 모든 면접 시간대를 삭제하시겠습니까?`,
                    'confirm',
                    async () => {
                        const response = await api('POST', '/api/company/interview-slots', {
                            companyId: user?.userId,
                            date: selectedDate,
                            slots: []
                        })

                        if (response?.success) {
                            await fetchSlots()
                            showModal('성공', `${selectedDate}의 면접 시간대가 삭제되었습니다.`, 'info')
                        }
                    }
                )
                return
            } else {
                showModal('알림', '최소 1개의 시간대를 선택해주세요.')
                return
            }
        }

        const slots = finalTimes.map(time => {
            const [hour, minute] = time.split(':')
            const endHour = minute === '30' ? parseInt(hour) + 1 : parseInt(hour)
            const endMinute = minute === '30' ? '00' : '30'

            const existingSlot = dateTimeMap[selectedDate]?.find(s => s.startTime === time)

            return {
                date: selectedDate,
                startTime: time,
                endTime: existingSlot?.endTime || `${endHour.toString().padStart(2, '0')}:${endMinute}`,
                interviewType: existingSlot?.interviewType || interviewType
            }
        })

        const response = await api('POST', '/api/company/interview-slots', {
            companyId: user?.userId,
            date: selectedDate,
            slots: slots
        })

        if (response?.success) {
            await fetchSlots()
            showModal('성공', `${selectedDate}의 면접 시간대가 저장되었습니다.`, 'info')
        }
    }

    // ==================== Event Handlers ====================
    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString)
    }

    const handleMonthChange = (month: any) => {
        setCurrentMonth(month.dateString.slice(0, 7))
    }

    // ==================== Render Functions ====================
    // 캘린더에 표시할 marked dates 생성
    const getMarkedDates = () => {
        const marked: any = {}

        // 면접 있는 날짜 표시
        Object.keys(groupedSchedules).forEach(date => {
            marked[date] = {
                marked: true,
                dotColor: '#3b82f6',
                customStyles: {
                    text: {
                        color: '#3b82f6',
                        fontWeight: 'bold'
                    }
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
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </SafeAreaView>
        )
    }

    // ==================== Main Render ====================
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white border-b border-gray-200">
                <View className="flex-row items-center p-4">
                    <Text className="text-lg font-bold">면접 일정 관리</Text>
                </View>
                
                {/* 탭 메뉴 */}
                <View className="flex-row px-4 pb-0">
                    <TouchableOpacity
                        onPress={() => setActiveTab('schedule')}
                        className={`flex-1 py-3 ${
                            activeTab === 'schedule' ? 'border-b-2 border-blue-500' : ''
                        }`}
                    >
                        <Text className={`text-center font-medium ${
                            activeTab === 'schedule' ? 'text-blue-500' : 'text-gray-600'
                        }`}>
                            면접 일정
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('slots')}
                        className={`flex-1 py-3 ${
                            activeTab === 'slots' ? 'border-b-2 border-blue-500' : ''
                        }`}
                    >
                        <Text className={`text-center font-medium ${
                            activeTab === 'slots' ? 'text-blue-500' : 'text-gray-600'
                        }`}>
                            시간대 설정
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1">
                {/* 캘린더 */}
                <View className="bg-white">
                    <Calendar
                        current={selectedDate}
                        onDayPress={handleDayPress}
                        onMonthChange={handleMonthChange}
                        markedDates={getMarkedDates()}
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

                {/* 탭별 컨텐츠 */}
                {activeTab === 'schedule' ? (
                    <InterviewScheduleTab
                        selectedDate={selectedDate}
                        selectedDateSchedules={selectedDateSchedules}
                        formatDateHeader={formatDateHeader}
                        onCancelInterview={handleCancelInterview}
                    />
                ) : (
                    <InterviewSlotsTab
                        selectedDate={selectedDate}
                        formatDateHeader={formatDateHeader}
                        onRefresh={fetchSlots}
                        bookedSlots={bookedSlots[selectedDate] || []}
                        interviewType={interviewType}
                        onInterviewTypeChange={setInterviewType}
                        timeSlots={timeSlots}
                        selectedTimes={selectedTimes}
                        onTimeToggle={handleTimeToggle}
                        onSaveForDate={handleSaveForDate}
                    />
                )}
            </ScrollView>

            <ModalComponent />
        </SafeAreaView>
    )
}