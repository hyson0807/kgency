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
            className={`px-4 py-2.5 rounded-xl border ${
                isSelected
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200'
            }`}
        >
            <Text className={`text-sm font-medium ${
                isSelected
                    ? 'text-blue-700'
                    : 'text-gray-600'
            }`}>
                {text}
            </Text>
        </TouchableOpacity>
    )
}

export default KeywordTag