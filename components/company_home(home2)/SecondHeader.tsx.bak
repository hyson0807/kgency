import {Text, TouchableOpacity, View} from "react-native";
import {router} from "expo-router";
import React from "react";
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from '@/contexts/TranslationContext';


export const SecondHeader = () => {
    const { t } = useTranslation();
    
    return (
        <View className="bg-white p-4 mb-2">

            <View className="flex-row items-center justify-between mb-4">
                <View>
                    <Text className="text-lg font-bold text-gray-800">구직자 목록</Text>
                    {/*<Text className="text-sm text-gray-600 mt-1">*/}
                    {/*    총 {matchedJobSeekers.length}명의 구직자*/}
                    {/*</Text>*/}
                </View>
            </View>

            <LinearGradient
                colors={['#10B981', '#34D399', '#6EE7B7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 24, marginBottom: 16 }}
            >
                <View className="items-center">
                    <Text className="text-white text-xl font-bold text-center mt-2">
                        {t('company.perfect_talent_title', '🎯 완벽한 인재 매칭')}
                    </Text>
                    <Text className="text-white text-sm text-center mt-2 opacity-90">
                        {t('company.talent_match_description', '우리 회사와 딱 맞는 인재를 찾아보세요!')}
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/(pages)/(company)/(company-information)/keywords')}
                        className="bg-white rounded-full px-6 py-3 mt-4"
                    >
                        <Text className="text-emerald-600 font-bold text-center">
                            {t('company.find_talent_button', '우리 회사랑 맞는 인재 찾기')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            

        </View>
    )
}