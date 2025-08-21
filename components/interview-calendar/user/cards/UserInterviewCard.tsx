// components/interview-calendar/UserInterviewCard.tsx
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { format } from 'date-fns'
import { useTranslation } from '@/contexts/TranslationContext'
import { JobDetailModal } from '../modals/JobDetailModal'
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
                    id: string
                    title: string
                    salary_range?: string
                    working_hours?: string
                    interview_location?: string
                }
            }
        }
    }
    onAddToCalendar: () => void
}
export const UserInterviewCard = ({ schedule, onAddToCalendar }: UserInterviewCardProps) => {
    const { t } = useTranslation()
    const [jobModalVisible, setJobModalVisible] = useState(false)
    
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
    return (
        <View className="bg-white rounded-xl p-4 shadow-sm">
            {/* 회사 정보 */}
            <TouchableOpacity 
                onPress={() => setJobModalVisible(true)}
                className="flex-row items-center justify-between mb-3"
                activeOpacity={0.7}
            >
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className="text-lg font-bold text-gray-800">
                            {schedule.interview_slot.company.name}
                        </Text>
                        <Ionicons name="chevron-forward" size={18} color="#6b7280" className="ml-1" />
                    </View>
                    <Text className="text-sm text-gray-600">
                        {schedule.proposal.application.job_posting.title}
                    </Text>
                </View>
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-600 text-sm font-medium">
                        {formatTime(schedule.interview_slot.start_time)} - {formatTime(schedule.interview_slot.end_time)}
                    </Text>
                </View>
            </TouchableOpacity>
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
                    <TouchableOpacity 
                        onPress={handleMap}
                        className="flex-row items-start"
                        activeOpacity={0.7}
                    >
                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2 flex-1 underline">
                            {schedule.proposal.application.job_posting.interview_location || schedule.proposal.location || schedule.interview_slot.company.address}
                        </Text>
                    </TouchableOpacity>
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
            
            <JobDetailModal
                visible={jobModalVisible}
                onClose={() => setJobModalVisible(false)}
                jobPostingId={schedule.proposal.application.job_posting.id}
            />
        </View>
    )
}