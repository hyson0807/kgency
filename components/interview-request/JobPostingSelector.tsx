import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
interface JobPosting {
    id: string
    title: string
    hasExistingApplication?: boolean
}
interface JobPostingSelectorProps {
    jobPostings: JobPosting[]
    selectedJobPostingId: string
    onSelectJobPosting: (id: string) => void
}
export default function JobPostingSelector({ 
    jobPostings, 
    selectedJobPostingId, 
    onSelectJobPosting 
}: JobPostingSelectorProps) {
    return (
        <View className="px-4 mb-6">
            <Text className="text-base font-semibold mb-3">공고 선택</Text>
            {jobPostings.length === 0 ? (
                <View className="border border-gray-200 rounded-lg p-4">
                    <Text className="text-gray-500 text-center mb-3">
                        활성화된 공고가 없습니다.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(pages)/(company)/(job-posting-registration)/job-posting-step1')}
                        className="bg-blue-500 py-3 px-4 rounded-lg"
                    >
                        <View className="flex-row items-center justify-center">
                            <Ionicons name="add" size={20} color="white" />
                            <Text className="text-white font-medium ml-2">
                                공고 등록하기
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="border border-gray-200 rounded-lg">
                    {jobPostings.map((posting, index) => (
                        <TouchableOpacity
                            key={posting.id}
                            onPress={() => onSelectJobPosting(posting.id)}
                            className={`p-4 ${
                                index !== jobPostings.length - 1 ? 'border-b border-gray-100' : ''
                            } ${
                                selectedJobPostingId === posting.id ? 'bg-blue-50' : ''
                            }`}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                                        selectedJobPostingId === posting.id 
                                            ? 'bg-blue-500 border-blue-500' 
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedJobPostingId === posting.id && (
                                            <View className="flex-1 justify-center items-center">
                                                <View className="w-2 h-2 bg-white rounded-full" />
                                            </View>
                                        )}
                                    </View>
                                    <Text className={`flex-1 ${
                                        selectedJobPostingId === posting.id
                                            ? 'text-blue-600 font-medium'
                                            : 'text-gray-700'
                                    }`}>
                                        {posting.title}
                                    </Text>
                                </View>
                                {posting.hasExistingApplication && (
                                    <View className="flex-row items-center ml-2">
                                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                        <Text className="text-xs text-green-600 ml-1 font-medium">
                                            지원완료
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    )
}