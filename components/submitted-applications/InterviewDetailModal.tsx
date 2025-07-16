// components/submitted-applications/InterviewDetailModal.tsx
import React from 'react'
import { View, Text, TouchableOpacity, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface InterviewDetails {
    companyName: string
    jobTitle: string
    location: string
    dateTime?: string
    interviewType?: string
}

interface InterviewDetailModalProps {
    visible: boolean
    onClose: () => void
    details: InterviewDetails | null
    t: (key: string, defaultText: string) => string
}

export const InterviewDetailModal = ({ visible, onClose, details, t }: InterviewDetailModalProps) => {
    if (!details) return null

    const formatDateTime = (dateTimeString?: string) => {
        if (!dateTimeString) return '-'

        const date = new Date(dateTimeString)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
        const hours = date.getHours()
        const minutes = date.getMinutes()

        return `${year}년 ${month}월 ${day}일 (${weekDay}) ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl">
                    {/* 헤더 */}
                    <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                        <Text className="text-lg font-bold">
                            {t('applications.interview_details', '면접 예약 내역')}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {/* 내용 */}
                    <View className="p-4 pb-8">
                        {/* 회사 정보 */}
                        <View className="mb-4">
                            <Text className="text-sm text-gray-600 mb-1">
                                {t('applications.company', '회사')}
                            </Text>
                            <Text className="text-base font-semibold">
                                {details.companyName}
                            </Text>
                        </View>

                        {/* 직무 */}
                        <View className="mb-4">
                            <Text className="text-sm text-gray-600 mb-1">
                                {t('applications.position', '직무')}
                            </Text>
                            <Text className="text-base">
                                {details.jobTitle}
                            </Text>
                        </View>

                        {/* 면접 일시 */}
                        <View className="mb-4">
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                                <Text className="text-sm text-gray-600 ml-1">
                                    {t('applications.interview_datetime', '면접 일시')}
                                </Text>
                            </View>
                            <Text className="text-base">
                                {formatDateTime(details.dateTime)}
                            </Text>
                        </View>

                        {/* 면접 장소 */}
                        <View className="mb-4">
                            <View className="flex-row items-center mb-1">
                                <Ionicons name="location-outline" size={16} color="#6b7280" />
                                <Text className="text-sm text-gray-600 ml-1">
                                    {t('applications.interview_location', '면접 장소')}
                                </Text>
                            </View>
                            <Text className="text-base">
                                {details.location || '-'}
                            </Text>
                        </View>

                        {/* 면접 유형 */}
                        {details.interviewType && (
                            <View className="mb-4">
                                <View className="flex-row items-center mb-1">
                                    <Ionicons
                                        name={
                                            details.interviewType === '화상'
                                                ? 'videocam-outline'
                                                : details.interviewType === '전화'
                                                    ? 'call-outline'
                                                    : 'people-outline'
                                        }
                                        size={16}
                                        color="#6b7280"
                                    />
                                    <Text className="text-sm text-gray-600 ml-1">
                                        {t('applications.interview_type', '면접 유형')}
                                    </Text>
                                </View>
                                <Text className="text-base">
                                    {details.interviewType} 면접
                                </Text>
                            </View>
                        )}

                        {/* 안내 메시지 */}
                        <View className="bg-blue-50 p-3 rounded-lg mt-4">
                            <Text className="text-sm text-blue-800">
                                {t('applications.interview_reminder', '면접 시간에 늦지 않도록 주의해주세요.')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    )
}