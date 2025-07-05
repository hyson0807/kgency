import {View, Text, TextInput, TouchableOpacity, Alert} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useProfile} from "@/hooks/useProfile";
import {router} from "expo-router";

const Register = () => {

    const { profile, updateProfile } = useProfile()

    // 회사 정보 상태
    const [companyName, setCompanyName] = useState('')
    const [address, setAddress] = useState('')
    const [description, setDescription] = useState('')

    // 프로필 정보 로드
    useEffect(() => {
        if (profile) {
            setCompanyName(profile.name || '')
            setAddress(profile.address || '')
            setDescription(profile.description || '')
        }
    }, [profile])

    const handleSave = async () => {
        if(!companyName || !address || !description) {
            Alert.alert('알림', '필수 정보를 모두 입력해주세요.')
            return
        }
        const result = await updateProfile({
            profile: {
                name: companyName,
                address: address,
                description: description,
                onboarding_completed: true
            }
        })
        if(!result) {
            console.log('프로필 업데이트 실패', result);
            return
        }
        router.replace('/(company)/home')
    }


    return (
        <SafeAreaView className="flex-1">
        <View className="flex-1 p-6 border-b border-gray-100">
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

            <View className="mb-4">
                <Text className="text-gray-700 mb-2">회사 소개 *</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder="회사를 소개해주세요"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                />
            </View>

            {/* 하단 버튼 */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSave}
                    className={`py-4 rounded-xl ${
                         'bg-blue-500'
                    }`}
                >
                    <Text className="text-center text-white font-bold text-lg">
                        회사 정보 입력
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
        </SafeAreaView>
    )
}
export default Register
