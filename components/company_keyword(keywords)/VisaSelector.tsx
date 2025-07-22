import {Text, TouchableOpacity, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

interface VisaSelectorProps {
    visaKeywords: {id: number, keyword: string, category: string}[],
    selectedVisas: number[],
    handleVisaSelect: (item: any) => void,
    removeVisa: (visaId: number) => void,
}

export const VisaSelector = ({
    visaKeywords,
    selectedVisas,
    handleVisaSelect,
    removeVisa,

                             }: VisaSelectorProps) => {

    const visaOptions = [
        { label: '상관없음', value: 'all' },
        ...visaKeywords.map(visa => ({
            label: visa.keyword,
            value: visa.id
        }))
    ]

    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">선호 비자</Text>
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
                data={visaOptions}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="비자를 선택하세요"
                searchPlaceholder="검색..."
                value={null}
                onChange={handleVisaSelect}
            />

            {/* 선택된 비자들 태그로 표시 */}
            {selectedVisas.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-4">
                    {selectedVisas.map(visaId => {
                        const visa = visaKeywords.find(k => k.id === visaId)
                        return visa ? (
                            <View
                                key={visaId}
                                className="flex-row items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-full"
                            >
                                <Text className="text-blue-700 text-sm font-medium mr-2">
                                    {visa.keyword}
                                </Text>
                                <TouchableOpacity onPress={() => removeVisa(visaId)}>
                                    <Ionicons name="close-circle" size={18} color="#1d4ed8" />
                                </TouchableOpacity>
                            </View>
                        ) : null
                    })}
                </View>
            )}

            {selectedVisas.length === 0 && (
                <Text className="text-sm text-gray-500 mt-3 text-center">
                    선택된 비자가 없습니다
                </Text>
            )}
        </View>
    )
}