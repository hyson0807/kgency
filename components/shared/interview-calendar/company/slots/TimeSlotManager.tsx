// components/shared/interview-calendar/company/slots/TimeSlotManager.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

export interface TimeSlot {
    id: string
    time: string
    maxCapacity: number
    currentBookings?: number  // 현재 예약된 인원수
}

interface TimeSlotManagerProps {
    selectedDate: string
    formatDateHeader: (dateString: string) => string
    initialSlots?: TimeSlot[]
    bookedSlots?: string[]
    onSlotsChange: (slots: TimeSlot[]) => void
    onSave: () => void
}

export const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({
    selectedDate,
    formatDateHeader,
    initialSlots = [],
    bookedSlots = [],
    onSlotsChange,
    onSave
}) => {
    const [slots, setSlots] = useState<TimeSlot[]>(initialSlots)
    const [showTimeModal, setShowTimeModal] = useState<{ slotId: string; show: boolean }>({ slotId: '', show: false })
    const [selectedHour, setSelectedHour] = useState('14')
    const [selectedMinute, setSelectedMinute] = useState('00')
    const [isInitialized, setIsInitialized] = useState(false)

    useEffect(() => {
        setSlots(initialSlots)
        setIsInitialized(true)
    }, [initialSlots])

    useEffect(() => {
        // 초기화 완료 후에만 onSlotsChange 호출 (무한루프 방지)
        if (isInitialized) {
            onSlotsChange(slots)
        }
    }, [slots, isInitialized])

    const generateUniqueId = () => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }

    const addNewSlot = () => {
        const now = new Date()
        const selectedDateObj = new Date(selectedDate)
        const isToday = selectedDateObj.toDateString() === now.toDateString()
        
        // 현재 시간을 기준으로 적절한 기본 시간 설정
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        
        let defaultTime = '09:00' // 미래 날짜의 기본값을 9시로 변경
        
        if (isToday) {
            // 오늘인 경우 현재 시간 이후의 가장 가까운 시간으로 설정
            // 현재 분을 15분 단위로 올림하여 다음 가능한 시간 계산
            let nextHour = currentHour
            let nextMinute = Math.ceil(currentMinute / 15) * 15
            
            // 60분이 되면 다음 시간으로 넘김
            if (nextMinute === 60) {
                nextHour += 1
                nextMinute = 0
            }
            
            // 현재 시간과 동일하면 다음 15분 슬롯으로 이동
            if (nextHour === currentHour && nextMinute <= currentMinute) {
                nextMinute += 15
                if (nextMinute === 60) {
                    nextHour += 1
                    nextMinute = 0
                }
            }
            
            if (nextHour < 24) {
                defaultTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`
            } else {
                defaultTime = '23:45'
            }
        } else {
            // 미래 날짜인 경우, 현재 시간과 비슷한 시간대로 설정 (하지만 최소 9시 이후)
            if (currentHour >= 9) {
                // 현재가 9시 이후라면 현재 시간 기준으로 설정
                let nextMinute = Math.ceil(currentMinute / 15) * 15
                let nextHour = currentHour
                
                if (nextMinute === 60) {
                    nextHour += 1
                    nextMinute = 0
                }
                
                if (nextHour < 24) {
                    defaultTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`
                }
            }
            // 현재가 9시 이전이라면 기본값 9:00 사용
        }
        
        const newSlot: TimeSlot = {
            id: generateUniqueId(),
            time: defaultTime,
            maxCapacity: 1
        }
        setSlots(prevSlots => [...prevSlots, newSlot])
    }

    const deleteSlot = (id: string) => {
        const slotToDelete = slots.find(slot => slot.id === id)
        
        // 예약이 있는 슬롯은 삭제 불가 (이미 UI에서 버튼이 숨겨지지만 추가 보호)
        if (slotToDelete && slotToDelete.currentBookings && slotToDelete.currentBookings > 0) {
            Alert.alert('알림', `이 시간대에 ${slotToDelete.currentBookings || 0}명의 예약이 있어 삭제할 수 없습니다.`)
            return
        }
        
        if (slotToDelete && bookedSlots.includes(slotToDelete.time)) {
            Alert.alert('알림', '예약된 시간대는 삭제할 수 없습니다.')
            return
        }
        
        // 예약이 없는 일반 시간대는 바로 삭제
        setSlots(prevSlots => prevSlots.filter(slot => slot.id !== id))
    }

    const updateSlotTime = (id: string, time: string) => {
        setSlots(prevSlots => 
            prevSlots.map(slot => 
                slot.id === id ? { ...slot, time } : slot
            )
        )
    }

    const updateSlotCapacity = (id: string, capacity: number) => {
        const slot = slots.find(s => s.id === id)
        
        // 최소/최대 범위 체크
        if (capacity < 1 || capacity > 10) return
        
        // 예약된 인원수보다 작게 설정할 수 없음
        if (slot && slot.currentBookings && capacity < slot.currentBookings) {
            Alert.alert('알림', `현재 ${slot.currentBookings || 0}명이 예약되어 있어 ${capacity}명으로 줄일 수 없습니다.`)
            return
        }
        
        setSlots(prevSlots => 
            prevSlots.map(slot => 
                slot.id === id ? { ...slot, maxCapacity: capacity } : slot
            )
        )
    }

    const isTimeInPast = (time: string) => {
        const now = new Date()
        const selectedDateObj = new Date(selectedDate)
        const isToday = selectedDateObj.toDateString() === now.toDateString()
        
        if (!isToday) return false
        
        const [hour, minute] = time.split(':').map(Number)
        const slotDateTime = new Date()
        slotDateTime.setHours(hour, minute, 0, 0)
        
        return slotDateTime <= now
    }

    const handleTimeConfirm = () => {
        const currentSlotId = showTimeModal.slotId
        if (!currentSlotId) return
        
        const newTime = `${selectedHour}:${selectedMinute}`
        
        // 현재 시간 이전인지 확인
        if (isTimeInPast(newTime)) {
            Alert.alert('알림', '현재 시간 이전의 시간대는 설정할 수 없습니다.')
            return
        }
        
        updateSlotTime(currentSlotId, newTime)
        setShowTimeModal({ slotId: '', show: false })
    }

    const openTimeModal = (slotId: string, currentTime: string) => {
        console.log('openTimeModal called', slotId, currentTime)
        const [hour, minute] = currentTime.split(':')
        setSelectedHour(hour)
        setSelectedMinute(minute)
        setShowTimeModal({ slotId, show: true })
    }

    // 시간 선택 옵션 생성
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
    const minutes = ['00', '15', '30', '45']
    
    // 현재 날짜인지 확인
    const now = new Date()
    const selectedDateObj = new Date(selectedDate)
    const isToday = selectedDateObj.toDateString() === now.toDateString()
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    const getTotalCapacity = () => {
        return slots.reduce((total, slot) => total + slot.maxCapacity, 0)
    }

    const sortedSlots = [...slots].sort((a, b) => a.time.localeCompare(b.time))

    return (
        <View className="px-4 mt-4">
            {/* 날짜 헤더 */}
            <View className="mb-4">
                <Text className="text-lg font-bold text-gray-900">
                    {formatDateHeader(selectedDate)}
                </Text>
            </View>

            {/* 기본 안내 메시지 */}
            <View className="bg-blue-50 p-3 rounded-lg mb-4 flex-row">
                <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2, marginRight: 8 }} />
                <View className="flex-1">
                    <Text className="text-sm text-blue-800">
                        시간과 인원은 자유롭게 설정 가능합니다.{'\n'}
                        각 시간대별로 면접 가능한 최대 인원을 설정하세요.{'\n'}
                        오늘 날짜의 경우 현재 시간 이전은 설정할 수 없습니다.
                    </Text>
                </View>
            </View>

            {/* 면접 시간대 목록 */}
            <View className="mb-4">
                <Text className="text-base font-semibold mb-3 text-gray-900">면접 시간대</Text>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    {sortedSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot.time)
                        const hasBookings = (slot.currentBookings || 0) > 0
                        const canDecrease = slot.maxCapacity > 1 && (slot.maxCapacity > (slot.currentBookings || 0))
                        const isPastTime = isTimeInPast(slot.time)
                        
                        return (
                            <View key={slot.id} className="bg-gray-50 rounded-lg p-4 mb-3 flex-row items-center">
                                {/* 시간 선택 */}
                                <View className="flex-1 mr-3">
                                    {hasBookings ? (
                                        <View>
                                            <Text className="text-lg font-semibold text-gray-700">
                                                {slot.time}
                                            </Text>
                                            <Text className="text-xs text-orange-600">
                                                {slot.currentBookings || 0}명 예약됨
                                            </Text>
                                        </View>
                                    ) : isBooked ? (
                                        <View>
                                            <Text className="text-lg font-semibold text-gray-400">
                                                {slot.time}
                                            </Text>
                                            <Text className="text-xs text-gray-400">예약된 시간</Text>
                                        </View>
                                    ) : isPastTime ? (
                                        <View>
                                            <Text className="text-lg font-semibold text-gray-400">
                                                {slot.time}
                                            </Text>
                                            <Text className="text-xs text-red-500">지난 시간</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => openTimeModal(slot.id, slot.time)}
                                            className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2"
                                        >
                                            <Text className="text-lg font-semibold text-blue-700">
                                                {slot.time}
                                            </Text>
                                            <Text className="text-xs text-blue-500">탭하여 시간 변경</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* 인원수 조절 */}
                                <View className="flex-row items-center bg-white rounded-lg p-1">
                                    <TouchableOpacity
                                        onPress={() => updateSlotCapacity(slot.id, slot.maxCapacity - 1)}
                                        disabled={!canDecrease || isPastTime}
                                        className={`w-7 h-7 rounded items-center justify-center ${
                                            (!canDecrease || isPastTime) ? 'bg-gray-100' : 'bg-gray-50'
                                        }`}
                                    >
                                        <Ionicons 
                                            name="remove" 
                                            size={16} 
                                            color={(!canDecrease || isPastTime) ? '#9CA3AF' : '#3b82f6'} 
                                        />
                                    </TouchableOpacity>
                                    
                                    <View className="mx-3 min-w-[60px]">
                                        <Text className="text-base font-semibold text-gray-900 text-center">
                                            {slot.maxCapacity}명
                                        </Text>
                                        {hasBookings && (
                                            <Text className="text-xs text-orange-600 text-center">
                                                ({slot.currentBookings || 0}명 예약)
                                            </Text>
                                        )}
                                    </View>
                                    
                                    <TouchableOpacity
                                        onPress={() => updateSlotCapacity(slot.id, slot.maxCapacity + 1)}
                                        disabled={slot.maxCapacity >= 10 || isPastTime}
                                        className={`w-7 h-7 rounded items-center justify-center ${
                                            (slot.maxCapacity >= 10 || isPastTime) ? 'bg-gray-100' : 'bg-gray-50'
                                        }`}
                                    >
                                        <Ionicons 
                                            name="add" 
                                            size={16} 
                                            color={(slot.maxCapacity >= 10 || isPastTime) ? '#9CA3AF' : '#3b82f6'} 
                                        />
                                    </TouchableOpacity>
                                </View>

                                {/* 삭제 버튼 */}
                                {!hasBookings && !isPastTime && (
                                    <TouchableOpacity
                                        onPress={() => deleteSlot(slot.id)}
                                        className="ml-3 w-8 h-8 bg-red-500 rounded items-center justify-center"
                                    >
                                        <Ionicons name="close" size={16} color="white" />
                                    </TouchableOpacity>
                                )}
                                {(hasBookings || isPastTime) && (
                                    <View className="ml-3 w-8 h-8 rounded items-center justify-center">
                                        <Ionicons 
                                            name={hasBookings ? "lock-closed" : "time"} 
                                            size={16} 
                                            color="#9CA3AF" 
                                        />
                                    </View>
                                )}
                            </View>
                        )
                    })}

                    {/* 시간 추가 버튼 */}
                    <TouchableOpacity
                        onPress={addNewSlot}
                        className="border-2 border-dashed border-blue-500 bg-blue-50 rounded-lg p-4 flex-row items-center justify-center"
                    >
                        <Ionicons name="add" size={20} color="#3b82f6" />
                        <Text className="ml-2 text-blue-600 font-medium">시간 추가</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>

            {/* 총 인원 정보 */}
            {slots.length > 0 && (
                <View className="bg-gray-50 p-4 rounded-lg mb-4 flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">오늘 총 면접 가능 인원</Text>
                    <Text className="text-lg font-bold text-blue-600">{getTotalCapacity()}명</Text>
                </View>
            )}

            {/* 저장 버튼 */}
            <TouchableOpacity
                onPress={onSave}
                disabled={slots.length === 0}
                className={`p-4 rounded-lg ${
                    slots.length === 0 
                        ? 'bg-gray-300' 
                        : 'bg-blue-500'
                }`}
            >
                <Text className={`text-center font-semibold ${
                    slots.length === 0 
                        ? 'text-gray-500' 
                        : 'text-white'
                }`}>
                    면접 일정 저장
                </Text>
            </TouchableOpacity>

            {/* 시간 선택 모달 */}
            {showTimeModal.show && (
                <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showTimeModal.show}
                    onRequestClose={() => setShowTimeModal({ slotId: '', show: false })}
                >
                    <View className="flex-1 justify-end bg-black/50">
                        <View className="bg-white rounded-t-3xl">
                            <View className="p-4 border-b border-gray-200">
                                <Text className="text-xl font-bold text-center">시간 선택</Text>
                            </View>
                            
                            <View className="p-4">
                                <View className="flex-row items-center justify-center mb-4">
                                    <View className="items-center">
                                        <Text className="text-sm text-gray-600 mb-2">시</Text>
                                        <ScrollView 
                                            className="h-40 w-20"
                                            showsVerticalScrollIndicator={false}
                                        >
                                            {hours.map(hour => {
                                                const hourNum = parseInt(hour)
                                                const isDisabled = isToday && hourNum < currentHour
                                                
                                                return (
                                                    <TouchableOpacity
                                                        key={hour}
                                                        onPress={() => !isDisabled && setSelectedHour(hour)}
                                                        disabled={isDisabled}
                                                        className={`py-2 px-4 my-1 rounded-lg ${
                                                            isDisabled
                                                                ? 'bg-gray-200'
                                                                : selectedHour === hour 
                                                                    ? 'bg-blue-500' 
                                                                    : 'bg-gray-100'
                                                        }`}
                                                    >
                                                        <Text className={`text-lg font-semibold text-center ${
                                                            isDisabled
                                                                ? 'text-gray-400'
                                                                : selectedHour === hour 
                                                                    ? 'text-white' 
                                                                    : 'text-gray-700'
                                                        }`}>
                                                            {hour}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </ScrollView>
                                    </View>
                                    
                                    <Text className="text-2xl font-bold mx-4 mt-8">:</Text>
                                    
                                    <View className="items-center">
                                        <Text className="text-sm text-gray-600 mb-2">분</Text>
                                        <ScrollView 
                                            className="h-40 w-20"
                                            showsVerticalScrollIndicator={false}
                                        >
                                            {minutes.map(minute => {
                                                const minuteNum = parseInt(minute)
                                                const hourNum = parseInt(selectedHour)
                                                const isDisabled = isToday && (hourNum < currentHour || (hourNum === currentHour && minuteNum <= currentMinute))
                                                
                                                return (
                                                    <TouchableOpacity
                                                        key={minute}
                                                        onPress={() => !isDisabled && setSelectedMinute(minute)}
                                                        disabled={isDisabled}
                                                        className={`py-2 px-4 my-1 rounded-lg ${
                                                            isDisabled
                                                                ? 'bg-gray-200'
                                                                : selectedMinute === minute 
                                                                    ? 'bg-blue-500' 
                                                                    : 'bg-gray-100'
                                                        }`}
                                                    >
                                                        <Text className={`text-lg font-semibold text-center ${
                                                            isDisabled
                                                                ? 'text-gray-400'
                                                                : selectedMinute === minute 
                                                                    ? 'text-white' 
                                                                    : 'text-gray-700'
                                                        }`}>
                                                            {minute}
                                                        </Text>
                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </ScrollView>
                                    </View>
                                </View>
                                
                                <View className="bg-blue-50 p-3 rounded-lg mb-4">
                                    <Text className="text-center text-lg font-semibold text-blue-700">
                                        선택된 시간: {selectedHour}:{selectedMinute}
                                    </Text>
                                    {isTimeInPast(`${selectedHour}:${selectedMinute}`) && (
                                        <Text className="text-center text-sm text-red-600 mt-1">
                                            ⚠️ 현재 시간 이전은 선택할 수 없습니다
                                        </Text>
                                    )}
                                </View>
                                
                                <View className="flex-row gap-3">
                                    <TouchableOpacity
                                        onPress={() => setShowTimeModal({ slotId: '', show: false })}
                                        className="flex-1 py-3 bg-gray-100 rounded-lg"
                                    >
                                        <Text className="text-center font-medium text-gray-700">취소</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity
                                        onPress={handleTimeConfirm}
                                        disabled={isTimeInPast(`${selectedHour}:${selectedMinute}`)}
                                        className={`flex-1 py-3 rounded-lg ${
                                            isTimeInPast(`${selectedHour}:${selectedMinute}`)
                                                ? 'bg-gray-300'
                                                : 'bg-blue-500'
                                        }`}
                                    >
                                        <Text className={`text-center font-medium ${
                                            isTimeInPast(`${selectedHour}:${selectedMinute}`)
                                                ? 'text-gray-500'
                                                : 'text-white'
                                        }`}>확인</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    )
}