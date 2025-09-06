import React from 'react'
import {Tabs} from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTranslation } from "@/contexts/TranslationContext";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, Animated } from 'react-native';
import { useTabBar } from '@/contexts/TabBarContext';
import { useUnreadMessage } from '@/contexts/UnreadMessageContext';
import TabIconWithBadge from '@/components/shared/TabIconWithBadge';
const UserLayout = () => {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { isTabBarVisible, translateY } = useTabBar();
    const { totalUnreadCount } = useUnreadMessage();
    
    const maxHeight = (Platform.OS === 'ios' ? 50 : 60) + insets.bottom;
    const maxPadding = insets.bottom + 10;
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#10b981',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: 'white',
                    height: maxHeight,
                    paddingBottom: maxPadding,
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    transform: [{ translateY }],
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 5,
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
                name="user-chats"
                options={{
                    tabBarLabel: t('tab.chats', '채팅'),
                    tabBarIcon: ({size, color}) => (
                        <TabIconWithBadge 
                            name="chatbubbles" 
                            size={size} 
                            color={color} 
                            badgeCount={totalUnreadCount}
                        />
                    )
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
export default UserLayout
