import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
interface SalaryInfoFormProps {
    salaryType: string
    setSalaryType: (value: string) => void
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
    salaryType,
    setSalaryType,
    salaryRange,
    setSalaryRange,
    salaryRangeNegotiable,
    setSalaryRangeNegotiable,
    payDay,
    setPayDay,
    payDayNegotiable,
    setPayDayNegotiable
}) => {
    const salaryTypes = [
        { label: '시급', value: '시급' },
        { label: '일급', value: '일급' },
        { label: '월급', value: '월급' },
        { label: '연봉', value: '연봉' }
    ]
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
                
                {/* 급여 타입 선택 */}
                <View className="flex-row gap-2 mb-3">
                    {salaryTypes.map(type => (
                        <TouchableOpacity
                            key={type.value}
                            onPress={() => setSalaryType(type.value)}
                            className={`px-3 py-2 rounded-lg border ${
                                salaryType === type.value
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <Text className={`text-sm ${
                                salaryType === type.value
                                    ? 'text-white'
                                    : 'text-gray-700'
                            }`}>
                                {type.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
                
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder="예: 200-250만원"
                    value={salaryRange}
                    onChangeText={setSalaryRange}
                />
            </View>
        </>
    )
}