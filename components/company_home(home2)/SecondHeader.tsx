import {Text, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";
import React from "react";


export const SecondHeader = () => {
    return (
        <View className="bg-white p-4 mb-2">
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="text-lg font-bold text-gray-800">구직자 목록</Text>
                    {/*<Text className="text-sm text-gray-600 mt-1">*/}
                    {/*    총 {matchedJobSeekers.length}명의 구직자*/}
                    {/*</Text>*/}
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/(pages)/(company)/keywords')}
                    className="bg-blue-100 px-4 py-2 rounded-lg"
                >
                    <Text className="text-blue-600 font-medium py-2">우리 회사랑 맞는 인재 찾기!</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}