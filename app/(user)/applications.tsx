import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'

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

const Applications = () => {
    const { user } = useAuth()
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reviewed'>('all')

    useEffect(() => {
        if (user) {
            fetchApplications()
        }
    }, [user, activeFilter])

    const fetchApplications = async () => {
        if (!user) return

        try {
            let query = supabase
                .from('applications')
                .select(`
                    *,
                    job_posting:job_posting_id (
                        id,
                        title,
                        is_active,
                        salary_range,
                        working_hours,
                        company:company_id (
                            id,
                            name,
                            address
                        )
                    ),
                    message:message_id (
                        content
                    )
                `)
                .eq('user_id', user.userId)
                .order('applied_at', { ascending: false })

            // 필터 적용
            if (activeFilter === 'pending') {
                query = query.eq('status', 'pending')
            } else if (activeFilter === 'reviewed') {
                query = query.in('status', ['reviewed', 'accepted', 'rejected'])
            }

            const { data, error } = await query

            if (error) throw error

            setApplications(data || [])
        } catch (error) {
            console.error('지원 내역 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await fetchApplications()
        setRefreshing(false)
    }, [user, activeFilter])

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 0) {
            return `오늘 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
        } else if (diffDays === 1) {
            return '어제'
        } else if (diffDays < 7) {
            return `${diffDays}일 전`
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}`
        }
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return { text: '검토중', color: 'text-orange-600', bgColor: 'bg-orange-100' }
            case 'reviewed':
                return { text: '검토완료', color: 'text-blue-600', bgColor: 'bg-blue-100' }
            case 'accepted':
                return { text: '합격', color: 'text-green-600', bgColor: 'bg-green-100' }
            case 'rejected':
                return { text: '불합격', color: 'text-red-600', bgColor: 'bg-red-100' }
            default:
                return { text: status, color: 'text-gray-600', bgColor: 'bg-gray-100' }
        }
    }

    const renderApplication = ({ item }: { item: Application }) => {
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

                {/* 공고 정보 */}
                <View className="mb-3">
                    {item.job_posting.salary_range && (
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="cash-outline" size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                                {item.job_posting.salary_range}
                            </Text>
                        </View>
                    )}
                    {item.job_posting.working_hours && (
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="time-outline" size={14} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                                {item.job_posting.working_hours}
                            </Text>
                        </View>
                    )}
                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-2">
                            {item.job_posting.company.address || '주소 미입력'}
                        </Text>
                    </View>
                </View>

                {/* 지원 정보 */}
                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                    <Text className="text-sm text-gray-500">
                        지원일: {formatDate(item.applied_at)}
                    </Text>

                    {!isPostingActive && (
                        <View className="bg-gray-100 px-2 py-1 rounded">
                            <Text className="text-xs text-gray-600">모집마감</Text>
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
                            제출한 이력서 보기
                        </Text>
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        )
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="mt-2 text-gray-600">로딩 중...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white border-b border-gray-200">
                <View className="p-4">
                    <Text className="text-2xl font-bold">지원 내역</Text>
                    <Text className="text-sm text-gray-600 mt-1">
                        총 {applications.length}개의 지원
                    </Text>
                </View>

                {/* 필터 탭 */}
                <View className="flex-row px-4">
                    <TouchableOpacity
                        onPress={() => setActiveFilter('all')}
                        className={`mr-4 pb-3 ${
                            activeFilter === 'all' ? 'border-b-2 border-blue-500' : ''
                        }`}
                    >
                        <Text className={`${
                            activeFilter === 'all' ? 'text-blue-500 font-bold' : 'text-gray-600'
                        }`}>
                            전체
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveFilter('pending')}
                        className={`mr-4 pb-3 ${
                            activeFilter === 'pending' ? 'border-b-2 border-blue-500' : ''
                        }`}
                    >
                        <Text className={`${
                            activeFilter === 'pending' ? 'text-blue-500 font-bold' : 'text-gray-600'
                        }`}>
                            검토중
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveFilter('reviewed')}
                        className={`pb-3 ${
                            activeFilter === 'reviewed' ? 'border-b-2 border-blue-500' : ''
                        }`}
                    >
                        <Text className={`${
                            activeFilter === 'reviewed' ? 'text-blue-500 font-bold' : 'text-gray-600'
                        }`}>
                            검토완료
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 지원 내역 리스트 */}
            <FlatList
                data={applications}
                keyExtractor={(item) => item.id}
                renderItem={renderApplication}
                contentContainerStyle={applications.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3b82f6']}
                        tintColor="#3b82f6"
                    />
                }
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-8">
                        <Ionicons name="document-text-outline" size={80} color="#9ca3af" />
                        <Text className="text-gray-500 text-lg mt-4">
                            {activeFilter === 'all'
                                ? '아직 지원한 공고가 없습니다'
                                : activeFilter === 'pending'
                                    ? '검토중인 지원이 없습니다'
                                    : '검토 완료된 지원이 없습니다'}
                        </Text>
                        {activeFilter === 'all' && (
                            <TouchableOpacity
                                onPress={() => router.push('/(user)/home')}
                                className="mt-4 px-6 py-3 bg-blue-500 rounded-xl"
                            >
                                <Text className="text-white font-medium">공고 보러가기</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    )
}

export default Applications