import {View, Text, ActivityIndicator} from 'react-native'
import React from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useTranslation} from "@/contexts/TranslationContext";

const LoadingScreen = () => {
    const {t} = useTranslation();

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-2 text-gray-600">{t('applications.loading', '로딩 중...')}</Text>
            </View>
        </SafeAreaView>
    )
}
export default LoadingScreen
