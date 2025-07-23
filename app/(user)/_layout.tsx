import React, {useEffect} from 'react'
import {Tabs} from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTranslation } from "@/contexts/TranslationContext";
import {useAuth} from "@/contexts/AuthContext";

const User_Layout = () => {
    const { t } = useTranslation();
    const {user} = useAuth();
    console.log("유저정보123123", user)

    useEffect(() => {
        console.log("유저정보123123", user)
    }, []);

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
                name="applications"
                options={{
                    tabBarLabel: t('tab.applications', '지원내역'),

                    tabBarIcon: ({size, color}) => <AntDesign name="copy1" size={size} color={color} />
                }}
            />

            <Tabs.Screen
                name="user-calendar"
                options={{
                    tabBarLabel: t('tab.schedule', '일정'),

                    tabBarIcon: ({size, color}) => <Ionicons name="calendar" size={size} color={color} />
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
export default User_Layout
