import {Ionicons} from "@expo/vector-icons";
import {Text, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";
import React from "react";
export const Empty = () => {
    return (
        <View className="flex-1 justify-center items-center p-8">
            <Ionicons name="document-text-outline" size={80} color="#9ca3af" />
            <Text className="text-gray-500 text-lg mt-4">
                아직 등록한 공고가 없습니다
            </Text>
            <TouchableOpacity
                onPress={() => router.push('/(pages)/(company)/(job-posting-registration)/job-posting-step1')}
                className="mt-4 px-6 py-3 bg-blue-500 rounded-xl"
            >
                <Text className="text-white font-medium">첫 공고 등록하기</Text>
            </TouchableOpacity>
        </View>
    )
}