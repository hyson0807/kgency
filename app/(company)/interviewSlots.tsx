import React, {useEffect, useState} from 'react'
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar } from 'react-native-calendars'
import { useModal } from '@/hooks/useModal'
import Back from '@/components/back'
import { useAuth } from '@/contexts/AuthContext'
import {api} from "@/lib/api";

interface TimeSlot {
    date: string
    startTime: string
    endTime: string
    location: string
    interviewType: '대면' | '화상' | '전화'
}

export default function SetInterviewSlots() {
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()

    const [selectedDate, setSelectedDate] = useState('')
    const [selectedTimes, setSelectedTimes] = useState<string[]>([])
    const [location, setLocation] = useState('')
    const [interviewType, setInterviewType] = useState<'대면' | '화상' | '전화'>('대면')
    const [loading, setLoading] = useState(false)

    // 날짜별로 선택된 시간들을 저장
    const [dateTimeMap, setDateTimeMap] = useState<Record<string, TimeSlot[]>>({})

    // 10시부터 18시까지 30분 단위 시간 슬롯 생성
    const timeSlots = []
    for (let hour = 10; hour < 18; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
        timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    const handleDateSelect = (day: any) => {
        setSelectedDate(day.dateString)
        // 해당 날짜에 이미 설정된 시간들이 있으면 불러오기
        const existingSlots = dateTimeMap[day.dateString] || []
        setSelectedTimes(existingSlots.map(slot => slot.startTime))
    }

    const handleTimeToggle = (time: string) => {
        if (selectedTimes.includes(time)) {
            setSelectedTimes(selectedTimes.filter(t => t !== time))
        } else {
            setSelectedTimes([...selectedTimes, time])
        }
    }

    const handleSaveForDate = async () => {
        if (!selectedDate) {
            showModal('알림', '날짜를 선택해주세요.')
            return
        }

        if (!location.trim()) {
            showModal('알림', '면접 장소를 입력해주세요.')
            return
        }

        if (selectedTimes.length === 0) {
            showModal('알림', '최소 1개의 시간대를 선택해주세요.')
            return
        }

        // 선택된 시간들을 TimeSlot 형식으로 변환
        const slots: TimeSlot[] = selectedTimes.map(time => {
            const [hour, minute] = time.split(':')
            const endHour = minute === '30' ? parseInt(hour) + 1 : parseInt(hour)
            const endMinute = minute === '30' ? '00' : '30'

            return {
                date: selectedDate,
                startTime: time,
                endTime: `${endHour.toString().padStart(2, '0')}:${endMinute}`,
                location: location,
                interviewType: interviewType
            }
        })

        const response = await api ('POST', '/api/company/interview-slots', {
            companyId: user?.userId,
            slots: slots
        })
        console.log('Response:', response)

        // 날짜별로 저장
        setDateTimeMap(prev => ({
            ...prev,
            [selectedDate]: slots
        }))

        showModal('성공', `${selectedDate}의 면접 시간대가 저장되었습니다.`, 'info')

        // 다음 날짜 설정을 위해 초기화
        setSelectedTimes([])
    }

    // const handleSubmitAll = async () => {
    //     const allSlots = Object.values(dateTimeMap).flat()
    //
    //     if (allSlots.length === 0) {
    //         showModal('알림', '설정된 면접 시간대가 없습니다.')
    //         return
    //     }
    //
    //     setLoading(true)
    //     try {
    //         // 백엔드로 데이터 전송
    //         const payload = {
    //             companyId: user?.userId,
    //             slots: allSlots
    //         }
    //
    //         // TODO: 실제 API 호출
    //         console.log('Sending to backend:', payload)
    //         showModal('성공', '면접 가능 시간대가 모두 저장되었습니다.', 'info')
    //         setTimeout(() => router.back(), 1500)
    //     } catch (error) {
    //         console.error('Error:', error)
    //         showModal('오류', '저장에 실패했습니다.')
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    // 설정된 날짜들 표시를 위한 markedDates 생성
    const markedDates = {
        ...Object.keys(dateTimeMap).reduce((acc, date) => ({
            ...acc,
            [date]: { marked: true, dotColor: '#3b82f6' }
        }), {}),
        [selectedDate]: {
            selected: true,
            selectedColor: '#3b82f6',
            marked: !!dateTimeMap[selectedDate]
        }
    }

    useEffect(() => {
        fetchSlot()
    }, []);

    const fetchSlot = async () => {
        const result = await api('GET', '/api/company/interview-slots?companyId=' + user?.userId)
        console.log(result)
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 가능 시간대 설정</Text>
            </View>

            <ScrollView className="flex-1">
                {/* 면접 타입 선택 */}
                <View className="p-4">
                    <Text className="text-base font-semibold mb-2">면접 방식</Text>
                    <View className="flex-row gap-2">
                        {(['대면', '화상', '전화'] as const).map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setInterviewType(type)}
                                className={`px-4 py-2 rounded-lg border ${
                                    interviewType === type
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                                }`}
                            >
                                <Text className={interviewType === type ? 'text-white' : 'text-gray-700'}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 면접 장소 입력 */}
                <View className="p-4">
                    <Text className="text-base font-semibold mb-2">면접 장소</Text>
                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="예: 서울시 강남구 테헤란로 123 5층"
                        className="border border-gray-300 rounded-lg px-4 py-3"
                    />
                </View>

                {/* 캘린더 */}
                <View className="px-4">
                    <Text className="text-base font-semibold mb-2">날짜 선택</Text>
                    <Calendar
                        current={new Date().toISOString().split('T')[0]}
                        minDate={new Date().toISOString().split('T')[0]}
                        onDayPress={handleDateSelect}
                        markedDates={markedDates}
                    />
                </View>



                {/* 시간 선택 */}
                {selectedDate && (
                    <View className="p-4">
                        <Text className="text-base font-semibold mb-2">
                            {selectedDate} 가능 시간 선택
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {timeSlots.map((time) => (
                                <TouchableOpacity
                                    key={time}
                                    onPress={() => handleTimeToggle(time)}
                                    className={`px-4 py-2 rounded-lg border ${
                                        selectedTimes.includes(time)
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-white border-gray-300'
                                    }`}
                                >
                                    <Text className={selectedTimes.includes(time) ? 'text-white' : 'text-gray-700'}>
                                        {time}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* 현재 날짜 저장 버튼 */}
                        <TouchableOpacity
                            onPress={handleSaveForDate}
                            className="mt-4 py-3 bg-gray-500 rounded-lg"
                        >
                            <Text className="text-center text-white font-semibold">
                                {selectedDate} 시간대 저장
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}


            </ScrollView>

            <ModalComponent />
        </SafeAreaView>
    )
}