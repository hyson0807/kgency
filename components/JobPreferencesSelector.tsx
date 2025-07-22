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
        const { t, translateDB } = useTranslation();
    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">
                {title || t('job_selector.title', '희망직종')}
            </Text>
            <View className="flex-row flex-wrap gap-3">
                {jobs.map(job => (
                    <KeywordTag
                        key={job.id}
                        id={job.id}
                        text={translateDB('keyword', 'keyword', job.id.toString(), job.keyword)}
                        isSelected={selectedJobs.includes(job.id)}
                        onPress={onToggle}
                    />
                ))}
            </View>
        </View>
    )
}

export default JobPreferencesSelector