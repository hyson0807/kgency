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
    payDay,
    setPayDay,
    payDayNegotiable,
    setPayDayNegotiable
}) => {
    return (
        <>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">급여</Text>
                <View className="flex-row items-center gap-2">
                    <TextInput
                        className="flex-1 border border-gray-300 rounded-lg p-3"
                        placeholder="예: 월 200-250만원"
                        value={salaryRange}
                        onChangeText={setSalaryRange}
                    />
                    <TouchableOpacity
                        onPress={() => setSalaryRangeNegotiable(!salaryRangeNegotiable)}
                        className="flex-row items-center gap-2"
                    >
                        <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                            salaryRangeNegotiable
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-300'
                        }`}>
                            {salaryRangeNegotiable && (
                                <Text className="text-white text-xs">✓</Text>
                            )}
                        </View>
                        <Text className="text-gray-700">협의가능</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 mb-2">급여일</Text>
                <View className="flex-row items-center gap-2">
                    <TextInput
                        className="flex-1 border border-gray-300 rounded-lg p-3"
                        placeholder="예: 매월 10일"
                        value={payDay}
                        onChangeText={setPayDay}
                    />
                    <TouchableOpacity
                        onPress={() => setPayDayNegotiable(!payDayNegotiable)}
                        className="flex-row items-center gap-2"
                    >
                        <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                            payDayNegotiable
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-300'
                        }`}>
                            {payDayNegotiable && (
                                <Text className="text-white text-xs">✓</Text>
                            )}
                        </View>
                        <Text className="text-gray-700">협의가능</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}