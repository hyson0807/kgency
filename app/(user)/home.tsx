import {View, Text} from 'react-native'
import React from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/contexts/AuthContext";

const Home = () => {
    const { logout } = useAuth();

    return (
        <SafeAreaView>
            <View>
                <Text>user Home</Text>
                <Text onPress={logout}>logout</Text>
            </View>
        </SafeAreaView>
    )
}
export default Home
