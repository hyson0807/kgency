import { View, Text } from 'react-native'
import React from 'react'
import KeywordTag from './KeywordTag'

interface Keyword {
    id: number;
    keyword: string;
    category: string;
}

interface WorkConditionsSelectorProps {
    conditions: Keyword[];
    selectedConditions: number[];
    onToggle: (conditionId: number) => void;
    title?: string;
}

const WorkConditionsSelector: React.FC<WorkConditionsSelectorProps> = ({
               conditions,
               selectedConditions,
               onToggle,
               title = "원하는 혜택"
}) => {
    return (
        <View className="p-6">
            <Text className="text-2xl font-bold mb-4">{title}</Text>
            <View className="flex-row flex-wrap gap-3">
                {conditions.map(condition => (
                    <KeywordTag
                        key={condition.id}
                        id={condition.id}
                        text={condition.keyword}
                        isSelected={selectedConditions.includes(condition.id)}
                        onPress={onToggle}
                    />
                ))}
            </View>
        </View>
    )
}

export default WorkConditionsSelector