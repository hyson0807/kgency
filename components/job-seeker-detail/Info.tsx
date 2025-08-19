import {Text, View} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import React from "react";
interface UserInfo {
    age?: number
    gender?: string
    visa?: string
    korean_level?: string
    how_long?: string
    experience?: string
    experience_content?: string
    preferred_days?: string[]
    preferred_times?: string[]
}
interface UserKeyword {
    keyword_id: number
    keyword: {
        id: number
        keyword: string
        category: string
    }
}
interface JobSeekerDetail {
    id: string
    name: string
    phone_number: string
    job_seeking_active: boolean
    created_at: string
    user_info?: UserInfo
    user_keywords?: UserKeyword[]
}
interface InfoProps {
    jobSeeker: JobSeekerDetail,
}
export const Info = ({
    jobSeeker,
                     }: InfoProps) => {
    return (
        <View className="p-6 border-b border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
                <View>
                    <Text className="text-2xl font-bold text-gray-800">
                        {jobSeeker.name || '이름 미등록'}
                    </Text>
                    <View className="flex-row items-center mt-2">
                        <View className={`px-2 py-1 rounded-full ${
                            jobSeeker.job_seeking_active ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                            <Text className={`text-xs font-medium ${
                                jobSeeker.job_seeking_active ? 'text-green-600' : 'text-gray-600'
                            }`}>
                                {jobSeeker.job_seeking_active ? '구직중' : '구직중지'}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            {/* 기본 정보 그리드 */}
            <View className="flex-row flex-wrap gap-4 mt-4">
                {jobSeeker.user_info?.age && (
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                            <Ionicons name="person-outline" size={16} color="#3b82f6" />
                        </View>
                        <View className="ml-2">
                            <Text className="text-xs text-gray-500">나이</Text>
                            <Text className="text-sm font-medium">{jobSeeker.user_info.age}세</Text>
                        </View>
                    </View>
                )}
                {jobSeeker.user_info?.gender && (
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                            <Ionicons name="male-female-outline" size={16} color="#9333ea" />
                        </View>
                        <View className="ml-2">
                            <Text className="text-xs text-gray-500">성별</Text>
                            <Text className="text-sm font-medium">{jobSeeker.user_info.gender === '상관없음' ? '기타' : jobSeeker.user_info.gender}</Text>
                        </View>
                    </View>
                )}
                {jobSeeker.user_info?.visa && (
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                            <Ionicons name="document-text-outline" size={16} color="#16a34a" />
                        </View>
                        <View className="ml-2">
                            <Text className="text-xs text-gray-500">비자</Text>
                            <Text className="text-sm font-medium">{jobSeeker.user_info.visa}</Text>
                        </View>
                    </View>
                )}
                {jobSeeker.user_info?.korean_level && (
                    <View className="flex-row items-center">
                        <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
                            <Ionicons name="language-outline" size={16} color="#ea580c" />
                        </View>
                        <View className="ml-2">
                            <Text className="text-xs text-gray-500">한국어</Text>
                            <Text className="text-sm font-medium">{jobSeeker.user_info.korean_level}</Text>
                        </View>
                    </View>
                )}
            </View>
            {/* 경력 정보 섹션 */}
            {(jobSeeker.user_info?.how_long ||
              jobSeeker.user_info?.preferred_days?.length || 
              jobSeeker.user_info?.preferred_times?.length || 
              jobSeeker.user_info?.experience || 
              jobSeeker.user_info?.experience_content) && (
                <View className="mt-6">
                    <Text className="text-lg font-bold text-gray-800 mb-4">경력 정보</Text>
                    
                    {/* 희망 근무 기간 */}
                    {jobSeeker.user_info?.how_long && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                <Ionicons name="time-outline" size={16} color="#3b82f6" />
                            </View>
                            <View className="ml-2">
                                <Text className="text-xs text-gray-500">희망 근무 기간</Text>
                                <Text className="text-sm font-medium">{jobSeeker.user_info.how_long}</Text>
                            </View>
                        </View>
                    )}
                    {/* 희망 근무 요일 */}
                    {jobSeeker.user_info?.preferred_days && jobSeeker.user_info.preferred_days.length > 0 && (
                        <View className="flex-row items-start mb-3">
                            <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center">
                                <Ionicons name="calendar-outline" size={16} color="#16a34a" />
                            </View>
                            <View className="ml-2 flex-1">
                                <Text className="text-xs text-gray-500">희망 근무 요일</Text>
                                <View className="flex-row flex-wrap gap-1 mt-1">
                                    {jobSeeker.user_info.preferred_days.map((day, index) => (
                                        <View key={index} className="bg-green-50 px-2 py-1 rounded">
                                            <Text className="text-xs font-medium text-green-700">{day}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}
                    {/* 희망 시간대 */}
                    {jobSeeker.user_info?.preferred_times && jobSeeker.user_info.preferred_times.length > 0 && (
                        <View className="flex-row items-start mb-3">
                            <View className="w-8 h-8 bg-purple-100 rounded-full items-center justify-center">
                                <Ionicons name="time-outline" size={16} color="#9333ea" />
                            </View>
                            <View className="ml-2 flex-1">
                                <Text className="text-xs text-gray-500">희망 시간대</Text>
                                <View className="flex-row flex-wrap gap-1 mt-1">
                                    {jobSeeker.user_info.preferred_times.map((time, index) => (
                                        <View key={index} className="bg-purple-50 px-2 py-1 rounded">
                                            <Text className="text-xs font-medium text-purple-700">{time}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}
                    {/* 관련 경력 */}
                    {jobSeeker.user_info?.experience && (
                        <View className="flex-row items-center mb-3">
                            <View className="w-8 h-8 bg-orange-100 rounded-full items-center justify-center">
                                <Ionicons name="briefcase-outline" size={16} color="#ea580c" />
                            </View>
                            <View className="ml-2">
                                <Text className="text-xs text-gray-500">관련 경력</Text>
                                <Text className="text-sm font-medium">{jobSeeker.user_info.experience}</Text>
                            </View>
                        </View>
                    )}
                    {/* 경력 내용 */}
                    {jobSeeker.user_info?.experience_content && (
                        <View className="flex-row items-start mb-3">
                            <View className="w-8 h-8 bg-yellow-100 rounded-full items-center justify-center">
                                <Ionicons name="document-text-outline" size={16} color="#d97706" />
                            </View>
                            <View className="ml-2 flex-1">
                                <Text className="text-xs text-gray-500">경력 내용</Text>
                                <Text className="text-sm font-medium text-gray-700 leading-relaxed mt-1">
                                    {jobSeeker.user_info.experience_content}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    )
}