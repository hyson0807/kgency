import {Text, TouchableOpacity, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import {Ionicons} from "@expo/vector-icons";
import React from "react";

interface CountrySelectorProps {
    countryKeywords: {id: number, keyword: string, category: string}[],
    selectedCountries: number[],
    handleCountrySelect: (item: any) => void,
    removeCountry: (countryId: number) => void,

}

export const CountrySelector = ({
    countryKeywords,
    selectedCountries,
    handleCountrySelect,
    removeCountry,
                                }: CountrySelectorProps) => {

    const countryOptions = [
        { label: '상관없음', value: 'all' },
        ...countryKeywords.map(country => ({
            label: country.keyword,
            value: country.id
        }))
    ]


    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">선호하는 국가</Text>
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
                data={countryOptions}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="국가를 선택하세요"
                searchPlaceholder="검색..."
                value={null} // 드롭다운 자체는 선택 값을 유지하지 않음
                onChange={handleCountrySelect}
            />

            {/* 선택된 국가들 태그로 표시 */}
            {selectedCountries.length > 0 && (
                <View className="flex-row flex-wrap gap-2 mt-4">
                    {selectedCountries.map(countryId => {
                        const country = countryKeywords.find(k => k.id === countryId)
                        return country ? (
                            <View
                                key={countryId}
                                className="flex-row items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-full"
                            >
                                <Text className="text-blue-700 text-sm font-medium mr-2">
                                    {country.keyword}
                                </Text>
                                <TouchableOpacity onPress={() => removeCountry(countryId)}>
                                    <Ionicons name="close-circle" size={18} color="#1d4ed8" />
                                </TouchableOpacity>
                            </View>
                        ) : null
                    })}
                </View>
            )}

            {selectedCountries.length === 0 && (
                <Text className="text-sm text-gray-500 mt-3 text-center">
                    선택된 국가가 없습니다
                </Text>
            )}
        </View>
    )
}