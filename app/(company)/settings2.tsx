import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Linking } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useModal } from '@/hooks/useModal'
import {authAPI} from "@/lib/api";
import AccountManagementModal from '@/components/common/AccountManagementModal';
import TermsOfService from '@/components/common/TermsOfService';
import PrivacyPolicy from '@/components/common/PrivacyPolicy';
import { useNotification } from "@/contexts/NotificationContext";
import { useTranslation } from "@/contexts/TranslationContext";
import { removePushToken } from '@/lib/notifications';
const Settings2 = () => {
    const { logout, user } = useAuth()
    const { profile } = useProfile()
    const { showModal, ModalComponent } = useModal()
    const { t } = useTranslation()
    const { notificationSettings, updateNotificationSettings } = useNotification()
    // 모달 상태
    const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false)
    const [accountModalVisible, setAccountModalVisible] = useState(false)
    const [termsModalVisible, setTermsModalVisible] = useState(false)
    const [privacyModalVisible, setPrivacyModalVisible] = useState(false)
    // 앱 정보
    const APP_VERSION = '1.0.0'
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
            '로그아웃',
            '정말 로그아웃 하시겠습니까?',
            'confirm',
            () => logout(),
            true
        )
    }
    // 회원 탈퇴 처리
    const handleDeleteAccount = async () => {
        try {
            // Push token 먼저 제거 (회원 탈퇴 전에)
            if (user?.userId) {
                try {
                    await removePushToken(user.userId);
                } catch (error) {
                    // Push token removal failed
                    // Continue with account deletion even if push token removal fails
                }
            }
            
            // 토큰은 api 함수에서 자동으로 처리됨!
            const result = await authAPI.deleteAccount();
            // 성공 시 처리
            // 회원 탈퇴 완료
            // 로컬 데이터 삭제
            await AsyncStorage.clear();
            // 로그인 화면으로 이동
            logout(true); // Skip push token removal in logout
        } catch (error: any) {
            // 회원 탈퇴 실패
            // 에러 메시지 표시
            showModal('오류', error.error || '회원 탈퇴 중 문제가 발생했습니다.', 'warning');
        }
    };
    // 외부 링크 열기
    const openLink = (url: string) => {
        Linking.openURL(url).catch(err => {
            // 링크 열기 실패 시 에러 처리
        })
    }
    // 고객센터 연락처 표시
    const showCustomerService = () => {
        showModal(
            '기업 고객센터',
            '기업 고객센터: jiwonn0207@gmail.com\n운영시간: 평일 09:00 - 18:00',
            'info'
        )
    }
    return (
        <View className="flex-1 bg-gray-50" style={{paddingTop: 44}}>
            {/* 헤더 */}
            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <Text className="text-2xl font-bold">설정</Text>
            </View>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* 회사 프로필 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="business" size={24} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="font-bold text-lg">{profile?.name || '회사명 없음'}</Text>
                                <Text className="text-sm text-gray-600">{profile?.phone_number}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(pages)/(company)/(company-information)/register')}
                            className="bg-blue-100 px-3 py-1 rounded-lg"
                        >
                            <Text className="text-blue-600 text-sm font-medium">회사 정보 수정</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* 채용 관리 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">채용 관리</Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(pages)/(company)/(company-information)/keywords')}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="pricetags-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">대표 키워드 관리</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/(company)/myJobPostings')}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">내 채용공고 관리</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
                {/* 알림 설정 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">{t('settings.notification_settings', '알림 설정')}</Text>
                    <View className="space-y-4">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">{t('settings.interview_schedule_confirmed', '면접 일정 확정 알림')}</Text>
                                <Text className="text-sm text-gray-600">{t('settings.interview_schedule_confirmed_description', '지원자가 면접 일정을 확정했을 때 알림')}</Text>
                            </View>
                            <Switch
                                value={notificationSettings.interviewScheduleConfirmed || false}
                                onValueChange={() => toggleNotification('interviewScheduleConfirmed')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.interviewScheduleConfirmed ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>
                        
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">새로운 지원자 알림</Text>
                                <Text className="text-sm text-gray-600">지원자가 즉시면접이나 일반 지원을 했을 때 알림</Text>
                            </View>
                            <Switch
                                value={notificationSettings.newApplication || false}
                                onValueChange={() => toggleNotification('newApplication')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.newApplication ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>
                        
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">면접 요청 수락 알림</Text>
                                <Text className="text-sm text-gray-600">지원자가 면접 요청을 수락했을 때 알림</Text>
                            </View>
                            <Switch
                                value={notificationSettings.interviewRequestAccepted || false}
                                onValueChange={() => toggleNotification('interviewRequestAccepted')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.interviewRequestAccepted ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>
                    </View>
                </View>
                {/* 정보 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">정보</Text>
                    <TouchableOpacity
                        onPress={() => setTermsModalVisible(true)}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">이용약관</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setPrivacyModalVisible(true)}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="shield-checkmark-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">개인정보처리방침</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={showCustomerService}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="call-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">기업 고객센터</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                    <View className="flex-row items-center justify-between py-3">
                        <View className="flex-row items-center">
                            <Ionicons name="information-circle-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">앱 버전</Text>
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
                            <Text className="ml-3">계정 관리</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
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
                            <Text className="text-xl font-bold text-gray-900">정말 탈퇴하시겠습니까?</Text>
                        </View>
                        <Text className="text-gray-600 text-center mb-4">
                            회원 탈퇴 시 모든 데이터가 삭제되며{'\n'}복구할 수 없습니다.
                        </Text>
                        <Text className="text-red-600 text-sm text-center mb-6 font-medium">
                            ⚠️ 등록한 모든 채용공고와 지원자 정보가 삭제됩니다
                        </Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setDeleteAccountModalVisible(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-100"
                            >
                                <Text className="text-center text-gray-700 font-medium">취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setDeleteAccountModalVisible(false)
                                    handleDeleteAccount()
                                }}
                                className="flex-1 py-3 rounded-xl bg-red-500"
                            >
                                <Text className="text-center text-white font-medium">탈퇴하기</Text>
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
export default Settings2