// app/(pages)/(user)/posting-detail.tsx
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { useMatchedJobPostings } from '@/hooks/useMatchedJobPostings'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from "@/contexts/TranslationContext";
import axios from 'axios'
import { useModal } from '@/hooks/useModal'


export default function PostingDetail() {
    const params = useLocalSearchParams()
    const { postingId, companyId, companyName } = params
    const { fetchPostingById, getPostingKeywords } = useMatchedJobPostings()
    const { user } = useAuth()

    const [posting, setPosting] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [hasApplied, setHasApplied] = useState(false)
    const { t, translateDB, language } = useTranslation()
    const { showModal, ModalComponent } = useModal()

    const dayTranslations: { [key: string]: { [lang: string]: string } } = {
        '월': {
            en: 'Mon', ja: '月', zh: '周一', vi: 'T2', hi: 'सोम', si: 'සඳුදා', ar: 'الإثنين', tr: 'Pzt', my: 'တနင်္လာ', ky: 'Дүйшөмбү', mn: 'Даваа'
        },
        '화': {en: 'Tue', ja: '火', zh: '周二', vi: 'T3', hi: 'मंगल', si: 'අඟහරුවාදා', ar: 'الثلاثاء', tr: 'Sal', my: 'အင်္ဂါ', ky: 'Шейшемби', ha: 'Talata', mn: 'Мягмар'
        },
        '수': {en: 'Wed', ja: '水', zh: '周三', vi: 'T4', hi: 'बुध', si: 'බදාදා', ar: 'الأربعاء', tr: 'Çar', my: 'ဗုဒ္ဓဟူး', ky: 'Шаршемби', ha: 'Laraba', mn: 'Лхагва'
        },
        '목': {en: 'Thu', ja: '木', zh: '周四', vi: 'T5', hi: 'गुरु', si: 'බ්‍රහස්පතින්දා', ar: 'الخميس', tr: 'Per', my: 'ကြာသပတေး', ky: 'Бейшемби', ha: 'Alhamis', mn: 'Пүрэв'
        },
        '금': {en: 'Fri', ja: '金', zh: '周五', vi: 'T6', hi: 'शुक्र', si: 'සිකුරාදා', ar: 'الجمعة', tr: 'Cum', my: 'သောကြာ', ky: 'Жума', ha: 'Jumma a', mn: 'Баасан'
        },
        '토': {en: 'Sat', ja: '土', zh: '周六', vi: 'T7', hi: 'शनि', si: 'සෙනසුරාදා', ar: 'السبت', tr: 'Cmt', my: 'စနေ', ky: 'Ишемби', ha: 'Asabar', mn: 'Бямба'
        },
        '일': {en: 'Sun', ja: '日', zh: '周日', vi: 'CN', hi: 'रवि', si: 'ඉරිදා', ar: 'الأحد', tr: 'Paz', my: 'တနင်္ဂနွေ', ky: 'Жекшемби', ha: 'Lahadi', mn: 'Ням'
        }
    };

    const [translatedData, setTranslatedData] = useState<{
        title?: string
        description?: string
        job_address?: string
        working_days?: string[]
        working_hours?: string
        salary_range?: string
        pay_day?: string
    } | null>(null)
    const [isTranslated, setIsTranslated] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)


    useEffect(() => {
        loadPostingDetail()
        checkApplicationStatus()
    }, [postingId])

    useEffect(() => {
        // 언어가 변경되면 번역 상태 초기화
        setTranslatedData(null)
        setIsTranslated(false)
    }, [language])

    const loadPostingDetail = async () => {
        if (!postingId) return

        setLoading(true)
        try {
            const data = await fetchPostingById(postingId as string)
            if (data) {
                setPosting(data)
            }
        } catch (error) {
            console.error('공고 상세 로드 실패:', error)
        } finally {
            setLoading(false)
        }
    }

    const checkApplicationStatus = async () => {
        if (!user || !postingId) return

        try {
            const { data, error } = await supabase
                .from('applications')
                .select('id')
                .eq('user_id', user.userId)
                .eq('job_posting_id', postingId)
                .maybeSingle()

            if (!error && data) {
                setHasApplied(true)
            }
        } catch (error) {
            console.error('지원 상태 확인 실패:', error)
        }
    }

    const handleApply = () => {
        router.push({
            pathname: '/(pages)/(user)/apply',
            params: {
                jobPostingId: postingId,
                companyId: posting?.company.id || companyId,
                companyName: posting?.company.name || companyName,
                jobTitle: posting?.title
            }
        })
    }

    const handleTranslate = async () => {
        if (!posting) return

        // 토글 기능
        if (isTranslated && translatedData) {
            setIsTranslated(false)
            return
        }

        // 이미 번역된 데이터가 있으면 토글
        if (translatedData) {
            setIsTranslated(true)
            return
        }

        // 새로 번역
        setIsTranslating(true)
        try {
            // 요일은 직접 매핑으로 번역
            const translatedDays = posting.working_days?.map((day: string) =>
                dayTranslations[day]?.[language] || day
            ) || []

            // 요일을 제외한 나머지 텍스트만 API로 번역
            const textsToTranslate = [
                { key: 'title', text: posting.title },
                { key: 'description', text: posting.description || '' },
                { key: 'job_address', text: posting.job_address || '' },
                { key: 'working_hours', text: posting.working_hours || '' },
                { key: 'salary_range', text: posting.salary_range || '' },
                { key: 'pay_day', text: posting.pay_day || '' }
            ].filter(item => item.text)

            const response = await axios.post('https://kgencyserver-production.up.railway.app/translate-batch', {
                texts: textsToTranslate,
                targetLang: language === 'ko' ? 'ko' : language
            })

            if (response.data.success) {
                const translations = response.data.translations

                // 번역 결과를 객체로 변환
                const translatedResult: any = {
                    working_days: translatedDays // 요일은 매핑된 값 사용
                }

                translations.forEach((item: any) => {
                    translatedResult[item.key] = item.translatedText
                })

                setTranslatedData(translatedResult)
                setIsTranslated(true)
            } else {
                throw new Error('번역 실패')
            }
        } catch (error) {
            console.error('번역 오류:', error)
            showModal(
                '번역 실패',
                '번역하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                'warning'
            )
        } finally {
            setIsTranslating(false)
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
                    <Text className="text-gray-500">{t('posting_detail.not_found', '공고를 찾을 수 없습니다.')}</Text>
                </View>
            </SafeAreaView>
        )
    }

    const keywords = getPostingKeywords(posting)

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                <View className="flex-row items-center">
                <Back />
                <Text className="text-lg font-bold ml-4">{t('posting_detail.title', '채용 상세')}</Text>
                </View>
                {language !== 'ko' && ( // 한국어가 아닐 때만 번역 버튼 표시
                    <TouchableOpacity
                        onPress={handleTranslate}
                        disabled={isTranslating}
                        className={`flex-row items-center px-3 py-1.5 rounded-full ${
                            isTranslated ? 'bg-green-100' : 'bg-blue-100'
                        }`}
                    >
                        <Ionicons
                            name={isTranslated ? "checkmark-circle" : "language"}
                            size={16}
                            color={isTranslated ? "#10b981" : "#3b82f6"}
                        />
                        <Text className={`ml-1 text-sm ${
                            isTranslated ? 'text-green-600' : 'text-blue-600'
                        }`}>
                            {isTranslated ? t('posting_detail.show_original', '원본 보기') : t('posting_detail.translate', '번역하기')}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 회사 정보 */}
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-sm text-gray-600 mb-1">{posting.company.name}</Text>
                    <Text className="text-2xl font-bold mb-3">
                        {isTranslated && translatedData?.title ? translatedData.title : posting.title}
                    </Text>
                </View>

                {/* 주요 정보 */}
                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">{t('posting_detail.work_conditions', '근무 조건')}</Text>

                    {/* 근무지역 */}
                    {posting.job_address && posting.job_address.length > 0 && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="location-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">{t('posting_detail.work_location', '근무지역')}</Text>
                                <Text className="text-base text-gray-800">
                                    {isTranslated && translatedData?.job_address ? translatedData.job_address : posting.job_address}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 근무일 */}
                    {posting.working_days && posting.working_days.length > 0 && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">{t('posting_detail.work_days', '근무일')}</Text>
                                <Text className="text-base text-gray-800">
                                    {isTranslated && translatedData?.working_days
                                        ? translatedData.working_days.join(', ')
                                        : posting.working_days.join(', ')
                                    }
                                    {posting.working_days_negotiable && t('posting_detail.negotiable', ' (협의가능)')}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 근무시간 */}
                    {posting.working_hours && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="time-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">{t('posting_detail.work_hours', '근무시간')}</Text>
                                <Text className="text-base text-gray-800">
                                    {isTranslated && translatedData?.working_hours
                                        ? translatedData.working_hours
                                        : posting.working_hours
                                    }
                                    {posting.working_hours_negotiable && t('posting_detail.negotiable', ' (협의가능)')}
                                </Text>
                            </View>
                        </View>
                    )}


                    {/* 급여타입 & 급여 */}
                    {(posting.salary_range) && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="cash-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">{t('posting_detail.salary', '급여')}</Text>
                                <Text className="text-base text-gray-800">
                                    {isTranslated && translatedData?.salary_range
                                        ? translatedData.salary_range
                                        : posting.salary_range
                                    }
                                    {posting.salary_range_negotiable && t('posting_detail.negotiable', ' (협의가능)')}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 급여일 */}
                    {posting.pay_day && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="wallet-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">{t('posting_detail.pay_day', '급여일')}</Text>
                                <Text className="text-base text-gray-800">
                                    {isTranslated && translatedData?.pay_day
                                        ? translatedData.pay_day
                                        : posting.pay_day
                                    }
                                    {posting.pay_day_negotiable && t('posting_detail.negotiable', ' (협의가능)')}
                                </Text>
                            </View>
                        </View>
                    )}

                    {posting.hiring_count && (
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="people-outline" size={18} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="text-xs text-gray-500">{t('posting_detail.hiring_count', '모집인원')}</Text>
                                <Text className="text-base text-gray-800">{posting.hiring_count}{t('posting_detail.people', '명')}</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* 상세 설명 */}
                {posting.description && (
                    <View className="p-6 border-b border-gray-100">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-semibold">
                                {t('posting_detail.detail_description', '상세 설명')}
                            </Text>
                        </View>
                        <Text className="text-gray-700 leading-6">
                            {isTranslated && translatedData?.description ? translatedData.description : posting.description}
                        </Text>
                    </View>
                )}



                <View className="p-6 border-b border-gray-100">
                    <Text className="text-lg font-semibold mb-4">{t('posting_detail.company_benefits', '회사의 강점!')}</Text>

                    {keywords.conditions.length > 0 && (
                        <View className="mb-4">
                            <View className="flex-row flex-wrap gap-2">
                                {keywords.conditions.map((keyword) => (
                                    <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full">
                                        <Text className="text-orange-700 text-sm">
                                            {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>







                {/* 채용 분야 */}
                {keywords && (
                    <View className="p-6">
                        <Text className="text-lg font-semibold mb-4">{t('posting_detail.hiring_fields', '채용 분야')}</Text>


                        {keywords.countries.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.target_countries', '대상 국가')}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {keywords.countries.map((keyword) => (
                                        <View key={keyword.id} className="bg-purple-100 px-3 py-1 rounded-full">
                                            <Text className="text-purple-700 text-sm">
                                                {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {keywords.jobs.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.job_positions', '모집 직종')}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {keywords.jobs.map((keyword) => (
                                        <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full">
                                            <Text className="text-orange-700 text-sm">
                                                {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                        {keywords.gender.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.target_gender', '모집 성별')}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {keywords.gender.map((keyword) => (
                                        <View key={keyword.id} className="bg-blue-100 px-3 py-1 rounded-full">
                                            <Text className="text-blue-700 text-sm">
                                                {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                        {keywords.age.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.target_age', '모집 나이대')}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {keywords.age.map((keyword) => (
                                        <View key={keyword.id} className="bg-green-100 px-3 py-1 rounded-full">
                                            <Text className="text-green-700 text-sm">
                                                {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                        {keywords.visa.length > 0 && (
                            <View className="mb-4">
                                <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.available_visa', '지원 가능한 비자')}</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {keywords.visa.map((keyword) => (
                                        <View key={keyword.id} className="bg-yellow-100 px-3 py-1 rounded-full">
                                            <Text className="text-yellow-700 text-sm">
                                                {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}


                    </View>
                )}
            </ScrollView>

            {/* 하단 지원 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-8 pt-2" >
                {hasApplied ? (
                    <View className="bg-gray-300 py-4 rounded-xl items-center">
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="#4b5563" />
                            <Text className="text-gray-700 font-bold text-lg ml-2">{t('posting_detail.already_applied', '이미 지원한 공고')}</Text>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        className="bg-blue-500 py-4 rounded-xl items-center mx-4 my-2"
                        onPress={handleApply}
                    >
                        <Text className="text-white text-lg font-bold">{t('posting_detail.apply', '지원하기')}</Text>
                    </TouchableOpacity>
                )}
            </View>
            <ModalComponent />
        </SafeAreaView>
    )
}