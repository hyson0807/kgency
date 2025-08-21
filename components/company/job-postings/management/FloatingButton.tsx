import {router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {TouchableOpacity} from "react-native";
import React from "react";
export const FloatingButton = () => {
    return (
        <TouchableOpacity
            onPress={() => router.push('/job-posting-step1')}
            className="absolute bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full items-center justify-center shadow-lg"
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
            }}
        >
            <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
    )
}