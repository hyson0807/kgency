import {Text, TouchableOpacity, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

interface GenderSelectorProps {
    genderKeywords: {id: number, keyword: string, category: string}[],
    selectedGenders: number[],
    handleGenderSelect: (item: any) => void,
    removeGender: (genderId: number) => void,
}


export const GenderSelector = ({
    genderKeywords,
    selectedGenders,
    handleGenderSelect,
    removeGender,

                               }: GenderSelectorProps) => {

    const genderOptions = [
        { label: '상관없음', value: 'all' },
        ...genderKeywords.map(gender => ({
            label: gender.keyword,
            value: gender.id
        }))
    ]

    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">선호하는 성별</Text>
            <Dropdown
                style={{
                    height: 48,
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    backgroundColor: '#f9fafb',
                }}
                placeholderStyle={{
                    fontSize: 16,
                    color: '#9ca3af'
                }}
                selectedTextStyle={{
                    fontSize: 16,
                }}
                inputSearchStyle={{
                    height: 40,
                    fontSize: 16,
                }}
                iconStyle={{
                    width: 20,
                    height: 20,
                }}
                data={genderOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="성별을 선택하세요"
                value={null}
                onChange={handleGenderSelect}
            />

            {/* 선택된 성별들 태그로 표시 */}
            {selectedGenders.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-4">
                    {selectedGenders.map(genderId => {
                        const gender = genderKeywords.find(k => k.id === genderId)
                        return gender ? (
                            <View
                                key={genderId}
                                className="flex-row items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-full"
                            >
                                <Text className="text-blue-700 text-sm font-medium mr-2">
                                    {gender.keyword}
                                </Text>
                                <TouchableOpacity onPress={() => removeGender(genderId)}>
                                    <Ionicons name="close-circle" size={18} color="#1d4ed8" />
                                </TouchableOpacity>
                            </View>
                        ) : null
                    })}
                </View>
            )}

            {selectedGenders.length === 0 && (
                <Text className="text-sm text-gray-500 mt-3 text-center">
                    선택된 성별이 없습니다
                </Text>
            )}
        </View>
    )
}