import React from 'react'
import { View, Text, TextInput } from 'react-native'
interface JobBasicInfoFormProps {
    jobTitle: string
    setJobTitle: (value: string) => void
    jobDescription: string
    setJobDescription: (value: string) => void
    jobAddress: string
    setJobAddress: (value: string) => void
    hiringCount: string
    setHiringCount: (value: string) => void
    interviewLocation?: string
    setInterviewLocation?: (value: string) => void
    specialNotes?: string
    setSpecialNotes?: (value: string) => void
}
export const JobBasicInfoForm: React.FC<JobBasicInfoFormProps> = ({
    jobTitle,
    setJobTitle,
    jobDescription,
    setJobDescription,
    jobAddress,
    setJobAddress,
    hiringCount,
    setHiringCount,
    interviewLocation,
    setInterviewLocation,
    specialNotes,
    setSpecialNotes
}) => {
    return (
        <View className="p-6 border-b border-gray-100">
            <Text className="text-xl font-bold mb-4">채용 정보</Text>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">채용 제목 *</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder="예: 주방 보조 직원 모집"
                    value={jobTitle}
                    onChangeText={setJobTitle}
                />
            </View>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">업무 내용</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 min-h-[100px]"
                    placeholder="업무 내용을 간단히 알려주세요!"
                    value={jobDescription}
                    onChangeText={setJobDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">가게 주소</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder="가게 주소"
                    value={jobAddress}
                    onChangeText={setJobAddress}
                />
            </View>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">모집인원</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder="예: 2"
                    value={hiringCount}
                    onChangeText={setHiringCount}
                    keyboardType="numeric"
                />
            </View>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">면접 장소</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder="면접 장소를 입력하세요 (미입력 시 가게 주소)"
                    value={interviewLocation || ''}
                    onChangeText={setInterviewLocation}
                />
            </View>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">특이사항</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 min-h-[80px]"
                    placeholder="면접시 필요한 준비물과 복장이 있다면 적어주세요"
                    value={specialNotes || ''}
                    onChangeText={setSpecialNotes}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                />
            </View>
        </View>
    )
}