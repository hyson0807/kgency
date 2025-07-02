import { Text, TouchableOpacity } from 'react-native'
import React from 'react'

interface KeywordTagProps {
    id: number;
    text: string;
    isSelected: boolean;
    onPress: (id: number) => void;
}

const KeywordTag: React.FC<KeywordTagProps> = ({ id, text, isSelected, onPress }) => {
    return (
        <TouchableOpacity
            onPress={() => onPress(id)}
            className={`px-4 py-3 rounded-full border-2 ${
                isSelected
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
            }`}
        >
            <Text className={`text-base ${
                isSelected
                    ? 'text-white font-bold'
                    : 'text-gray-700'
            }`}>
                {text}
            </Text>
        </TouchableOpacity>
    )
}

export default KeywordTag