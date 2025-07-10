import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from '@/lib/supabase'
import { router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import CustomModal from '@/components/CustomModal'

interface JobPosting {
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
    const [postings, setPostings] = useState<JobPosting[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // 모달 상태
    const [deleteModal, setDeleteModal] = useState({
        visible: false,
        postingId: '',
        title: ''
    })

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
                .is('deleted_at', null)  // 삭제되지 않은 공고만 조회
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

            // 성공 메시지 제거 - 상태 변경만 수행
        } catch (error) {
            console.error('상태 변경 실패:', error)
        }
    }

    const handleDelete = (postingId: string, title: string) => {
        setDeleteModal({
            visible: true,
            postingId,
            title
        })
    }

    const confirmDelete = async () => {
        try {
            // 1. 권한 확인
            const { data: posting, error: checkError } = await supabase
                .from('job_postings')
                .select('company_id')
                .eq('id', deleteModal.postingId)
                .single()

            if (checkError || !posting || posting.company_id !== user?.userId) {
                console.error('삭제 권한이 없습니다')
                setDeleteModal({ visible: false, postingId: '', title: '' })
                return
            }

            // 2. 관련 applications의 status를 'reviewed'로 변경
            const { error: appUpdateError } = await supabase
                .from('applications')
                .update({
                    status: 'reviewed',
                    reviewed_at: new Date().toISOString()
                })
                .eq('job_posting_id', deleteModal.postingId)

            if (appUpdateError) {
                console.error('지원 내역 상태 변경 실패:', appUpdateError)
            }

            // 2. 관련 applications도 soft delete 처리
            const { error: appDeleteError } = await supabase
                .from('applications')
                .update({ deleted_at: new Date().toISOString() })
                .eq('job_posting_id', deleteModal.postingId)

            if (appDeleteError) {
                console.error('지원 내역 삭제 처리 실패:', appDeleteError)
            }

            // 3. 메시지 soft delete 처리
            const { data: applications } = await supabase
                .from('applications')
                .select('message_id')
                .eq('job_posting_id', deleteModal.postingId)
                .not('message_id', 'is', null)

            if (applications && applications.length > 0) {
                const messageIds = applications.map(app => app.message_id)

                await supabase
                    .from('messages')
                    .update({ is_deleted: true })
                    .in('id', messageIds)
            }

            // 4. 공고 soft delete 처리
            const { error: deleteError } = await supabase
                .from('job_postings')
                .update({
                    is_active: false,
                    deleted_at: new Date().toISOString()
                })
                .eq('id', deleteModal.postingId)

            if (deleteError) throw deleteError

            // 5. 로컬 상태 업데이트
            setPostings(prev => prev.filter(p => p.id !== deleteModal.postingId))
            setDeleteModal({ visible: false, postingId: '', title: '' })

        } catch (error) {
            console.error('삭제 처리 실패:', error)
            setDeleteModal({ visible: false, postingId: '', title: '' })
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
    }

    const renderPosting = ({ item }: { item: JobPosting }) => {
        const applicationCount = item.applications?.length || 0
        const jobKeywords = item.job_posting_keywords?.filter(k => k.keyword.category === '직종') || []

        return (
            <TouchableOpacity
                onPress={() => router.push({
                    pathname: '/(pages)/(company)/posting-detail',
                    params: { postingId: item.id }
                })}
                className={`mx-4 my-2 p-4 rounded-xl shadow-sm ${
                    item.is_active ? 'bg-white' : 'bg-gray-100'
                }`}
            >
                {/* 상태 및 지원자 수 */}
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
                        {jobKeywords.length > 0 && (
                            <View className="flex-row flex-wrap gap-1 mt-1">
                                {jobKeywords.slice(0, 3).map((k, index) => (
                                    <Text key={index} className="text-xs text-gray-600">
                                        {k.keyword.keyword}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                    <View className="items-end">
                        <View className={`px-2 py-1 rounded-full ${
                            item.is_active ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                            <Text className={`text-xs font-medium ${
                                item.is_active ? 'text-green-600' : 'text-gray-600'
                            }`}>
                                {item.is_active ? '모집중' : '마감'}
                            </Text>
                        </View>
                        <Text className="text-sm text-gray-600 mt-1">
                            지원자 {applicationCount}명
                        </Text>
                    </View>
                </View>

                {/* 공고 정보 */}
                <View className="mb-3">
                    <Text className="text-sm text-gray-500 mt-1">
                        등록일: {formatDate(item.created_at)}
                    </Text>
                </View>

                {/* 액션 버튼들 */}
                <View className="flex-row gap-2 pt-3 border-t border-gray-200">
                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation()
                            router.push({
                                pathname: '/(pages)/(company)/info',
                                params: { jobPostingId: item.id }
                            })
                        }}
                        className="flex-1 py-2 rounded-lg bg-blue-50"
                    >
                        <Text className="text-center text-blue-600 font-medium">수정</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation()
                            handleToggleActive(item.id, item.is_active)
                        }}
                        className={`flex-1 py-2 rounded-lg ${
                            item.is_active ? 'bg-orange-50' : 'bg-green-50'
                        }`}
                    >
                        <Text className={`text-center font-medium ${
                            item.is_active ? 'text-orange-600' : 'text-green-600'
                        }`}>
                            {item.is_active ? '마감' : '재개'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={(e) => {
                            e.stopPropagation()
                            handleDelete(item.id, item.title)
                        }}
                        className="flex-1 py-2 rounded-lg bg-red-50"
                    >
                        <Text className="text-center text-red-600 font-medium">삭제</Text>
                    </TouchableOpacity>
                </View>
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
                renderItem={renderPosting}
                contentContainerStyle={postings.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-8">
                        <Ionicons name="document-text-outline" size={80} color="#9ca3af" />
                        <Text className="text-gray-500 text-lg mt-4">
                            아직 등록한 공고가 없습니다
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(pages)/(company)/info')}
                            className="mt-4 px-6 py-3 bg-blue-500 rounded-xl"
                        >
                            <Text className="text-white font-medium">첫 공고 등록하기</Text>
                        </TouchableOpacity>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3b82f6']}
                        tintColor="#3b82f6"
                    />
                }
            />

            {/* 플로팅 버튼 */}
            <TouchableOpacity
                onPress={() => router.push('/(pages)/(company)/info')}
                className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
                style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
            >
                <Ionicons name="add" size={28} color="white" />
            </TouchableOpacity>

            {/* 삭제 확인 모달 */}
            <CustomModal
                visible={deleteModal.visible}
                onClose={() => setDeleteModal({ visible: false, postingId: '', title: '' })}
                title="공고 삭제"
                message={`"${deleteModal.title}" 공고를 삭제하시겠습니까?\n삭제된 공고는 복구할 수 없습니다.`}
                type="warning"
                confirmText="삭제"
                cancelText="취소"
                onConfirm={confirmDelete}
                showCancel={true}
                icon="trash-outline"
            />
        </SafeAreaView>
    )
}

export default JobPosting