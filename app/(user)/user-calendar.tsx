import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, ScrollView, ActivityIndicator, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from '@react-navigation/native'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale/ko'
import { enUS } from 'date-fns/locale/en-US'
import { ja } from 'date-fns/locale/ja'
import { zhCN } from 'date-fns/locale/zh-CN'
import { vi } from 'date-fns/locale/vi'
import { hi } from 'date-fns/locale/hi'
import { ar } from 'date-fns/locale/ar'
import { tr } from 'date-fns/locale/tr'
// Components
import Back from '@/components/shared/common/back'
import { UserInterviewCard } from '@/components/shared/interview-calendar/user/cards/UserInterviewCard'
// Hooks & Utils
import { api } from "@/lib/api"
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/hooks/useModal'
import { useTranslation } from '@/contexts/TranslationContext'
import { getCalendarConfig } from '@/lib/translations/locales'
import { groupByDate } from '@/lib/dateUtils'
// Date-fns locale mapping
const dateFnsLocaleMap: Record<string, any> = {
    ko: ko,
    en: enUS,
    ja: ja,
    zh: zhCN,
    vi: vi,
    hi: hi,
    ar: ar,
    tr: tr,
    si: enUS, // fallback to English
    my: enUS, // fallback to English
    ky: enUS, // fallback to English
    ha: enUS, // fallback to English
    mn: enUS  // fallback to English
}
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
                interview_location?: string
            }
        }
    }
}
export default function UserInterviewCalendar() {
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()
    const { t, language } = useTranslation()
    const insets = useSafeAreaInsets()
    // State
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'))
    const [groupedSchedules, setGroupedSchedules] = useState<Record<string, InterviewSchedule[]>>({})
    const [selectedDateSchedules, setSelectedDateSchedules] = useState<InterviewSchedule[]>([])
    const [loading, setLoading] = useState(true)
    // 사용자 언어 설정에 따른 동적 캘린더 언어 변경
    useEffect(() => {
        const config = getCalendarConfig(language)
        LocaleConfig.locales[language] = config
        LocaleConfig.defaultLocale = language
    }, [language])
    // Effects
    useEffect(() => {
        if (user?.userId) {
            fetchMonthSchedules(currentMonth)
        }
    }, [user?.userId, currentMonth])
    // 페이지 포커스 시 데이터 새로고침 (면접 시간 선택 후 돌아올 때 상태 업데이트)
    useFocusEffect(
        useCallback(() => {
            if (user?.userId) {
                fetchMonthSchedules(currentMonth)
            }
        }, [user?.userId, currentMonth])
    )
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
                
                // 서버에서 받은 스케줄 배열이 있다면 클라이언트에서 직접 그룹화
                if (response.data.schedules && Array.isArray(response.data.schedules)) {
                    const clientGroupedSchedules = groupByDate(
                        response.data.schedules as InterviewSchedule[], 
                        (schedule: InterviewSchedule) => schedule.interview_slot.start_time
                    )
                    setGroupedSchedules(clientGroupedSchedules as Record<string, InterviewSchedule[]>)
                } else {
                    // fallback: 서버에서 이미 그룹화된 데이터 사용
                    setGroupedSchedules(response.data.groupedSchedules || {})
                }
            }
        } catch (error) {
            showModal(t('common.error', '오류'), t('calendar.load_error', '면접 일정을 불러오는데 실패했습니다.'))
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
            showModal(t('common.notification', '알림'), t('calendar.open_error', '캘린더 앱을 열 수 없습니다.'))
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
        const currentLocale = dateFnsLocaleMap[language] || ko
        
        // 언어별 날짜 형식 패턴
        const formatPatterns: Record<string, string> = {
            ko: 'M월 d일 (E)',
            en: 'MMM d (E)',
            ja: 'M月d日 (E)',
            zh: 'M月d日 (E)',
            vi: 'd MMM (E)',
            hi: 'd MMM (E)',
            ar: 'd MMM (E)',
            tr: 'd MMM (E)',
            si: 'MMM d (E)',
            my: 'MMM d (E)',
            ky: 'MMM d (E)',
            ha: 'MMM d (E)',
            mn: 'MMM d (E)'
        }
        
        const pattern = formatPatterns[language] || formatPatterns.ko
        return format(date, pattern, { locale: currentLocale })
    }
    if (loading) {
        return (
            <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </View>
        )
    }
    return (
        <View className="flex-1 bg-gray-50" style={{paddingTop: insets.top}}>
            {/* 헤더 */}
            <View className="bg-white border-b border-gray-200">
                <View className="flex-row items-center p-4">
                    <Back />
                    <Text className="text-lg font-bold ml-4">{t('calendar.my_interview_schedule', '내 면접 일정')}</Text>
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
                                {selectedDateSchedules.length}{t('calendar.count_unit', '건')}
                            </Text>
                        </View>
                    </View>
                    {selectedDateSchedules.length === 0 ? (
                        <View className="bg-white rounded-xl p-8 items-center">
                            <Ionicons name="calendar-outline" size={60} color="#cbd5e0" />
                            <Text className="text-gray-500 mt-4">
                                {t('calendar.no_scheduled_interviews', '예정된 면접이 없습니다')}
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
        </View>
    )
}