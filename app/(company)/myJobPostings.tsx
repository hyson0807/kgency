import { View, Text, FlatList, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from '@/lib/supabase'
import { useModal } from '@/hooks/useModal'
import LoadingScreen from "@/components/common/LoadingScreen";
import {PostingCard} from "@/components/myJobPostings(company)/PostingCard";
import {FloatingButton} from "@/components/myJobPostings(company)/FloatingButton";
import {Empty} from "@/components/myJobPostings(company)/Empty";

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
            const { data, error } = await supabase
                .from('job_postings')
                .select(`
                *,
                applications (
                    id
                ),
                job_posting_keywords:job_posting_keyword (
                    keyword:keyword_id (
                        keyword,
                        category
                    )
                )
            `)
                .eq('company_id', user.userId)
                .is('deleted_at', null)
                .order('created_at', { ascending: false })

            if (error) throw error

            setPostings(data || [])
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
            const { error } = await supabase
                .from('job_postings')
                .update({ is_active: !currentStatus })
                .eq('id', postingId)

            if (error) throw error

            // 로컬 상태 업데이트
            setPostings(prev =>
                prev.map(posting =>
                    posting.id === postingId
                        ? { ...posting, is_active: !currentStatus }
                        : posting
                )
            )
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
            // 1. 권한 확인
            const { data: posting, error: checkError } = await supabase
                .from('job_postings')
                .select('company_id')
                .eq('id', postingId)
                .single()

            if (checkError || !posting || posting.company_id !== user?.userId) {
                console.error('삭제 권한이 없습니다')
                return
            }

            // 2. 관련 applications의 status를 'reviewed'로 변경
            const { error: appUpdateError } = await supabase
                .from('applications')
                .update({
                    status: 'reviewed',
                    reviewed_at: new Date().toISOString()
                })
                .eq('job_posting_id', postingId)

            if (appUpdateError) {
                console.error('지원 내역 상태 변경 실패:', appUpdateError)
            }

            // 3. 관련 applications도 soft delete 처리
            const { error: appDeleteError } = await supabase
                .from('applications')
                .update({ deleted_at: new Date().toISOString() })
                .eq('job_posting_id', postingId)

            if (appDeleteError) {
                console.error('지원 내역 삭제 처리 실패:', appDeleteError)
            }

            // 4. 메시지 soft delete 처리
            const { data: applications } = await supabase
                .from('applications')
                .select('message_id')
                .eq('job_posting_id', postingId)
                .not('message_id', 'is', null)

            if (applications && applications.length > 0) {
                const messageIds = applications.map(app => app.message_id).filter(Boolean)

                await supabase
                    .from('messages')
                    .update({ is_deleted: true })
                    .in('id', messageIds)
            }

            // 5. 공고 soft delete 처리
            const { error: deleteError } = await supabase
                .from('job_postings')
                .update({
                    is_active: false,
                    deleted_at: new Date().toISOString()
                })
                .eq('id', postingId)

            if (deleteError) throw deleteError

            // 6. 로컬 상태 업데이트
            setPostings(prev => prev.filter(p => p.id !== postingId))

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
                <Text className="text-2xl font-bold">내 채용공고</Text>
                <Text className="text-sm text-gray-600 mt-1">
                    총 {postings.length}개의 공고
                </Text>
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