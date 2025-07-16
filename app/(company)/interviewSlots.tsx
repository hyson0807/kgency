import React, {useEffect, useState} from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
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

    // 예약된 시간 슬롯을 저장할 state 추가
    const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({})


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

        // 기존 슬롯이 있으면 location과 interviewType도 설정
        if (existingSlots.length > 0) {
            setLocation(existingSlots[0].location || '')
            setInterviewType(existingSlots[0].interviewType || '대면')
        } else {
            // 새로운 날짜 선택 시 초기화
            setLocation('')
            setInterviewType('대면')
        }
    }

    const handleTimeToggle = (time: string) => {
        // 예약된 시간은 선택 불가
        if (bookedSlots[selectedDate]?.includes(time)) {
            showModal('알림', '이미 예약된 시간대입니다.')
            return
        }

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

        // 예약된 시간은 유지하고 나머지만 업데이트
        const existingBookedSlots = dateTimeMap[selectedDate]?.filter(slot =>
            bookedSlots[selectedDate]?.includes(slot.startTime)
        ) || []

        if (selectedTimes.length === 0 && existingBookedSlots.length > 0) {
            showModal('알림', '예약된 시간대가 있어 모든 시간을 삭제할 수 없습니다.')
            return
        }


        // 시간이 선택되지 않은 경우 삭제 확인
        if (selectedTimes.length === 0) {
            // 기존에 해당 날짜에 시간이 있었는지 확인
            if (dateTimeMap[selectedDate] && dateTimeMap[selectedDate].length > 0) {
                // 삭제 확인 모달
                showModal(
                    '확인',
                    `${selectedDate}의 모든 면접 시간대를 삭제하시겠습니까?`,
                    'confirm',
                    async () => {
                        // 삭제 처리
                        const response = await api('POST', '/api/company/interview-slots', {
                            companyId: user?.userId,
                            date: selectedDate,
                            slots: []
                        })

                        if (response?.success) {
                            // 로컬 상태에서도 삭제
                            setDateTimeMap(prev => {
                                const newMap = { ...prev }
                                delete newMap[selectedDate]
                                return newMap
                            })
                            showModal('성공', `${selectedDate}의 면접 시간대가 삭제되었습니다.`, 'info')
                        }
                    }
                )
                return
            } else {
                showModal('알림', '최소 1개의 시간대를 선택해주세요.')
                return
            }
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

        const response = await api('POST', '/api/company/interview-slots', {
            companyId: user?.userId,
            slots: slots
        })

        if (response?.success) {
            // 날짜별로 저장
            setDateTimeMap(prev => ({
                ...prev,
                [selectedDate]: slots
            }))

            showModal('성공', `${selectedDate}의 면접 시간대가 저장되었습니다.`, 'info')
        }
    }



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

        if (result?.data && Array.isArray(result.data)) {
            const groupedSlots: Record<string, TimeSlot[]> = {}
            const bookedSlotsMap: Record<string, string[]> = {}

            result.data.forEach((slot: any) => {
                const startDateTime = new Date(slot.start_time)
                const date = startDateTime.toISOString().split('T')[0]
                const startTime = startDateTime.toTimeString().slice(0, 5)

                const endDateTime = new Date(slot.end_time)
                const endTime = endDateTime.toTimeString().slice(0, 5)

                const timeSlot: TimeSlot = {
                    date: date,
                    startTime: startTime,
                    endTime: endTime,
                    location: slot.location,
                    interviewType: slot.interview_type
                }

                if (!groupedSlots[date]) {
                    groupedSlots[date] = []
                    bookedSlotsMap[date] = []
                }

                groupedSlots[date].push(timeSlot)

                // 예약된 슬롯이면 기록
                if (slot.is_booked) {
                    bookedSlotsMap[date].push(startTime)
                }
            })

            setDateTimeMap(groupedSlots)
            setBookedSlots(bookedSlotsMap)
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 가능 시간대 설정</Text>
            </View>

            <ScrollView className="flex-1">



                {/* 캘린더 */}
                <View className="px-4 mt-4">
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

                        {/* 예약된 시간이 있으면 안내 메시지 */}
                        {bookedSlots[selectedDate]?.length > 0 && (
                            <View className="bg-yellow-50 p-3 rounded-lg mb-3">
                                <Text className="text-sm text-yellow-800">
                                    ⚠️ 이미 예약된 시간대는 변경할 수 없습니다.
                                </Text>
                            </View>
                        )}

                        <View className="flex-row flex-wrap gap-2">
                            {timeSlots.map((time) => {
                                const isBooked = bookedSlots[selectedDate]?.includes(time)
                                const isSelected = selectedTimes.includes(time)

                                return (
                                    <TouchableOpacity
                                        key={time}
                                        onPress={() => handleTimeToggle(time)}
                                        disabled={isBooked}
                                        className={`px-4 py-2 rounded-lg border relative ${
                                            isBooked
                                                ? 'bg-gray-100 border-gray-300'
                                                : isSelected
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'bg-white border-gray-300'
                                        }`}
                                    >
                                        <Text className={
                                            isBooked
                                                ? 'text-gray-400'
                                                : isSelected
                                                    ? 'text-white'
                                                    : 'text-gray-700'
                                        }>
                                            {time}
                                        </Text>
                                        {isBooked && (
                                            <Text className="text-xs text-gray-400 absolute -bottom-2">
                                                예약됨
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                )
                            })}
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


