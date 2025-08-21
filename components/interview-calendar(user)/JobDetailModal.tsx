import React, { useEffect, useState } from 'react'
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { useTranslation } from '@/contexts/TranslationContext'
interface JobPosting {
    id: string
    title: string
    description?: string
    hiring_count: number
    working_hours?: string
    working_hours_negotiable: boolean
    working_days?: string[]
    working_days_negotiable: boolean
    salary_range?: string
    salary_range_negotiable: boolean
    salary_type?: string
    pay_day?: string
    pay_day_negotiable: boolean
    job_address?: string
    interview_location?: string
    special_notes?: string
    company?: {
        name: string
        address?: string
        phone_number?: string
        description?: string
    }
}
interface JobDetailModalProps {
    visible: boolean
    onClose: () => void
    jobPostingId: string
}
export const JobDetailModal = ({ visible, onClose, jobPostingId }: JobDetailModalProps) => {
    const { t, language } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)
    const [translatedData, setTranslatedData] = useState<{
        title?: string
        description?: string
        job_address?: string
        interview_location?: string
        working_hours?: string
        working_days?: string[]
        salary_range?: string
        pay_day?: string
        company_name?: string
        company_address?: string
        company_description?: string
        special_notes?: string
    } | null>(null)
    const [isTranslated, setIsTranslated] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)
    const dayTranslations: { [key: string]: { [lang: string]: string } } = {
        '월': {
            en: 'Mon', ja: '月', zh: '周一', vi: 'T2', hi: 'सोम', si: 'සඳුදා', ar: 'الإثنين', tr: 'Pzt', my: 'တနင်္လာ', ky: 'Дүйшөмбү', ha: 'Dudu', mn: 'Даваа'
        },
        '화': {
            en: 'Tue', ja: '火', zh: '周二', vi: 'T3', hi: 'मंगल', si: 'අඟහරුවාදා', ar: 'الثلاثاء', tr: 'Sal', my: 'အင်္ဂါ', ky: 'Шейшемби', ha: 'Talata', mn: 'Мягмар'
        },
        '수': {
            en: 'Wed', ja: '水', zh: '周三', vi: 'T4', hi: 'बुध', si: 'බදාදා', ar: 'الأربعاء', tr: 'Çar', my: 'ဗုဒ္ဓဟူး', ky: 'Шаршемби', ha: 'Laraba', mn: 'Лхагва'
        },
        '목': {
            en: 'Thu', ja: '木', zh: '周四', vi: 'T5', hi: 'गुरु', si: 'බ්‍රහස්පතින්දා', ar: 'الخميس', tr: 'Per', my: 'ကြာသပတေး', ky: 'Бейшемби', ha: 'Alhamis', mn: 'Пүрэв'
        },
        '금': {
            en: 'Fri', ja: '金', zh: '周五', vi: 'T6', hi: 'शुक्र', si: 'සිකුරාදා', ar: 'الجمعة', tr: 'Cum', my: 'သောကြာ', ky: 'Жума', ha: 'Jumma\'a', mn: 'Баасан'
        },
        '토': {
            en: 'Sat', ja: '土', zh: '周六', vi: 'T7', hi: 'शनि', si: 'සෙනසුරාදා', ar: 'السبت', tr: 'Cmt', my: 'စနေ', ky: 'Ишемби', ha: 'Asabar', mn: 'Бямба'
        },
        '일': {
            en: 'Sun', ja: '日', zh: '周日', vi: 'CN', hi: 'रवि', si: 'ඉරිදා', ar: 'الأحد', tr: 'Paz', my: 'တနင်္ဂနွေ', ky: 'Жекшемби', ha: 'Lahadi', mn: 'Ням'
        }
    }
    useEffect(() => {
        if (visible && jobPostingId) {
            fetchJobDetails()
        }
    }, [visible, jobPostingId])
    useEffect(() => {
        // Reset translation when language changes
        setTranslatedData(null)
        setIsTranslated(false)
    }, [language])
    useEffect(() => {
        // Reset translation when modal closes
        if (!visible) {
            setTranslatedData(null)
            setIsTranslated(false)
        }
    }, [visible])
    const fetchJobDetails = async () => {
        try {
            setLoading(true)
            const response = await api('GET', `/api/job-postings/${jobPostingId}`)
            setJobPosting(response.data)
        } catch (error) {
        } finally {
            setLoading(false)
        }
    }
    const handleCall = () => {
        if (jobPosting?.company?.phone_number) {
            Linking.openURL(`tel:${jobPosting.company.phone_number}`)
        }
    }
    const handleMap = () => {
        const address = jobPosting?.interview_location || jobPosting?.job_address || jobPosting?.company?.address
        if (address) {
            const encodedAddress = encodeURIComponent(address)
            Linking.openURL(`https://map.kakao.com/link/search/${encodedAddress}`)
        }
    }
    const handleTranslate = async () => {
        if (!jobPosting) return
        // Toggle if already translated
        if (isTranslated && translatedData) {
            setIsTranslated(false)
            return
        }
        // Show already translated data
        if (translatedData) {
            setIsTranslated(true)
            return
        }
        // Translate
        setIsTranslating(true)
        try {
            // Translate working days using dayTranslations
            const translatedDays = jobPosting.working_days?.map((day: string) =>
                dayTranslations[day]?.[language] || day
            ) || []
            const textsToTranslate = [
                { key: 'title', text: jobPosting.title },
                { key: 'description', text: jobPosting.description || '' },
                { key: 'job_address', text: jobPosting.job_address || '' },
                { key: 'interview_location', text: jobPosting.interview_location || '' },
                { key: 'working_hours', text: jobPosting.working_hours || '' },
                { key: 'salary_range', text: jobPosting.salary_range || '' },
                { key: 'pay_day', text: jobPosting.pay_day || '' },
                { key: 'company_name', text: jobPosting.company?.name || '' },
                { key: 'company_address', text: jobPosting.company?.address || '' },
                { key: 'company_description', text: jobPosting.company?.description || '' },
                { key: 'special_notes', text: jobPosting.special_notes || '' }
            ].filter(item => item.text)
            const response = await api('POST', '/api/translate/translate-batch', {
                texts: textsToTranslate,
                targetLang: language
            })
            if (response.success) {
                const translations = response.translations
                const translatedResult: any = {
                    working_days: translatedDays // Add translated days
                }
                translations.forEach((item: any) => {
                    translatedResult[item.key] = item.translatedText
                })
                setTranslatedData(translatedResult)
                setIsTranslated(true)
            } else {
                throw new Error('Translation failed')
            }
        } catch (error) {
        } finally {
            setIsTranslating(false)
        }
    }
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50">
                <TouchableOpacity 
                    className="flex-1" 
                    activeOpacity={1} 
                    onPress={onClose}
                />
                <View className="bg-white rounded-t-3xl h-4/5">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
                        <Text className="text-xl font-bold">{t('job_detail.title', '공고 상세 정보')}</Text>
                        <View className="flex-row items-center gap-3">
                            {language !== 'ko' && (
                                <TouchableOpacity 
                                    onPress={handleTranslate}
                                    disabled={isTranslating}
                                    className={`px-3 py-1.5 rounded-full ${isTranslated ? 'bg-blue-100' : 'bg-gray-100'}`}
                                >
                                    {isTranslating ? (
                                        <ActivityIndicator size="small" color="#3b82f6" />
                                    ) : (
                                        <Text className={`text-sm font-medium ${isTranslated ? 'text-blue-600' : 'text-gray-700'}`}>
                                            {isTranslated ? t('job_detail.show_original', '원문보기') : t('job_detail.translate', '번역하기')}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity onPress={onClose}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {loading ? (
                        <View className="p-10 items-center">
                            <ActivityIndicator size="large" color="#3b82f6" />
                        </View>
                    ) : (
                        <ScrollView 
                            style={{ flex: 1 }}
                            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                            showsVerticalScrollIndicator={true}
                            bounces={true}
                        >
                            {jobPosting ? (
                                <>
                                    {/* Company Info */}
                                    {jobPosting.company && (
                                        <View className="mb-6">
                                            <Text className="text-lg font-bold mb-3">{t('job_detail.company_info', '회사 정보')}</Text>
                                            <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                                                <InfoRow label={t('job_detail.company_name', '회사명')} value={isTranslated && translatedData?.company_name ? translatedData.company_name : jobPosting.company.name} />
                                                {jobPosting.company.address && (
                                                    <InfoRow label={t('job_detail.address', '주소')} value={isTranslated && translatedData?.company_address ? translatedData.company_address : jobPosting.company.address} />
                                                )}
                                                {jobPosting.company.phone_number && (
                                                    <InfoRow label={t('job_detail.phone_number', '전화번호')} value={jobPosting.company.phone_number} />
                                                )}
                                            </View>
                                        </View>
                                    )}
                                    {jobPosting && (
                                        <View className="mb-6">
                                            <Text className="text-lg font-bold mb-3">{t('job_detail.interview_location', '면접 장소')}</Text>
                                            <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                                                <InfoRow label={t('job_detail.location', '위치')} value={(isTranslated && translatedData?.interview_location ? translatedData.interview_location : jobPosting.interview_location) || (isTranslated && translatedData?.job_address ? translatedData.job_address : jobPosting.job_address) || (isTranslated && translatedData?.company_address ? translatedData.company_address : jobPosting.company?.address) || t('job_detail.contact_company', '회사 연락 요망')} />
                                            </View>
                                        </View>
                                    )}
                                    {/* Job Info */}
                                    <View className="mb-6">
                                        <Text className="text-lg font-bold mb-3">{t('job_detail.job_info', '채용 정보')}</Text>
                                        <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            <InfoRow label={t('job_detail.title_label', '제목')} value={isTranslated && translatedData?.title ? translatedData.title : jobPosting.title} />
                                            <InfoRow label={t('job_detail.hiring_count', '채용인원')} value={`${jobPosting.hiring_count}${t('job_detail.people_unit', '명')}`} />
                                            
                                            {jobPosting.working_hours && (
                                                <InfoRow 
                                                    label={t('job_detail.working_hours', '근무시간')} 
                                                    value={`${isTranslated && translatedData?.working_hours ? translatedData.working_hours : jobPosting.working_hours}${jobPosting.working_hours_negotiable ? ` (${t('job_detail.negotiable', '협의 가능')})` : ''}`} 
                                                />
                                            )}
                                            
                                            {jobPosting.working_days && jobPosting.working_days.length > 0 && (
                                                <InfoRow 
                                                    label={t('job_detail.working_days', '근무요일')} 
                                                    value={`${isTranslated && translatedData?.working_days ? translatedData.working_days.join(', ') : jobPosting.working_days.join(', ')}${jobPosting.working_days_negotiable ? ` (${t('job_detail.negotiable', '협의 가능')})` : ''}`} 
                                                />
                                            )}
                                            
                                            {jobPosting.salary_range && (
                                                <InfoRow 
                                                    label={t('job_detail.salary', '급여')} 
                                                    value={`${isTranslated && translatedData?.salary_range ? translatedData.salary_range : jobPosting.salary_range}${jobPosting.salary_type ? ` (${jobPosting.salary_type})` : ''}${jobPosting.salary_range_negotiable ? ` (${t('job_detail.negotiable', '협의 가능')})` : ''}`} 
                                                />
                                            )}
                                            
                                            {jobPosting.pay_day && (
                                                <InfoRow 
                                                    label={t('job_detail.pay_day', '급여일')} 
                                                    value={`${isTranslated && translatedData?.pay_day ? translatedData.pay_day : jobPosting.pay_day}${jobPosting.pay_day_negotiable ? ` (${t('job_detail.negotiable', '협의 가능')})` : ''}`} 
                                                />
                                            )}
                                            
                                            {jobPosting.job_address && (
                                                <InfoRow label={t('job_detail.work_location', '근무지')} value={isTranslated && translatedData?.job_address ? translatedData.job_address : jobPosting.job_address} />
                                            )}
                                        </View>
                                    </View>
                                    {/* Job Description */}
                                    {jobPosting.description && (
                                        <View className="mb-6">
                                            <Text className="text-lg font-bold mb-3">{t('job_detail.job_description', '업무 내용')}</Text>
                                            <View className="bg-gray-50 rounded-xl p-4">
                                                <Text className="text-sm text-gray-800 leading-5">
                                                    {isTranslated && translatedData?.description ? translatedData.description : jobPosting.description}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                    {/* Company Description */}
                                    {jobPosting.company?.description && (
                                        <View className="mb-6">
                                            <Text className="text-lg font-bold mb-3">{t('job_detail.company_description', '회사 소개')}</Text>
                                            <View className="bg-gray-50 rounded-xl p-4">
                                                <Text className="text-sm text-gray-800 leading-5">
                                                    {isTranslated && translatedData?.company_description ? translatedData.company_description : jobPosting.company.description}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                    {/* Special Notes */}
                                    {jobPosting.special_notes && (
                                        <View className="mb-6">
                                            <Text className="text-lg font-bold mb-3">{t('job_detail.special_notes', '특이사항')}</Text>
                                            <View className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                                <View className="flex-row items-start">
                                                    <Ionicons name="information-circle" size={20} color="#d97706" />
                                                    <Text className="text-sm text-yellow-800 leading-5 ml-2 flex-1">
                                                        {isTranslated && translatedData?.special_notes ? translatedData.special_notes : jobPosting.special_notes}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                    {/* Action Buttons */}
                                    <View className="flex-row gap-3 mt-4">
                                        {jobPosting.company?.phone_number && (
                                            <TouchableOpacity
                                                onPress={handleCall}
                                                className="flex-1 flex-row items-center justify-center bg-green-50 py-3 rounded-lg"
                                            >
                                                <Ionicons name="call-outline" size={20} color="#16a34a" />
                                                <Text className="text-green-600 text-base font-medium ml-2">{t('job_detail.make_call', '전화하기')}</Text>
                                            </TouchableOpacity>
                                        )}
                                        {(jobPosting.interview_location || jobPosting.job_address) && (
                                            <TouchableOpacity
                                                onPress={handleMap}
                                                className="flex-1 flex-row items-center justify-center bg-blue-50 py-3 rounded-lg"
                                            >
                                                <Ionicons name="map-outline" size={20} color="#3b82f6" />
                                                <Text className="text-blue-600 text-base font-medium ml-2">{t('job_detail.view_map', '지도보기')}</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </>
                            ) : (
                                <View className="p-10 items-center">
                                    <Text className="text-gray-500">{t('job_detail.no_data', '공고 정보를 불러올 수 없습니다.')}</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    )
}
const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">{label}</Text>
        <Text className="text-base font-medium text-right flex-1 ml-3">{value}</Text>
    </View>
)