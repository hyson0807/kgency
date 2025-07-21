import React from 'react'
import {Text, TouchableOpacity, View} from "react-native";




interface TapProps {
    setActiveFilter: (filter: 'all' | 'user_initiated' | 'company_invited') => void,
    activeFilter: string,
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
}


export const Tap = ({setActiveFilter, activeFilter, t}: TapProps) => {


    return (
        <View className="flex-row px-4">
            <TouchableOpacity
                onPress={() => setActiveFilter('all')}
                className={`mr-4 pb-3 ${
                    activeFilter === 'all' ? 'border-b-2 border-blue-500' : ''
                }`}
            >
                <Text className={`${
                    activeFilter === 'all' ? 'text-blue-500 font-bold' : 'text-gray-600'
                }`}>
                    {t('applications.filter_all', '전체')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setActiveFilter('user_initiated')}
                className={`mr-4 pb-3 ${
                    activeFilter === 'user_initiated' ? 'border-b-2 border-blue-500' : ''
                }`}
            >
                <Text className={`${
                    activeFilter === 'user_initiated' ? 'text-blue-500 font-bold' : 'text-gray-600'
                }`}>
                    {t('applications.filter_user_initiated', '내가 지원')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setActiveFilter('company_invited')}
                className={`pb-3 ${
                    activeFilter === 'company_invited' ? 'border-b-2 border-blue-500' : ''
                }`}
            >
                <Text className={`${
                    activeFilter === 'company_invited' ? 'text-blue-500 font-bold' : 'text-gray-600'
                }`}>
                    {t('applications.filter_company_invited', '회사 초대')}
                </Text>
            </TouchableOpacity>
        </View>
    )
}