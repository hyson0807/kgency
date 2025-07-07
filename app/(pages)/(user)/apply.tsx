import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { router, useLocalSearchParams } from 'expo-router'
import Back from '@/components/back'
import { Dropdown } from 'react-native-element-dropdown'
import { useProfile } from '@/hooks/useProfile'
import { supabase } from '@/lib/supabase'

export default function Apply() {
    const params = useLocalSearchParams();
    const { jobPostingId, companyId, companyName, jobTitle } = params;
    const { profile, updateProfile, loading: profileLoading } = useProfile();

    // 개인정보 상태
    const [name, setName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [age, setAge] = useState('')
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

    // 드롭다운 옵션들
    const genderOptions = [
        { label: '남성', value: '남성' },
        { label: '여성', value: '여성' },
        { label: '기타', value: '기타' }
    ]
    const visaOptions = [
        { label: 'F-2 (거주비자)', value: 'F-2' },
        { label: 'F-4 (재외동포)', value: 'F-4' },
        { label: 'F-5 (영주)', value: 'F-5' },
        { label: 'F-6 (결혼이민)', value: 'F-6' },
        { label: 'E-9 (비전문취업)', value: 'E-9' },
        { label: 'H-2 (방문취업)', value: 'H-2' },
        { label: 'D-2 (유학)', value: 'D-2' },
        { label: 'D-4 (일반연수)', value: 'D-4' },
        { label: '기타', value: '기타' }
    ]
    const koreanLevelOptions = ['초급', '중급', '고급']
    const topicOptions = ['1급', '2급', '3급이상']
    const workPeriodOptions = ['1개월', '3개월', '6개월', '1년', '장기']
    const experienceOptions = ['처음','1개월', '6개월', '1년', '3년이상']
    const educationOptions = [
        { label: '중학교 졸업', value: '중학교 졸업' },
        { label: '고등학교 졸업', value: '고등학교 졸업' },
        { label: '전문대 졸업', value: '전문대 졸업' },
        { label: '대학교 졸업', value: '대학교 졸업' },
        { label: '대학원 졸업', value: '대학원 졸업' },
        { label: '기타', value: '기타' }
    ]

    // 프로필 정보 로드
    useEffect(() => {
        if (profile) {
            setName(profile.name || '')
            setPhoneNumber(profile.phone_number || '')

            if (profile.user_info) {
                setAge(profile.user_info.age?.toString() || '')
                setGender(profile.user_info.gender || null)
                setVisa(profile.user_info.visa || null)
                setKoreanLevel(profile.user_info.korean_level || null)
                setTopic(profile.user_info.topic || null)
                setHowLong(profile.user_info.how_long || null)
                setExperience(profile.user_info.experience || null)
                setExperienceContent(profile.user_info.experience_content || '')
            }
        }
    }, [profile])

    // 중복 지원 확인
    useEffect(() => {
        const checkExistingApplication = async () => {
            if (profile?.id && jobPostingId) {
                try {
                    const { data, error } = await supabase
                        .from('applications')
                        .select('id')
                        .eq('user_id', profile.id)
                        .eq('job_posting_id', jobPostingId)
                        .maybeSingle();

                    if (error && error.code !== 'PGRST116') {
                        console.error('지원 내역 확인 오류:', error);
                    }

                    setHasApplied(!!data);
                } catch (error) {
                    console.error('지원 내역 확인 실패:', error);
                }
            }
        };

        checkExistingApplication();
    }, [profile?.id, jobPostingId]);

    const validateForm = () => {
        if (!name) {
            Alert.alert('알림', '이름은 필수 입력 항목입니다.')
            return false
        }


        if (age && (parseInt(age) < 0 || parseInt(age) > 100)) {
            Alert.alert('알림', '올바른 나이를 입력해주세요.')
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        // 중복 지원 체크
        if (hasApplied) {
            Alert.alert(
                '이미 지원한 공고',
                '이 공고에는 이미 지원하셨습니다. 그래도 이력서를 다시 작성하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    {
                        text: '계속하기',
                        onPress: () => proceedToResume()
                    }
                ]
            );
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
            if (howLong) userInfoData.how_long = howLong;
            if (experience) userInfoData.experience = experience;
            if (experienceContent) userInfoData.experience_content = experienceContent;

            // 프로필 업데이트
            const updated = await updateProfile({
                profile: {
                    name,
                },
                userInfo: userInfoData
            });

            if (updated) {
                // Resume 페이지로 이동
                router.push({
                    pathname: '/resume',
                    params: {
                        jobPostingId: String(jobPostingId),
                        companyId: String(companyId),
                        companyName: String(companyName),
                        jobTitle: String(jobTitle),
                        question: String(question)
                    }
                });
            } else {
                Alert.alert('오류', '정보 저장에 실패했습니다.')
            }
        } catch (error) {
            console.error('프로필 업데이트 오류:', error)
            Alert.alert('오류', '정보 저장 중 문제가 발생했습니다.')
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
                <Text className="text-lg font-bold ml-4">지원서 작성</Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                <View className="p-6">
                    {/* 지원 공고 */}
                    <View className="mb-6 p-4 bg-blue-50 rounded-xl">
                        <Text className="text-sm text-gray-600">지원 공고</Text>
                        <Text className="text-lg font-bold text-blue-600">{jobTitle || '채용 공고'}</Text>
                        <Text className="text-sm text-gray-600 mt-1">{companyName}</Text>
                        {hasApplied && (
                            <Text className="text-sm text-orange-600 mt-2">
                                ⚠️ 이미 지원한 공고입니다
                            </Text>
                        )}
                    </View>

                    {/* 기본 정보 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold mb-4">기본 정보</Text>
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">이름 *</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3"
                                placeholder="이름을 입력하세요"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                        <View className="flex-row gap-4 mb-4">
                            <View className="flex-1">
                                <Text className="text-gray-700 mb-2">나이</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg p-3"
                                    placeholder="나이"
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-700 mb-2">성별</Text>
                                <Dropdown
                                    style={{
                                        height: 50,
                                        borderColor: '#d1d5db',
                                        borderWidth: 1,
                                        borderRadius: 8,
                                        paddingHorizontal: 12,
                                    }}
                                    placeholderStyle={{ fontSize: 14, color: '#9ca3af' }}
                                    selectedTextStyle={{ fontSize: 14 }}
                                    data={genderOptions}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="선택"
                                    value={gender}
                                    onChange={item => setGender(item.value)}
                                />
                            </View>
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">비자 종류</Text>
                            <Dropdown
                                style={{
                                    height: 50,
                                    borderColor: '#d1d5db',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                }}
                                placeholderStyle={{ fontSize: 14, color: '#9ca3af' }}
                                selectedTextStyle={{ fontSize: 14 }}
                                data={visaOptions}
                                labelField="label"
                                valueField="value"
                                placeholder="비자 종류 선택"
                                value={visa}
                                onChange={item => setVisa(item.value)}
                            />
                        </View>
                    </View>

                    {/* 경력 및 정보 */}
                    <View className="mb-6">
                        <Text className="text-lg font-bold mb-4">경력 및 정보</Text>

                        {/* 희망 근무 기간 */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">희망 근무 기간</Text>
                            <View className="flex-row gap-2 flex-wrap">
                                {workPeriodOptions.map((period) => (
                                    <TouchableOpacity
                                        key={period}
                                        onPress={() => setHowLong(period)}
                                        className={`px-4 py-2 rounded-lg border ${
                                            howLong === period
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={`${
                                            howLong === period ? 'text-white' : 'text-gray-700'
                                        }`}>{period}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* 관련 경력 */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">관련 경력</Text>
                            <View className="flex-row gap-2 flex-wrap">
                                {experienceOptions.map((exp) => (
                                    <TouchableOpacity
                                        key={exp}
                                        onPress={() => setExperience(exp)}
                                        className={`px-4 py-2 rounded-lg border ${
                                            experience === exp
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={`${
                                            experience === exp ? 'text-white' : 'text-gray-700'
                                        }`}>{exp}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* 경력 내용 */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">경력 내용</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 h-24"
                                placeholder="간단한 경력 내용을 입력하세요"
                                value={experienceContent}
                                onChangeText={setExperienceContent}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        {/* 한국어 실력 */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">한국어 실력</Text>
                            <View className="flex-row gap-2">
                                {koreanLevelOptions.map((level) => (
                                    <TouchableOpacity
                                        key={level}
                                        onPress={() => setKoreanLevel(level)}
                                        className={`flex-1 py-3 rounded-lg border items-center ${
                                            koreanLevel === level
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={`font-medium ${
                                            koreanLevel === level ? 'text-white' : 'text-gray-700'
                                        }`}>{level}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* 토픽 급수 */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">토픽 급수</Text>
                            <View className="flex-row gap-2">
                                {topicOptions.map((grade) => (
                                    <TouchableOpacity
                                        key={grade}
                                        onPress={() => setTopic(topic === grade ? null : grade)}
                                        className={`flex-1 py-3 rounded-lg border items-center ${
                                            topic === grade
                                                ? 'bg-blue-500 border-blue-500'
                                                : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={`font-medium ${
                                            topic === grade ? 'text-white' : 'text-gray-700'
                                        }`}>{grade}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* 경력 내용 */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2">사장님께 물어보고 싶은 내용</Text>
                            <TextInput
                                className="border border-gray-300 rounded-lg p-3 h-24"
                                placeholder="질문사항"
                                value={question}
                                onChangeText={setQuestion}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>
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
                        {saving ? '저장 중...' : '이력서 자동으로 만들어줄게!'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}