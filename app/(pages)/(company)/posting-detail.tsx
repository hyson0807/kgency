// app/(pages)/(company)/posting-detail.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useMatchedJobPostings } from '@/hooks/useMatchedJobPostings'
import { useModal } from '@/hooks/useModal'
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
    const { fetchPostingById, getPostingKeywords } = useMatchedJobPostings()

    const [posting, setPosting] = useState<any>(null)
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'info' | 'applicants'>('info')
    const { showModal, ModalComponent, hideModal } = useModal()


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

    const handleContactApplicant = (applicant: Application) => {
        showModal(
            '지원자 연락',
            `${applicant.user.name}님에게 연락하시겠습니까?\n연락처: ${applicant.user.phone_number}`,
            'confirm',
            () => {
                hideModal()  // setModalConfig 대신 hideModal 사용
                console.log('전화:', applicant.user.phone_number)
            },
            true  // showCancel을 true로 설정
        )
    }

    const handleViewResume = (application: Application) => {
        if (application.message) {
            router.push({
                pathname: '/(pages)/(company)/view-resume',
                params: {
                    applicationId: application.id,
                    userName: application.user.name,
                    resume: application.message.content,
                    userPhone: application.user.phone_number
                }
            })
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    //지원자 부분
    //지원자 부분
    const renderApplicant = ({ item }: { item: Application }) => (
        <View className="bg-white mx-4 my-2 p-4 rounded-xl shadow-sm">
            <View className="mb-2">
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

            {/* 지원자 정보 요약 */}
            <View className="space-y-1 mb-3">
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

            {/* 버튼들 */}
            <View className="flex-row gap-2 pt-3 border-t border-gray-100">
                <TouchableOpacity
                    onPress={() => handleViewResume(item)}
                    className="flex-1 bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"
                >
                    <Ionicons name="document-text-outline" size={18} color="white" />
                    <Text className="text-white font-medium ml-2">이력서 보기</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        // 실제 앱에서는 Clipboard API 사용
                        showModal(
                            '연락처 복사',
                            `${item.user.name}님의 연락처가 복사되었습니다.\n${item.user.phone_number}`,
                            'info'
                        )
                        // 실제 구현시: Clipboard.setString(item.user.phone_number)
                    }}
                    className="flex-1 bg-gray-100 py-3 rounded-lg flex-row items-center justify-center"
                >
                    <Ionicons name="copy-outline" size={18} color="#374151" />
                    <Text className="text-gray-700 font-medium ml-2">연락처 복사</Text>
                </TouchableOpacity>
            </View>
        </View>
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

                        {/* 가게 주소 추가 */}
                        {posting?.job_address && (
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="business-outline" size={20} color="#6b7280" />
                                <View className="ml-3">
                                    <Text className="text-xs text-gray-500">가게 주소</Text>
                                    <Text className="text-gray-700">{posting.job_address}</Text>
                                </View>
                            </View>
                        )}




                        {/* 근무일 */}
                        {posting?.working_days && posting.working_days.length > 0 && (
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                <View className="ml-3">
                                    <Text className="text-xs text-gray-500">근무일</Text>
                                    <Text className="text-gray-700">
                                        {posting.working_days.join(', ')}
                                        {posting.working_days_negotiable && ' (협의가능)'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* 근무시간 */}
                        {posting?.working_hours && (
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="time-outline" size={20} color="#6b7280" />
                                <View className="ml-3">
                                    <Text className="text-xs text-gray-500">근무시간</Text>
                                    <Text className="text-gray-700">
                                        {posting.working_hours}
                                        {posting.working_hours_negotiable && ' (협의가능)'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* 급여타입 & 급여 */}
                        {(posting?.salary_range) && (
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="cash-outline" size={20} color="#6b7280" />
                                <View className="ml-3">
                                    <Text className="text-xs text-gray-500">급여</Text>
                                    <Text className="text-gray-700">
                                        {posting.salary_range}
                                        {posting.salary_range_negotiable && ' (협의가능)'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* 급여일 */}
                        {posting?.pay_day && (
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="wallet-outline" size={20} color="#6b7280" />
                                <View className="ml-3">
                                    <Text className="text-xs text-gray-500">급여일</Text>
                                    <Text className="text-gray-700">
                                        {posting.pay_day}
                                        {posting.pay_day_negotiable && ' (협의가능)'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {posting?.hiring_count && (
                            <View className="flex-row items-center">
                                <Ionicons name="people-outline" size={20} color="#6b7280" />
                                <View className="ml-3">
                                    <Text className="text-xs text-gray-500">모집인원</Text>
                                    <Text className="text-gray-700">{posting.hiring_count}명</Text>
                                </View>
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


                    {/* 회사의 강점 - 추가할 부분 */}
                    <View className="p-6 border-b border-gray-100">
                        <Text className="text-lg font-semibold mb-4">회사의 강점!</Text>

                        {keywords.conditions.length > 0 && (
                            <View className="mb-4">
                                <View className="flex-row flex-wrap gap-2">
                                    {keywords.conditions.map((keyword) => (
                                        <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full">
                                            <Text className="text-orange-700 text-sm">{keyword.keyword}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    {/* 채용 분야 */}
                    {keywords && (
                        <View className="p-6">
                            <Text className="text-lg font-semibold mb-4">채용 분야</Text>

                            {keywords.countries.length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-gray-600 font-medium mb-2">대상 국가</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {keywords.countries.map((keyword) => (
                                            <View key={keyword.id} className="bg-purple-100 px-3 py-1 rounded-full">
                                                <Text className="text-purple-700 text-sm">{keyword.keyword}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {keywords.jobs.length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-gray-600 font-medium mb-2">모집 직종</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {keywords.jobs.map((keyword) => (
                                            <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full">
                                                <Text className="text-orange-700 text-sm">{keyword.keyword}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {keywords.gender.length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-gray-600 font-medium mb-2">모집 성별</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {keywords.gender.map((keyword) => (
                                            <View key={keyword.id} className="bg-blue-100 px-3 py-1 rounded-full">
                                                <Text className="text-blue-700 text-sm">{keyword.keyword}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                            {keywords.age.length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-gray-600 font-medium mb-2">모집 나이대</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {keywords.age.map((keyword) => (
                                            <View key={keyword.id} className="bg-green-100 px-3 py-1 rounded-full">
                                                <Text className="text-green-700 text-sm">{keyword.keyword}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                            {keywords.visa.length > 0 && (
                                <View className="mb-4">
                                    <Text className="text-gray-600 font-medium mb-2">지원 가능한 비자</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {keywords.visa.map((keyword) => (
                                            <View key={keyword.id} className="bg-yellow-100 px-3 py-1 rounded-full">
                                                <Text className="text-yellow-700 text-sm">{keyword.keyword}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
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
            <ModalComponent />
        </SafeAreaView>
    )
}