import {View, Text, TouchableOpacity} from 'react-native'
import React from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';
import {router} from "expo-router";
interface BackProps {
    onPress?: () => void;
}
const Back: React.FC<BackProps> = ({ onPress }) => {
    return (
        <TouchableOpacity
            onPress={onPress || (() => router.back())}
            className="flex items-center justify-center w-12 h-12"
        >
            <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
    )
}
export default Back
