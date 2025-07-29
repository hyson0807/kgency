import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from 'expo-router'
import Back from '@/components/back'
import { useProfile } from '@/hooks/useProfile'
import { useModal } from '@/hooks/useModal'
import { useTranslation } from "@/contexts/TranslationContext";
import {PersonalInformation} from "@/components/application-form/Personal-Information";
import {DetailInfromation} from "@/components/application-form/Detail-Information";
import { api } from '@/lib/api';


export default function ApplicationForm() {
    const params = useLocalSearchParams();
    const { jobPostingId, companyId, companyName, jobTitle } = params;
    const { profile, updateProfile, loading: profileLoading } = useProfile();

    // 개인정보 상태
    const [name, setName] = useState('')
    const [age, setAge] = useState<string | ''>('')
    const [gender, setGender] = useState<string | null>(null)
    const [visa, setVisa] = useState<string | null>(null)
    const [koreanLevel, setKoreanLevel] = useState<string | null>(null)
    const [topic, setTopic] = useState<string | null>(null)
    const [howLong, setHowLong] = useState<string | null>(null)
    const [experience, setExperience] = useState<string | null>(null)
    const [experienceContent, setExperienceContent] = useState('')
    const [hasApplied, setHasApplied] = useState(false)
    const [saving, setSaving] = useState(false)
    const [question, setQuestion] = useState('')

    // 새로운 상태 추가
    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [daysNegotiable, setDaysNegotiable] = useState(false)
    const [selectedTimes, setSelectedTimes] = useState<string[]>([])
    const [timesNegotiable, setTimesNegotiable] = useState(false)

    const { showModal, hideModal, ModalComponent } = useModal();
    const { t } = useTranslation()


    // 프로필 정보 로드
    useEffect(() => {
        if (profile) {
            setName(profile.name || '')

            if (profile.user_info) {
                setAge(profile.user_info.age?.toString() || '')
                setGender(profile.user_info.gender || null)
                setVisa(profile.user_info.visa || null)
                setKoreanLevel(profile.user_info.korean_level || null)
                setTopic(profile.user_info.topic || null)
                setHowLong(profile.user_info.how_long || null)
                setExperience(profile.user_info.experience || null)
                setExperienceContent(profile.user_info.experience_content || '')
                
                // 희망 근무일/시간 정보 로드
                setSelectedDays(profile.user_info.preferred_days || [])
                setSelectedTimes(profile.user_info.preferred_times || [])
            }
        }
    }, [profile])

    // 중복 지원 확인
    useEffect(() => {
        const checkExistingApplication = async () => {
            if (profile?.id && jobPostingId) {
                try {
                    const response = await api('GET', `/api/applications/check-duplicate?jobPostingId=${jobPostingId}`);

                    if (response.success) {
                        setHasApplied(response.isDuplicate);
                    }
                } catch (error) {
                    console.error('지원 내역 확인 실패:', error);
                }
            }
        };

        checkExistingApplication();
    }, [profile?.id, jobPostingId]);

    const validateForm = () => {
        if (!name) {
            showModal(t('alert.notification', '알림'), t('apply.name_required', '이름은 필수 입력 항목입니다.'))
            return false
        }

        if (age && (parseInt(age) < 0 || parseInt(age) > 100)) {
            showModal(t('alert.notification', '알림'), t('apply.invalid_age', '올바른 나이를 입력해주세요.'))
            return false
        }

        return true
    }

    // 요일 선택 토글
    const toggleDay = (dayValue: string) => {
        if (selectedDays.includes(dayValue)) {
            setSelectedDays(selectedDays.filter(d => d !== dayValue))
        } else {
            setSelectedDays([...selectedDays, dayValue])
        }
    }

    // 시간대 선택 토글
    const toggleTime = (timeValue: string) => {
        if (selectedTimes.includes(timeValue)) {
            setSelectedTimes(selectedTimes.filter(t => t !== timeValue))
        } else {
            setSelectedTimes([...selectedTimes, timeValue])
        }
    }

    const handleSubmit = async () => {
        // 중복 지원 체크
        if (hasApplied) {
            showModal(
                t('apply.already_applied_title', '이미 지원한 공고'),
                t('apply.already_applied_message', '이 공고에는 이미 지원하셨습니다. 그래도 이력서를 다시 작성하시겠습니까?'),
                'confirm',
                () => {
                    hideModal()
                    proceedToResume()
                },
                true  // showCancel true
            )
            return;
        }

        proceedToResume();
    }

    const proceedToResume = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            // userInfo 객체 생성 - 타입 안전하게 처리
            const userInfoData: any = {};

            // 값이 있는 경우에만 추가
            if (age) userInfoData.age = parseInt(age);
            if (gender) userInfoData.gender = gender;
            if (visa) userInfoData.visa = visa;
            if (koreanLevel) userInfoData.korean_level = koreanLevel;
            if (topic) userInfoData.topic = topic;
            
            // how_long과 experience는 null 값도 저장
            userInfoData.how_long = howLong;
            userInfoData.experience = experience;
            
            if (experienceContent) userInfoData.experience_content = experienceContent;

            // 프로필 업데이트
            const updated = await updateProfile({
                profile: {
                    name,
                },
                userInfo: userInfoData
            });

            if (updated) {
                // Resume 페이지로 이동 - 새로운 파라미터 추가
                router.push({
                    pathname: '/resume',
                    params: {
                        jobPostingId: String(jobPostingId),
                        companyId: String(companyId),
                        companyName: String(companyName),
                        jobTitle: String(jobTitle),
                        question: String(question),
                        // 새로운 파라미터 추가
                        selectedDays: selectedDays.join(','),
                        daysNegotiable: String(daysNegotiable),
                        selectedTimes: selectedTimes.join(','),
                        timesNegotiable: String(timesNegotiable)
                    }
                });
            } else {
                showModal(t('alert.error', '오류'), t('apply.save_failed', '정보 저장에 실패했습니다.'), 'warning')
            }
        } catch (error) {
            console.error('프로필 업데이트 오류:', error)
            showModal(t('alert.error', '오류'), t('apply.save_error', '정보 저장 중 문제가 발생했습니다.'), 'warning')
        } finally {
            setSaving(false)
        }
    }

    if (profileLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">{t('apply.title', '지원서 작성')}</Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="p-6">
                    {/* 지원 공고 */}
                    <View className="mb-6 p-4 bg-blue-50 rounded-xl">
                        <Text className="text-sm text-gray-600">{t('apply.applying_to', '지원 공고')}</Text>
                        <Text className="text-lg font-bold text-blue-600">{jobTitle || t('apply.job_posting', '채용 공고')}</Text>
                        <Text className="text-sm text-gray-600 mt-1">{companyName}</Text>
                        {hasApplied && (
                            <Text className="text-sm text-orange-600 mt-2">
                                ⚠️ {t('apply.already_applied_warning', '이미 지원한 공고입니다')}
                            </Text>
                        )}
                    </View>

                    {/* 기본 정보 */}
                    <PersonalInformation
                        t={t}
                        name={name}
                        setName={setName}
                        age={age}
                        setAge={setAge}
                        gender={gender}
                        setGender={setGender}
                        visa={visa}
                        setVisa={setVisa} />

                    {/* 경력 및 정보 */}
                    <DetailInfromation
                        t={t}
                        formData={{
                            howLong,
                            selectedDays,
                            daysNegotiable,
                            selectedTimes,
                            timesNegotiable,
                            experience,
                            experienceContent,
                            koreanLevel,
                            topic,
                            question
                        }}
                        handlers={{
                            setHowLong,
                            toggleDay,
                            setDaysNegotiable,
                            setSelectedDays,
                            toggleTime,
                            setTimesNegotiable,
                            setSelectedTimes,
                            setExperience,
                            setExperienceContent,
                            setKoreanLevel,
                            setTopic,
                            setQuestion
                        }}
                    />



                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-8 pt-2">
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={saving}
                    className={`py-4 rounded-xl mx-4 my-2 ${saving ? 'bg-gray-400' : 'bg-blue-500'}`}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        {saving ? t('apply.saving', '저장 중...') : t('apply.create_resume', '이력서 자동으로 만들어줄게!')}
                    </Text>
                </TouchableOpacity>
            </View>

            <ModalComponent />

        </SafeAreaView>
    )
}