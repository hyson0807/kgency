// app/(pages)/(company)/view-application-step4.tsx
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, {useEffect, useState} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import AntDesign from '@expo/vector-icons/AntDesign'
import Back from '@/components/shared/common/back'
import { useModal } from '@/lib/shared/ui/hooks/useModal'
import { ActivityIndicator } from 'react-native'
import {api} from "@/lib/api"
import { useChatRoomNavigation } from '@/lib/features/chat/hooks/useChatRoomNavigation'
import { useUserProfileImage } from '@/lib/features/profile/hooks/useUserProfileImage'
import { ProfileImageModal } from '@/components/shared/modals/ProfileImageModal'
export default function ViewResume() {
    const { showModal, ModalComponent } = useModal()
    const { createAndNavigateToChat } = useChatRoomNavigation()
    const params = useLocalSearchParams()
    const {
        applicationId,
        messageId,
        userName,
        resume,
        subject,
        createdAt,
        userId,
        postingId,
        proposalStatus
    } = params
    const [translatedResume, setTranslatedResume] = useState<string | null>(null)
    const [isTranslated, setIsTranslated] = useState(false)
    const [isTranslating, setIsTranslating] = useState(false)
    const [profileImageModalVisible, setProfileImageModalVisible] = useState(false)
    const { profileImage: userProfileImage } = useUserProfileImage(userId)
    useEffect(() => {
        if (messageId) {
            markAsRead()
        }
    }, [messageId])
    
    const markAsRead = async () => {
        if (!messageId) return
        try {
            await api('PUT', `/api/messages/${messageId}/read`);
        } catch (error) {
        }
    }
    const handleTranslate = async () => {
        const resumeText = Array.isArray(resume) ? resume[0] : resume
        if (!resumeText) return
        // 토글 기능
        if (isTranslated && translatedResume) {
            setIsTranslated(false)
            return
        }
        // 이미 번역된 텍스트가 있으면 토글
        if (translatedResume) {
            setIsTranslated(true)
            return
        }
        // 새로 번역
        setIsTranslating(true)
        try {
            const response = await api('POST', '/api/translate/translate', {
                text: resumeText,
                targetLang: 'ko' // 항상 한국어로 번역
            })
            if (response.success) {
                setTranslatedResume(response.translatedText)
                setIsTranslated(true)
            } else {
                throw new Error('번역 실패')
            }
        } catch (error) {
            showModal(
                '번역 실패',
                '이력서를 번역하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                'warning'
            )
        } finally {
            setIsTranslating(false)
        }
    }

    const handleSaveResume = () => {
        showModal('알림', '이력서가 저장되었습니다.')
    }

    const handleStartChat = async () => {
        const userIdParam = Array.isArray(userId) ? userId[0] : userId
        const postingIdParam = Array.isArray(postingId) ? postingId[0] : postingId
        const applicationIdParam = Array.isArray(applicationId) ? applicationId[0] : applicationId

        await createAndNavigateToChat({
            companyId: '', // 훅 내부에서 현재 사용자가 회사인지 구직자인지 판단하므로 빈 값도 가능
            userId: userIdParam,
            jobPostingId: postingIdParam,
            applicationId: applicationIdParam,
            fromApplication: true
        })
    }
    const formatDate = (dateString: string | string[]) => {
        const date = new Date(Array.isArray(dateString) ? dateString[0] : dateString)
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                <View className="flex-row items-center">
                    <Back />
                    <Text className="text-lg font-bold ml-4">이력서</Text>
                </View>
                <View className="flex-row items-center gap-3">
                    {/* 번역 버튼 추가 */}
                    <TouchableOpacity
                        onPress={handleTranslate}
                        disabled={isTranslating}
                    >
                        {isTranslating ? (
                            <ActivityIndicator size="small" color="#3b82f6" />
                        ) : (
                            <Ionicons
                                name={isTranslated ? "language" : "language-outline"}
                                size={24}
                                color={isTranslated ? "#10b981" : "#3b82f6"}
                            />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSaveResume}>
                        <Ionicons name="bookmark-outline" size={24} color="#3b82f6" />
                    </TouchableOpacity>
                </View>
            </View>
            {/* 지원자 정보 */}
            <View className="bg-blue-50 mx-4 mt-4 p-4 rounded-xl">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <TouchableOpacity onPress={() => setProfileImageModalVisible(true)}>
                            {userProfileImage ? (
                                <Image 
                                    source={{ uri: userProfileImage }} 
                                    className="w-16 h-16 rounded-full bg-gray-100"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
                                    <Text className="text-2xl font-bold text-gray-600">
                                        {Array.isArray(userName) ? userName[0]?.charAt(0) || '?' : userName?.charAt(0) || '?'}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                        <View>
                            <Text className="text-sm text-gray-600">지원자</Text>
                            <Text className="text-lg font-bold text-blue-900">
                                {Array.isArray(userName) ? userName[0] : userName}
                            </Text>
                            {subject && (
                                <Text className="text-sm text-gray-600 mt-1">
                                    {Array.isArray(subject) ? subject[0] : subject}
                                </Text>
                            )}
                            {createdAt && (
                                <Text className="text-xs text-gray-500 mt-1">
                                    수신일: {formatDate(createdAt)}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
            {/* 이력서 내용 */}
            <ScrollView className="flex-1 px-4 py-4">
                <View className="bg-gray-50 p-6 rounded-xl">
                    {isTranslated && (
                        <View className="mb-3 pb-3 border-b border-gray-200">
                            <View className="flex-row items-center">
                                <Ionicons name="language" size={16} color="#10b981" />
                                <Text className="text-sm text-green-600 ml-1">한국어로 번역됨</Text>
                            </View>
                        </View>
                    )}
                    <Text className="text-base text-gray-800 leading-7">
                        {isTranslated && translatedResume
                            ? translatedResume
                            : (Array.isArray(resume) ? resume[0] : resume)
                        }
                    </Text>
                </View>
            </ScrollView>
            {/* 하단 액션 버튼 */}
            <View className="px-4 pb-4">
                {(!proposalStatus || proposalStatus === 'none') && applicationId && userId && postingId && (
                    <TouchableOpacity
                        onPress={handleStartChat}
                        className="bg-blue-500 py-3 rounded-xl flex-row items-center justify-center"
                    >
                        <AntDesign name="message1" size={18} color="white" />
                        <Text className="text-white font-medium ml-2">채팅으로 대화하기</Text>
                    </TouchableOpacity>
                )}
            </View>
            <ModalComponent />
            
            {/* Profile Image Modal */}
            <ProfileImageModal
                visible={profileImageModalVisible}
                imageUrl={userProfileImage}
                userName={Array.isArray(userName) ? userName[0] : userName}
                onClose={() => setProfileImageModalVisible(false)}
            />
        </SafeAreaView>
    )
}