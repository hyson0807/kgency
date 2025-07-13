import React from 'react'
import {Text, TouchableOpacity, View} from "react-native";




interface TapProps {
    setActiveFilter: (filter: 'all' | 'pending' | 'reviewed') => void,
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
                onPress={() => setActiveFilter('pending')}
                className={`mr-4 pb-3 ${
                    activeFilter === 'pending' ? 'border-b-2 border-blue-500' : ''
                }`}
            >
                <Text className={`${
                    activeFilter === 'pending' ? 'text-blue-500 font-bold' : 'text-gray-600'
                }`}>
                    {t('applications.filter_pending', '검토중')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => setActiveFilter('reviewed')}
                className={`pb-3 ${
                    activeFilter === 'reviewed' ? 'border-b-2 border-blue-500' : ''
                }`}
            >
                <Text className={`${
                    activeFilter === 'reviewed' ? 'text-blue-500 font-bold' : 'text-gray-600'
                }`}>
                    {t('applications.filter_reviewed', '검토완료')}
                </Text>
            </TouchableOpacity>
        </View>
    )
}