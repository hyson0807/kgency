import {Image, Text, View} from "react-native";
import React from "react";


export const Header = () => {
    return (
        <View className="bg-white px-4 py-3 border-b border-gray-200">
            <View className="flex-row items-center">
                <Image 
                    source={require('@/assets/images/kgency_logo.png')}
                    className="w-10 h-10 mr-3"
                    resizeMode="contain"
                />
                <Text className="text-xl font-bold text-gray-800">K-gency</Text>
            </View>
        </View>
    )
}