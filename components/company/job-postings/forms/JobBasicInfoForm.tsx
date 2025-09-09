import React, { useRef } from 'react'
import { View, Text, TextInput, ScrollView } from 'react-native'
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
    specialNotes,
    setSpecialNotes
}) => {
    const scrollViewRef = useRef<ScrollView>(null)
    
    const handleInputFocus = (inputName: string) => {
        // 각 입력창에 대한 대략적인 Y 위치 설정
        const approximatePositions: {[key: string]: number} = {
            'jobTitle': 80,
            'jobDescription': 200,
            'jobAddress': 360,
            'hiringCount': 460,
            'specialNotes': 560
        }
        
        // 키보드가 올라오는 시간을 기다림
        setTimeout(() => {
            const targetY = approximatePositions[inputName] || 0
            
            if (scrollViewRef.current) {
                scrollViewRef.current.scrollTo({
                    x: 0,
                    y: targetY,
                    animated: true
                })
            }
        }, 100)
    }
    
    return (
        <ScrollView 
            ref={scrollViewRef}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            automaticallyAdjustKeyboardInsets={true}
        >

            <View className="p-6">
                <Text className="text-xl font-bold mb-2">기본 정보를 입력해주세요</Text>
                <Text className="text-gray-600 mb-6">채용공고의 기본적인 정보를 작성해주세요.</Text>
            </View>

            <View className="p-6 border-b border-gray-100">
                <Text className="text-xl font-bold mb-4">채용 정보</Text>
                <View className="mb-4">
                    <Text className="text-gray-700 mb-2">채용 제목 *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3"
                        placeholder="예: 주방 보조 직원 모집"
                        value={jobTitle}
                        onChangeText={setJobTitle}
                        onFocus={() => handleInputFocus('jobTitle')}
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
                        onFocus={() => handleInputFocus('jobDescription')}
                    />
                </View>
                <View className="mb-4">
                    <Text className="text-gray-700 mb-2">가게 주소</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3"
                        placeholder="가게 주소"
                        value={jobAddress}
                        onChangeText={setJobAddress}
                        onFocus={() => handleInputFocus('jobAddress')}
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
                        onFocus={() => handleInputFocus('hiringCount')}
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
                        onFocus={() => handleInputFocus('specialNotes')}
                    />
                </View>
            </View>
        </ScrollView>
    )
}