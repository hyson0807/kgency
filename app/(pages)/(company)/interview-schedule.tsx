import React, {useEffect, useState} from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useModal } from '@/hooks/useModal'
import Back from '@/components/back'
import { useAuth } from '@/contexts/AuthContext'
import {api} from "@/lib/api";

export default function InterviewSchedule() {
    const { applicationId, userId, postingId } = useLocalSearchParams()
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()

    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [applicantInfo, setApplicantInfo] = useState<any>(null)





    const handleSubmit = async () => {
        if (!location.trim()) {
            showModal('알림', '면접 장소를 입력해주세요.')
            return
        }

        setLoading(true)
        try {
            const response = await api('POST', '/api/interview-proposals/company', {
                applicationId,
                companyId: user?.userId,
                location: location.trim()
            })

            if (response?.success) {
                showModal('성공', '면접이 제안되었습니다. 지원자가 시간을 선택할 수 있습니다.', 'info')

                //Applicaion의 상태를 proposed

                // 새로고침 신호와 함께 돌아가기
                router.replace({
                    pathname: '/(pages)/(company)/posting-detail2',
                    params: {
                        postingId: postingId,
                        refresh: 'true'
                    }
                })
            }
        } catch (error) {
            console.error('Failed to submit proposal:', error)
            showModal('오류', '면접 제안에 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 일정 제안</Text>
            </View>

            <ScrollView className="flex-1">
                {/* 지원자 정보 (선택사항) */}
                {applicantInfo && (
                    <View className="p-4 bg-gray-50">
                        <Text className="text-sm text-gray-600">지원자</Text>
                        <Text className="text-base font-semibold">{applicantInfo.name}</Text>
                        <Text className="text-sm text-gray-500">{applicantInfo.position}</Text>
                    </View>
                )}

                {/* 안내 메시지 */}
                <View className="p-4 bg-blue-50 mx-4 mt-4 rounded-lg">
                    <Text className="text-sm text-blue-800">
                        면접 장소를 입력하고 제안하면, 지원자가 회사님이 설정한 가능한 시간대 중에서 선택할 수 있습니다.
                    </Text>
                </View>

                {/* 면접 장소 입력 */}
                <View className="p-4">
                    <Text className="text-base font-semibold mb-2">면접 장소*</Text>
                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="예: 서울시 강남구 테헤란로 123 5층 회의실"
                        className="border border-gray-300 rounded-lg px-4 py-3"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                    <Text className="text-xs text-gray-500 mt-1">
                        상세한 주소와 층, 회의실 정보를 입력해주세요
                    </Text>
                </View>

                {/* 제출 버튼 */}
                <View className="p-4">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={loading || !location.trim()}
                        className={`py-4 rounded-lg ${
                            loading || !location.trim()
                                ? 'bg-gray-300'
                                : 'bg-blue-500'
                        }`}
                    >
                        <Text className="text-center text-white font-semibold">
                            {loading ? '처리중...' : '면접 일정 제안하기'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <ModalComponent />
        </SafeAreaView>
    )
}