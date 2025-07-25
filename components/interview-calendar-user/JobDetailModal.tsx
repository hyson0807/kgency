import React, { useEffect, useState } from 'react'
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Linking } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'

interface JobPosting {
    id: string
    title: string
    description?: string
    hiring_count: number
    working_hours?: string
    working_hours_negotiable: boolean
    working_days?: string[]
    working_days_negotiable: boolean
    salary_range?: string
    salary_range_negotiable: boolean
    salary_type?: string
    pay_day?: string
    pay_day_negotiable: boolean
    job_address?: string
    interview_location?: string
    company?: {
        name: string
        address?: string
        phone_number?: string
        description?: string
    }
}

interface JobDetailModalProps {
    visible: boolean
    onClose: () => void
    jobPostingId: string
}

export const JobDetailModal = ({ visible, onClose, jobPostingId }: JobDetailModalProps) => {
    const [loading, setLoading] = useState(true)
    const [jobPosting, setJobPosting] = useState<JobPosting | null>(null)


    useEffect(() => {
        if (visible && jobPostingId) {
            fetchJobDetails()
        }
    }, [visible, jobPostingId])

    const fetchJobDetails = async () => {
        try {
            setLoading(true)
            const response = await api('GET', `/api/job-postings/${jobPostingId}`)
            setJobPosting(response.data)
        } catch (error) {
            console.error('Error fetching job details:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCall = () => {
        if (jobPosting?.company?.phone_number) {
            Linking.openURL(`tel:${jobPosting.company.phone_number}`)
        }
    }

    const handleMap = () => {
        const address = jobPosting?.interview_location || jobPosting?.job_address || jobPosting?.company?.address
        if (address) {
            const encodedAddress = encodeURIComponent(address)
            Linking.openURL(`https://map.kakao.com/link/search/${encodedAddress}`)
        }
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
                        <Text className="text-xl font-bold">공고 상세 정보</Text>
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
                            {jobPosting ? (
                                <>
                                    {/* Company Info */}
                                    {jobPosting.company && (
                                        <View className="mb-6">
                                            <Text className="text-lg font-bold mb-3">회사 정보</Text>
                                            <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                                                <InfoRow label="회사명" value={jobPosting.company.name} />
                                                {jobPosting.company.address && (
                                                    <InfoRow label="주소" value={jobPosting.company.address} />
                                                )}
                                                {jobPosting.company.phone_number && (
                                                    <InfoRow label="전화번호" value={jobPosting.company.phone_number} />
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    {jobPosting && (
                                        <View className="mb-6">
                                            <Text className="text-lg font-bold mb-3">면접 장소</Text>
                                            <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                                                <InfoRow label="위치" value={jobPosting.interview_location || jobPosting.job_address || jobPosting.company?.address || '회사 연력 요망'} />

                                            </View>
                                        </View>
                                    )}

                                    {/* Job Info */}
                                    <View className="mb-6">
                                        <Text className="text-lg font-bold mb-3">채용 정보</Text>
                                        <View className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            <InfoRow label="제목" value={jobPosting.title} />
                                            <InfoRow label="채용인원" value={`${jobPosting.hiring_count}명`} />
                                            
                                            {jobPosting.working_hours && (
                                                <InfoRow 
                                                    label="근무시간" 
                                                    value={`${jobPosting.working_hours}${jobPosting.working_hours_negotiable ? ' (협의 가능)' : ''}`} 
                                                />
                                            )}
                                            
                                            {jobPosting.working_days && jobPosting.working_days.length > 0 && (
                                                <InfoRow 
                                                    label="근무요일" 
                                                    value={`${jobPosting.working_days.join(', ')}${jobPosting.working_days_negotiable ? ' (협의 가능)' : ''}`} 
                                                />
                                            )}
                                            
                                            {jobPosting.salary_range && (
                                                <InfoRow 
                                                    label="급여" 
                                                    value={`${jobPosting.salary_range}${jobPosting.salary_type ? ` (${jobPosting.salary_type})` : ''}${jobPosting.salary_range_negotiable ? ' (협의 가능)' : ''}`} 
                                                />
                                            )}
                                            
                                            {jobPosting.pay_day && (
                                                <InfoRow 
                                                    label="급여일" 
                                                    value={`${jobPosting.pay_day}${jobPosting.pay_day_negotiable ? ' (협의 가능)' : ''}`} 
                                                />
                                            )}
                                            
                                            {jobPosting.job_address && (
                                                <InfoRow label="근무지" value={jobPosting.job_address} />
                                            )}
                                        </View>
                                    </View>

                                    {/* Job Description */}
                                    {jobPosting.description && (
                                        <View className="mb-6">
                                            <Text className="text-lg font-bold mb-3">업무 내용</Text>
                                            <View className="bg-gray-50 rounded-xl p-4">
                                                <Text className="text-sm text-gray-800 leading-5">
                                                    {jobPosting.description}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Company Description */}
                                    {jobPosting.company?.description && (
                                        <View className="mb-6">
                                            <Text className="text-lg font-bold mb-3">회사 소개</Text>
                                            <View className="bg-gray-50 rounded-xl p-4">
                                                <Text className="text-sm text-gray-800 leading-5">
                                                    {jobPosting.company.description}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {/* Action Buttons */}
                                    <View className="flex-row gap-3 mt-4">
                                        {jobPosting.company?.phone_number && (
                                            <TouchableOpacity
                                                onPress={handleCall}
                                                className="flex-1 flex-row items-center justify-center bg-green-50 py-3 rounded-lg"
                                            >
                                                <Ionicons name="call-outline" size={20} color="#16a34a" />
                                                <Text className="text-green-600 text-base font-medium ml-2">전화하기</Text>
                                            </TouchableOpacity>
                                        )}

                                        {(jobPosting.interview_location || jobPosting.job_address) && (
                                            <TouchableOpacity
                                                onPress={handleMap}
                                                className="flex-1 flex-row items-center justify-center bg-blue-50 py-3 rounded-lg"
                                            >
                                                <Ionicons name="map-outline" size={20} color="#3b82f6" />
                                                <Text className="text-blue-600 text-base font-medium ml-2">지도보기</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </>
                            ) : (
                                <View className="p-10 items-center">
                                    <Text className="text-gray-500">공고 정보를 불러올 수 없습니다.</Text>
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
        <Text className="text-base font-medium text-right flex-1 ml-3">{value}</Text>
    </View>
)