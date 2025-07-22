import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'

interface WorkScheduleFormProps {
    workingHours: string
    setWorkingHours: (value: string) => void
    workingHoursNegotiable: boolean
    setWorkingHoursNegotiable: (value: boolean) => void
    workingDays: string[]
    toggleWorkingDay: (day: string) => void
    workingDaysNegotiable: boolean
    setWorkingDaysNegotiable: (value: boolean) => void
}

export const WorkScheduleForm: React.FC<WorkScheduleFormProps> = ({
    workingHours,
    setWorkingHours,
    workingHoursNegotiable,
    setWorkingHoursNegotiable,
    workingDays,
    toggleWorkingDay,
    workingDaysNegotiable,
    setWorkingDaysNegotiable
}) => {
    const weekDays = [
        { label: '월', value: '월' },
        { label: '화', value: '화' },
        { label: '수', value: '수' },
        { label: '목', value: '목' },
        { label: '금', value: '금' },
        { label: '토', value: '토' },
        { label: '일', value: '일' }
    ]

    return (
        <>
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">근무시간</Text>
                <View className="flex-row items-center gap-2">
                    <TextInput
                        className="flex-1 border border-gray-300 rounded-lg p-3"
                        placeholder="예: 09:00-18:00"
                        value={workingHours}
                        onChangeText={setWorkingHours}
                    />
                    <TouchableOpacity
                        onPress={() => setWorkingHoursNegotiable(!workingHoursNegotiable)}
                        className="flex-row items-center gap-2"
                    >
                        <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                            workingHoursNegotiable
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-300'
                        }`}>
                            {workingHoursNegotiable && (
                                <Text className="text-white text-xs">✓</Text>
                            )}
                        </View>
                        <Text className="text-gray-700">협의가능</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mb-4">
                <Text className="text-gray-700 mb-2">근무일 *</Text>
                <View className="flex-row flex-wrap gap-3 items-center">
                    {weekDays.map(day => (
                        <TouchableOpacity
                            key={day.value}
                            onPress={() => toggleWorkingDay(day.value)}
                            className={`px-2 py-2 rounded-lg border-2 ${
                                workingDays.includes(day.value)
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <Text className={`font-medium ${
                                workingDays.includes(day.value)
                                    ? 'text-white'
                                    : 'text-gray-700'
                            }`}>
                                {day.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        onPress={() => setWorkingDaysNegotiable(!workingDaysNegotiable)}
                        className="flex-row items-center gap-2 mt-3"
                    >
                        <View className={`w-5 h-5 rounded border-2 items-center justify-center ${
                            workingDaysNegotiable
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-300'
                        }`}>
                            {workingDaysNegotiable && (
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