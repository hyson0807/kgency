import {Text, TouchableOpacity, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import {Ionicons} from "@expo/vector-icons";
import React from "react";


interface AgeSelectorProps {
    ageKeywords: {id: number, keyword: string, category: string}[],
    selectedAges: number[],
    handleAgeSelect: (item: any) => void,
    removeAge: (ageId: number) => void,
}

export const AgeSelector = ({
    ageKeywords,
    selectedAges,
    handleAgeSelect,
    removeAge,


                            }: AgeSelectorProps) => {

    const ageOptions = [
        { label: '상관없음', value: 'all' },
        ...ageKeywords.map(age => ({
            label: age.keyword,
            value: age.id
        }))
    ]



    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">선호하는 나이대</Text>
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
                data={ageOptions}
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="나이대를 선택하세요"
                value={null}
                onChange={handleAgeSelect}
            />

            {/* 선택된 나이대들 태그로 표시 */}
            {selectedAges.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-4">
                    {selectedAges.map(ageId => {
                        const age = ageKeywords.find(k => k.id === ageId)
                        return age ? (
                            <View
                                key={ageId}
                                className="flex-row items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-full"
                            >
                                <Text className="text-blue-700 text-sm font-medium mr-2">
                                    {age.keyword}
                                </Text>
                                <TouchableOpacity onPress={() => removeAge(ageId)}>
                                    <Ionicons name="close-circle" size={18} color="#1d4ed8" />
                                </TouchableOpacity>
                            </View>
                        ) : null
                    })}
                </View>
            )}

            {selectedAges.length === 0 && (
                <Text className="text-sm text-gray-500 mt-3 text-center">
                    선택된 나이대가 없습니다
                </Text>
            )}
        </View>
    )
}