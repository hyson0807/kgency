import React from 'react'
import { View, Text, TextInput } from 'react-native'
interface InterviewLocationInputProps {
    value: string
    onChangeText: (text: string) => void
    placeholder?: string
}
export default function InterviewLocationInput({ 
    value, 
    onChangeText, 
    placeholder = "예: 서울시 강남구 테헤란로 123 5층"
}: InterviewLocationInputProps) {
    return (
        <View className="px-4 mb-6">
            <Text className="text-base font-semibold mb-3">면접 장소</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                className="border border-gray-300 rounded-lg px-4 py-3"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
            />
        </View>
    )
}