// app/(pages)/(user)/interview-calendar-user.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

// Components
import Back from '@/components/back'
import { UserInterviewCard } from '@/components/interview-calendar-user/UserInterviewCard'

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
        interview_type: string
        company: {
            id: string
            name: string
            address?: string
            phone_number?: string
        }
    }
    proposal: {
        id: string
        location: string
        application: {
            id: string
            job_posting: {
                id: string
                title: string
                salary_range?: string
                working_hours?: string
                description?: string
            }
        }
    }
}

export default function UserInterviewCalendar() {
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()

    // State
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'))
    const [schedules, setSchedules] = useState<InterviewSchedule[]>([])
    const [groupedSchedules, setGroupedSchedules] = useState<Record<string, InterviewSchedule[]>>({})
    const [selectedDateSchedules, setSelectedDateSchedules] = useState<InterviewSchedule[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Effects
    useEffect(() => {
        if (user?.userId) {
            fetchMonthSchedules(currentMonth)
        }
    }, [user?.userId, currentMonth])

    useEffect(() => {
        const daySchedules = groupedSchedules[selectedDate] || []
        setSelectedDateSchedules(daySchedules)
    }, [selectedDate, groupedSchedules])

    // API Functions
    const fetchMonthSchedules = async (month: string) => {
        try {
            setLoading(true)
            const response = await api('GET', `/api/interview-schedules/user/calendar?userId=${user?.userId}&month=${month}`)

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

    // Event Handlers
    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString)
    }

    const handleMonthChange = (month: any) => {
        setCurrentMonth(month.dateString.slice(0, 7))
    }

    const handleAddToCalendar = (schedule: InterviewSchedule) => {
        // 캘린더 앱에 일정 추가 (선택사항)
        const startTime = new Date(schedule.interview_slot.start_time)
        const endTime = new Date(schedule.interview_slot.end_time)
        const title = `${schedule.interview_slot.company.name} 면접`
        const location = schedule.proposal.location || schedule.interview_slot.company.address || ''

        // 캘린더 URL 스킴 사용 (iOS/Android 모두 지원)
        const eventUrl = `calshow:${startTime.getTime() / 1000}`
        Linking.openURL(eventUrl).catch(() => {
            showModal('알림', '캘린더 앱을 열 수 없습니다.')
        })
    }

    // Render Functions
    const getMarkedDates = () => {
        const marked: any = {}

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

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white border-b border-gray-200">
                <View className="flex-row items-center p-4">
                    <Back />
                    <Text className="text-lg font-bold ml-4">내 면접 일정</Text>
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

                {/* 선택된 날짜의 면접 일정 */}
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
                                <UserInterviewCard
                                    key={schedule.id}
                                    schedule={schedule}
                                    onAddToCalendar={() => handleAddToCalendar(schedule)}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <ModalComponent />
        </SafeAreaView>
    )
}