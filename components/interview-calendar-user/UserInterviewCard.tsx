// components/interview-calendar/UserInterviewCard.tsx
import React from 'react'
import { View, Text, TouchableOpacity, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { useTranslation } from '@/contexts/TranslationContext'

interface UserInterviewCardProps {
    schedule: {
        id: string
        interview_slot: {
            start_time: string
            end_time: string
            interview_type: string
            company: {
                name: string
                address?: string
                phone_number?: string
            }
        }
        proposal: {
            location: string
            application: {
                job_posting: {
                    title: string
                    salary_range?: string
                    working_hours?: string
                }
            }
        }
    }
    onAddToCalendar: () => void
}

export const UserInterviewCard = ({ schedule, onAddToCalendar }: UserInterviewCardProps) => {
    const { t } = useTranslation()
    
    const formatTime = (dateString: string) => {
        return format(new Date(dateString), 'HH:mm')
    }

    const handleCall = () => {
        if (schedule.interview_slot.company.phone_number) {
            Linking.openURL(`tel:${schedule.interview_slot.company.phone_number}`)
        }
    }

    const handleMap = () => {
        const address = schedule.proposal.location || schedule.interview_slot.company.address
        if (address) {
            // 카카오맵 또는 네이버맵으로 연결
            const encodedAddress = encodeURIComponent(address)
            Linking.openURL(`https://map.kakao.com/link/search/${encodedAddress}`)
        }
    }

    const getInterviewTypeIcon = (type: string) => {
        switch (type) {
            case '화상':
                return 'videocam-outline'
            case '전화':
                return 'call-outline'
            default:
                return 'people-outline'
        }
    }

    return (
        <View className="bg-white rounded-xl p-4 shadow-sm">
            {/* 회사 정보 */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">
                        {schedule.interview_slot.company.name}
                    </Text>
                    <Text className="text-sm text-gray-600">
                        {schedule.proposal.application.job_posting.title}
                    </Text>
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-600 text-sm font-medium">
                        {formatTime(schedule.interview_slot.start_time)} - {formatTime(schedule.interview_slot.end_time)}
                    </Text>
                </View>
            </View>

            {/* 면접 정보 */}
            <View className="space-y-2 mb-3">
                {/*<View className="flex-row items-center">*/}
                {/*    <Ionicons*/}
                {/*        name={getInterviewTypeIcon(schedule.interview_slot.interview_type)}*/}
                {/*        size={16}*/}
                {/*        color="#6b7280"*/}
                {/*    />*/}
                {/*    <Text className="text-sm text-gray-600 ml-2">*/}
                {/*        {schedule.interview_slot.interview_type} 면접*/}
                {/*    </Text>*/}
                {/*</View>*/}

                {(schedule.proposal.location || schedule.interview_slot.company.address) && (
                    <View className="flex-row items-start">
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2 flex-1">
                            {schedule.proposal.location || schedule.interview_slot.company.address}
                        </Text>
                    </View>
                )}

                {schedule.proposal.application.job_posting.salary_range && (
                    <View className="flex-row items-center">
                        <Ionicons name="cash-outline" size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2">
                            {schedule.proposal.application.job_posting.salary_range}
                        </Text>
                    </View>
                )}
            </View>

            {/* 액션 버튼들 */}
            <View className="flex-row gap-2 pt-3 border-t border-gray-100">
                {schedule.interview_slot.company.phone_number && (
                    <TouchableOpacity
                        onPress={handleCall}
                        className="flex-1 flex-row items-center justify-center bg-green-50 py-2 rounded-lg"
                    >
                        <Ionicons name="call-outline" size={18} color="#16a34a" />
                        <Text className="text-green-600 text-sm font-medium ml-1">{t('calendar.call', '전화')}</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={handleMap}
                    className="flex-1 flex-row items-center justify-center bg-blue-50 py-2 rounded-lg"
                >
                    <Ionicons name="map-outline" size={18} color="#3b82f6" />
                    <Text className="text-blue-600 text-sm font-medium ml-1">{t('calendar.map', '지도')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onAddToCalendar}
                    className="flex-1 flex-row items-center justify-center bg-purple-50 py-2 rounded-lg"
                >
                    <Ionicons name="calendar-outline" size={18} color="#8b5cf6" />
                    <Text className="text-purple-600 text-sm font-medium ml-1">{t('calendar.add_to_calendar', '일정 추가')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}