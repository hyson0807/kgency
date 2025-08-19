import {View, Text, TextInput, TouchableOpacity, ScrollView} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useProfile} from "@/hooks/useProfile";
import {router} from "expo-router";
import { useModal } from '@/hooks/useModal'
const Register = () => {
    const { showModal, ModalComponent } = useModal()
    const { profile, updateProfile } = useProfile()
    const [companyName, setCompanyName] = useState('')
    const [address, setAddress] = useState('')
    // 프로필 정보 로드
    useEffect(() => {
        if (profile) {
            setCompanyName(profile.name || '')
            setAddress(profile.address || '')
        }
    }, [profile])
    const handleSave = async () => {
        if(!companyName || !address) {
            showModal('알림', '필수 정보를 모두 입력해주세요', "info")
            return
        }
        try {
            // 1. 프로필 업데이트
            const result = await updateProfile({
                profile: {
                    name: companyName,
                    address: address,
                    onboarding_completed: true
                }
            })
            if(!result) {
                return
            }
            router.push('/keywords')
        } catch (error) {
            showModal('오류', '저장 중 문제가 발생했습니다.', 'warning')
        }
    }
    return (
        <SafeAreaView className="flex-1">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="flex-1 justify-start p-6">
                    {/* 회사 정보 섹션 */}
                    <Text className="text-xl font-bold mb-4">회사 정보</Text>
                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">회사명 *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="회사명을 입력하세요"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />
                    </View>
                    <View className="mb-4">
                        <Text className="text-gray-700 mb-2">주소 *</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3"
                            placeholder="예: 서울시 강남구"
                            value={address}
                            onChangeText={setAddress}
                        />
                    </View>
                </View>
            </ScrollView>
            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-blue-500 py-4 rounded-xl items-center mx-4 mb-4"
                >
                    <Text className="text-center text-white font-bold text-lg">
                        회사 정보 입력
                    </Text>
                </TouchableOpacity>
            </View>
            <ModalComponent />
        </SafeAreaView>
    )
}
export default Register