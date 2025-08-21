import { Text, View } from "react-native";
import React from "react";
import { useTranslation } from '@/contexts/TranslationContext';
import { CompanyHeaderCarousel } from './CompanyHeaderCarousel';

export const SecondHeader = () => {
    const { t } = useTranslation();
    
    return (
        <View className="bg-white p-4 mb-2">
            <View className="flex-row items-center justify-between mb-4">
                <View>
                    <Text className="text-lg font-bold text-gray-800">
                        {t('company.job_seekers_list', '구직자 목록')}
                    </Text>
                </View>
            </View>
            <CompanyHeaderCarousel />
        </View>
    )
}