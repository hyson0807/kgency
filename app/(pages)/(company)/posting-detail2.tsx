// app/(pages)/(company)/posting-detail.tsx
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { supabase } from '@/lib/supabase'
import { useMatchedJobPostings } from '@/hooks/useMatchedJobPostings'
import { useModal } from '@/hooks/useModal'
import {PostingDetail} from "@/components/posting-detail2(company)/PostingDetail";
import {ApplicantCard} from "@/components/posting-detail2(company)/ApplicantCard";

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
            age?: number;
            gender?:string;
            visa?:string;
            how_long?:string;
            topic?:string;
            korean_level?:string;
            experience?:string;
            experience_content?:string; }
    }
    message?: {
        content: string
        is_read: boolean
    }
}

export default function CompanyPostingDetail() {
    const params = useLocalSearchParams()
    const { postingId } = params
    const { fetchPostingById, getPostingKeywords } = useMatchedJobPostings()

    const [posting, setPosting] = useState<any>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'applicants'>('info')
    const { showModal, ModalComponent } = useModal()


    useEffect(() => {
        if (postingId) {
            loadPostingDetail()
            loadApplications()
        }
    }, [postingId])

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
            const { data, error } = await supabase
                .from('applications')
                .select(`
                    *,
                    user:user_id (
                        id,
                        name,
                        phone_number,
                        address,
                        user_info!user_info_user_id_fkey (
                            age,
                            gender,
                            visa,
                            how_long,
                            topic,
                            korean_level,
                            experience,
                            experience_content
                        )
                    ),
                    message:message_id (
                        content,
                        is_read
                    )
                `)
                .eq('job_posting_id', postingId)
                .order('applied_at', { ascending: false })

            if (error) throw error
            setApplications(data || [])
        } catch (error) {
            console.error('지원자 로드 실패:', error)
        }
    }


    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </SafeAreaView>
        )
    }
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

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white border-b border-gray-200">
                <View className="flex-row items-center p-4">
                    <Back />
                    <Text className="text-lg font-bold ml-4">{posting?.title || '공고 상세'}</Text>
                </View>

                {/* 탭 */}
                <View className="flex-row">
                    <TouchableOpacity
                        onPress={() => setActiveTab('info')}
                        className={`flex-1 py-3 ${activeTab === 'info' ? 'border-b-2 border-blue-500' : ''}`}
                    >
                        <Text className={`text-center ${activeTab === 'info' ? 'text-blue-500 font-bold' : 'text-gray-600'}`}>
                            공고 정보
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab('applicants')}
                        className={`flex-1 py-3 ${activeTab === 'applicants' ? 'border-b-2 border-blue-500' : ''}`}
                    >
                        <Text className={`text-center ${activeTab === 'applicants' ? 'text-blue-500 font-bold' : 'text-gray-600'}`}>
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
                    keyExtractor={(item) => item.id}
                    renderItem={({item}) => <ApplicantCard item={item} /> }
                    contentContainerStyle={applications.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
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