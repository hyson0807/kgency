// app/(pages)/(company)/interview-calendar.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

// Components
import Back from '@/components/back'
import { InterviewScheduleCard } from '@/components/interview-calendar/InterviewScheduleCard'

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

export default function InterviewCalendar() {
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()

    // ==================== State ====================
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'))
    const [schedules, setSchedules] = useState<InterviewSchedule[]>([])
    const [groupedSchedules, setGroupedSchedules] = useState<Record<string, InterviewSchedule[]>>({})
    const [selectedDateSchedules, setSelectedDateSchedules] = useState<InterviewSchedule[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // ==================== Effects ====================
    useEffect(() => {
        if (user?.userId) {
            fetchMonthSchedules(currentMonth)
        }
    }, [user?.userId, currentMonth])

    useEffect(() => {
        // 선택된 날짜의 일정 필터링
        const daySchedules = groupedSchedules[selectedDate] || []
        setSelectedDateSchedules(daySchedules)
    }, [selectedDate, groupedSchedules])

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

    const handleCancelInterview = async (scheduleId: string) => {
        Alert.alert(
            '면접 취소',
            '정말로 이 면접을 취소하시겠습니까?',
            [
                { text: '아니오', style: 'cancel' },
                {
                    text: '예',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await api('PUT', `/api/interview-schedules/company/${scheduleId}/cancel`, {
                                companyId: user?.userId
                            })

                            if (response?.success) {
                                showModal('성공', '면접이 취소되었습니다.', 'info')
                                fetchMonthSchedules(currentMonth)
                            }
                        } catch (error) {
                            console.error('Failed to cancel interview:', error)
                            showModal('오류', '면접 취소에 실패했습니다.')
                        }
                    }
                }
            ]
        )
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
                    <Back />
                    <Text className="text-lg font-bold ml-4">면접 일정 관리</Text>
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
                                <InterviewScheduleCard
                                    key={schedule.id}
                                    schedule={schedule}
                                    onCancel={() => handleCancelInterview(schedule.id)}
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