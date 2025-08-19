import React from 'react'
import {Tabs} from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTranslation } from "@/contexts/TranslationContext";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useTabBar } from '@/contexts/TabBarContext';
const User_Layout = () => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { isTabBarVisible } = useTabBar();
    
    const maxHeight = (Platform.OS === 'ios' ? 50 : 60) + insets.bottom;
    const maxPadding = insets.bottom + 10;
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: 'blue',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: Platform.OS === 'ios' ? {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    height: isTabBarVisible ? maxHeight : 0,
                    paddingBottom: isTabBarVisible ? maxPadding : 0,
                    overflow: 'hidden',
                    position: isTabBarVisible ? 'relative' : 'absolute',
                    bottom: isTabBarVisible ? 0 : -maxHeight,
                } : {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    height: isTabBarVisible ? maxHeight : 0,
                    paddingBottom: isTabBarVisible ? maxPadding : 0,
                    overflow: 'hidden',
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
                name="shop"
                options={{
                    tabBarLabel: t('tab.shop', '상점'),
                    tabBarIcon: ({size, color}) => <Ionicons name="storefront" size={size} color={color} />
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
