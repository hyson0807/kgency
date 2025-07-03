import {View, Text, TouchableOpacity} from 'react-native'
import React from 'react'
import Fontisto from '@expo/vector-icons/Fontisto';

const HeaderHome = () => {
    return (
        <View className="flex-row items-center justify-between w-full h-12  m-3 px-3">
            <View className="p-2">
                <Text className="text-2xl">케이전시</Text>
            </View>
            <View className="flex-row items-center justify-center gap-4 p-2">
                <Text className="text-2xl">검색</Text>
                <TouchableOpacity>
                    <Fontisto name="bell" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    )
}
export default HeaderHome
