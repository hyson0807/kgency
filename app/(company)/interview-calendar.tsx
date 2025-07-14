import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar } from 'react-native-calendars'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Back from '@/components/back'

interface Interview {
    id: string
    interview_location: string
    time_slot: {
        interview_date: string
        start_time: string
        end_time: string
    }
    application: {
        user: {
            name: string
            phone_number: string
        }
    }
    job_posting: {
        title: string
    }
}

export default function InterviewCalendar() {
    const { user } = useAuth()
    const [interviews, setInterviews] = useState<Interview[]>([])
    const [selectedDate, setSelectedDate] = useState('')
    const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({})

    useEffect(() => {
        loadInterviews()
    }, [])

    const loadInterviews = async () => {
        const { data, error } = await supabase
            .from('confirmed_interviews')
            .select(`
            id,
            interview_location,
            time_slot_id,
            interview_time_slots!time_slot_id (
                interview_date,
                start_time,
                end_time
            ),
            application_id,
            applications!application_id (
                user_id,
                profiles!user_id (
                    name,
                    phone_number
                )
            ),
            job_posting_id,
            job_postings!job_posting_id (
                title
            )
        `)
            .eq('company_id', user?.userId)
            .eq('status', 'scheduled')

        console.log('Interview data:', data) // 디버깅용
        console.log('Error:', error) // 디버깅용

        if (!error && data) {
            // 데이터 변환
            const formattedInterviews = data.map(item => {
                // 배열인 경우 첫 번째 요소 선택
                const timeSlot = Array.isArray(item.interview_time_slots)
                    ? item.interview_time_slots[0]
                    : item.interview_time_slots

                const application = Array.isArray(item.applications)
                    ? item.applications[0]
                    : item.applications

                const jobPosting = Array.isArray(item.job_postings)
                    ? item.job_postings[0]
                    : item.job_postings

                // profiles도 배열인 경우 처리
                const profiles = application?.profiles
                const profile = Array.isArray(profiles) ? profiles[0] : profiles

                return {
                    id: item.id,
                    interview_location: item.interview_location,
                    time_slot: {
                        interview_date: timeSlot?.interview_date || '',
                        start_time: timeSlot?.start_time || '',
                        end_time: timeSlot?.end_time || ''
                    },
                    application: {
                        user: {
                            name: profile?.name || '',
                            phone_number: profile?.phone_number || ''
                        }
                    },
                    job_posting: {
                        title: jobPosting?.title || ''
                    }
                }
            })

            setInterviews(formattedInterviews)

            // 면접이 있는 날짜 표시
            const dates: {[key: string]: any} = {}
            formattedInterviews.forEach(interview => {
                const date = interview.time_slot.interview_date
                if (date) {
                    dates[date] = {
                        marked: true,
                        dotColor: '#3b82f6'
                    }
                }
            })
            setMarkedDates(dates)
        }
    }

    const getDayInterviews = () => {
        return interviews.filter(
            interview => interview.time_slot.interview_date === selectedDate
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 일정 관리</Text>
            </View>

            <ScrollView className="flex-1">
                <Calendar
                    current={new Date().toISOString().split('T')[0]}
                    onDayPress={(day) => setSelectedDate(day.dateString)}
                    markedDates={{
                        ...markedDates,
                        [selectedDate]: {
                            ...markedDates[selectedDate],
                            selected: true,
                            selectedColor: '#3b82f6'
                        }
                    }}
                />

                {selectedDate && (
                    <View className="p-4">
                        <Text className="text-lg font-semibold mb-4">
                            {selectedDate} 면접 일정
                        </Text>

                        {getDayInterviews().length === 0 ? (
                            <Text className="text-gray-500 text-center py-8">
                                이 날은 면접 일정이 없습니다.
                            </Text>
                        ) : (
                            getDayInterviews().map((interview) => (
                                <View key={interview.id} className="bg-gray-50 p-4 rounded-lg mb-3">
                                    <Text className="font-semibold text-blue-600">
                                        {interview.time_slot.start_time} - {interview.time_slot.end_time}
                                    </Text>
                                    <Text className="font-semibold mt-1">{interview.job_posting.title}</Text>
                                    <Text className="text-gray-600">지원자: {interview.application.user.name}</Text>
                                    <Text className="text-gray-600">연락처: {interview.application.user.phone_number}</Text>
                                    <Text className="text-gray-600 mt-2">📍 {interview.interview_location}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}