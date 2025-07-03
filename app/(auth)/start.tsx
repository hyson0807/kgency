import {View, Text, SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native'
import React from 'react'
import {LinearGradient} from "expo-linear-gradient";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {router} from "expo-router";

const Start = () => {
    return (
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >

                <View className="mb-10 gap-5">
                    <Text style={styles.title}>일자리 찾고 있나요?</Text>
                    <Text style={styles.subtitle}>30초만에 나에게 딱 맞는{'\n'} 일자리를 찾아드릴께요</Text>
                </View>

                <TouchableOpacity
                    className="flex w-[240px] h-16 bg-white rounded-full items-center justify-center"
                    onPress={() => router.push('/user_login')}
                >
                    <Text className="text-[#667eea] text-xl font-bold">시작하기</Text>
                </TouchableOpacity>

                <View className="flex-row items-center justify-center mt-10 gap-4">
                    <TouchableOpacity>
                        <MaterialIcons name="language" size={30} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="border rounded-full p-2"
                        onPress={() => router.push('/company_login')}
                    >
                        <Text>구인자 로그인</Text>
                    </TouchableOpacity>
                </View>

            </LinearGradient>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',

    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 18,
        textAlign: 'center',
        color: 'white',
    }
})


export default Start
