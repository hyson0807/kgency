import {View, Text} from 'react-native'
import React, {useEffect} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useProfile} from "@/hooks/useProfile";
import {router} from "expo-router";


const Info = () => {

    const { profile } = useProfile();

    useEffect(() => {

    }, [profile]);

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 justify-center items-center">
                <Text>회사 공고 등록하기 페이지</Text>
                <Text>{profile?.name}</Text>
                <Text onPress={() => router.back()}>back</Text>
            </View>
        </SafeAreaView>
    )
}
export default Info
