import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/hooks/useModal'
import { useAuth } from '@/contexts/AuthContext'
import Back from '@/components/back'
import { Ionicons } from '@expo/vector-icons'

interface TimeSlot {
    id: string
    interview_date: string
    start_time: string
    end_time: string
    is_selected: boolean
}

export default function InterviewSelection() {
    const { applicationId } = useLocalSearchParams()
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()

    const [schedule, setSchedule] = useState<any>(null)
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
    const [loading, setLoading] = useState(true)
    const [confirming, setConfirming] = useState(false)

    useEffect(() => {
        loadInterviewSchedule()
    }, [])

    const loadInterviewSchedule = async () => {
        try {
            // 면접 일정 정보 가져오기
            const { data: scheduleData, error: scheduleError } = await supabase
                .from('interview_schedules')
                .select(`
          *,
          job_posting:job_postings!inner(
            title,
            company:profiles!inner(
              name
            )
          )
        `)
                .eq('application_id', applicationId)
                .single()

            if (scheduleError) throw scheduleError

            setSchedule(scheduleData)

            // 시간 슬롯 가져오기 (다른 사람이 선택한 것 제외)
            const { data: slotsData, error: slotsError } = await supabase
                .from('interview_time_slots')
                .select('*')
                .eq('schedule_id', scheduleData.id)
                .eq('is_selected', false)
                .gte('interview_date', new Date().toISOString().split('T')[0])
                .order('interview_date')
                .order('start_time')

            if (slotsError) throw slotsError

            setTimeSlots(slotsData || [])
        } catch (error) {
            console.error('Error loading schedule:', error)
            showModal('오류', '면접 일정을 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const handleTimeSelect = async (slot: TimeSlot) => {
        showModal(
            '면접 시간 확정',
            `${slot.interview_date} ${slot.start_time}에 면접을 확정하시겠습니까?`,
            'confirm',
            () => confirmInterview(slot),
            true
        )
    }

    const confirmInterview = async (slot: TimeSlot) => {
        setConfirming(true)
        try {
            // 트랜잭션으로 처리
            const { error: updateSlotError } = await supabase
                .from('interview_time_slots')
                .update({ is_selected: true })
                .eq('id', slot.id)

            if (updateSlotError) throw updateSlotError

            const { error: confirmError } = await supabase
                .from('confirmed_interviews')
                .insert({
                    application_id: applicationId,
                    time_slot_id: slot.id,
                    user_id: user?.userId,
                    company_id: schedule.company_id,
                    job_posting_id: schedule.job_posting_id,
                    interview_location: schedule.interview_location
                })

            if (confirmError) throw confirmError

            // 지원서 상태 업데이트
            const { error: appError } = await supabase
                .from('applications')
                .update({ status: 'interview_scheduled' })
                .eq('id', applicationId)

            if (appError) throw appError

            showModal('성공', '면접 일정이 확정되었습니다!', 'info')
            router.replace('/')
        } catch (error) {
            console.error('Error confirming interview:', error)
            showModal('오류', '면접 확정에 실패했습니다.')
        } finally {
            setConfirming(false)
        }
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 시간 선택</Text>
            </View>

            <ScrollView className="flex-1">
                {/* 공고 정보 */}
                <View className="p-4 bg-blue-50 m-4 rounded-lg">
                    <Text className="text-lg font-semibold text-blue-600">
                        {schedule?.job_posting.title}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                        {schedule?.job_posting.company.name}
                    </Text>
                </View>

                {/* 면접 장소 */}
                <View className="px-4 mb-4">
                    <View className="flex-row items-center bg-gray-50 p-4 rounded-lg">
                        <Ionicons name="location" size={24} color="#6b7280" />
                        <View className="ml-3 flex-1">
                            <Text className="text-sm text-gray-500">면접 장소</Text>
                            <Text className="font-medium">{schedule?.interview_location}</Text>
                        </View>
                    </View>
                </View>

                {/* 시간 선택 */}
                <View className="px-4">
                    <Text className="text-lg font-semibold mb-3">
                        면접 가능 시간을 선택해주세요
                    </Text>

                    {timeSlots.length === 0 ? (
                        <Text className="text-gray-500 text-center py-8">
                            선택 가능한 시간이 없습니다.
                        </Text>
                    ) : (
                        timeSlots.map((slot) => (
                            <TouchableOpacity
                                key={slot.id}
                                onPress={() => handleTimeSelect(slot)}
                                className="bg-white border border-gray-200 p-4 rounded-lg mb-3"
                            >
                                <View className="flex-row items-center justify-between">
                                    <View>
                                        <Text className="font-semibold text-lg">
                                            {new Date(slot.interview_date).toLocaleDateString('ko-KR', {
                                                month: 'long',
                                                day: 'numeric',
                                                weekday: 'short'
                                            })}
                                        </Text>
                                        <Text className="text-blue-600 mt-1">
                                            {slot.start_time} - {slot.end_time}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} color="#6b7280" />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            <ModalComponent />
        </SafeAreaView>
    )
}