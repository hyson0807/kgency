import React from 'react'
import {Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";


interface Application {
    id: string
    applied_at: string
    status: string
    job_posting: {
        id: string
        title: string
        is_active: boolean
        salary_range?: string
        working_hours?: string
        company: {
            id: string
            name: string
            address?: string
        }
    }
    message?: {
        content: string
    }
}

interface ApplicationItemProps {
    item: Application;
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
}

export const ApplicationItem = ({ item, t }: ApplicationItemProps) => {

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { text: t('applications.status_pending', '검토중'), color: 'text-orange-600', bgColor: 'bg-orange-100' }
            case 'reviewed':
                return { text: t('applications.status_reviewed', '검토완료'), color: 'text-blue-600', bgColor: 'bg-blue-100' }
            case 'accepted':
                return { text: t('applications.status_accepted', '합격'), color: 'text-green-600', bgColor: 'bg-green-100' }
            case 'rejected':
                return { text: t('applications.status_rejected', '불합격'), color: 'text-red-600', bgColor: 'bg-red-100' }
            default:
                return { text: status, color: 'text-gray-600', bgColor: 'bg-gray-100' }
        }
    }

    const handleViewPosting = (application: Application) => {
        if (application.job_posting) {
            router.push({
                pathname: '/(pages)/(user)/posting-detail',
                params: {
                    postingId: application.job_posting.id,
                    companyId: application.job_posting.company.id,
                    companyName: application.job_posting.company.name
                }
            })
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return t('applications.today', '오늘') + ` ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
        } else if (diffDays === 1) {
            return t('applications.yesterday', '어제')
        } else if (diffDays < 7) {
            return t('applications.days_ago', `${diffDays}일 전`, { days: diffDays })
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}`
        }
    }

    const handleViewResume = (application: Application) => {
        if (application.message) {
            router.push({
                pathname: '/(pages)/(user)/view-my-resume',
                params: {
                    applicationId: application.id,
                    companyName: application.job_posting.company.name,
                    jobTitle: application.job_posting.title,
                    resume: application.message.content,
                    appliedAt: application.applied_at
                }
            })
        }
    }

    const statusInfo = getStatusInfo(item.status)
    const isPostingActive = item.job_posting?.is_active

    return (
        <TouchableOpacity
            onPress={() => handleViewPosting(item)}
            className="bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm"
            activeOpacity={0.7}
        >
            {/* 상태 뱃지 */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-sm text-gray-600">
                        {item.job_posting.company.name}
                    </Text>
                    <Text className="text-lg font-bold text-gray-800 pr-4">
                        {item.job_posting.title}
                    </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${statusInfo.bgColor}`}>
                    <Text className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                    </Text>
                </View>
            </View>


            {/* 지원 정보 */}
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                <Text className="text-sm text-gray-500">
                    {t('applications.applied_date', '지원일')}: {formatDate(item.applied_at)}
                </Text>

                {!isPostingActive && (
                    <View className="bg-gray-100 px-2 py-1 rounded">
                        <Text className="text-xs text-gray-600">{t('applications.closed', '모집마감')}</Text>
                    </View>
                )}
            </View>

            {/* 이력서 보기 버튼 */}
            {item.message && (
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation()
                        handleViewResume(item)
                    }}
                    className="mt-3 flex-row items-center justify-center"
                >
                    <Ionicons name="document-text-outline" size={16} color="#3b82f6" />
                    <Text className="text-blue-600 text-sm font-medium ml-1">
                        {t('applications.view_resume', '제출한 이력서 보기')}
                    </Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    )
}