// app/(pages)/(user)/instant-interview-selection.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from '@/contexts/TranslationContext'
import Back from '@/components/back'
import { useModal } from '@/hooks/useModal'
import { groupByDate, formatTime24 } from '@/lib/dateUtils'
interface TimeSlot {
    id: string
    start_time: string
    end_time: string
    location: string
    interview_type: string
    is_available: boolean
    is_booked?: boolean
}
export default function InstantInterviewSelection() {
    const params = useLocalSearchParams()
    const {
        jobPostingId,
        companyId,
        companyName,
        jobTitle,
        jobAddress,
        interviewLocation,
        specialNotes
    } = params
    const { user } = useAuth()
    const { t, language } = useTranslation()
    const { showModal, ModalComponent } = useModal()
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
    const [selectedSlotId, setSelectedSlotId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [translating, setTranslating] = useState(false)
    const [translatedJobTitle, setTranslatedJobTitle] = useState<string>('')
    const [translatedSpecialNotes, setTranslatedSpecialNotes] = useState<string>('')
    useEffect(() => {
        fetchAvailableSlots()
        // 언어가 한국어가 아닌 경우 초기 번역 상태 설정
        if (language !== 'ko') {
            setTranslatedJobTitle(jobTitle as string || '')
            setTranslatedSpecialNotes(specialNotes as string || '')
        }
    }, [])
    const fetchAvailableSlots = async () => {
        try {
            setLoading(true)
            // 회사의 면접 가능 시간대 조회
            const response = await api('GET', '/api/company/interview-slots?companyId=' + companyId)
            if (response?.success && response.data) {
                // 확정된 면접 시간(is_booked: true) 제외하고 설정
                const availableOnly = response.data.filter((slot: TimeSlot) => !slot.is_booked)
                setAvailableSlots(availableOnly)
            }
        } catch (error) {
            showModal(t('alert.error', '오류'), t('instant_interview.fetch_slots_failed', '면접 시간대를 불러오는데 실패했습니다.'))
        } finally {
            setLoading(false)
        }
    }
    const handleTranslate = async () => {
        if (language === 'ko' || translating) return
        setTranslating(true)
        try {
            const textsToTranslate = []
            
            if (jobTitle) {
                textsToTranslate.push(jobTitle as string)
            }
            
            if (specialNotes) {
                textsToTranslate.push(specialNotes as string)
            }
            if (textsToTranslate.length > 0) {
                const response = await api('POST', '/api/translate/translate-batch', {
                    texts: textsToTranslate,
                    targetLang: language
                })
                if (response?.success && response.translations) {
                    const translations = response.translations
                    let translationIndex = 0
                    if (jobTitle && translations[translationIndex]) {
                        setTranslatedJobTitle(translations[translationIndex])
                        translationIndex++
                    }
                    if (specialNotes && translations[translationIndex]) {
                        setTranslatedSpecialNotes(translations[translationIndex])
                    }
                }
            }
        } catch (error) {
            showModal(t('alert.error', '오류'), t('posting_detail.translate_failed', '번역에 실패했습니다.'))
        } finally {
            setTranslating(false)
        }
    }
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const weekDay = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
        const hours = date.getHours()
        const minutes = date.getMinutes()
        return {
            date: `${month}월 ${day}일 (${weekDay})`,
            time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }
    }
    const groupSlotsByDate = (slots: TimeSlot[]) => {
        return groupByDate(slots, (slot) => slot.start_time)
    }
    const handleSelectSlot = (slotId: string) => {
        setSelectedSlotId(slotId)
    }
    const handleSubmit = async () => {
        if (!selectedSlotId) {
            showModal(t('alert.notification', '알림'), t('instant_interview.select_time_first', '면접 시간을 선택해주세요.'))
            return
        }
        if (!user) {
            showModal(t('alert.error', '오류'), t('interview.login_required', '로그인이 필요합니다.'))
            return
        }
        setSubmitting(true)
        try {
            // 1. 토큰 잔액 확인
            const balanceResponse = await api('GET', '/api/purchase/tokens/balance');
            if (balanceResponse?.success && balanceResponse.balance < 1) {
                showModal(
                    t('alert.notification', '토큰 부족'), 
                    t('instant_interview.insufficient_tokens', '토큰을 이용하면, 무응답 걱정 없이, 100% 면접이 확정되요!'),
                    'warning',
                    () => {
                        router.push('/(user)/shop')
                    },
                    true,
                    t('instant_interview.go_to_shop', '상점으로 가기'),
                    t('button.cancel', '취소')
                )
                return
            }
            // 2. 지원서 생성 (토큰 사용, 이력서 없이, 바로 scheduled 상태로)
            const applicationResponse = await api('POST', '/api/applications/instant-interview', {
                companyId: companyId,
                jobPostingId: jobPostingId,
                useToken: true // 토큰 사용 플래그
            });
            if (!applicationResponse?.success) {
                if (applicationResponse?.error === '이미 지원한 공고입니다.') {
                    showModal(t('alert.notification', '알림'), t('instant_interview.already_applied', '이미 지원한 공고입니다.'))
                    return
                }
                if (applicationResponse?.error === '토큰이 부족합니다. 상점에서 토큰을 구매해주세요.') {
                    showModal(
                        t('alert.notification', '토큰 부족'), 
                        t('instant_interview.insufficient_tokens', '즉시면접 예약을 위해서는 토큰 1개가 필요합니다. 상점에서 토큰을 구매해주세요.'),
                        'warning',
                        () => {
                            router.push('/(user)/shop')
                        },
                        true,
                        t('instant_interview.go_to_shop', '상점으로 가기'),
                        t('button.cancel', '취소')
                    )
                    return
                }
                throw new Error(applicationResponse?.error || '지원서 생성 실패')
            }
            const application = applicationResponse.data;
            // 3. 면접 제안서 생성 (실제로는 유저가 스스로 만든 것이지만 형식상 필요)
            const proposalResponse = await api('POST', '/api/interview-proposals/company', {
                applicationId: application.id,
                companyId: companyId,
                location: interviewLocation || jobAddress || t('interview.default_location', '회사 주소') // interview_location이 있으면 우선 사용
            })
            if (!proposalResponse?.success || !proposalResponse.data) {
                throw new Error('면접 제안 생성 실패')
            }
            // 4. 면접 스케줄 생성
            const scheduleResponse = await api('POST', '/api/interview-schedules/user', {
                proposalId: proposalResponse.data.id,
                interviewSlotId: selectedSlotId
            })
            if (scheduleResponse?.success) {
                showModal(
                    t('alert.success', '성공'), 
                    t('instant_interview.schedule_confirmed_with_token', '면접 일정이 확정되었습니다! 토큰 1개가 사용되었습니다.'), 
                    'info',
                    () => {
                        router.replace('/(user)/applications')
                    }
                )
            } else {
                throw new Error('면접 스케줄 생성 실패')
            }
        } catch (error) {
            showModal(t('alert.error', '오류'), t('instant_interview.schedule_failed', '면접 일정 확정에 실패했습니다.'))
        } finally {
            setSubmitting(false)
        }
    }
    const groupedSlots = groupSlotsByDate(availableSlots)
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
            <View className="bg-white border-b border-gray-200">
                <View className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center">
                        <Back />
                        <Text className="text-lg font-bold ml-4">{t('instant_interview.select_time_title', '면접 시간 선택')}</Text>
                    </View>
                    {language !== 'ko' && (jobTitle || specialNotes) && (
                        <TouchableOpacity
                            onPress={handleTranslate}
                            disabled={translating}
                            className="flex-row items-center px-3 py-1 bg-blue-100 rounded-lg"
                        >
                            <Ionicons 
                                name="language" 
                                size={16} 
                                color="#3b82f6" 
                            />
                            <Text className="text-blue-600 text-sm ml-1">
                                {translating ? t('interview.processing', '처리중...') : t('posting_detail.translate', '번역하기')}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <ScrollView className="flex-1">
                {/* 완벽 매칭 배너 */}
                <View className="bg-purple-50 p-4 mb-2">
                    <View className="flex-row items-center">
                        <View className="bg-purple-100 p-2 rounded-full mr-3">
                            <Ionicons name="flash" size={24} color="#8b5cf6" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-purple-800 font-bold text-base">
                                {t('instant_interview.perfect_match_banner', '완벽한 매칭!')}
                            </Text>
                            <Text className="text-purple-600 text-sm mt-1">
                                {t('instant_interview.no_resume_required', '이력서 제출 없이 바로 면접 일정을 확정할 수 있습니다.')}
                            </Text>
                        </View>
                    </View>
                </View>
                {/* 회사 정보 */}
                <View className="bg-white p-4 mb-2">
                    <Text className="text-sm text-gray-600">{t('instant_interview.company', '회사')}</Text>
                    <Text className="text-base font-semibold">{companyName}</Text>
                    <Text className="text-sm text-gray-600 mt-1">{t('instant_interview.position', '직무')}</Text>
                    <Text className="text-base">
                        {language !== 'ko' && translatedJobTitle ? translatedJobTitle : jobTitle}
                    </Text>
                </View>
                {/* 면접 장소 */}
                {(interviewLocation || jobAddress) && (
                    <View className="bg-white p-4 mb-2">
                        <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={20} color="#6b7280" />
                            <Text className="text-sm text-gray-600 ml-2">
                                {t('instant_interview.interview_location', '면접 장소')}
                            </Text>
                        </View>
                        <Text className="text-base mt-1">{interviewLocation || jobAddress}</Text>
                    </View>
                )}
                {/* 특이사항 */}
                {specialNotes && (
                    <View className="bg-yellow-50 p-4 mb-2 border border-yellow-200">
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle" size={20} color="#d97706" />
                            <Text className="text-sm text-yellow-800 font-semibold ml-2">
                                {t('instant_interview.special_notes', '특이사항')}
                            </Text>
                        </View>
                        <Text className="text-base text-yellow-800 mt-2">
                            {language !== 'ko' && translatedSpecialNotes ? translatedSpecialNotes : specialNotes}
                        </Text>
                    </View>
                )}
                {/* 시간대 선택 */}
                <View className="bg-white p-4">
                    <Text className="text-base font-semibold mb-4">
                        {t('instant_interview.select_available_time', '면접 가능 시간대를 선택해주세요')}
                    </Text>
                    {Object.keys(groupedSlots).length === 0 ? (
                        <View className="py-8 items-center">
                            <Text className="text-gray-500">
                                {t('instant_interview.no_available_slots', '선택 가능한 시간대가 없습니다.')}
                            </Text>
                        </View>
                    ) : (
                        Object.entries(groupedSlots).map(([dateKey, slots]) => {
                            const { date } = formatDateTime(slots[0].start_time)
                            return (
                                <View key={dateKey} className="mb-6">
                                    <Text className="text-sm font-semibold text-gray-700 mb-3">
                                        {date}
                                    </Text>
                                    {slots.map((slot) => {
                                        const startTime = formatTime24(slot.start_time)
                                        const endTime = formatTime24(slot.end_time)
                                        const isSelected = selectedSlotId === slot.id
                                        return (
                                            <TouchableOpacity
                                                key={slot.id}
                                                onPress={() => handleSelectSlot(slot.id)}
                                                className={`mb-3 p-4 rounded-lg border ${
                                                    isSelected
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-300 bg-white'
                                                }`}
                                            >
                                                <View className="flex-row justify-between items-center">
                                                    <View className="flex-1">
                                                        <Text className={`text-base font-medium ${
                                                            isSelected ? 'text-purple-700' : 'text-gray-800'
                                                        }`}>
                                                            {startTime} - {endTime}
                                                        </Text>
                                                        {/* 면접 유형 */}
                                                        <View className="flex-row items-center mt-2">
                                                            <Ionicons
                                                                name={
                                                                    slot.interview_type === '화상'
                                                                        ? 'videocam-outline'
                                                                        : slot.interview_type === '전화'
                                                                            ? 'call-outline'
                                                                            : 'people-outline'
                                                                }
                                                                size={16}
                                                                color="#6b7280"
                                                            />
                                                            <Text className="text-sm text-gray-600 ml-1">
                                                                {slot.interview_type} {t('instant_interview.interview_type', '면접')}
                                                            </Text>
                                                        </View>
                                                        {/* 개별 장소 */}
                                                        {slot.location && (
                                                            <View className="flex-row items-center mt-1">
                                                                <Ionicons
                                                                    name="location-outline"
                                                                    size={16}
                                                                    color="#6b7280"
                                                                />
                                                                <Text className="text-sm text-gray-600 ml-1">
                                                                    {slot.location}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                    <View className={`w-6 h-6 rounded-full border-2 ${
                                                        isSelected
                                                            ? 'border-purple-500 bg-purple-500'
                                                            : 'border-gray-300'
                                                    }`}>
                                                        {isSelected && (
                                                            <Ionicons
                                                                name="checkmark"
                                                                size={16}
                                                                color="white"
                                                                style={{ marginLeft: 2, marginTop: 2 }}
                                                            />
                                                        )}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            )
                        })
                    )}
                </View>
            </ScrollView>
            {/* 하단 버튼 */}
            <View className="bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={!selectedSlotId || submitting}
                    className={`py-4 rounded-lg ${
                        !selectedSlotId || submitting
                            ? 'bg-gray-300'
                            : 'bg-purple-600'
                    }`}
                >
                    <Text className="text-center text-white font-semibold">
                        {submitting ? t('interview.processing', '처리중...') : t('instant_interview.confirm_immediately', '면접 즉시 확정하기')}
                    </Text>
                </TouchableOpacity>
            </View>
            <ModalComponent />
        </SafeAreaView>
    )
}