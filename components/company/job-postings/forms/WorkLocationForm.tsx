import React from 'react'
import { View, Text } from 'react-native'
import { Dropdown } from "react-native-element-dropdown"
interface LocationOption {
    label: string
    value: number
}
interface WorkLocationFormProps {
    locationOptions: LocationOption[]
    selectedLocation: number | null
    setSelectedLocation: (value: number | null) => void
}
export const WorkLocationForm: React.FC<WorkLocationFormProps> = ({
    locationOptions,
    selectedLocation,
    setSelectedLocation
}) => {
    return (
        <View className="mb-4">
            <Text className="text-gray-700 mb-2">근무 지역</Text>
            <Dropdown
                style={{
                    height: 44,
                    borderColor: '#d1d5db',
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
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
                placeholder="근무 지역을 선택하세요"
                searchPlaceholder="검색..."
                value={selectedLocation}
                onChange={item => {
                    setSelectedLocation(item.value);
                }}
            />
        </View>
    )
}