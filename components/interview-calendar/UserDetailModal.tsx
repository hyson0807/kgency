import React, { useEffect, useState } from 'react'
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { userAPI } from '@/lib/api/userAPI'

interface UserInfo {
    name: string
    age: number
    gender: string
    visa: string
    korean_level: string
    how_long: string
    experience: string
    experience_content?: string
    topic?: string
}

interface Keyword {
    id: number
    keyword: string
    category: string
}

interface UserDetailModalProps {
    visible: boolean
    onClose: () => void
    userId: string
}

export const UserDetailModal = ({ visible, onClose, userId }: UserDetailModalProps) => {
    const [loading, setLoading] = useState(true)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [keywords, setKeywords] = useState<Keyword[]>([])
    const [profileName, setProfileName] = useState<string>('')

    useEffect(() => {
        if (visible && userId) {
            fetchUserDetails()
        }
    }, [visible, userId])

    const fetchUserDetails = async () => {
        try {
            setLoading(true)

            const data = await userAPI.getUserDetails(userId)

            if (data) {
                setUserInfo(data.userInfo)
                setProfileName(data.profile.name) // profiles 테이블의 name 사용
                
                // 기본 정보에 있는 카테고리는 제외
                const excludedCategories = ['성별', '나이대', '비자', '한국어수준']
                const filteredKeywords = data.keywords.filter(
                    (keyword: Keyword) => !excludedCategories.includes(keyword.category)
                )
                setKeywords(filteredKeywords)
            }
        } catch (error) {
            console.error('Error fetching user details:', error)
        } finally {
            setLoading(false)
        }
    }

    const getCategoryIcon = (category: string) => {
        const iconMap: { [key: string]: string } = {
            '국가': 'globe-outline',
            '직종': 'briefcase-outline',
            '근무조건': 'clipboard-outline',
            '지역': 'location-outline',
            '비자': 'document-text-outline',
            '근무요일': 'calendar-outline',
            '한국어수준': 'language-outline',
            '성별': 'person-outline',
            '지역이동': 'car-outline'
        }
        return iconMap[category] || 'ellipse-outline'
    }

    const getCategoryLabel = (category: string) => {
        const labelMap: { [key: string]: string } = {
            '국가': '국가',
            '직종': '희망 직종',
            '근무조건': '희망 헤택',
            '지역': '희망 지역',
            '비자': '비자 상태',
            '근무요일': '희망 근무요일',
            '한국어수준': '한국어 수준',
            '성별': '성별',
            '나이대': '연령대',
            '지역이동': '이동 가능 여부'
        }
        return labelMap[category] || category
    }

    const groupKeywordsByCategory = () => {
        const grouped: { [key: string]: Keyword[] } = {}
        keywords.forEach(keyword => {
            if (!grouped[keyword.category]) {
                grouped[keyword.category] = []
            }
            grouped[keyword.category].push(keyword)
        })
        return grouped
    }

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50">
                <TouchableOpacity 
                    className="flex-1" 
                    activeOpacity={1} 
                    onPress={onClose}
                />
                <View className="bg-white rounded-t-3xl h-4/5">
                    {/* Header */}
                    <View className="flex-row items-center justify-between p-5 border-b border-gray-100">
                        <Text className="text-xl font-bold">지원자 상세 정보</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View className="p-10 items-center">
                            <ActivityIndicator size="large" color="#3b82f6" />
                        </View>
                    ) : (
                        <ScrollView 
                            style={{ flex: 1 }}
                            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                            showsVerticalScrollIndicator={true}
                            bounces={true}
                        >
                            {userInfo ? (
                                <>
                                    {/* Basic Info */}
                                    <View className="mb-6">
                                        <Text className="text-lg font-bold mb-3">기본 정보</Text>
                                        <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            <InfoRow label="이름" value={profileName} />
                                            <InfoRow label="나이" value={`${userInfo.age}세`} />
                                            <InfoRow label="성별" value={userInfo.gender} />
                                            <InfoRow label="비자" value={userInfo.visa} />
                                            <InfoRow label="한국어 수준" value={userInfo.korean_level} />
                                            <InfoRow label="희망 근무 기간" value={userInfo.how_long} />
                                            {userInfo.topic && (
                                                <InfoRow label="토픽" value={userInfo.topic} />
                                            )}
                                        </View>
                                    </View>



                                    {/* Keywords */}
                                    <View className="mb-6">
                                        <Text className="text-lg font-bold mb-3">선택 키워드</Text>
                                        {Object.entries(groupKeywordsByCategory()).map(([category, categoryKeywords]) => (
                                            <View key={category} className="mb-4">
                                                <View className="flex-row items-center mb-2">
                                                    <Ionicons
                                                        name={getCategoryIcon(category) as any}
                                                        size={18}
                                                        color="#6b7280"
                                                    />
                                                    <Text className="text-sm font-medium text-gray-700 ml-1">
                                                        {getCategoryLabel(category)}
                                                    </Text>
                                                </View>
                                                <View className="flex-row flex-wrap gap-2">
                                                    {categoryKeywords.map(keyword => (
                                                        <View
                                                            key={keyword.id}
                                                            className="bg-blue-100 px-3 py-1.5 rounded-full"
                                                        >
                                                            <Text className="text-sm text-blue-700">
                                                                {keyword.keyword}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        ))}
                                    </View>
                                </>
                            ) : (
                                <View className="p-10 items-center">
                                    <Text className="text-gray-500">사용자 정보를 불러올 수 없습니다.</Text>
                                </View>
                            )}
                        </ScrollView>
                    )}
                </View>
            </View>
        </Modal>
    )
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <View className="flex-row justify-between">
        <Text className="text-sm text-gray-600">{label}</Text>
        <Text className="text-base font-medium">{value}</Text>
    </View>
)