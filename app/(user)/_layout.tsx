import React from 'react'
import {Tabs} from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const user_Layout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    backgroundColor: 'white',
                    borderTopWidth: 1,
                    height: 60,
                },
            }}
        >

            <Tabs.Screen
                name="home"
                options={{
                    tabBarIcon: ({size, color}) => <Ionicons name='home' size={size} color={color}/>
                }}
            />

            <Tabs.Screen
                name="myposting"
                options={{
                    tabBarLabel: '내 공고',
                    tabBarIcon: ({size, color}) => <Ionicons name="document-text" size={size} color={color} />
                }}
            />

            <Tabs.Screen
                name="applications"
                options={{
                    tabBarIcon: ({size, color}) => <Entypo name="v-card" size={size} color={color} />
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({size, color}) => <MaterialIcons name="settings" size={size} color={color} />
                }}
            />
        </Tabs>
    )
}
export default user_Layout
