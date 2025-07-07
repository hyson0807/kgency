import React from 'react'
import {Tabs} from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTranslation } from "@/contexts/TranslationContext";

const user_Layout = () => {
    const { t, translateDB, language } = useTranslation();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: 'blue',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    height: 70,

                },
            }}
        >

            <Tabs.Screen
                name="home"

                options={{
                    tabBarLabel: t('tab.home', '홈'),
                    tabBarIcon: ({size, color}) => <Ionicons name='home' size={size} color={color}/>
                }}
            />

            <Tabs.Screen
                name="myposting"
                options={{
                    tabBarLabel: t('tab.my_posting', '내공고'),
                    tabBarIcon: ({size, color}) => <Entypo name="v-card" size={size} color={color} />
                }}
            />

            <Tabs.Screen
                name="applications"
                options={{
                    tabBarLabel: t('tab.applications', '지원내역'),

                    tabBarIcon: ({size, color}) => <AntDesign name="copy1" size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarLabel: t('tab.settings', '설정'),
                    tabBarIcon: ({size, color}) => <MaterialIcons name="settings" size={size} color={color} />
                }}
            />
        </Tabs>
    )
}
export default user_Layout
