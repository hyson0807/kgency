import { View, Text, ScrollView, TouchableOpacity, Switch, Modal, Alert, Linking, Platform } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { useProfile } from "@/hooks/useProfile"
import { router } from "expo-router"
import { Ionicons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from '@/lib/supabase'

const Settings = () => {
    const { logout, user } = useAuth()
    const { profile } = useProfile()

    // 알림 설정 상태
    const [notificationSettings, setNotificationSettings] = useState({
        newJob: true,
        applicationStatus: true,
        marketing: false
    })

    // 모달 상태
    const [languageModalVisible, setLanguageModalVisible] = useState(false)
    const [deleteAccountModalVisible, setDeleteAccountModalVisible] = useState(false)
    const [logoutModalVisible, setLogoutModalVisible] = useState(false)

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

    // 웹 호환 Alert 함수
    const showAlert = (title: string, message: string, buttons: any[]) => {
        if (Platform.OS === 'web') {
            // 웹에서는 모달로 처리
            if (title === '로그아웃') {
                setLogoutModalVisible(true)
            } else if (title === '언어 변경') {
                // 웹에서는 console.log로 대체
                console.log(title, message)
                // 또는 Toast 라이브러리 사용
            }
        } else {
            // 모바일에서는 기본 Alert 사용
            Alert.alert(title, message, buttons)
        }
    }

    // 로그아웃 처리
    const handleLogout = () => {
        if (Platform.OS === 'web') {
            setLogoutModalVisible(true)
        } else {
            Alert.alert(
                '로그아웃',
                '정말 로그아웃 하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    {
                        text: '로그아웃',
                        style: 'destructive',
                        onPress: () => logout()
                    }
                ]
            )
        }
    }

    // 실제 로그아웃 실행
    const performLogout = async () => {
        setLogoutModalVisible(false)
        await logout()
    }

    // 회원 탈퇴 처리
    const handleDeleteAccount = async () => {
        if (!user) return

        try {
            // Auth 유저 삭제
            await supabase.auth.admin.deleteUser(user.userId)

            // 로컬 데이터 삭제 및 로그아웃
            await AsyncStorage.clear()

            if (Platform.OS === 'web') {
                console.log('회원 탈퇴 완료')
                await logout()
            } else {
                Alert.alert('회원 탈퇴 완료', '그동안 이용해주셔서 감사합니다.', [
                    { text: '확인', onPress: () => logout() }
                ])
            }
        } catch (error) {
            console.error('회원 탈퇴 실패:', error)
            if (Platform.OS === 'web') {
                console.error('회원 탈퇴 처리 중 문제가 발생했습니다.')
            } else {
                Alert.alert('오류', '회원 탈퇴 처리 중 문제가 발생했습니다.')
            }
        }
    }

    // 언어 변경
    const handleLanguageChange = async (language: string) => {
        try {
            await AsyncStorage.setItem('appLanguage', language)
            setSelectedLanguage(language)
            setLanguageModalVisible(false)

            if (Platform.OS === 'web') {
                console.log('언어가 변경되었습니다. 새로고침하면 적용됩니다.')
            } else {
                Alert.alert('언어 변경', '앱을 재시작하면 적용됩니다.')
            }
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

    // 고객센터 처리
    const handleCustomerService = () => {
        if (Platform.OS === 'web') {
            console.log('고객센터 문의')
        } else {
            Alert.alert('고객센터', '문의사항이 있으신가요?')
        }
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
                {/* 프로필 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="person" size={24} color="#3b82f6" />
                            </View>
                            <View className="ml-3">
                                <Text className="font-bold text-lg">{profile?.name || '이름 없음'}</Text>
                                <Text className="text-sm text-gray-600">{profile?.phone_number}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(pages)/(user)/info')}
                            className="bg-blue-100 px-3 py-1 rounded-lg"
                        >
                            <Text className="text-blue-600 text-sm font-medium">프로필 수정</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 알림 설정 섹션 */}
                <View className="bg-white mx-4 mt-4 p-6 rounded-2xl shadow-sm">
                    <Text className="text-lg font-bold mb-4">알림 설정</Text>

                    <View className="space-y-4">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="font-medium">새 일자리 알림</Text>
                                <Text className="text-sm text-gray-600">매칭되는 새 공고 알림</Text>
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
                                <Text className="font-medium">지원 현황 알림</Text>
                                <Text className="text-sm text-gray-600">지원 상태 변경 알림</Text>
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
                                <Text className="font-medium">마케팅 알림</Text>
                                <Text className="text-sm text-gray-600">이벤트 및 혜택 정보</Text>
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
                        onPress={() => openLink('https://example.com/terms')}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">이용약관</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => openLink('https://example.com/privacy')}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="shield-checkmark-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">개인정보처리방침</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleCustomerService}
                        className="flex-row items-center justify-between py-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="mail-outline" size={20} color="#6b7280" />
                            <Text className="ml-3">고객센터</Text>
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

            {/* 로그아웃 확인 모달 (웹용) */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={logoutModalVisible}
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center px-4">
                    <View className="bg-white rounded-2xl p-6">
                        <Text className="text-xl font-bold text-center mb-4">로그아웃</Text>
                        <Text className="text-gray-600 text-center mb-6">
                            정말 로그아웃 하시겠습니까?
                        </Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setLogoutModalVisible(false)}
                                className="flex-1 py-3 rounded-xl bg-gray-100"
                            >
                                <Text className="text-center text-gray-700 font-medium">취소</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={performLogout}
                                className="flex-1 py-3 rounded-xl bg-red-500"
                            >
                                <Text className="text-center text-white font-medium">로그아웃</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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

                        <Text className="text-gray-600 text-center mb-6">
                            회원 탈퇴 시 모든 데이터가 삭제되며{'\n'}복구할 수 없습니다.
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
        </SafeAreaView>
    )
}

export default Settings