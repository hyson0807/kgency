import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'

interface SalaryInfoFormProps {
    salaryRange: string
    setSalaryRange: (value: string) => void
    salaryRangeNegotiable: boolean
    setSalaryRangeNegotiable: (value: boolean) => void
    payDay: string
    setPayDay: (value: string) => void
    payDayNegotiable: boolean
    setPayDayNegotiable: (value: boolean) => void
}

export const SalaryInfoForm: React.FC<SalaryInfoFormProps> = ({
    salaryRange,
    setSalaryRange,
    salaryRangeNegotiable,
    setSalaryRangeNegotiable,
}) => {
    return (
        <>
            <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-700">급여</Text>
                    <TouchableOpacity
                        onPress={() => setSalaryRangeNegotiable(!salaryRangeNegotiable)}
                        className={`px-3 py-1 rounded-full ${
                            salaryRangeNegotiable ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                    >
                        <Text className={`text-sm ${
                            salaryRangeNegotiable ? 'text-white' : 'text-gray-700'
                        }`}>협의가능</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder="예: 월 200-250만원"
                    value={salaryRange}
                    onChangeText={setSalaryRange}
                />
            </View>


        </>
    )
}