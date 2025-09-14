import { View, Text, ScrollView, TouchableOpacity, Switch, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/lib/features/profile/hooks/useProfile"
import { router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useModal } from '@/lib/shared/ui/hooks/useModal'
import { useTranslation } from "@/contexts/TranslationContext";
import { useNotification } from "@/contexts/NotificationContext";
import { authAPI } from "@/lib/api/auth"
import AccountManagementModal from '@/components/shared/common/AccountManagementModal';
import TermsOfService from '@/components/shared/common/TermsOfService';
import PrivacyPolicy from '@/components/shared/common/PrivacyPolicy';
import { languages } from '@/lib/constants/languages';
import { removePushToken } from '@/lib/shared/services/notifications';
import ProfileImageUploader from '@/components/shared/Image/ProfileImageUploader';
const Settings = () => {
    const { logout, user,checkAuthState } = useAuth()
    const { profile, updateProfile, refreshProfile } = useProfile()
    const { showModal, ModalComponent } = useModal()
    const insets = useSafeAreaInsets()
    const [isJobSeekingActive, setIsJobSeekingActive] = useState(false)
    const { t, language, changeLanguage } = useTranslation()
    const { notificationSettings, updateNotificationSettings } = useNotification()
    const [selectedLanguage, setSelectedLanguage] = useState(language)
    const [pendingLanguageChange, setPendingLanguageChange] = useState<string | null>(null)
    // 모달 상태
    const [languageModalVisible, setLanguageModalVisible] = useState(false)
    const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false)
    const [accountModalVisible, setAccountModalVisible] = useState(false)
    const [termsModalVisible, setTermsModalVisible] = useState(false)
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false)
    // 앱 정보
    const APP_VERSION = '1.0.4(업데이트버전4)'
    // 초기 설정 로드
    useEffect(() => {
        checkAuthState()
        setIsJobSeekingActive(profile?.job_seeking_active || true)
    }, [profile])
    
    // 사용자 변경 시 프로필 새로고침
    useEffect(() => {
        if (user?.userId) {
            refreshProfile();
        }
    }, [user?.userId])
    // 언어 변경 시 selectedLanguage 동기화
    useEffect(() => {
        setSelectedLanguage(language)
    }, [language])
    // 언어 변경 완료 후 모달 표시
    useEffect(() => {
        if (pendingLanguageChange && language === pendingLanguageChange) {
            showModal(
                t('settings.language_change', '언어 변경'),
                t('settings.restart_required', '앱을 재시작해주세요'),
                'info'
            )
            setPendingLanguageChange(null)
        }
    }, [language, pendingLanguageChange, t, showModal])
    // 알림 토글
    const toggleNotification = (key: keyof typeof notificationSettings) => {
        const newSettings = {
            ...notificationSettings,
            [key]: !notificationSettings[key]
        }
        updateNotificationSettings(newSettings)
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
            // Push token 먼저 제거 (회원 탈퇴 전에)
            if (user.userId) {
                try {
                    await removePushToken(user.userId);
                } catch (error) {
                    // Continue with account deletion even if push token removal fails
                }
            }
            // 서버 API 호출 (토큰은 자동으로 처리됨)
            const result = await authAPI.deleteAccount();
            if (result.success) {
                // 로컬 데이터 삭제
                await AsyncStorage.clear();
                showModal(
                    t('settings.delete_complete', '회원 탈퇴 완료'),
                    t('settings.thank_you', '그동안 이용해주셔서 감사합니다.'),
                    'info',
                    () => logout(true) // Skip push token removal in logout
                )
            } else {
                throw new Error(result.error || '회원 탈퇴 처리 중 문제가 발생했습니다.')
            }
        } catch (error: any) {
            // 토큰이 없거나 만료된 경우
            if (error.response?.status === 401) {
                showModal(
                    t('settings.error', '오류'),
                    t('settings.auth_not_found', '인증 정보를 찾을 수 없습니다.'),
                    'warning'
                )
            } else {
                showModal(
                    t('settings.error', '오류'),
                    t('settings.delete_error', '회원 탈퇴 처리 중 문제가 발생했습니다.'),
                    'warning'
                )
            }
        }
    }
    // 언어 변경
    const handleLanguageChange = async (lang: string) => {
        try {
            setPendingLanguageChange(lang) // 변경하려는 언어 저장
            await changeLanguage(lang) // TranslationContext의 changeLanguage 사용
            setSelectedLanguage(lang) // 선택된 언어 상태 업데이트
            setLanguageModalVisible(false)
        } catch (error) {
            setPendingLanguageChange(null) // 실패 시 초기화
            showModal(
                t('settings.error', '오류'),
                t('settings.language_change_error', '언어 변경 중 오류가 발생했습니다.'),
                'warning'
            )
        }
    }
    // 고객센터 처리
    const handleCustomerService = () => {
        showModal(
            t('settings.customer_service', '고객센터'),
            t('settings.customer_service_info', '문의사항이 있으신가요?\n고객센터: jiwonn0207@gmail.com\n운영시간: 평일 09:00 - 18:00'),
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
        if(!res) showModal(t('settings.error', '알림'), t('settings.activation_failed', '공고 활성화 실패'), 'warning')
        setIsJobSeekingActive(newStatus)
    }
    return (
        <View className="flex-1 bg-gray-50" style={{paddingTop: insets.top}}>
            {/* 헤더 */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-2xl font-bold">{t('settings.title', '설정')}</Text>
            </View>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* 프로필 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <View className="items-center mb-4">
                        <ProfileImageUploader 
                            currentImageUrl={profile?.profile_image_url}
                            onImageUpdate={async (url) => {
                                await updateProfile({
                                    profile: { profile_image_url: url }
                                });
                            }}
                        />
                        <Text className="font-bold text-lg mt-3">{profile?.name || t('settings.no_name', '이름 없음')}</Text>
                        <Text className="text-sm text-gray-600">{profile?.phone_number}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/(pages)/(user)/(user-information)/info')}
                        className="bg-blue-100 px-4 py-2 rounded-lg self-center"
                    >
                        <Text className="text-blue-600 text-sm font-medium">{t('settings.edit_profile', '프로필 수정')}</Text>
                    </TouchableOpacity>
                </View>
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1">
                        <Text className="text-lg font-bold text-gray-800">
                            {t('settings.activate_job_posting', '구직 공고 활성화')}
                        </Text>
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
                                <Text className="font-medium">{t('settings.chat_message_notification', '채팅 메시지 알림')}</Text>
                                <Text className="text-sm text-gray-600">{t('settings.chat_message_description', '새로운 채팅 메시지를 받을 때 알림')}</Text>
                            </View>
                            <Switch
                                value={notificationSettings.chatMessage || true}
                                onValueChange={() => toggleNotification('chatMessage')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.chatMessage ? '#ffffff' : '#f3f4f6'}
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
                {/* 상점 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <TouchableOpacity
                        onPress={() => router.push('/(pages)/(user)/(shop)/shop')}
                        className="flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full items-center justify-center">
                                <Ionicons name="diamond" size={20} color="white" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-base font-semibold">{t('settings.shop', '토큰 상점')}</Text>
                                <Text className="text-xs text-gray-600 mt-0.5">{t('settings.shop_desc', '토큰 충전 및 이용내역 확인')}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                {/* 영상 연습 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <TouchableOpacity
                        onPress={() => router.push('/(pages)/(user)/video-practice')}
                        className="flex-row items-center justify-between"
                    >
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-500 rounded-full items-center justify-center">
                                <Ionicons name="videocam" size={20} color="white" />
                            </View>
                            <View className="ml-3 flex-1">
                                <Text className="text-base font-semibold">{t('settings.video_practice', '영상 연습')}</Text>
                                <Text className="text-xs text-gray-600 mt-0.5">{t('settings.video_practice_desc', '면접 영상 녹화 연습하기')}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>

                {/* 정보 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">{t('settings.information', '정보')}</Text>
                    <TouchableOpacity
                        onPress={() => setTermsModalVisible(true)}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">{t('settings.terms_of_service', '이용약관')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setPrivacyModalVisible(true)}
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
                    <TouchableOpacity
                        onPress={() => setAccountModalVisible(true)}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="settings-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">{t('settings.account_management', '계정 관리')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
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
            {/* 계정 관리 모달 */}
            <AccountManagementModal
                visible={accountModalVisible}
                onClose={() => setAccountModalVisible(false)}
                onLogout={() => {
                    setAccountModalVisible(false);
                    handleLogout();
                }}
                onDeleteAccount={() => {
                    setAccountModalVisible(false);
                    setDeleteAccountModalVisible(true);
                }}
            />
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
            {/* 이용약관 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={termsModalVisible}
                onRequestClose={() => setTermsModalVisible(false)}
            >
                <TermsOfService onClose={() => setTermsModalVisible(false)} />
            </Modal>
            {/* 개인정보처리방침 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={privacyModalVisible}
                onRequestClose={() => setPrivacyModalVisible(false)}
            >
                <PrivacyPolicy onClose={() => setPrivacyModalVisible(false)} />
            </Modal>
            {/* useModal로 생성되는 모달 */}
            <ModalComponent />
        </View>
    )
}
export default Settings