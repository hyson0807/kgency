import {View, Text, ScrollView, TextInput, Switch, TouchableOpacity} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/contexts/AuthContext";
import {useUserKeywords} from "@/hooks/useUserKeywords";
import LoadingScreen from "@/components/LoadingScreen";

const Info = () => {

    const {profile, updateProfile, logout} = useAuth();
    const [address, setAddress] = useState(profile?.address || '');

    const { keywords, loading, updateKeywords } = useUserKeywords();
    if(loading) return <LoadingScreen/>

    const country =


    const handleSaveAndNext = async () => {
        await updateProfile({address});
    }




    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 items-center">
                <View className="w-full bg-green-700 p-6">
                    <Text className="text-3xl font-bold">원하는 조건을 선택해 주세요</Text>
                    <Text className="text-xl">중요한 것만 골라주세요</Text>
                </View>
                <ScrollView className="flex-1 w-full">
                    <View className="w-full bg-pink-400 p-6">
                        <Text className="text-3xl font-bold">거주지 & 이동 가능</Text>
                        <View className="m-2 p-4 gap-4 bg-white rounded-xl">
                            <TextInput
                                className="w-full border-2 p-5 rounded-xl"
                                placeholder="현재 거주지 입력(예: 서울 강남구)"
                                value={address}
                                onChangeText={setAddress}
                            />
                            <View className="flex-row items-center justify-between">
                                <Text className="text-xl">지역이동 가능</Text>
                                <Switch/>
                            </View>
                        </View>
                    </View>
                    <View className="w-full bg-blue-200 p-6">
                        <Text className="text-3xl font-bold">국가</Text>
                        <View className="m-2 p-4 gap-4 bg-white rounded-xl">

                        </View>
                    </View>

                    <View className="w-full bg-yellow-100 p-6">
                        <TouchableOpacity
                            className="flex w-full bg-blue-200 items-center justify-center p-6 rounded-xl"
                            onPress={handleSaveAndNext}
                        >
                            <Text className="font-bold text-3xl">매칭 일자리 보기</Text>
                        </TouchableOpacity>
                    </View>

                    <Text onPress={logout}>logout</Text>
                </ScrollView>
            </View>
        </SafeAreaView>
    )
}
export default Info
