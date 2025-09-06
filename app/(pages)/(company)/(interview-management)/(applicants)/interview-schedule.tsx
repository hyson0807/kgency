import React, {useState} from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useModal } from '@/lib/shared/ui/hooks/useModal'
import Back from '@/components/shared/common/back'
export default function InterviewSchedule() {
    const { applicationId, userId, postingId } = useLocalSearchParams()
    const { showModal, ModalComponent } = useModal()
    const [location, setLocation] = useState('')
    const [loading, setLoading] = useState(false)
    const [applicantInfo, setApplicantInfo] = useState<any>(null)
    const handleSubmit = async () => {
        if (!location.trim()) {
            showModal('알림', '면접 장소를 입력해주세요.')
            return
        }
        // 다음 페이지로 이동 (면접 시간 선택)
        router.push({
            pathname: '/(pages)/(company)/(interview-management)/(applicants)/interview-proposal-time',
            params: {
                applicationId: applicationId as string,
                userId: userId as string,
                postingId: postingId as string,
                location: location.trim()
            }
        })
    }
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 일정 제안</Text>
            </View>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
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
                            다음
                        </Text>
                    </TouchableOpacity>
                </View>
                </ScrollView>
            </KeyboardAvoidingView>
            <ModalComponent />
        </SafeAreaView>
    )
}