import {Text, TouchableOpacity, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {useModal} from "@/hooks/useModal";
import {router} from "expo-router";


interface Application {
    id: string
    applied_at: string
    status: string
    user: {
        id: string
        name: string
        phone_number: string
        address?: string
        user_info?: {
            age?: number;
            gender?:string;
            visa?:string;
            how_long?:string;
            topic?:string;
            korean_level?:string;
            experience?:string;
            experience_content?:string; }
    }
    message?: {
        content: string
        is_read: boolean
    }
}

interface ApplicantCardProps {
    item: Application;
}


export const ApplicantCard = ({item}: ApplicantCardProps) => {

    const {showModal} = useModal()

    const handleViewResume = (application: Application) => {
        if (application.message) {
            router.push({
                pathname: '/(pages)/(company)/view-resume',
                params: {
                    applicationId: application.id,
                    userName: application.user.name,
                    resume: application.message.content,
                    userPhone: application.user.phone_number
                }
            })
        }
    }
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    return (
        <View className="bg-white mx-4 my-2 p-4 rounded-xl shadow-sm">
            <View className="mb-2">
                <View className="flex-row items-center">
                    <Text className="text-lg font-bold">{item.user.name}</Text>
                    {item.message && !item.message.is_read && (
                        <View className="ml-2 bg-blue-500 px-2 py-0.5 rounded-full">
                            <Text className="text-xs text-white">새 이력서</Text>
                        </View>
                    )}
                </View>
                <View className="flex-row items-center gap-5">
                    <View className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                        <Text className="text-lg font-bold">{item.user.name.charAt(0)}</Text>

                    </View>
                    <View className="flex-row items-center gap-2">
                        <Text className="text-sm text-gray-600">{item.user.user_info?.age}세 {item.user.user_info?.gender}</Text>
                        <Text className="text-sm text-gray-600">{item.user.user_info?.visa}</Text>
                    </View>
                    <Text className="text-sm text-gray-600">{formatDate(item.applied_at)}</Text>
                </View>
            </View>

            {/* 지원자 정보 요약 */}
            <View className="space-y-1 mb-3">
                {item.user.user_info?.age && (
                    <Text className="text-sm text-gray-700">
                        나이: {item.user.user_info.age}세 / {item.user.user_info.gender || '성별 미입력'}
                    </Text>
                )}

                {item.user.user_info?.visa && (
                    <Text className="text-sm text-gray-700">
                        비자: {item.user.user_info.visa}
                    </Text>
                )}
                {item.user.user_info?.korean_level && (
                    <Text className="text-sm text-gray-700">
                        한국어: {item.user.user_info.korean_level}
                    </Text>
                )}
                {item.user.user_info?.experience && (
                    <Text className="text-sm text-gray-700">
                        경력: {item.user.user_info.experience}
                    </Text>
                )}
            </View>

            {/* 버튼들 */}
            <View className="flex-row gap-2 pt-3 border-t border-gray-100">
                <TouchableOpacity
                    onPress={() => handleViewResume(item)}
                    className="flex-1 bg-blue-500 py-3 rounded-lg flex-row items-center justify-center"
                >
                    <Ionicons name="document-text-outline" size={18} color="white" />
                    <Text className="text-white font-medium ml-2">이력서 보기</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => {
                        // 실제 앱에서는 Clipboard API 사용
                        showModal(
                            '연락처 복사',
                            `${item.user.name}님의 연락처가 복사되었습니다.\n${item.user.phone_number}`,
                            'info'
                        )
                        // 실제 구현시: Clipboard.setString(item.user.phone_number)
                    }}
                    className="flex-1 bg-gray-100 py-3 rounded-lg flex-row items-center justify-center"
                >
                    <Ionicons name="copy-outline" size={18} color="#374151" />
                    <Text className="text-gray-700 font-medium ml-2">연락처 복사</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}