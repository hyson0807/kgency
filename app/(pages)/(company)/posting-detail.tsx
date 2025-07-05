// app/(pages)/(company)/posting-detail.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

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
    const { user } = useAuth()

    const [posting, setPosting] = useState<any>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'applicants'>('info')

    useEffect(() => {
        if (postingId) {
            loadPostingDetail()
            loadApplications()
        }
    }, [postingId])

    const loadPostingDetail = async () => {
        try {
            const { data, error } = await supabase
                .from('job_postings')
                .select(`
                    *,
                    job_posting_keywords:job_posting_keyword (
                        keyword:keyword_id (
                            keyword,
                            category
                        )
                    )
                `)
                .eq('id', postingId)
                .single()

            if (error) throw error
            setPosting(data)
        } catch (error) {
            console.error('공고 로드 실패:', error)
            Alert.alert('오류', '공고 정보를 불러오는데 실패했습니다.')
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

    const handleContactApplicant = (applicant: Application) => {
        Alert.alert(
            '지원자 연락',
            `${applicant.user.name}님에게 연락하시겠습니까?\n연락처: ${applicant.user.phone_number}`,
            [
                { text: '취소', style: 'cancel' },
                { text: '전화', onPress: () => {
                        // 전화 앱 열기 (실제 구현시)
                        console.log('전화:', applicant.user.phone_number)
                    }}
            ]
        )
    }

    const handleViewResume = (application: Application) => {
        if (application.message) {
            router.push({
                pathname: '/(pages)/(company)/view-resume',
                params: {
                    applicationId: application.id,
                    userName: application.user.name,
                    resume: application.message.content
                }
            })
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    const renderApplicant = ({ item }: { item: Application }) => (
        <TouchableOpacity
            onPress={() => handleViewResume(item)}
            className="bg-white mx-4 my-2 p-4 rounded-xl shadow-sm"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <View className="flex-row items-center">
                        <Text className="text-lg font-bold">{item.user.name}</Text>
                        {item.message && !item.message.is_read && (
                            <View className="ml-2 bg-blue-500 px-2 py-0.5 rounded-full">
                                <Text className="text-xs text-white">새 이력서</Text>
                            </View>
                        )}
                    </View>
                    <Text className="text-sm text-gray-600">{formatDate(item.applied_at)}</Text>
                </View>
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation()
                        handleContactApplicant(item)
                    }}
                    className="bg-blue-100 p-2 rounded-full"
                >
                    <Ionicons name="call-outline" size={20} color="#3b82f6" />
                </TouchableOpacity>
            </View>

            {/* 지원자 정보 요약 */}
            <View className="space-y-1">
                {item.user.user_info?.age && (
                    <Text className="text-sm text-gray-700">
                        나이: {item.user.user_info.age}세 / {item.user.user_info.gender || '성별 미입력'}
                    </Text>
                )}

                {item.user.user_info?.visa && (
                    <Text className="text-sm text-gray-700">
                        비자: {item.user.user_info.visa}
                    </Text>
                )}
                {item.user.user_info?.korean_level && (
                    <Text className="text-sm text-gray-700">
                        한국어: {item.user.user_info.korean_level}
                    </Text>
                )}
                {item.user.user_info?.experience && (
                    <Text className="text-sm text-gray-700">
                        경력: {item.user.user_info.experience}
                    </Text>
                )}
            </View>

            <View className="mt-3 pt-3 border-t border-gray-100">
                <TouchableOpacity className="flex-row items-center justify-center">
                    <Ionicons name="document-text-outline" size={16} color="#3b82f6" />
                    <Text className="text-blue-600 font-medium ml-2">이력서 보기</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </SafeAreaView>
        )
    }

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
                <ScrollView className="flex-1 bg-white" showsVerticalScrollIndicator={false}>
                    {/* 공고 상태 */}
                    <View className="p-6 border-b border-gray-100">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-semibold">공고 상태</Text>
                            <View className={`px-3 py-1 rounded-full ${
                                posting?.is_active ? 'bg-green-100' : 'bg-gray-200'
                            }`}>
                                <Text className={`text-sm font-medium ${
                                    posting?.is_active ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                    {posting?.is_active ? '모집중' : '마감'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* 근무 조건 */}
                    <View className="p-6 border-b border-gray-100">
                        <Text className="text-lg font-semibold mb-4">근무 조건</Text>

                        {posting?.title && (
                            <View className="flex-row items-center mb-3">
                                <Text className="text-gray-700 ml-3">제목: {posting.title}</Text>
                            </View>
                        )}

                        {posting?.salary_range && (
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="cash-outline" size={20} color="#6b7280" />
                                <Text className="text-gray-700 ml-3">급여: {posting.salary_range}</Text>
                            </View>
                        )}
                        {posting?.working_hours && (
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="time-outline" size={20} color="#6b7280" />
                                <Text className="text-gray-700 ml-3">근무시간: {posting.working_hours}</Text>
                            </View>
                        )}
                        {posting?.hiring_count && (
                            <View className="flex-row items-center">
                                <Ionicons name="people-outline" size={20} color="#6b7280" />
                                <Text className="text-gray-700 ml-3">모집인원: {posting.hiring_count}명</Text>
                            </View>
                        )}
                    </View>

                    {/* 복지/혜택 */}
                    {posting?.benefits && posting.benefits.length > 0 && (
                        <View className="p-6 border-b border-gray-100">
                            <Text className="text-lg font-semibold mb-4">복지/혜택</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {posting.benefits.map((benefit: string, index: number) => (
                                    <View key={index} className="bg-blue-100 px-3 py-1 rounded-full">
                                        <Text className="text-blue-700">{benefit}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* 상세 설명 */}
                    {posting?.description && (
                        <View className="p-6 border-b border-gray-100">
                            <Text className="text-lg font-semibold mb-4">상세 설명</Text>
                            <Text className="text-gray-700 leading-6">{posting.description}</Text>
                        </View>
                    )}

                    {/* 자격요건 */}
                    {posting?.requirements && (
                        <View className="p-6">
                            <Text className="text-lg font-semibold mb-4">자격요건</Text>
                            <Text className="text-gray-700 leading-6">{posting.requirements}</Text>
                        </View>
                    )}

                    {/* 수정/삭제 버튼 */}
                    <View className="p-6">
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/(pages)/(company)/info',
                                params: { jobPostingId: postingId }
                            })}
                            className="bg-blue-500 py-3 rounded-xl mb-3"
                        >
                            <Text className="text-center text-white font-bold">공고 수정</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                <FlatList
                    data={applications}
                    keyExtractor={(item) => item.id}
                    renderItem={renderApplicant}
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
        </SafeAreaView>
    )
}