import {View, Text} from 'react-native'
import React from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/contexts/AuthContext";
import {router} from "expo-router";

const Home = () => {
    const { logout } = useAuth();

    return (
        <SafeAreaView>
            <View>
                <Text>user Home</Text>
                <Text onPress={logout}>logout</Text>
                <Text onPress={() => router.replace('/(user)/info')}>info</Text>
            </View>
        </SafeAreaView>
    )
}
export default Home
