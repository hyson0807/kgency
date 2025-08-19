import {Text, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";
import React from "react";
interface MyJobPostings {
    id: string
    title: string
    description?: string
    hiring_count: number
    is_active: boolean
    created_at: string
    updated_at: string
    working_hours?: string
    working_hours_negotiable?: boolean
    working_days?: string[]
    working_days_negotiable?: boolean
    pay_day?: string
    pay_day_negotiable?: boolean
    salary_range?: string
    salary_type: string
    applications?: {
        id: string
    }[]
    job_posting_keywords?: {
        keyword: {
            keyword: string
            category: string
        }
    }[]
}
interface PostingCardProps {
    item: MyJobPostings
    onToggleActive: (postingId: string, currentStatus: boolean) => void
    onDelete: (postingId: string, title: string) => void
}
export const PostingCard = ({
    item,
    onToggleActive,
    onDelete,
                            }: PostingCardProps) => {
    const applicationCount = item.applications?.length || 0
    const jobKeywords = item.job_posting_keywords?.filter(k => k.keyword.category === '직종') || []
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`
    }
    return (
        <TouchableOpacity
            onPress={() => router.push({
                pathname: '/(pages)/(company)/posting-detail2',
                params: { postingId: item.id }
            })}
            className={`mx-4 my-2 p-4 rounded-xl shadow-sm ${
                item.is_active ? 'bg-white' : 'bg-gray-100'
            }`}
        >
            {/* 상태 및 지원자 수 */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800">{item.title}</Text>
                    {jobKeywords.length > 0 && (
                        <View className="flex-row flex-wrap gap-1 mt-1">
                            {jobKeywords.slice(0, 3).map((k, index) => (
                                <Text key={index} className="text-xs text-gray-600">
                                    {k.keyword.keyword}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>
                <View className="items-end">
                    <View className={`px-2 py-1 rounded-full ${
                        item.is_active ? 'bg-green-100' : 'bg-gray-200'
                    }`}>
                        <Text className={`text-xs font-medium ${
                            item.is_active ? 'text-green-600' : 'text-gray-600'
                        }`}>
                            {item.is_active ? '모집중' : '마감'}
                        </Text>
                    </View>
                    <Text className="text-sm text-gray-600 mt-1">
                        지원자 {applicationCount}명
                    </Text>
                </View>
            </View>
            {/* 공고 정보 */}
            <View className="mb-3">
                <Text className="text-sm text-gray-500 mt-1">
                    등록일: {formatDate(item.created_at)}
                </Text>
            </View>
            {/* 액션 버튼들 */}
            <View className="flex-row gap-2 pt-3 border-t border-gray-200">
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation()
                        router.push({
                            pathname: '/job-posting-step1',
                            params: { jobPostingId: item.id }
                        })
                    }}
                    className="flex-1 py-2 rounded-lg bg-blue-50"
                >
                    <Text className="text-center text-blue-600 font-medium">수정</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation()
                        onToggleActive(item.id, item.is_active)
                    }}
                    className={`flex-1 py-2 rounded-lg ${
                        item.is_active ? 'bg-orange-50' : 'bg-green-50'
                    }`}
                >
                    <Text className={`text-center font-medium ${
                        item.is_active ? 'text-orange-600' : 'text-green-600'
                    }`}>
                        {item.is_active ? '마감' : '재개'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation()
                        onDelete(item.id, item.title)
                    }}
                    className="flex-1 py-2 rounded-lg bg-red-50"
                >
                    <Text className="text-center text-red-600 font-medium">삭제</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )
}