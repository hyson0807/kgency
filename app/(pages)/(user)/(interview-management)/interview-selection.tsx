// app/(pages)/(user)/interview-selection.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from "@/lib/api"
import Back from '@/components/back'
import { useModal } from '@/hooks/useModal'
import { groupByDate, formatTime24 } from '@/lib/dateUtils'
interface TimeSlot {
    id: string
    start_time: string
    end_time: string
    location: string
    interview_type: string
    is_available: boolean
}
export default function InterviewSelection() {
    const params = useLocalSearchParams()
    const {
        applicationId,
        companyId,
        proposalId,
        companyName,
        jobTitle,
        proposalLocation
    } = params
    const { showModal, ModalComponent } = useModal()
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [selectedSlotId, setSelectedSlotId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [specialNotes, setSpecialNotes] = useState<string>('')
    useEffect(() => {
        fetchAvailableSlots()
    }, [])
    const fetchAvailableSlots = async () => {
        try {
            setLoading(true)
            const response = await api('GET', `/api/interview-proposals/user/${applicationId}`)
            if (response?.success && response.data?.availableSlots) {
                
                // 현재 시간 이후의 슬롯만 필터링
                const now = new Date()
                const futureSlots = response.data.availableSlots.filter((slot: TimeSlot) => {
                    const slotStartTime = new Date(slot.start_time)
                    return slotStartTime > now
                })
                
                setAvailableSlots(futureSlots)
                
                // 특이사항 정보 가져오기
                if (response.data?.jobPosting?.special_notes) {
                    setSpecialNotes(response.data.jobPosting.special_notes)
                }
            }
        } catch (error) {
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
        return groupByDate(slots, (slot) => slot.start_time)
    }
    const handleSelectSlot = (slotId: string) => {
        setSelectedSlotId(slotId)
    }
    const handleSubmit = async () => {
        if (!selectedSlotId) {
            showModal('알림', '면접 시간을 선택해주세요.')
            return
        }
        setSubmitting(true)
        try {
            const response = await api('POST', '/api/interview-schedules/user', {
                proposalId: proposalId as string,
                interviewSlotId: selectedSlotId
            })
            if (response?.success) {
                showModal('성공', '면접 일정이 확정되었습니다.', 'info')
                router.back()
            }
        } catch (error) {
            showModal('오류', '면접 일정 선택에 실패했습니다.')
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
                {/* 회사 정보 */}
                <View className="bg-white p-4 mb-2">
                    <Text className="text-sm text-gray-600">회사</Text>
                    <Text className="text-base font-semibold">{companyName}</Text>
                    <Text className="text-sm text-gray-600 mt-1">직무</Text>
                    <Text className="text-base">{jobTitle}</Text>
                </View>
                {/* 면접 장소 (제안된 장소) */}
                {proposalLocation && (
                    <View className="bg-white p-4 mb-2">
                        <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={20} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">면접 장소</Text>
                        </View>
                        <Text className="text-base mt-1">{proposalLocation}</Text>
                    </View>
                )}
                {/* 특이사항 */}
                {specialNotes && (
                    <View className="bg-yellow-50 p-4 mb-2 border border-yellow-200">
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle" size={20} color="#d97706" />
                            <Text className="text-sm text-yellow-800 font-semibold ml-2">특이사항</Text>
                        </View>
                        <Text className="text-base text-yellow-800 mt-2">{specialNotes}</Text>
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
                                        const startTime = formatTime24(slot.start_time)
                                        const endTime = formatTime24(slot.end_time)
                                        const isSelected = selectedSlotId === slot.id
                                        return (
                                            <TouchableOpacity
                                                key={slot.id}
                                                onPress={() => handleSelectSlot(slot.id)}
                                                className={`mb-3 p-4 rounded-lg border ${
                                                    isSelected
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 bg-white'
                                                }`}
                                            >
                                                <View className="flex-row justify-between items-center">
                                                    <View className="flex-1">
                                                        <Text className={`text-base font-medium ${
                                                            isSelected ? 'text-blue-700' : 'text-gray-800'
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
                                                        {/* 개별 장소 (slots의 location) */}
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
                                                            ? 'border-blue-500 bg-blue-500'
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
                            : 'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-semibold">
                        {submitting ? '처리중...' : '면접 일정 확정하기'}
                    </Text>
                </TouchableOpacity>
            </View>
            <ModalComponent />
        </SafeAreaView>
    )
}