import React from 'react'
import {Tabs} from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useTabBar } from '@/contexts/TabBarContext';
const company_Layout = () => {
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
                name="home2"
                options={{
                    tabBarLabel: '홈',
                    tabBarIcon: ({size, color}) => <Ionicons name='home' size={size} color={color}/>
                }}
            />
            <Tabs.Screen
                name="myJobPostings"
                options={{
                    tabBarLabel: '내 공고',
                    tabBarIcon: ({size, color}) => <Entypo name="add-to-list" size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="interview-calendar"
                options={{
                    tabBarLabel: '면접 관리',
                    tabBarIcon: ({size, color}) => <Ionicons name="calendar" size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="settings2"
                options={{
                    tabBarLabel: '설정',
                    tabBarIcon: ({size, color}) => <MaterialIcons name="settings" size={size} color={color} />
                }}
            />
        </Tabs>
    )
}
export default company_Layout
