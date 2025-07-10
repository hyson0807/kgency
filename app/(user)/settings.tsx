import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Linking, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useModal } from '@/hooks/useModal'
import { useTranslation } from "@/contexts/TranslationContext";

const Settings = () => {
    const { logout, user,checkAuthState } = useAuth()
    const { profile, updateProfile } = useProfile()
    const { showModal, ModalComponent } = useModal()
    const [isJobSeekingActive, setIsJobSeekingActive] = useState(false)
    const { t, language, changeLanguage } = useTranslation()

    const [selectedLanguage, setSelectedLanguage] = useState(language)


    const languages = [
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
        { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
        { code: 'ar', name: 'العربية', flag: '🇩🇿' },
        { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
        { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
        { code: 'ky', name: 'Кыргызча', flag: '🇰🇬' },
        { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
        { code: 'mn', name: 'Монгол', flag: '🇲🇳' }
    ];

    // 알림 설정 상태
    const [notificationSettings, setNotificationSettings] = useState({
        newJob: true,
        applicationStatus: true,
        marketing: false
    })

    // 모달 상태
    const [languageModalVisible, setLanguageModalVisible] = useState(false)
    const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false)



    // 앱 정보
    const APP_VERSION = '1.0.0'

    // 알림 설정 로드
    useEffect(() => {
        checkAuthState()
        loadNotificationSettings()
        setIsJobSeekingActive(profile?.job_seeking_active || true)
    }, [])

    const loadNotificationSettings = async () => {
        try {
            const saved = await AsyncStorage.getItem('notificationSettings')
            if (saved) {
                setNotificationSettings(JSON.parse(saved))
            }
        } catch (error) {
            console.error('알림 설정 로드 실패:', error)
        }
    }

    // 알림 설정 저장
    const saveNotificationSettings = async (newSettings: typeof notificationSettings) => {
        try {
            await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings))
            setNotificationSettings(newSettings)
        } catch (error) {
            console.error('알림 설정 저장 실패:', error)
        }
    }

    // 알림 토글
    const toggleNotification = (key: keyof typeof notificationSettings) => {
        const newSettings = {
            ...notificationSettings,
            [key]: !notificationSettings[key]
        }
        saveNotificationSettings(newSettings)
    }

    // 로그아웃 처리
    const handleLogout = () => {
        showModal(
            t('settings.logout', '로그아웃'),
            t('settings.logout_confirm', '정말 로그아웃 하시겠습니까?'),
            'confirm',
            () => logout(),
            true
        )
    }

    // 회원 탈퇴 처리
    const handleDeleteAccount = async () => {
        if (!user) return

        try {
            // 토큰 가져오기
            const token = await AsyncStorage.getItem('authToken');
            if (!token) {
                showModal(t('settings.error', '오류'), t('settings.auth_not_found', '인증 정보를 찾을 수 없습니다.'), 'warning')
                return;
            }

            // 서버 API 호출
            const response = await fetch('https://kgencyserver-production.up.railway.app/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                // 로컬 데이터 삭제
                await AsyncStorage.clear();

                showModal(
                    t('settings.delete_complete', '회원 탈퇴 완료'),
                    t('settings.thank_you', '그동안 이용해주셔서 감사합니다.'),
                    'info',
                    () => logout()
                )
            } else {
                throw new Error(result.error || '회원 탈퇴 처리 중 문제가 발생했습니다.')
            }
        } catch (error) {
            console.error('회원 탈퇴 실패:', error);
            showModal(
                t('settings.error', '오류'),
                t('settings.delete_error', '회원 탈퇴 처리 중 문제가 발생했습니다.'),
                'warning'
            )
        }
    }

    // 언어 변경
    const handleLanguageChange = async (lang: string) => {
        try {
            await changeLanguage(lang) // TranslationContext의 changeLanguage 사용
            setLanguageModalVisible(false)

            showModal(
                t('settings.language_change', '언어 변경'),
                t('settings.restart_required', '앱을 재시작해주세요'), // 메시지 변경
                'info'
            )
        } catch (error) {
            console.error('언어 설정 저장 실패:', error)
            showModal(
                t('settings.error', '오류'),
                t('settings.language_change_error', '언어 변경 중 오류가 발생했습니다.'),
                'warning'
            )
        }
    }

    // 외부 링크 열기
    const openLink = (url: string) => {
        Linking.openURL(url).catch(err =>
            console.error('링크 열기 실패:', err)
        )
    }

    // 고객센터 처리
    const handleCustomerService = () => {
        showModal(
            t('settings.customer_service', '고객센터'),
            t('settings.customer_service_info', '문의사항이 있으신가요?\n고객센터: 1588-0000\n운영시간: 평일 09:00 - 18:00'),
            'info'
        )
    }

    const newStatus = !isJobSeekingActive
    const activeButton = async () => {
        const res = await updateProfile({
            profile: {
                job_seeking_active: newStatus
            }
        })
        if(!res) showModal('알림', '공고 활성화 실패', 'warning')
        setIsJobSeekingActive(newStatus)

    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-2xl font-bold">{t('settings.title', '설정')}</Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* 프로필 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="person" size={24} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="font-bold text-lg">{profile?.name || t('settings.no_name', '이름 없음')}</Text>
                                <Text className="text-sm text-gray-600">{profile?.phone_number}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(pages)/(user)/info')}
                            className="bg-blue-100 px-3 py-1 rounded-lg"
                        >
                            <Text className="text-blue-600 text-sm font-medium">{t('settings.edit_profile', '프로필 수정')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800">{t('settings.activate_posting', '구직공고 활성화')}</Text>
                        <Text className="text-sm text-gray-600 mt-1">
                            {t('settings.activate_description', '활성화하면 회사에서 내 프로필을 볼 수 있습니다')}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={activeButton}
                        className={`w-14 h-8 rounded-full p-1 ${
                            isJobSeekingActive ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                    >
                        <View className={`w-6 h-6 bg-white rounded-full ${
                            isJobSeekingActive ? 'self-end' : 'self-start'
                        }`} />
                    </TouchableOpacity>
                </View>
                </View>

                {/* 알림 설정 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">{t('settings.notification_settings', '알림 설정')}</Text>

                    <View className="space-y-4">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">{t('settings.new_job_notification', '새 일자리 알림')}</Text>
                                <Text className="text-sm text-gray-600">{t('settings.new_job_description', '매칭되는 새 공고 알림')}</Text>
                            </View>
                            <Switch
                                value={notificationSettings.newJob}
                                onValueChange={() => toggleNotification('newJob')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.newJob ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">{t('settings.application_status_notification', '지원 현황 알림')}</Text>
                                <Text className="text-sm text-gray-600">{t('settings.application_status_description', '지원 상태 변경 알림')}</Text>
                            </View>
                            <Switch
                                value={notificationSettings.applicationStatus}
                                onValueChange={() => toggleNotification('applicationStatus')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.applicationStatus ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">{t('settings.marketing_notification', '마케팅 알림')}</Text>
                                <Text className="text-sm text-gray-600">{t('settings.marketing_description', '이벤트 및 혜택 정보')}</Text>
                            </View>
                            <Switch
                                value={notificationSettings.marketing}
                                onValueChange={() => toggleNotification('marketing')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.marketing ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>
                    </View>
                </View>

                {/* 앱 설정 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">{t('settings.app_settings', '앱 설정')}</Text>

                    <TouchableOpacity
                        onPress={() => setLanguageModalVisible(true)}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="language" size={20} color="#6b7280" />
                            <Text className="ml-3">{t('settings.language_settings', '언어 설정')}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-600 mr-2">
                                {languages.find(lang => lang.code === language)?.name || '한국어'}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </View>
                    </TouchableOpacity>
                </View>


                {/* 정보 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">{t('settings.information', '정보')}</Text>

                    <TouchableOpacity
                        onPress={() => openLink('https://example.com/terms')}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">{t('settings.terms_of_service', '이용약관')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => openLink('https://example.com/privacy')}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="shield-checkmark-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">{t('settings.privacy_policy', '개인정보처리방침')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleCustomerService}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="mail-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">{t('settings.customer_service', '고객센터')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-between py-3">
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">{t('settings.app_version', '앱 버전')}</Text>
                        </View>
                        <Text className="text-gray-600">{APP_VERSION}</Text>
                    </View>
                </View>

                {/* 계정 관리 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">{t('settings.account_management', '계정 관리')}</Text>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center py-3"
                    >
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <Text className="ml-3 text-red-500">{t('settings.logout', '로그아웃')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setDeleteAccountModalVisible(true)}
                        className="flex-row items-center py-3"
                    >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        <Text className="ml-3 text-red-500">{t('settings.delete_account', '회원 탈퇴')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* 언어 선택 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-[500px]">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold">
                                {t('settings.select_language', '언어 선택')}
                            </Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={true} style={{ flexGrow: 0 }}>
                            {languages.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    onPress={() => handleLanguageChange(lang.code)}
                                    className={`flex-row items-center justify-between p-4 rounded-lg mb-2 ${
                                        selectedLanguage === lang.code ? 'bg-blue-50' : 'bg-gray-50'
                                    }`}
                                >
                                    <View className="flex-row items-center">
                                        <Text className="text-2xl mr-3">{lang.flag}</Text>
                                        <Text className={`text-lg ${
                                            selectedLanguage === lang.code ? 'text-blue-600 font-bold' : 'text-gray-700'
                                        }`}>{lang.name}</Text>
                                    </View>
                                    {selectedLanguage === lang.code && (
                                        <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* 회원 탈퇴 확인 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={deleteAccountModalVisible}
                onRequestClose={() => setDeleteAccountModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center px-4">
                    <View className="bg-white rounded-2xl p-6">
                        <View className="items-center mb-4">
                            <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-3">
                                <Ionicons name="warning" size={32} color="#ef4444" />
                            </View>
                            <Text className="text-xl font-bold text-gray-900">{t('settings.delete_confirm_title', '정말 탈퇴하시겠습니까?')}</Text>
                        </View>

                        <Text className="text-gray-600 text-center mb-6">
                            {t('settings.delete_warning', '회원 탈퇴 시 모든 데이터가 삭제되며\n복구할 수 없습니다.')}
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setDeleteAccountModalVisible(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-100"
                            >
                                <Text className="text-center text-gray-700 font-medium">{t('button.cancel', '취소')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => {
                                    setDeleteAccountModalVisible(false)
                                    handleDeleteAccount()
                                }}
                                className="flex-1 py-3 rounded-xl bg-red-500"
                            >
                                <Text className="text-center text-white font-medium">{t('settings.delete_button', '탈퇴하기')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* useModal로 생성되는 모달 */}
            <ModalComponent />
        </SafeAreaView>
    )
}

export default Settings