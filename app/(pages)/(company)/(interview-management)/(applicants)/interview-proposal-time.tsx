// app/(pages)/(company)/interview-proposal-time.tsx
import React, { useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useModal } from '@/hooks/useModal'
import Back from '@/components/back'
import { useAuth } from '@/contexts/AuthContext'
import { api } from "@/lib/api"
import { InterviewCalendarSelector } from '@/components/shared/interview-calendar/company/calendar/InterviewCalendarSelector'
export default function InterviewProposalTime() {
    const { applicationId, userId, postingId, location } = useLocalSearchParams()
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()
    const [loading, setLoading] = useState(false)
    const handleConfirm = async (selectedDate: string, selectedTime: string, interviewType: string) => {
        setLoading(true)
        try {
            // 선택된 시간들을 배열로 변환
            const selectedTimes = selectedTime.split(',')
            
            // 각 시간에 대한 슬롯 정보 생성
            const slots = selectedTimes.map(time => {
                const [hour, minute] = time.split(':')
                const endHour = minute === '30' ? parseInt(hour) + 1 : parseInt(hour)
                const endMinute = minute === '30' ? '00' : '30'
                
                return {
                    date: selectedDate,
                    startTime: time,
                    endTime: `${endHour.toString().padStart(2, '0')}:${endMinute}`,
                    interviewType: interviewType
                }
            })
            // 먼저 선택된 시간대들을 저장
            const slotResponse = await api('POST', '/api/company/interview-slots', {
                companyId: user?.userId,
                date: selectedDate,
                slots: slots
            })
            if (!slotResponse?.success) {
                throw new Error('시간대 저장에 실패했습니다.')
            }
            // 그 다음 면접 제안 생성
            const response = await api('POST', '/api/interview-proposals/company', {
                applicationId,
                companyId: user?.userId,
                location: location as string,
                selectedDate,
                selectedTimes: selectedTimes, // 배열로 전달
                interviewType
            })
            if (response?.success) {
                showModal(
                    '성공', 
                    '면접이 제안되었습니다. 지원자가 시간을 선택할 수 있습니다.', 
                    'confirm',
                    () => {
                        router.replace({
                            pathname: '/(company)/myJobPostings',
                            params: {
                                postingId: postingId as string,
                                refresh: 'true'
                            }
                        })
                    }
                )
            }
        } catch (error) {
            showModal('오류', '면접 제안에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 시간 선택</Text>
            </View>
            <ScrollView className="flex-1">
                {/* 안내 메시지 */}
                <View className="p-4 bg-blue-50 mx-4 mt-4 rounded-lg">
                    <Text className="text-sm text-blue-800">
                        설정하신 가능한 시간대가 표시됩니다. 면접 날짜와 시간을 선택해주세요.
                    </Text>
                </View>
                {/* 면접 장소 표시 */}
                <View className="p-4 mx-4 mt-4 bg-gray-50 rounded-lg">
                    <Text className="text-sm text-gray-600 mb-1">면접 장소</Text>
                    <Text className="text-base">{location}</Text>
                </View>
                {/* 캘린더 선택기 */}
                <View className="flex-1">
                    <InterviewCalendarSelector
                        companyId={user?.userId || ''}
                        onConfirm={handleConfirm}
                    />
                </View>
            </ScrollView>
            <ModalComponent />
        </SafeAreaView>
    )
}