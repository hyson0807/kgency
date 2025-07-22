import {Text, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import React from "react";

interface LocationProps {
    selectedLocation: number | null,
    setSelectedLocation: (locationId: number | null) => void,
    locationOptions: {
        label: string,
        value: number
    }[]
}

export const LocationSelector = ({
    selectedLocation,
    setSelectedLocation,
    locationOptions,
                         }: LocationProps) => {




    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">사장님 회사 위치!</Text>
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
                data={locationOptions}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder="지역을 선택하세요"
                searchPlaceholder="검색..."
                value={selectedLocation}
                onChange={item => {
                    setSelectedLocation(item.value)
                }}
            />
        </View>
    )
}