import React from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'

interface WorkScheduleFormProps {
    workingHours: string
    setWorkingHours: (value: string) => void
    workingHoursNegotiable: boolean
    setWorkingHoursNegotiable: (value: boolean) => void
    workingDays: string[]
    toggleWorkingDay: (day: string) => void
    setWorkingDays: (days: string[]) => void
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
    setWorkingDays,
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
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-700">근무시간</Text>
                    <TouchableOpacity
                        onPress={() => setWorkingHoursNegotiable(!workingHoursNegotiable)}
                        className={`px-3 py-1 rounded-full ${
                            workingHoursNegotiable ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                    >
                        <Text className={`text-sm ${
                            workingHoursNegotiable ? 'text-white' : 'text-gray-700'
                        }`}>협의가능</Text>
                    </TouchableOpacity>
                </View>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder="예: 09:00-18:00"
                    value={workingHours}
                    onChangeText={setWorkingHours}
                />
            </View>

            <View className="mb-4">
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-700">근무일 *</Text>
                    <TouchableOpacity
                        onPress={() => {
                            setWorkingDaysNegotiable(!workingDaysNegotiable)
                            if (!workingDaysNegotiable) {
                                // 협의가능을 선택하면 모든 요일 선택
                                const allDays = ['월', '화', '수', '목', '금', '토', '일']
                                setWorkingDays(allDays)
                            }
                        }}
                        className={`px-3 py-1 rounded-full ${
                            workingDaysNegotiable ? 'bg-blue-500' : 'bg-gray-200'
                        }`}
                    >
                        <Text className={`text-sm ${
                            workingDaysNegotiable ? 'text-white' : 'text-gray-700'
                        }`}>협의가능</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap gap-2">
                    {weekDays.map(day => (
                        <TouchableOpacity
                            key={day.value}
                            onPress={() => toggleWorkingDay(day.value)}
                            className={`w-10 h-10 rounded-lg border-2 items-center justify-center ${
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
                </View>
            </View>
        </>
    )
}