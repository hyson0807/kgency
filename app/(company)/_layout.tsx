import React from 'react'
import {Tabs} from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Feather from '@expo/vector-icons/Feather';


const company_Layout = () => {
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
                name="home2"
                options={{
                    tabBarLabel: '홈',
                    tabBarIcon: ({size, color}) => <Ionicons name='home' size={size} color={color}/>
                }}
            />

            <Tabs.Screen
                name="jobPosting"
                options={{
                    tabBarLabel: '내 공고',
                    tabBarIcon: ({size, color}) => <Entypo name="add-to-list" size={size} color={color} />
                }}
            />

            <Tabs.Screen
                name="inbox"
                options={{
                    tabBarLabel: '메시지',

                    tabBarIcon: ({size, color}) => <Feather name="mail" size={size} color={color} />
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

