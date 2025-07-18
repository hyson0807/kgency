// app/(pages)/(company)/posting-detail2.tsx
import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

// Components
import Back from '@/components/back'
import { PostingDetail } from "@/components/posting-detail2(company)/PostingDetail"
import { ApplicantCard } from "@/components/posting-detail2(company)/ApplicantCard"

// Hooks & Utils
import { api } from "@/lib/api"
import { useMatchedJobPostings } from '@/hooks/useMatchedJobPostings'
import { useModal } from '@/hooks/useModal'
import LoadingScreen from "@/components/common/LoadingScreen";

// Types
interface Application {
    id: string
    applied_at: string
    status: string
    user: {
        id: string
        name: string
        phone_number: string
        address?: string
        user_info?: {
            age?: number
            gender?: string
            visa?: string
            how_long?: string
            topic?: string
            korean_level?: string
            experience?: string
            experience_content?: string
        }
        user_keyword?: {
            keyword_id: number
            keywords: {
                id: number
                keyword: string
                category: string
            }
        }[]
    }
    message?: {
        content: string
        is_read: boolean
    }
}

export default function CompanyPostingDetail() {
    // ==================== Hooks ====================
    const params = useLocalSearchParams()
    const { postingId, refresh } = params
    const { fetchPostingById, getPostingKeywords } = useMatchedJobPostings()
    const { showModal, ModalComponent } = useModal()

    // ==================== State ====================
    const [posting, setPosting] = useState<any>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [proposalStatuses, setProposalStatuses] = useState<Record<string, string>>({})
    const [activeTab, setActiveTab] = useState<'info' | 'applicants'>('info')
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // ==================== Effects ====================
    // 초기 데이터 로드
    useEffect(() => {
        if (postingId) {
            loadPostingDetail()
            loadApplications()
        }
    }, [postingId])

    // 지원자 목록 변경 시 면접 제안 상태 조회
    useEffect(() => {
        if (applications.length > 0) {
            const applicationIds = applications.map(app => app.id)
            fetchAllProposalStatuses(applicationIds)
        }
    }, [applications])

    // 면접 제안 후 돌아왔을 때 새로고침
    useEffect(() => {
        if (refresh === 'true' && applications.length > 0) {
            const applicationIds = applications.map(app => app.id)
            fetchAllProposalStatuses(applicationIds)
        }
    }, [refresh])

    // ==================== Data Loading Functions ====================
    const loadPostingDetail = async () => {
        if (!postingId) return

        try {
            const data = await fetchPostingById(postingId as string)
            if (data) {
                setPosting(data)
            }
        } catch (error) {
            console.error('공고 로드 실패:', error)
            showModal('오류', '공고 정보를 불러오는데 실패했습니다.', 'warning')
        } finally {
            setLoading(false)
        }
    }

    const loadApplications = async () => {
        try {
            // 서버 API 호출로 변경
            const response = await api('GET', `/api/applications/company/${postingId}`)

            if (response?.success) {
                setApplications(response.data || [])
            } else {
                throw new Error(response?.message || '지원자 정보를 불러오는데 실패했습니다.')
            }
        } catch (error) {
            console.error('지원자 로드 실패:', error)
            showModal('오류', '지원자 정보를 불러오는데 실패했습니다.', 'warning')
        }
    }

    const fetchAllProposalStatuses = async (applicationIds: string[]) => {
        const statuses: Record<string, string> = {}

        await Promise.all(
            applicationIds.map(async (id) => {
                try {
                    const response = await api('GET', '/api/interview-proposals/user/' + id)
                    if (response?.success && response.data?.proposal) {
                        statuses[id] = response.data.proposal.status
                    }
                } catch (error) {
                    statuses[id] = 'none'
                }
            })
        )

        setProposalStatuses(statuses)
    }

    // ==================== Event Handlers ====================
    const onRefresh = async () => {
        setRefreshing(true)
        await loadApplications()
        const applicationIds = applications.map(app => app.id)
        await fetchAllProposalStatuses(applicationIds)
        setRefreshing(false)
    }

    // ==================== Render Functions ====================
    // 로딩 상태
    if (loading) {
        return (
            <LoadingScreen />
        )
    }

    // 공고 없음
    if (!posting) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-row items-center p-4 border-b border-gray-200">
                    <Back />
                </View>
                <View className="flex-1 justify-center items-center">
                    <Text className="text-gray-500">공고를 찾을 수 없습니다.</Text>
                </View>
            </SafeAreaView>
        )
    }

    const keywords = getPostingKeywords(posting)

    // ==================== Main Render ====================
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white border-b border-gray-200">
                <View className="flex-row items-center p-4">
                    <Back />
                    <Text className="text-lg font-bold ml-4">
                        {posting?.title || '공고 상세'}
                    </Text>
                </View>

                {/* 탭 */}
                <View className="flex-row">
                    <TouchableOpacity
                        onPress={() => setActiveTab('info')}
                        className={`flex-1 py-3 ${
                            activeTab === 'info' ? 'border-b-2 border-blue-500' : ''
                        }`}
                    >
                        <Text className={`text-center ${
                            activeTab === 'info'
                                ? 'text-blue-500 font-bold'
                                : 'text-gray-600'
                        }`}>
                            공고 정보
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab('applicants')}
                        className={`flex-1 py-3 ${
                            activeTab === 'applicants' ? 'border-b-2 border-blue-500' : ''
                        }`}
                    >
                        <Text className={`text-center ${
                            activeTab === 'applicants'
                                ? 'text-blue-500 font-bold'
                                : 'text-gray-600'
                        }`}>
                            지원자 ({applications.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 컨텐츠 */}
            {activeTab === 'info' ? (
                <PostingDetail
                    keywords={keywords}
                    postingId={postingId as string}
                    posting={posting}
                />
            ) : (
                <FlatList
                    data={applications}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <ApplicantCard
                            item={item}
                            postingId={postingId as string}
                            proposalStatus={proposalStatuses[item.id] || 'none'}
                        />
                    )}
                    contentContainerStyle={
                        applications.length === 0
                            ? { flex: 1 }
                            : { paddingVertical: 8 }
                    }
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center p-8">
                            <Ionicons name="people-outline" size={80} color="#9ca3af" />
                            <Text className="text-gray-500 text-lg mt-4">
                                아직 지원자가 없습니다
                            </Text>
                        </View>
                    }
                />
            )}

            <ModalComponent />
        </SafeAreaView>
    )
}