import React from 'react'
import {Tabs} from "expo-router";
import { Ionicons } from "@expo/vector-icons"
import Entypo from '@expo/vector-icons/Entypo';


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
                name="info"
                options={{
                    tabBarIcon: ({size, color}) => <Entypo name="v-card" size={size} color={color} />
                }}
            />
        </Tabs>
    )
}
export default user_Layout
