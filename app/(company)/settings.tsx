import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/hooks/useModal'

const Settings = () => {
    const { logout, user } = useAuth()
    const { profile } = useProfile()
    const { showModal, ModalComponent } = useModal()

    // 알림 설정 상태
    const [notificationSettings, setNotificationSettings] = useState({
        newApplicant: true,          // 새 지원자 알림
        messageReceived: true,       // 메시지 수신 알림
        postingExpiry: true,         // 공고 만료 알림
        marketing: false
    })

    // 모달 상태
    const [languageModalVisible, setLanguageModalVisible] = useState(false)
    const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false)

    // 언어 설정
    const [selectedLanguage, setSelectedLanguage] = useState('ko')

    // 앱 정보
    const APP_VERSION = '1.0.0'

    // 알림 설정 로드
    useEffect(() => {
        loadNotificationSettings()
    }, [])

    const loadNotificationSettings = async () => {
        try {
            const saved = await AsyncStorage.getItem('companyNotificationSettings')
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
            await AsyncStorage.setItem('companyNotificationSettings', JSON.stringify(newSettings))
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
            '로그아웃',
            '정말 로그아웃 하시겠습니까?',
            'confirm',
            () => logout(),
            true
        )
    }

    // 회원 탈퇴 처리
    const handleDeleteAccount = async () => {
        if (!user) return

        try {
            // Auth 유저 삭제 (CASCADE로 관련 데이터 자동 삭제)
            await supabase.auth.admin.deleteUser(user.userId)

            // 로컬 데이터 삭제 및 로그아웃
            await AsyncStorage.clear()

            showModal(
                '회원 탈퇴 완료',
                '그동안 이용해주셔서 감사합니다.',
                'info',
                () => logout()
            )
        } catch (error) {
            console.error('회원 탈퇴 실패:', error)
            showModal(
                '오류',
                '회원 탈퇴 처리 중 문제가 발생했습니다.',
                'warning'
            )
        }
    }

    // 언어 변경
    const handleLanguageChange = async (language: string) => {
        try {
            await AsyncStorage.setItem('appLanguage', language)
            setSelectedLanguage(language)
            setLanguageModalVisible(false)
            showModal(
                '언어 변경',
                '앱을 재시작하면 적용됩니다.',
                'info'
            )
        } catch (error) {
            console.error('언어 설정 저장 실패:', error)
        }
    }

    // 외부 링크 열기
    const openLink = (url: string) => {
        Linking.openURL(url).catch(err =>
            console.error('링크 열기 실패:', err)
        )
    }

    // 고객센터 연락처 표시
    const showCustomerService = () => {
        showModal(
            '기업 고객센터',
            '기업 고객센터: 1588-0000\n운영시간: 평일 09:00 - 18:00',
            'info'
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
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
                            onPress={() => router.push('/(pages)/(company)/register')}
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
                        onPress={() => router.push('/(pages)/(company)/keywords')}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="pricetags-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">대표 키워드 관리</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/(company)/jobPosting')}
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
                    <Text className="text-lg font-bold mb-4">알림 설정</Text>

                    <View className="space-y-4">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">새 지원자 알림</Text>
                                <Text className="text-sm text-gray-600">공고에 새로운 지원자 알림</Text>
                            </View>
                            <Switch
                                value={notificationSettings.newApplicant}
                                onValueChange={() => toggleNotification('newApplicant')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.newApplicant ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">메시지 수신 알림</Text>
                                <Text className="text-sm text-gray-600">지원자 이력서 수신 알림</Text>
                            </View>
                            <Switch
                                value={notificationSettings.messageReceived}
                                onValueChange={() => toggleNotification('messageReceived')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.messageReceived ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">공고 만료 알림</Text>
                                <Text className="text-sm text-gray-600">채용공고 만료 예정 알림</Text>
                            </View>
                            <Switch
                                value={notificationSettings.postingExpiry}
                                onValueChange={() => toggleNotification('postingExpiry')}
                                trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                                thumbColor={notificationSettings.postingExpiry ? '#ffffff' : '#f3f4f6'}
                            />
                        </View>

                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">마케팅 알림</Text>
                                <Text className="text-sm text-gray-600">서비스 업데이트 및 혜택 정보</Text>
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
                    <Text className="text-lg font-bold mb-4">앱 설정</Text>

                    <TouchableOpacity
                        onPress={() => setLanguageModalVisible(true)}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="language" size={20} color="#6b7280" />
                            <Text className="ml-3">언어 설정</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-gray-600 mr-2">
                                {selectedLanguage === 'ko' ? '한국어' : 'English'}
                            </Text>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* 정보 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">정보</Text>

                    <TouchableOpacity
                        onPress={() => openLink('https://example.com/business-terms')}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">기업 이용약관</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => openLink('https://example.com/business-privacy')}
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

                    <TouchableOpacity
                        onPress={() => openLink('https://example.com/business-guide')}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="help-circle-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">채용 가이드</Text>
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
                    <Text className="text-lg font-bold mb-4">계정 관리</Text>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center py-3"
                    >
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <Text className="ml-3 text-red-500">로그아웃</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setDeleteAccountModalVisible(true)}
                        className="flex-row items-center py-3"
                    >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        <Text className="ml-3 text-red-500">회원 탈퇴</Text>
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
                    <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold">언어 선택</Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => handleLanguageChange('ko')}
                            className={`flex-row items-center justify-between p-4 rounded-lg mb-2 ${
                                selectedLanguage === 'ko' ? 'bg-blue-50' : 'bg-gray-50'
                            }`}
                        >
                            <Text className={`text-lg ${
                                selectedLanguage === 'ko' ? 'text-blue-600 font-bold' : 'text-gray-700'
                            }`}>한국어</Text>
                            {selectedLanguage === 'ko' && (
                                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => handleLanguageChange('en')}
                            className={`flex-row items-center justify-between p-4 rounded-lg ${
                                selectedLanguage === 'en' ? 'bg-blue-50' : 'bg-gray-50'
                            }`}
                        >
                            <Text className={`text-lg ${
                                selectedLanguage === 'en' ? 'text-blue-600 font-bold' : 'text-gray-700'
                            }`}>English</Text>
                            {selectedLanguage === 'en' && (
                                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                            )}
                        </TouchableOpacity>
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

            {/* useModal로 생성되는 모달 */}
            <ModalComponent />
        </SafeAreaView>
    )
}

export default Settings