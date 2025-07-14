import React, { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar } from 'react-native-calendars'
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/hooks/useModal'
import Back from '@/components/back'
import { useAuth } from '@/contexts/AuthContext'

export default function InterviewSchedule() {
    const { applicationId, userId, postingId } = useLocalSearchParams()
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()

    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTimes, setSelectedTimes] = useState<string[]>([])
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)

    // 30분 단위 시간 슬롯 생성
    const timeSlots = []
    for (let hour = 10; hour <= 18; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
        timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    const handleTimeSelect = (time: string) => {
        if (selectedTimes.includes(time)) {
            setSelectedTimes(selectedTimes.filter(t => t !== time))
        } else if (selectedTimes.length < 3) {
            setSelectedTimes([...selectedTimes, time])
        } else {
            showModal('알림', '최대 3개의 시간대만 선택할 수 있습니다.')
        }
    }

    const handleSubmit = async () => {
        if (!location.trim()) {
            showModal('알림', '면접 장소를 입력해주세요.')
            return
        }

        if (selectedTimes.length === 0) {
            showModal('알림', '최소 1개의 시간대를 선택해주세요.')
            return
        }

        setLoading(true)
        try {
            // 1. interview_schedules 생성
            const { data: schedule, error: scheduleError } = await supabase
                .from('interview_schedules')
                .insert({
                    application_id: applicationId,
                    company_id: user?.userId,
                    job_posting_id: postingId,
                    interview_location: location
                })
                .select()
                .single()

            if (scheduleError) throw scheduleError

            // 2. interview_time_slots 생성
            const timeSlots = selectedTimes.map(time => ({
                schedule_id: schedule.id,
                interview_date: selectedDate,
                start_time: time,
                end_time: `${parseInt(time.split(':')[0]) + 1}:${time.split(':')[1]}`
            }))

            const { error: slotsError } = await supabase
                .from('interview_time_slots')
                .insert(timeSlots)

            if (slotsError) throw slotsError

            showModal('성공', '면접 일정이 제안되었습니다.', 'info')
            router.back()
        } catch (error) {
            console.error('Error:', error)
            showModal('오류', '면접 일정 생성에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 일정 제안</Text>
            </View>

            <ScrollView className="flex-1">
                {/* 면접 장소 입력 */}
                <View className="p-4">
                    <Text className="text-base font-semibold mb-2">면접 장소</Text>
                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="예: 서울시 강남구 테헤란로 123 5층"
                        className="border border-gray-300 rounded-lg px-4 py-3"
                    />
                </View>

                {/* 캘린더 */}
                <View className="px-4">
                    <Text className="text-base font-semibold mb-2">날짜 선택</Text>
                    <Calendar
                        current={new Date().toISOString().split('T')[0]}
                        minDate={new Date().toISOString().split('T')[0]}
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={{
                            [selectedDate]: { selected: true, selectedColor: '#3b82f6' }
                        }}
                    />
                </View>

                {/* 시간 선택 */}
                {selectedDate && (
                    <View className="p-4">
                        <Text className="text-base font-semibold mb-2">
                            시간 선택 (최대 3개)
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {timeSlots.map((time) => (
                                <TouchableOpacity
                                    key={time}
                                    onPress={() => handleTimeSelect(time)}
                                    className={`px-4 py-2 rounded-lg border ${
                                        selectedTimes.includes(time)
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-white border-gray-300'
                                    }`}
                                >
                                    <Text className={selectedTimes.includes(time) ? 'text-white' : 'text-gray-700'}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* 제출 버튼 */}
                <View className="p-4">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading || !selectedDate || selectedTimes.length === 0}
                        className={`py-4 rounded-lg ${
                            loading || !selectedDate || selectedTimes.length === 0
                                ? 'bg-gray-300'
                                : 'bg-blue-500'
                        }`}
                    >
                        <Text className="text-center text-white font-semibold">
                            면접 일정 제안하기
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ModalComponent />
        </SafeAreaView>
    )
}