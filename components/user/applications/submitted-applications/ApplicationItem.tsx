import React, { useState } from 'react'
import {Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import {router} from "expo-router";
import { api } from "@/lib/core/api"
import { useAuth } from "@/contexts/AuthContext"
import { useModal } from "@/lib/shared/ui/hooks/useModal"
interface InterviewProposal {
    id: string
    application_id: string
    company_id: string
    location: string
    status: string
    created_at: string
    profiles?: {
        id: string
        name: string
    }
}
interface Application {
    id: string
    applied_at: string
    status: string
    type: 'user_initiated' | 'company_invited' | 'user_instant_interview'
    job_posting: {
        id: string
        title: string
        is_active: boolean
        deleted_at: string
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
    interviewProposal?: InterviewProposal | null
}
interface ApplicationItemProps {
    item: Application;
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
}
export const ApplicationItem = ({ item, t }: ApplicationItemProps) => {
    const { user } = useAuth()
    const { showModal } = useModal()
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
                pathname: '/(pages)/(user)/(application-management)/view-my-resume',
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

    const handleGoToChat = async (application: Application) => {
        if (!user?.userId) return;
        
        try {
            // 기존 채팅방이 있는지 확인
            const response = await api('GET', `/api/chat/find-existing-room?user_id=${user.userId}&company_id=${application.job_posting.company.id}`);
            
            if (response.success && response.data?.roomId) {
                // 기존 채팅방이 있으면 해당 방으로 이동
                router.push(`/(pages)/chat/${response.data.roomId}`);
            } else {
                // 채팅방이 없으면 알림 표시
                showModal(
                    '채팅방을 찾을 수 없습니다',
                    '존재하지 않는 채팅방입니다.',
                    'warning'
                );
            }
        } catch (error) {
            console.error('채팅방 이동 오류:', error);
            showModal(
                '오류',
                '채팅방에 접근할 수 없습니다.',
                'warning'
            );
        }
    }
    return (
        <TouchableOpacity
                onPress={() => handleViewPosting(item)}
                className={`bg-white mx-4 my-2 p-4 rounded-2xl shadow-sm ${
                    item.type === 'user_instant_interview' ? 'border-2 border-purple-500' : ''
                }`}
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
                </View>
                {/* 지원 정보 */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <Text className="text-sm text-gray-500">
                        {t('applications.applied_date', '지원일')}: {formatDate(item.applied_at)}
                    </Text>
                </View>
                {/* 지원 타입에 따른 버튼 표시 */}
                {item.type === 'user_initiated' ? (
                    /* 일반지원: 제출한 이력서 보기 버튼 */
                    item.message && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation()
                                handleViewResume(item)
                            }}
                            className="mt-2 flex-row items-center justify-center bg-gray-50 py-2 rounded-lg"
                        >
                            <Ionicons name="document-text-outline" size={16} color="black" />
                            <Text className="text-sm font-medium ml-1">
                                {t('applications.view_resume', '제출한 이력서 보기')}
                            </Text>
                        </TouchableOpacity>
                    )
                ) : (
                    /* 채팅지원: 채팅으로 가기 버튼 */
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation()
                            handleGoToChat(item)
                        }}
                        className="mt-2 flex-row items-center justify-center bg-blue-50 py-2 rounded-lg"
                    >
                        <Ionicons name="chatbubble-outline" size={16} color="#3b82f6" />
                        <Text className="text-blue-600 text-sm font-medium ml-1">
                            {t('applications.go_to_chat', '채팅으로 가기')}
                        </Text>
                    </TouchableOpacity>
                )}
                {/* 면접 취소 상태 체크 - 최우선으로 표시 */}
                {item.status === 'cancelled' ? (
                    <View className="mt-2 flex-row items-center justify-center bg-red-50 py-2 rounded-lg">
                        <Ionicons name="close-circle" size={16} color="#ef4444" />
                        <Text className="text-red-600 text-sm font-medium ml-1">
                            {t('applications.interview_cancelled', '면접 취소된 공고입니다')}
                        </Text>
                    </View>
                ) : (
                    /* 면접 확정 표시 - 면접이 확정된 경우 최우선 표시 */
                    item.interviewProposal && item.interviewProposal.status === 'scheduled' ? (
                        <View className="mt-2 flex-row items-center justify-center bg-blue-50 py-2 rounded-lg">
                            <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
                            <Text className="text-blue-600 text-sm font-medium ml-1">
                                {t('applications.interview_confirmed', '면접 확정')}
                            </Text>
                        </View>
                    ) : (
                    <>
                        {/* 삭제된 공고 체크 */}
                        {item.job_posting.deleted_at !== null ? (
                            <View className="mt-2 flex-row items-center justify-center bg-gray-100 py-2 rounded-lg">
                                <Ionicons name="trash-outline" size={16} color="#6b7280" />
                                <Text className="text-gray-600 text-sm font-medium ml-1">
                                    {t('applications.deleted_posting', '삭제된 공고입니다')}
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* 활성 상태 체크 */}
                                {!item.job_posting.is_active && (
                                    /* 마감된 공고 */
                                    <View className="mt-2 flex-row items-center justify-center bg-gray-100 py-2 rounded-lg">
                                        <Ionicons name="close-circle-outline" size={16} color="#6b7280" />
                                        <Text className="text-gray-600 text-sm font-medium ml-1">
                                            {t('applications.closed_posting', '마감된 공고입니다')}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </>
                    )
                )}
        </TouchableOpacity>
    )
}