import { View, Text } from 'react-native'
import React from 'react'
import KeywordTag from './KeywordTag'
import { useTranslation } from '@/contexts/TranslationContext'
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
               title
}) => {
        const { t, translateDB } = useTranslation();
    return (
        <View className="p-6">
            <Text className="font-bold mb-4">
                {title || t('work_conditions_selector.title', '원하는 혜택')}
            </Text>
            <View className="flex-row flex-wrap gap-3">
                {conditions.map(condition => (
                    <KeywordTag
                        key={condition.id}
                        id={condition.id}
                        text={translateDB('keyword', 'keyword', condition.id.toString(), condition.keyword)}
                        isSelected={selectedConditions.includes(condition.id)}
                        onPress={onToggle}
                    />
                ))}
            </View>
        </View>
    )
}

export default WorkConditionsSelector