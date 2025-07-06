import {View, Text, SafeAreaView, StyleSheet, TouchableOpacity} from 'react-native'
import React from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {router} from "expo-router";

const Start = () => {
    return (
        <SafeAreaView style={styles.container}>
            <View className="flex-1 items-center justify-center px-6">
                {/* 로고 영역 */}
                <View className="mb-8">
                    <View className="w-24 h-24 bg-blue-100 rounded-3xl items-center justify-center mb-6">
                        <MaterialIcons name="work" size={48} color="#3b82f6" />
                    </View>
                </View>

                {/* 메인 텍스트 */}
                <View className="mb-12 gap-4">
                    <Text className="text-3xl font-bold text-gray-900 text-center">
                        일자리 찾고 있나요?
                    </Text>
                    <Text className="text-lg text-center text-gray-600 leading-7">
                        30초만에 나에게 딱 맞는{'\n'}일자리를 찾아드릴께요
                    </Text>
                </View>

                {/* 시작하기 버튼 */}
                <TouchableOpacity
                    className="w-[240px] h-16 bg-blue-500 rounded-full items-center justify-center shadow-lg mb-8"
                    onPress={() => router.push('/user_login')}
                    style={{
                        shadowColor: '#3b82f6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    <Text className="text-white text-xl font-bold">시작하기</Text>
                </TouchableOpacity>

                {/* 하단 옵션 */}
                <View className="flex-row items-center justify-center gap-6">
                    <TouchableOpacity className="p-2">
                        <MaterialIcons name="language" size={28} color="#6b7280" />
                    </TouchableOpacity>

                    <View className="w-px h-6 bg-gray-300" />

                    <TouchableOpacity
                        className="py-2 px-4"
                        onPress={() => router.push('/company_login')}
                    >
                        <Text className="text-gray-600 font-medium">구인자 로그인</Text>
                    </TouchableOpacity>
                </View>


            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
})

export default Start