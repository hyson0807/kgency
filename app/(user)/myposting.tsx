import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useProfile } from "@/hooks/useProfile"
import { router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import { Dropdown } from 'react-native-element-dropdown'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/hooks/useModal'
import { useTranslation} from "@/contexts/TranslationContext";

const MyPosting = () => {
    const { profile, updateProfile, loading: profileLoading } = useProfile()
    const [isJobSeekingActive, setIsJobSeekingActive] = useState(false)

    // 프로필 정보 상태
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState<string | undefined>(undefined)
    const [visa, setVisa] = useState<string | undefined>(undefined)
    const [koreanLevel, setKoreanLevel] = useState<string | undefined>(undefined)

    // 키워드 정보 상태
    const [userKeywords, setUserKeywords] = useState<string[]>([])
    const [userLocation, setUserLocation] = useState<string>('')

    const [modalVisible, setModalVisible] = useState(false)
    const { showModal, ModalComponent, hideModal} = useModal()

    const { t } = useTranslation();

    // 드롭다운 옵션들
    const genderOptions = [
        { label: t('myposting.gender_male', '남성'), value: '남성' },
        { label: t('myposting.gender_female', '여성'), value: '여성' },
        { label: t('myposting.gender_other', '기타'), value: '기타' }
    ]

    const visaOptions = [
        { label: t('myposting.visa_f2', 'F-2 (거주비자)'), value: 'F-2' },
        { label: t('myposting.visa_f4', 'F-4 (재외동포)'), value: 'F-4' },
        { label: t('myposting.visa_f5', 'F-5 (영주)'), value: 'F-5' },
        { label: t('myposting.visa_f6', 'F-6 (결혼이민)'), value: 'F-6' },
        { label: t('myposting.visa_e9', 'E-9 (비전문취업)'), value: 'E-9' },
        { label: t('myposting.visa_h2', 'H-2 (방문취업)'), value: 'H-2' },
        { label: t('myposting.visa_d2', 'D-2 (유학)'), value: 'D-2' },
        { label: t('myposting.visa_d4', 'D-4 (일반연수)'), value: 'D-4' },
        { label: t('myposting.visa_other', '기타'), value: '기타' }
    ]

    const koreanLevelOptions = [
        { label: t('myposting.korean_beginner', '초급'), value: '초급' },
        { label: t('myposting.korean_intermediate', '중급'), value: '중급' },
        { label: t('myposting.korean_advanced', '고급'), value: '고급' }
    ]



    // 프로필 정보 로드
    useEffect(() => {
        if (profile) {
            setIsJobSeekingActive(profile.job_seeking_active || false)
            setName(profile.name || '')

            if (profile.user_info) {
                setAge(profile.user_info.age?.toString() || '')
                setGender(profile.user_info.gender || undefined)
                setVisa(profile.user_info.visa || undefined)
                setKoreanLevel(profile.user_info.korean_level || undefined)
            }
        }
    }, [profile])

    // 유저 키워드 가져오기
    useEffect(() => {
        fetchUserKeywords()
    }, [profile])

    const fetchUserKeywords = async () => {
        if (!profile) return;

        try {
            const { data, error } = await supabase
                .from('user_keyword')
                .select(`
                keyword:keyword_id (
                    keyword,
                    category
                )
            `)
                .eq('user_id', profile.id);

            if (error) throw error;

            if (data) {
                // keyword가 배열이면 먼저 flatMap 해줘야 함
                const keywordList = (data as { keyword: { keyword: string; category: string }[] }[])
                    .flatMap(item => item.keyword || []);

                const allKeywords = keywordList.map(k => k.keyword);
                setUserKeywords(allKeywords);

                const location = keywordList.find(k => k.category === '지역');
                if (location) {
                    setUserLocation(location.keyword);
                }
            }
        } catch (error) {
            console.error('키워드 조회 실패:', error);
        }
    };

    // 필수 정보 입력 확인
    const isRequiredInfoComplete = () => {
        return !!(name && age && gender && visa && koreanLevel)
    }

    // 구직공고 활성화 토글
    const toggleJobSeeking = async () => {
        if (!isRequiredInfoComplete()) {
            showModal(
                t('myposting.required_info_title', '필수 정보 입력 필요'),
                t('myposting.required_info_message', '구직공고를 활성화하려면 모든 필수 정보를 입력해주세요.'),
                'info',
                () => {
                    hideModal()
                    setModalVisible(true)
                },
                true  // showCancel
            )
            return
        }

        const newStatus = !isJobSeekingActive

        const updated = await updateProfile({
            profile: {
                job_seeking_active: newStatus
            }
        })

        if (updated) {
            setIsJobSeekingActive(newStatus)
            // 성공 메시지 제거
        } else {
            showModal('오류', '상태 변경에 실패했습니다.', 'warning')
        }
    }

    // 프로필 정보 저장
    const handleSaveProfile = async () => {
        if (!isRequiredInfoComplete()) {
            showModal('알림', '모든 필수 정보를 입력해주세요.')
            return
        }

        const updated = await updateProfile({
            profile: {
                name
            },
            userInfo: {
                age: parseInt(age),
                gender: gender || undefined,
                visa: visa || undefined,
                korean_level: koreanLevel || undefined
            }
        })

        if (updated) {
            setModalVisible(false)
            // 성공 메시지 제거
        } else {
            showModal('오류', '정보 업데이트에 실패했습니다.', 'warning')
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
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-2xl font-bold">{t('myposting.title', '내 구직공고')}</Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* 공고 활성화 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-gray-800">{t('myposting.activate_posting', '구직공고 활성화')}</Text>
                            <Text className="text-sm text-gray-600 mt-1">
                                {t('myposting.activate_description', '활성화하면 회사에서 내 프로필을 볼 수 있습니다')}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={toggleJobSeeking}
                            className={`w-14 h-8 rounded-full p-1 ${
                                isJobSeekingActive ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <View className={`w-6 h-6 bg-white rounded-full ${
                                isJobSeekingActive ? 'self-end' : 'self-start'
                            }`} />
                        </TouchableOpacity>
                    </View>

                    {!isRequiredInfoComplete() && (
                        <View className="bg-amber-50 p-3 rounded-lg">
                            <Text className="text-amber-800 text-sm">
                                ⚠️ {t('myposting.required_info_warning', '필수 정보를 모두 입력해야 구직공고를 활성화할 수 있습니다')}
                            </Text>
                        </View>
                    )}

                    {isJobSeekingActive && (
                        <View className="bg-green-50 p-3 rounded-lg">
                            <Text className="text-green-800 text-sm">
                                ✓ {t('myposting.posting_active', '구직공고가 활성화되어 있습니다')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* 내 정보 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-gray-800">{t('myposting.my_info', '내 정보')}</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="bg-blue-100 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-blue-600 font-medium">{t('button.edit', '수정')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{t('myposting.name', '이름')}</Text>
                            <Text className="font-medium">{name || 'none'}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{t('myposting.age', '나이')}</Text>
                            <Text className="font-medium">{age || 'none'}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{t('myposting.gender', '성별')}</Text>
                            <Text className="font-medium">{gender || 'none'}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{t('myposting.visa', '비자')}</Text>
                            <Text className="font-medium">{visa || 'none'}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">{t('myposting.korean_level', '한국어 실력')}</Text>
                            <Text className="font-medium">{koreanLevel || 'none'}</Text>
                        </View>
                    </View>
                </View>

                {/* 희망 조건 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-lg font-bold text-gray-800">{t('myposting.matching_keywords', '내 매칭 키워드')}</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(pages)/(user)/info')}
                            className="bg-blue-100 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-blue-600 font-medium">{t('button.edit', '수정')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-3">
                        <View>
                            {userKeywords.length > 0 ? (
                                <Text className="text-sm text-gray-700 leading-5 ">
                                    {userKeywords.join(', ')}
                                </Text>
                            ) : (
                                <Text className="text-sm text-gray-500">{t('myposting.no_keywords', '선택된 키워드가 없습니다')}</Text>
                            )}
                        </View>
                    </View>
                </View>

            </ScrollView>

            {/* 정보 수정 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
                        {/* 모달 헤더 */}
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold">{t('myposting.edit_info', '정보 수정')}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* 이름 */}
                            <View className="mb-4">
                                <Text className="text-gray-700 mb-2">{t('myposting.name', '이름')} *</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg p-3"
                                    placeholder={t('myposting.enter_name', '이름을 입력하세요')}
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            {/* 나이 */}
                            <View className="mb-4">
                                <Text className="text-gray-700 mb-2">{t('myposting.age', '나이')} *</Text>
                                <TextInput
                                    className="border border-gray-300 rounded-lg p-3"
                                    placeholder={t('myposting.enter_age', '나이를 입력하세요')}
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                />
                            </View>

                            {/* 성별 */}
                            <View className="mb-4">
                                <Text className="text-gray-700 mb-2">{t('myposting.gender', '성별')} *</Text>
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
                                    placeholder={t('myposting.select_gender', '성별을 선택하세요')}
                                    value={gender}
                                    onChange={item => setGender(item.value)}
                                />
                            </View>

                            {/* 비자 */}
                            <View className="mb-4">
                                <Text className="text-gray-700 mb-2">{t('myposting.visa_type', '비자 종류')} *</Text>
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
                                    placeholder={t('myposting.select_visa', '비자 종류를 선택하세요')}
                                    value={visa}
                                    onChange={item => setVisa(item.value)}
                                />
                            </View>

                            {/* 한국어 실력 */}
                            <View className="mb-6">
                                <Text className="text-gray-700 mb-2">{t('myposting.korean_level', '한국어 실력')} *</Text>
                                <View className="flex-row gap-2">
                                    {koreanLevelOptions.map((level) => (
                                        <TouchableOpacity
                                            key={level.value}
                                            onPress={() => setKoreanLevel(level.value)}
                                            className={`flex-1 py-3 rounded-lg border items-center ${
                                                koreanLevel === level.value
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'bg-white border-gray-300'
                                            }`}
                                        >
                                            <Text className={`font-medium ${
                                                koreanLevel === level.value ? 'text-white' : 'text-gray-700'
                                            }`}>{level.label}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* 저장 버튼 */}
                            <TouchableOpacity
                                onPress={handleSaveProfile}
                                className="bg-blue-500 py-4 rounded-xl mb-4"
                            >
                                <Text className="text-center text-white font-bold text-lg">{t('button.save', '저장')}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <ModalComponent/>


        </SafeAreaView>
    )
}

export default MyPosting