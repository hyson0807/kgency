// app/(pages)/(user)/instant-interview-selection.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import Back from '@/components/back'
import { useModal } from '@/hooks/useModal'

interface TimeSlot {
    id: string
    start_time: string
    end_time: string
    location: string
    interview_type: string
    is_available: boolean
    is_booked?: boolean
}

export default function InstantInterviewSelection() {
    const params = useLocalSearchParams()
    const {
        jobPostingId,
        companyId,
        companyName,
        jobTitle,
        jobAddress
    } = params

    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [selectedSlotId, setSelectedSlotId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchAvailableSlots()
    }, [])

    const fetchAvailableSlots = async () => {
        try {
            setLoading(true)
            // 회사의 면접 가능 시간대 조회
            const response = await api('GET', '/api/company/interview-slots?companyId=' + companyId)

            console.log(response)

            if (response?.success && response.data) {
                // 확정된 면접 시간(is_booked: true) 제외하고 설정
                const availableOnly = response.data.filter((slot: TimeSlot) => !slot.is_booked)
                setAvailableSlots(availableOnly)
            }
        } catch (error) {
            console.error('Failed to fetch available slots:', error)
            showModal('오류', '면접 시간대를 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
        const hours = date.getHours()
        const minutes = date.getMinutes()

        return {
            date: `${month}월 ${day}일 (${weekDay})`,
            time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }
    }

    const groupSlotsByDate = (slots: TimeSlot[]) => {
        const grouped: Record<string, TimeSlot[]> = {}

        slots.forEach(slot => {
            const dateKey = new Date(slot.start_time).toDateString()
            if (!grouped[dateKey]) {
                grouped[dateKey] = []
            }
            grouped[dateKey].push(slot)
        })

        return grouped
    }

    const handleSelectSlot = (slotId: string) => {
        setSelectedSlotId(slotId)
    }

    const handleSubmit = async () => {
        if (!selectedSlotId) {
            showModal('알림', '면접 시간을 선택해주세요.')
            return
        }

        if (!user) {
            showModal('오류', '로그인이 필요합니다.')
            return
        }

        setSubmitting(true)
        try {
            // 1. 지원서 생성 (이력서 없이, 바로 scheduled 상태로)
            const applicationResponse = await api('POST', '/api/applications/instant-interview', {
                companyId: companyId,
                jobPostingId: jobPostingId
            });

            if (!applicationResponse?.success) {
                if (applicationResponse?.error === '이미 지원한 공고입니다.') {
                    showModal('알림', '이미 지원한 공고입니다.')
                    return
                }
                throw new Error(applicationResponse?.error || '지원서 생성 실패')
            }

            const application = applicationResponse.data;

            // 2. 면접 제안서 생성 (실제로는 유저가 스스로 만든 것이지만 형식상 필요)
            const proposalResponse = await api('POST', '/api/interview-proposals/company', {
                applicationId: application.id,
                companyId: companyId,
                location: jobAddress || '회사 주소' // 회사 주소를 기본 면접 장소로
            })

            if (!proposalResponse?.success || !proposalResponse.data) {
                throw new Error('면접 제안 생성 실패')
            }

            // 3. 면접 스케줄 생성
            const scheduleResponse = await api('POST', '/api/interview-schedules/user', {
                proposalId: proposalResponse.data.id,
                interviewSlotId: selectedSlotId
            })

            if (scheduleResponse?.success) {
                showModal(
                    '성공', 
                    '면접 일정이 확정되었습니다!', 
                    'info',
                    () => {
                        router.replace('/(user)/applications')
                    }
                )
            } else {
                throw new Error('면접 스케줄 생성 실패')
            }
        } catch (error) {
            console.error('Failed to submit instant interview:', error)
            showModal('오류', '면접 일정 확정에 실패했습니다.')
        } finally {
            setSubmitting(false)
        }
    }

    const groupedSlots = groupSlotsByDate(availableSlots)

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
            <View className="bg-white border-b border-gray-200">
                <View className="flex-row items-center p-4">
                    <Back />
                    <Text className="text-lg font-bold ml-4">면접 시간 선택</Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                {/* 완벽 매칭 배너 */}
                <View className="bg-purple-50 p-4 mb-2">
                    <View className="flex-row items-center">
                        <View className="bg-purple-100 p-2 rounded-full mr-3">
                            <Ionicons name="flash" size={24} color="#8b5cf6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-purple-800 font-bold text-base">완벽한 매칭!</Text>
                            <Text className="text-purple-600 text-sm mt-1">
                                이력서 제출 없이 바로 면접 일정을 확정할 수 있습니다.
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 회사 정보 */}
                <View className="bg-white p-4 mb-2">
                    <Text className="text-sm text-gray-600">회사</Text>
                    <Text className="text-base font-semibold">{companyName}</Text>
                    <Text className="text-sm text-gray-600 mt-1">직무</Text>
                    <Text className="text-base">{jobTitle}</Text>
                </View>

                {/* 면접 장소 */}
                {jobAddress && (
                    <View className="bg-white p-4 mb-2">
                        <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={20} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">면접 장소</Text>
                        </View>
                        <Text className="text-base mt-1">{jobAddress}</Text>
                    </View>
                )}

                {/* 시간대 선택 */}
                <View className="bg-white p-4">
                    <Text className="text-base font-semibold mb-4">면접 가능 시간대를 선택해주세요</Text>

                    {Object.keys(groupedSlots).length === 0 ? (
                        <View className="py-8 items-center">
                            <Text className="text-gray-500">선택 가능한 시간대가 없습니다.</Text>
                        </View>
                    ) : (
                        Object.entries(groupedSlots).map(([dateKey, slots]) => {
                            const { date } = formatDateTime(slots[0].start_time)

                            return (
                                <View key={dateKey} className="mb-6">
                                    <Text className="text-sm font-semibold text-gray-700 mb-3">
                                        {date}
                                    </Text>

                                    {slots.map((slot) => {
                                        const startTime = formatDateTime(slot.start_time).time
                                        const endTime = formatDateTime(slot.end_time).time
                                        const isSelected = selectedSlotId === slot.id

                                        return (
                                            <TouchableOpacity
                                                key={slot.id}
                                                onPress={() => handleSelectSlot(slot.id)}
                                                className={`mb-3 p-4 rounded-lg border ${
                                                    isSelected
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-300 bg-white'
                                                }`}
                                            >
                                                <View className="flex-row justify-between items-center">
                                                    <View className="flex-1">
                                                        <Text className={`text-base font-medium ${
                                                            isSelected ? 'text-purple-700' : 'text-gray-800'
                                                        }`}>
                                                            {startTime} - {endTime}
                                                        </Text>

                                                        {/* 면접 유형 */}
                                                        <View className="flex-row items-center mt-2">
                                                            <Ionicons
                                                                name={
                                                                    slot.interview_type === '화상'
                                                                        ? 'videocam-outline'
                                                                        : slot.interview_type === '전화'
                                                                            ? 'call-outline'
                                                                            : 'people-outline'
                                                                }
                                                                size={16}
                                                                color="#6b7280"
                                                            />
                                                            <Text className="text-sm text-gray-600 ml-1">
                                                                {slot.interview_type} 면접
                                                            </Text>
                                                        </View>

                                                        {/* 개별 장소 */}
                                                        {slot.location && (
                                                            <View className="flex-row items-center mt-1">
                                                                <Ionicons
                                                                    name="location-outline"
                                                                    size={16}
                                                                    color="#6b7280"
                                                                />
                                                                <Text className="text-sm text-gray-600 ml-1">
                                                                    {slot.location}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    <View className={`w-6 h-6 rounded-full border-2 ${
                                                        isSelected
                                                            ? 'border-purple-500 bg-purple-500'
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {isSelected && (
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={16}
                                                                color="white"
                                                                style={{ marginLeft: 2, marginTop: 2 }}
                                                            />
                                                        )}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            )
                        })
                    )}
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!selectedSlotId || submitting}
                    className={`py-4 rounded-lg ${
                        !selectedSlotId || submitting
                            ? 'bg-gray-300'
                            : 'bg-purple-600'
                    }`}
                >
                    <Text className="text-center text-white font-semibold">
                        {submitting ? '처리중...' : '면접 즉시 확정하기'}
                    </Text>
                </TouchableOpacity>
            </View>

            <ModalComponent />
        </SafeAreaView>
    )
}