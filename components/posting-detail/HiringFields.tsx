import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from '@/contexts/TranslationContext';
import { sortWorkDayKeywords } from '@/lib/utils/keywordUtils';

interface Keyword {
    id: number;
    keyword: string;
}

interface Keywords {
    conditions: Keyword[];
    countries: Keyword[];
    jobs: Keyword[];
    gender: Keyword[];
    age: Keyword[];
    visa: Keyword[];
    koreanLevel: Keyword[];
    workDay: Keyword[];
}

interface HiringFieldsProps {
    keywords: Keywords;
    translateDB: (table: string, column: string, id: string, defaultValue: string) => string;
}

const HiringFields = ({ keywords, translateDB }: HiringFieldsProps) => {
    const { t } = useTranslation();

    if (!keywords) return null;

    return (

    <View className="flex-1">

        <View className="p-6 border-b border-gray-100">
            <Text className="text-lg font-semibold mb-4">{t('posting_detail.company_benefits', '회사의 강점!')}</Text>
            {keywords.conditions.length > 0 && (
                <View className="mb-4">
                    <View className="flex-row flex-wrap gap-2">
                        {keywords.conditions.map((keyword) => (
                            <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full">
                                <Text className="text-orange-700 text-sm">
                                    {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>

        <View className="p-6">
            <Text className="text-lg font-semibold mb-4">{t('posting_detail.hiring_fields', '채용 분야')}</Text>

            {keywords.countries.length > 0 && (
                <View className="mb-4">
                    <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.target_countries', '대상 국가')}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {keywords.countries.map((keyword) => (
                            <View key={keyword.id} className="bg-purple-100 px-3 py-1 rounded-full">
                                <Text className="text-purple-700 text-sm">
                                    {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {keywords.jobs.length > 0 && (
                <View className="mb-4">
                    <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.job_positions', '모집 직종')}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {keywords.jobs.map((keyword) => (
                            <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full">
                                <Text className="text-orange-700 text-sm">
                                    {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {keywords.gender.length > 0 && (
                <View className="mb-4">
                    <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.target_gender', '모집 성별')}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {keywords.gender.map((keyword) => (
                            <View key={keyword.id} className="bg-blue-100 px-3 py-1 rounded-full">
                                <Text className="text-blue-700 text-sm">
                                    {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {keywords.koreanLevel.length > 0 && (
                <View className="mb-4">
                    <Text className="text-gray-600 font-medium mb-2">한국어 수준</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {keywords.koreanLevel.map((keyword) => (
                            <View key={keyword.id} className="bg-blue-100 px-3 py-1 rounded-full">
                                <Text className="text-blue-700 text-sm">
                                    {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {keywords.age.length > 0 && (
                <View className="mb-4">
                    <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.target_age', '모집 나이대')}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {keywords.age.map((keyword) => (
                            <View key={keyword.id} className="bg-green-100 px-3 py-1 rounded-full">
                                <Text className="text-green-700 text-sm">
                                    {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {keywords.visa.length > 0 && (
                <View className="mb-4">
                    <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.available_visa', '지원 가능한 비자')}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {keywords.visa.map((keyword) => (
                            <View key={keyword.id} className="bg-yellow-100 px-3 py-1 rounded-full">
                                <Text className="text-yellow-700 text-sm">
                                    {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {keywords.workDay.length > 0 && (
                <View className="mb-4">
                    <Text className="text-gray-600 font-medium mb-2">{t('posting_detail.work_days', '근무 요일')}</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {sortWorkDayKeywords(keywords.workDay).map((keyword) => (
                            <View key={keyword.id} className="bg-indigo-100 px-3 py-1 rounded-full">
                                <Text className="text-indigo-700 text-sm">
                                    {translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword)}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    </View>
    );
};

export default HiringFields;