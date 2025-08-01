import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { router } from 'expo-router'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { useModal } from '@/hooks/useModal'
import LoadingScreen from "@/components/common/LoadingScreen";
import {PostingCard} from "@/components/myJobPostings(company)/PostingCard";
import {FloatingButton} from "@/components/myJobPostings(company)/FloatingButton";
import {Empty} from "@/components/myJobPostings(company)/Empty";
import {Ionicons} from "@expo/vector-icons";
import { api } from '@/lib/api';

interface MyJobPostings {
    id: string
    title: string
    description?: string
    hiring_count: number
    is_active: boolean
    created_at: string
    updated_at: string
    working_hours?: string
    working_hours_negotiable?: boolean
    working_days?: string[]
    working_days_negotiable?: boolean
    pay_day?: string
    pay_day_negotiable?: boolean
    salary_range?: string
    salary_type: string
    applications?: {
        id: string
    }[]
    job_posting_keywords?: {
        keyword: {
            keyword: string
            category: string
        }
    }[]
}

const JobPosting = () => {
    const { user } = useAuth()
    const [postings, setPostings] = useState<MyJobPostings[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // useModal 사용
    const { showModal, hideModal, ModalComponent } = useModal()

    useEffect(() => {
        if (user) {
            fetchPostings()
        }
    }, [user])

    const fetchPostings = async () => {
        if (!user) return

        try {
            const response = await api('GET', '/api/job-postings/company');
            
            if (response.success) {
                setPostings(response.data || [])
            } else {
                console.error('공고 조회 실패:', response.error)
            }
        } catch (error) {
            console.error('공고 조회 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await fetchPostings()
        setRefreshing(false)
    }, [user])

    const handleToggleActive = async (postingId: string, currentStatus: boolean) => {
        try {
            const response = await api('PATCH', `/api/job-postings/${postingId}/toggle-active`);
            
            if (response.success) {
                // 로컬 상태 업데이트
                setPostings(prev =>
                    prev.map(posting =>
                        posting.id === postingId
                            ? { ...posting, is_active: !currentStatus }
                            : posting
                    )
                )
            } else {
                console.error('상태 변경 실패:', response.error)
            }
        } catch (error) {
            console.error('상태 변경 실패:', error)
        }
    }

    const handleDelete = (postingId: string, title: string) => {
        showModal(
            '공고 삭제',
            `"${title}" 공고를 삭제하시겠습니까?\n삭제된 공고는 복구할 수 없습니다.`,
            'warning',
            async () => {
                await confirmDelete(postingId)
                hideModal()
            },
            true
        )
    }

    const confirmDelete = async (postingId: string) => {
        try {
            const response = await api('DELETE', `/api/job-postings/${postingId}`);
            
            if (response.success) {
                // 로컬 상태 업데이트
                setPostings(prev => prev.filter(p => p.id !== postingId))
            } else {
                console.error('삭제 처리 실패:', response.error)
                showModal(
                    '오류',
                    '공고 삭제 중 문제가 발생했습니다.',
                    'warning',
                    hideModal
                )
            }
        } catch (error) {
            console.error('삭제 처리 실패:', error)
            showModal(
                '오류',
                '공고 삭제 중 문제가 발생했습니다.',
                'warning',
                hideModal
            )
        }
    }





    if (loading) {
        return (
            <LoadingScreen />
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-2xl font-bold">내 채용공고</Text>
                        <Text className="text-sm text-gray-600 mt-1">
                            총 {postings.length}개의 공고
                        </Text>
                    </View>

                </View>
            </View>

            {/* 공고 목록 */}
            <FlatList
                data={postings}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => <PostingCard item={item} onToggleActive={handleToggleActive} onDelete={handleDelete} /> }
                contentContainerStyle={postings.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
                ListEmptyComponent={ <Empty/> }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3b82f6']}
                        tintColor="#3b82f6"
                    />
                }
            />

            <FloatingButton/>

            <ModalComponent />
        </SafeAreaView>
    )
}

export default JobPosting