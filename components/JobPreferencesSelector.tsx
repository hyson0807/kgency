import { View, Text } from 'react-native'
import React from 'react'
import KeywordTag from './KeywordTag'
import { useTranslation } from '@/contexts/TranslationContext'
interface Keyword {
    id: number;
    keyword: string;
    category: string;
}

interface JobPreferencesSelectorProps {
    jobs: Keyword[];
    selectedJobs: number[];
    onToggle: (jobId: number) => void;
    title?: string;
}

const JobPreferencesSelector: React.FC<JobPreferencesSelectorProps> = ({
                           jobs,
                           selectedJobs,
                           onToggle,
                           title
                       }) => {
        const { t } = useTranslation();
    return (
        <View className="p-6">
            <Text className=" font-bold mb-4">
                {title || t('job_selector.title', '희망직종')}
            </Text>
            <View className="flex-row flex-wrap gap-3">
                {jobs.map(job => (
                    <KeywordTag
                        key={job.id}
                        id={job.id}
                        text={job.keyword}
                        isSelected={selectedJobs.includes(job.id)}
                        onPress={onToggle}
                    />
                ))}
            </View>
        </View>
    )
}

export default JobPreferencesSelector