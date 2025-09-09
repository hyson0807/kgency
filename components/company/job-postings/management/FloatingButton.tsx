import {router} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import {TouchableOpacity} from "react-native";
import React from "react";
export const FloatingButton = () => {
    return (
        <TouchableOpacity
            onPress={() => router.push('/job-posting-step1')}
            style={{
                position: 'absolute',
                bottom: 90,
                right: 24,
                width: 56,
                height: 56,
                backgroundColor: '#3b82f6',
                borderRadius: 28,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
                zIndex: 999,
            }}
        >
            <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
    )
}