import {View, Text} from 'react-native'
import React from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/contexts/AuthContext";

const Settings = () => {
    const {logout} = useAuth();

    return (
        <SafeAreaView className="flex-1">
            <View className="flex-1 justify-center items-center">
                <Text>Settings</Text>
                <Text onPress={logout}>Logout</Text>
            </View>
        </SafeAreaView>
    )
}
export default Settings
