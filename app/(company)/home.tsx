import {View, Text} from 'react-native'
import React, {useEffect} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/contexts/AuthContext";
import {useUsers} from "@/hooks/useUsers";
import {router} from "expo-router";

const Home = () => {
    const {user} = useAuth(); //userId, phone, usertype
    const { fetchUsers } = useUsers({includeKeywords: true})

    useEffect(() => {
        fetchUsers();
    }, [])

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 justify-center items-center">
                <Text> company Home</Text>
                <Text onPress={() => router.push('/(pages)/(company)/info')}>info</Text>
            </View>
        </SafeAreaView>
    )
}
export default Home
