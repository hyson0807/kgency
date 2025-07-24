// app/(pages)/(user)/posting-detail.tsx
import {View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated} from 'react-native'
import React, { useEffect, useState, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import Back from '@/components/back'
import { useMatchedJobPostings } from '@/hooks/useMatchedJobPostings'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslation } from "@/contexts/TranslationContext";
import { useModal } from '@/hooks/useModal'
import HiringFields from "@/components/posting-detail/HiringFields";
import Header from "@/components/posting-detail/Header";
import {WorkCondition} from "@/components/posting-detail/WorkCondition";
import {api} from "@/lib/api";


export default function PostingDetail() {

    const params = useLocalSearchParams()
    const { postingId, companyId, companyName, suitability } = params
    const { fetchPostingById, getPostingKeywords } = useMatchedJobPostings()
    const { user } = useAuth()

    const [posting, setPosting] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [hasApplied, setHasApplied] = useState(false)
    const { t, translateDB, language } = useTranslation()
    const { showModal, ModalComponent } = useModal()

    // 애니메이션을 위한 ref
    const scaleAnim = useRef(new Animated.Value(1)).current
    const glowAnim = useRef(new Animated.Value(0)).current

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

    useEffect(() => {
        // 면접 즉시 확정 버튼 애니메이션
        if (suitability === 'perfect' && !hasApplied) {
            // 펄스 애니메이션
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.05,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ).start()

            // 글로우 애니메이션
            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ]),
            ).start()
        }
    }, [suitability, hasApplied])

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
            pathname: '/(pages)/(user)/application-form',
            params: {
                jobPostingId: postingId,
                companyId: posting?.company.id || companyId,
                companyName: posting?.company.name || companyName,
                jobTitle: posting?.title
            }
        })
    }

    const handleInstantInterview = () => {
        showModal(
            '면접 즉시 확정',
            '완벽한 매칭입니다! 면접 일정을 즉시 확정하시겠습니까?',
            'confirm', // type
            () => {
                // onConfirm 콜백 - 바로 면접 일정 선택 페이지로 이동
                router.push({
                    pathname: '/(pages)/(user)/instant-interview-selection',
                    params: {
                        jobPostingId: postingId,
                        companyId: posting?.company.id || companyId,
                        companyName: posting?.company.name || companyName,
                        jobTitle: posting?.title,
                        jobAddress: posting?.job_address || '',
                        interviewLocation: posting?.interview_location || ''
                    }
                })
            },
            true, // showCancel
            '확정', // confirmText
            '취소' // cancelText
        )
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

            const response = await api('POST', '/api/translate/translate-batch', {
                texts: textsToTranslate,
                targetLang: language === 'ko' ? 'ko' : language
            })

            if (response.success) {
                const translations = response.translations

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
            <Header language={language} handleTranslate={handleTranslate} isTranslated={isTranslated} isTranslating={isTranslating} t={t} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 회사 정보 */}
                <WorkCondition posting={posting} isTranslated={isTranslated} translatedData={translatedData} />

                {/* 채용 분야 */}
                <HiringFields keywords={keywords} translateDB={translateDB} />

            </ScrollView>

            {/* 하단 지원 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-8 pt-2" >
                {hasApplied ? (
                    <View className="bg-gray-300 py-4 rounded-xl items-center mx-4 my-2">
                        <View className="flex-row items-center">
                            <Ionicons name="checkmark-circle" size={20} color="#4b5563" />
                            <Text className="text-gray-700 font-bold text-lg ml-2">{t('posting_detail.already_applied', '이미 지원한 공고')}</Text>
                        </View>
                    </View>
                ) : (
                    <>
                        {/* 면접 즉시 확정 버튼 - suitability가 perfect일 때만 표시 */}
                        {suitability === 'perfect' && (
                            <Animated.View
                                style={{
                                    transform: [{ scale: scaleAnim }],
                                    opacity: glowAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.8, 1]
                                    })
                                }}
                                className="mx-4 mb-3"
                            >
                                <TouchableOpacity
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-xl items-center shadow-lg"
                                    style={{
                                        backgroundColor: '#8b5cf6',
                                        shadowColor: '#8b5cf6',
                                        shadowOffset: { width: 0, height: 4 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 8,
                                        elevation: 8,
                                    }}
                                    onPress={handleInstantInterview}
                                    activeOpacity={0.8}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="flash" size={24} color="white" />
                                        <Text className="text-white text-lg font-bold ml-2">
                                            {t('posting_detail.instant_interview', '면접 즉시 확정')}
                                        </Text>
                                        <View className="ml-2 bg-white/20 px-2 py-1 rounded-full">
                                            <Text className="text-white text-xs font-semibold">
                                                {t('posting_detail.perfect_match', '완벽 매칭')}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* 일반 지원하기 버튼 */}
                        <TouchableOpacity
                            className="bg-blue-500 py-4 rounded-xl items-center mx-4 my-2"
                            onPress={handleApply}
                        >
                            <Text className="text-white text-lg font-bold">{t('posting_detail.apply', '지원하기')}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
            <ModalComponent />
        </SafeAreaView>
    )
}