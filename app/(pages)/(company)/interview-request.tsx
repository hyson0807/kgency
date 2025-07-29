// app/(pages)/(company)/interview-request.tsx
import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { router, useLocalSearchParams } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

import Back from '@/components/back'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/hooks/useModal'
import { TimeSlotGrid } from '@/components/interview-calendar/TimeSlotGrid'
import { getLocalDateString, getLocalTimeString } from '@/lib/dateUtils'

// 한국어 캘린더 설정
LocaleConfig.locales['ko'] = {
    monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
    today: '오늘'
}
LocaleConfig.defaultLocale = 'ko'

interface TimeSlot {
    date: string
    startTime: string
    endTime: string
    interviewType: '대면' | '화상' | '전화'
}

interface JobPosting {
    id: string
    title: string
    hasExistingApplication?: boolean
}

export default function InterviewRequest() {
    const { user } = useAuth()
    const { showModal, ModalComponent } = useModal()
    const params = useLocalSearchParams()
    const { userId: jobSeekerId } = params

    // State
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [companyJobPostings, setCompanyJobPostings] = useState<JobPosting[]>([])
    const [selectedJobPostingId, setSelectedJobPostingId] = useState<string>('')
    const [interviewLocation, setInterviewLocation] = useState('')
    const [jobSeekerName, setJobSeekerName] = useState('')
    
    // 시간대 선택 관련 state
    const [selectedTimes, setSelectedTimes] = useState<string[]>([])
    const [interviewType, setInterviewType] = useState<'대면' | '화상' | '전화'>('대면')
    const [dateTimeMap, setDateTimeMap] = useState<Record<string, TimeSlot[]>>({})
    const [bookedSlots, setBookedSlots] = useState<Record<string, string[]>>({})
    const [userSelectedTimesByDate, setUserSelectedTimesByDate] = useState<Record<string, { added: string[], removed: string[] }>>({})
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false)

    useEffect(() => {
        if (user?.userId && jobSeekerId) {
            fetchInitialData()
        }
    }, [user?.userId, jobSeekerId])

    useEffect(() => {
        if (user?.userId) {
            fetchSlots()
        }
    }, [user?.userId])

    const [previousSelectedDate, setPreviousSelectedDate] = useState<string>('')
    
    useEffect(() => {
        // 날짜가 변경되었을 때만 해당 날짜의 데이터를 로드
        if (selectedDate && selectedDate !== previousSelectedDate && Object.keys(dateTimeMap).length > 0) {
            const userSelectedForDate = userSelectedTimesByDate[selectedDate] || { added: [], removed: [] }
            const existingServerTimes = dateTimeMap[selectedDate]?.map(slot => slot.startTime) || []
            
            // 서버 시간에서 제거된 시간들을 빼고, 사용자가 추가한 시간들을 더함
            const finalTimes = [
                ...existingServerTimes.filter(time => !userSelectedForDate.removed.includes(time)),
                ...userSelectedForDate.added
            ]
            
            setSelectedTimes([...new Set(finalTimes)])
            
            // 면접 유형 설정 (기존 데이터 우선)
            if (dateTimeMap[selectedDate]?.length > 0) {
                setInterviewType(dateTimeMap[selectedDate][0].interviewType || '대면')
            } else {
                setInterviewType('대면')
            }
            
            setPreviousSelectedDate(selectedDate)
        }
    }, [selectedDate, dateTimeMap, userSelectedTimesByDate, previousSelectedDate])

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            
            // 회사 공고 목록 가져오기 (지원 상태 포함)
            const jobPostingsResponse = await api('GET', `/api/job-postings/company/with-status?jobSeekerId=${jobSeekerId}`)
            
            if (jobPostingsResponse?.success) {
                setCompanyJobPostings(jobPostingsResponse.data || [])
            } else {
                throw new Error('공고 목록을 불러오는데 실패했습니다.')
            }

            // 구직자 이름 가져오기
            const userProfileResponse = await api('GET', `/api/profiles/user/${jobSeekerId}`)
            
            if (userProfileResponse?.success) {
                setJobSeekerName(userProfileResponse.data?.name || '')
            } else {
                throw new Error('구직자 정보를 불러오는데 실패했습니다.')
            }

        } catch (error) {
            console.error('데이터 로딩 실패:', error)
            console.error('Error details:', {
                message: (error as any)?.message,
                response: (error as any)?.response?.data,
                status: (error as any)?.response?.status
            })
            showModal('오류', '데이터를 불러오는데 실패했습니다.')
        } finally {
            setLoading(false)
        }
    }

    const fetchSlots = async () => {
        try {
            const result = await api('GET', '/api/company/interview-slots?companyId=' + user?.userId)

            if (result?.data && Array.isArray(result.data)) {
                const groupedSlots: Record<string, TimeSlot[]> = {}
                const bookedSlotsMap: Record<string, string[]> = {}

                result.data.forEach((slot: any) => {
                    // 유틸리티 함수 사용하여 일관된 날짜/시간 처리
                    const date = getLocalDateString(slot.start_time)
                    const startTime = getLocalTimeString(slot.start_time)
                    const endTime = getLocalTimeString(slot.end_time)

                    const timeSlot: TimeSlot = {
                        date: date,
                        startTime: startTime,
                        endTime: endTime,
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
                
                // 초기 로드 시 현재 선택된 날짜의 시간대를 selectedTimes에 설정
                if (selectedDate && groupedSlots[selectedDate] && !previousSelectedDate) {
                    const existingServerTimes = groupedSlots[selectedDate].map(slot => slot.startTime)
                    setSelectedTimes(existingServerTimes)
                    setPreviousSelectedDate(selectedDate)
                    
                    // 면접 유형도 설정
                    if (groupedSlots[selectedDate]?.length > 0) {
                        setInterviewType(groupedSlots[selectedDate][0].interviewType || '대면')
                    }
                }
            }
        } catch (error) {
            console.error('면접 시간대 조회 실패:', error)
        }
    }

    // 전체 선택된 시간대 개수 계산 함수
    const getTotalSelectedSlots = () => {
        const now = new Date()
        let totalCount = 0
        
        // 기존 서버 데이터의 시간대 (예약되지 않은 것만)
        Object.entries(dateTimeMap).forEach(([date, slots]) => {
            const dateObj = new Date(date)
            const isToday = dateObj.toDateString() === now.toDateString()
            
            slots.forEach(slot => {
                const [hour, minute] = slot.startTime.split(':')
                const slotDateTime = new Date(date)
                slotDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0)
                
                // 현재 시간 이후이고 예약되지 않은 시간대만
                const isValidTime = isToday ? slotDateTime >= now : dateObj > now
                const isBooked = bookedSlots[date]?.includes(slot.startTime) || false
                
                if (isValidTime && !isBooked) {
                    // 사용자가 제거하지 않은 시간대만 카운트
                    const userSelection = userSelectedTimesByDate[date]
                    if (!userSelection?.removed.includes(slot.startTime)) {
                        totalCount++
                    }
                }
            })
        })
        
        // 사용자가 추가로 선택한 시간대
        Object.entries(userSelectedTimesByDate).forEach(([date, userSelection]) => {
            const dateObj = new Date(date)
            const isToday = dateObj.toDateString() === now.toDateString()
            
            userSelection.added.forEach(time => {
                const [hour, minute] = time.split(':')
                const slotDateTime = new Date(date)
                slotDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0)
                
                const isValidTime = isToday ? slotDateTime >= now : dateObj > now
                
                if (isValidTime) {
                    totalCount++
                }
            })
        })
        
        return totalCount
    }

    const handleSendInterviewRequest = async () => {
        if (!selectedJobPostingId) {
            showModal('알림', '면접 제안할 공고를 선택해주세요.')
            return
        }

        const totalSelectedSlots = getTotalSelectedSlots()
        if (totalSelectedSlots === 0) {
            showModal('알림', '최소 1개의 면접 시간대를 선택해주세요.')
            return
        }

        if (!interviewLocation.trim()) {
            showModal('알림', '면접 장소를 입력해주세요.')
            return
        }

        setSubmitting(true)
        try {
            // 1. 선택된 시간대들을 저장
            const bookedTimesForDate = bookedSlots[selectedDate] || []
            const mustIncludeBookedTimes = [...bookedTimesForDate]
            const newlySelectedTimes = selectedTimes.filter(time => !bookedTimesForDate.includes(time))
            const finalTimes = [...new Set([...mustIncludeBookedTimes, ...newlySelectedTimes])]

            const slots = finalTimes.map(time => {
                const [hour, minute] = time.split(':')
                const endHour = minute === '30' ? parseInt(hour) + 1 : parseInt(hour)
                const endMinute = minute === '30' ? '00' : '30'

                const existingSlot = dateTimeMap[selectedDate]?.find(s => s.startTime === time)

                return {
                    date: selectedDate,
                    startTime: time,
                    endTime: existingSlot?.endTime || `${endHour.toString().padStart(2, '0')}:${endMinute}`,
                    interviewType: existingSlot?.interviewType || interviewType
                }
            })

            const slotsResponse = await api('POST', '/api/company/interview-slots', {
                companyId: user?.userId,
                date: selectedDate,
                slots: slots
            })

            if (!slotsResponse?.success) {
                throw new Error('시간대 저장에 실패했습니다.')
            }

            // 2. 먼저 초대형 지원서 생성
            const applicationResponse = await api('POST', '/api/applications/invitation', {
                userId: jobSeekerId,
                jobPostingId: selectedJobPostingId
            })

            if (!applicationResponse?.success) {
                if (applicationResponse?.error?.includes('이미 지원한 공고')) {
                    showModal('알림', '해당 구직자는 이미 이 공고에 지원했습니다.')
                    return
                }
                throw new Error('지원서 생성에 실패했습니다.')
            }

            // 3. 면접 제안 생성
            const response = await api('POST', '/api/interview-proposals/company', {
                applicationId: applicationResponse.data.id,
                companyId: user?.userId,
                location: interviewLocation.trim()
            })

            if (response?.success) {
                showModal('성공', '면접 시간대가 설정되고 면접 요청이 성공적으로 전송되었습니다.', 'info', () => {
                    router.back()
                })
            }
        } catch (error) {
            console.error('면접 요청 실패:', error)
            showModal('오류', '면접 요청에 실패했습니다.')
        } finally {
            setSubmitting(false)
        }
    }

    // 시간대 선택 관련 함수들
    const timeSlots = []
    for (let hour = 0; hour < 24; hour++) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:00`)
        timeSlots.push(`${hour.toString().padStart(2, '0')}:30`)
    }

    const handleTimeToggle = (time: string) => {
        // 예약된 시간은 선택 불가
        if (bookedSlots[selectedDate]?.includes(time)) {
            showModal('알림', '이미 예약된 시간대입니다.')
            return
        }

        let newSelectedTimes: string[]
        if (selectedTimes.includes(time)) {
            newSelectedTimes = selectedTimes.filter(t => t !== time)
        } else {
            newSelectedTimes = [...selectedTimes, time]
        }
        
        setSelectedTimes(newSelectedTimes)
        
        // 사용자 선택 상태를 날짜별로 저장
        // DB에 있는 시간과 사용자가 추가로 선택한 시간을 구분하여 저장
        const existingServerTimes = dateTimeMap[selectedDate]?.map(slot => slot.startTime) || []
        const removedServerTimes: string[] = []
        
        // DB에서 제거된 시간들을 추적
        existingServerTimes.forEach(serverTime => {
            if (!newSelectedTimes.includes(serverTime)) {
                removedServerTimes.push(serverTime)
            }
        })
        
        // 사용자가 새로 추가한 시간들 (DB에 없는 시간들)
        const addedTimes = newSelectedTimes.filter(t => !existingServerTimes.includes(t))
        
        setUserSelectedTimesByDate(prev => ({
            ...prev,
            [selectedDate]: {
                added: addedTimes,
                removed: removedServerTimes
            }
        }))
    }

    const formatDateHeader = (dateString: string) => {
        const date = new Date(dateString)
        return format(date, 'M월 d일 (E)', { locale: ko })
    }

    // 캘린더에 표시할 marked dates 생성
    const getMarkedDates = () => {
        const marked: any = {}

        // 선택된 날짜 표시
        marked[selectedDate] = {
            selected: true,
            selectedColor: '#3b82f6'
        }

        return marked
    }

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">면접 요청</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* 구직자 정보 */}
                <View className="bg-gray-50 p-4 m-4 rounded-lg">
                    <Text className="text-sm text-gray-600 mb-1">면접 대상자</Text>
                    <Text className="text-lg font-semibold">{jobSeekerName}</Text>
                </View>

                {/* 공고 선택 */}
                <View className="px-4 mb-6">
                    <Text className="text-base font-semibold mb-3">공고 선택</Text>
                    {companyJobPostings.length === 0 ? (
                        <View className="border border-gray-200 rounded-lg p-4">
                            <Text className="text-gray-500 text-center">
                                활성화된 공고가 없습니다.
                            </Text>
                        </View>
                    ) : (
                        <View className="border border-gray-200 rounded-lg">
                            {companyJobPostings.map((posting, index) => (
                                <TouchableOpacity
                                    key={posting.id}
                                    onPress={() => setSelectedJobPostingId(posting.id)}
                                    className={`p-4 ${
                                        index !== companyJobPostings.length - 1 ? 'border-b border-gray-100' : ''
                                    } ${
                                        selectedJobPostingId === posting.id ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1">
                                            <View className={`w-5 h-5 rounded-full border-2 mr-3 ${
                                                selectedJobPostingId === posting.id 
                                                    ? 'bg-blue-500 border-blue-500' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {selectedJobPostingId === posting.id && (
                                                    <View className="flex-1 justify-center items-center">
                                                        <View className="w-2 h-2 bg-white rounded-full" />
                                                    </View>
                                                )}
                                            </View>
                                            <Text className={`flex-1 ${
                                                selectedJobPostingId === posting.id
                                                    ? 'text-blue-600 font-medium'
                                                    : 'text-gray-700'
                                            }`}>
                                                {posting.title}
                                            </Text>
                                        </View>
                                        {posting.hasExistingApplication && (
                                            <View className="flex-row items-center ml-2">
                                                <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                                                <Text className="text-xs text-green-600 ml-1 font-medium">
                                                    지원완료
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                {/* 면접 장소 입력 */}
                <View className="px-4 mb-6">
                    <Text className="text-base font-semibold mb-3">면접 장소</Text>
                    <TextInput
                        value={interviewLocation}
                        onChangeText={setInterviewLocation}
                        placeholder="예: 서울시 강남구 테헤란로 123 5층"
                        className="border border-gray-300 rounded-lg px-4 py-3"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* 캘린더 */}
                <View className="bg-white border-t border-gray-200">
                    <View className="p-4">
                        <Text className="text-base font-semibold mb-3">면접 날짜 선택</Text>
                    </View>
                    <Calendar
                        current={selectedDate}
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={getMarkedDates()}
                        minDate={format(new Date(), 'yyyy-MM-dd')}
                        theme={{
                            backgroundColor: '#ffffff',
                            calendarBackground: '#ffffff',
                            selectedDayBackgroundColor: '#3b82f6',
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: '#3b82f6',
                            dayTextColor: '#2d3748',
                            textDisabledColor: '#cbd5e0',
                            dotColor: '#3b82f6',
                            monthTextColor: '#1a202c',
                            textMonthFontWeight: 'bold',
                            textDayFontSize: 16,
                            textMonthFontSize: 18,
                            textDayHeaderFontSize: 14
                        }}
                    />
                </View>

                {/* 면접 유형 선택 */}
                {/*<View className="px-4 mb-6">*/}
                {/*    <Text className="text-base font-semibold mb-3">면접 유형</Text>*/}
                {/*    <View className="flex-row gap-3">*/}
                {/*        {['대면', '화상', '전화'].map((type) => (*/}
                {/*            <TouchableOpacity*/}
                {/*                key={type}*/}
                {/*                onPress={() => setInterviewType(type as '대면' | '화상' | '전화')}*/}
                {/*                className={`px-4 py-2 rounded-lg border ${*/}
                {/*                    interviewType === type*/}
                {/*                        ? 'bg-blue-500 border-blue-500'*/}
                {/*                        : 'bg-white border-gray-300'*/}
                {/*                }`}*/}
                {/*            >*/}
                {/*                <Text className={`text-center ${*/}
                {/*                    interviewType === type ? 'text-white' : 'text-gray-700'*/}
                {/*                }`}>*/}
                {/*                    {type}*/}
                {/*                </Text>*/}
                {/*            </TouchableOpacity>*/}
                {/*        ))}*/}
                {/*    </View>*/}
                {/*</View>*/}

                {/* 선택된 날짜의 시간대 선택 */}
                <View className="p-4">
                    <Text className="text-base font-semibold mb-3">
                        {formatDateHeader(selectedDate)} 면접 시간대 선택
                    </Text>
                    
                    <TimeSlotGrid
                        timeSlots={timeSlots}
                        selectedTimes={selectedTimes}
                        bookedSlots={bookedSlots[selectedDate] || []}
                        onTimeToggle={handleTimeToggle}
                    />
                    {/* 전체 날짜의 선택된 시간대 요약 */}
                    {(() => {
                        const now = new Date()
                        const allValidSlots: Array<{ date: string, time: string, isBooked: boolean }> = []
                        
                        // 모든 날짜의 시간대를 수집하고 현재 시간 이후만 필터링
                        Object.entries(dateTimeMap).forEach(([date, slots]) => {
                            const dateObj = new Date(date)
                            const isToday = dateObj.toDateString() === now.toDateString()
                            
                            slots.forEach(slot => {
                                const [hour, minute] = slot.startTime.split(':')
                                const slotDateTime = new Date(date)
                                slotDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0)
                                
                                // 오늘인 경우 현재 시간 이후만, 미래 날짜는 모두 포함
                                const isValidTime = isToday ? slotDateTime >= now : dateObj > now
                                
                                if (isValidTime) {
                                    const isBooked = bookedSlots[date]?.includes(slot.startTime) || false
                                    allValidSlots.push({
                                        date: date,
                                        time: slot.startTime,
                                        isBooked: isBooked
                                    })
                                }
                            })
                        })
                        
                        // 사용자가 선택한 시간대 추가
                        Object.entries(userSelectedTimesByDate).forEach(([date, userSelection]) => {
                            const dateObj = new Date(date)
                            const isToday = dateObj.toDateString() === now.toDateString()
                            
                            // 사용자가 추가한 시간들
                            userSelection.added.forEach(time => {
                                const [hour, minute] = time.split(':')
                                const slotDateTime = new Date(date)
                                slotDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0)
                                
                                const isValidTime = isToday ? slotDateTime >= now : dateObj > now
                                
                                if (isValidTime && !allValidSlots.find(slot => slot.date === date && slot.time === time)) {
                                    allValidSlots.push({
                                        date: date,
                                        time: time,
                                        isBooked: false
                                    })
                                }
                            })
                            
                            // 사용자가 제거한 시간들을 allValidSlots에서 제거
                            userSelection.removed.forEach(removedTime => {
                                const index = allValidSlots.findIndex(slot => slot.date === date && slot.time === removedTime)
                                if (index !== -1) {
                                    allValidSlots.splice(index, 1)
                                }
                            })
                        })
                        
                        // 현재 날짜의 선택된 시간대 추가
                        if (selectedTimes.length > 0) {
                            const dateObj = new Date(selectedDate)
                            const isToday = dateObj.toDateString() === now.toDateString()
                            
                            selectedTimes.forEach(time => {
                                const [hour, minute] = time.split(':')
                                const slotDateTime = new Date(selectedDate)
                                slotDateTime.setHours(parseInt(hour), parseInt(minute), 0, 0)
                                
                                const isValidTime = isToday ? slotDateTime >= now : dateObj > now
                                
                                if (isValidTime && !allValidSlots.find(slot => slot.date === selectedDate && slot.time === time)) {
                                    const isBooked = bookedSlots[selectedDate]?.includes(time) || false
                                    allValidSlots.push({
                                        date: selectedDate,
                                        time: time,
                                        isBooked: isBooked
                                    })
                                }
                            })
                        }
                        
                        // 날짜별, 시간별로 정렬
                        allValidSlots.sort((a, b) => {
                            if (a.date !== b.date) {
                                return a.date.localeCompare(b.date)
                            }
                            const [aHour, aMin] = a.time.split(':').map(Number)
                            const [bHour, bMin] = b.time.split(':').map(Number)
                            return (aHour * 60 + aMin) - (bHour * 60 + bMin)
                        })
                        
                        if (allValidSlots.length === 0) return null
                        
                        return (
                            <View className="mt-6 bg-green-50 rounded-lg border border-green-200">
                                {/* 접기/펼치기 헤더 */}
                                <TouchableOpacity
                                    onPress={() => setIsSummaryExpanded(!isSummaryExpanded)}
                                    className="flex-row items-center justify-between p-4"
                                >
                                    <View className="flex-row items-center gap-2">
                                        <Ionicons name="calendar" size={20} color="#16a34a" />
                                        <Text className="text-lg font-semibold text-green-900">
                                            전체 면접 가능 시간대 ({allValidSlots.length}개)
                                        </Text>
                                    </View>
                                    <Ionicons 
                                        name={isSummaryExpanded ? "chevron-up" : "chevron-down"} 
                                        size={20} 
                                        color="#16a34a" 
                                    />
                                </TouchableOpacity>
                                
                                {/* 접을 수 있는 내용 */}
                                {isSummaryExpanded && (
                                    <View className="px-4 pb-4">
                                        {/* 날짜별로 그룹화하여 표시 */}
                                        {Object.entries(
                                            allValidSlots.reduce((acc, slot) => {
                                                if (!acc[slot.date]) acc[slot.date] = []
                                                acc[slot.date].push(slot)
                                                return acc
                                            }, {} as Record<string, typeof allValidSlots>)
                                        ).map(([date, slots]) => (
                                            <View key={date} className="mb-3">
                                                <Text className="text-sm font-medium text-green-800 mb-2">
                                                    {formatDateHeader(date)}
                                                </Text>
                                                <View className="flex-row flex-wrap gap-2 pl-2">
                                                    {slots.map((slot) => (
                                                        <View
                                                            key={`${slot.date}-${slot.time}`}
                                                            className={`px-3 py-1.5 rounded-full border ${
                                                                slot.isBooked
                                                                    ? 'bg-gray-100 border-gray-300'
                                                                    : 'bg-green-100 border-green-300'
                                                            }`}
                                                        >
                                                            <Text className={`text-sm font-medium ${
                                                                slot.isBooked ? 'text-gray-600' : 'text-green-800'
                                                            }`}>
                                                                {slot.time}{slot.isBooked ? ' (예약됨)' : ''}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            </View>
                                        ))}
                                        
                                        <View className="mt-2 pt-2 border-t border-green-200">
                                            <Text className="text-xs text-green-600 text-center">
                                                💡 현재 시간 이후의 모든 면접 가능 시간대입니다
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )
                    })()}
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSendInterviewRequest}
                    disabled={submitting || !selectedJobPostingId || getTotalSelectedSlots() === 0 || !interviewLocation.trim()}
                    className={`py-4 rounded-xl ${
                        submitting || !selectedJobPostingId || getTotalSelectedSlots() === 0 || !interviewLocation.trim()
                            ? 'bg-gray-300'
                            : 'bg-blue-500'
                    }`}
                >
                    <View className="flex-row items-center justify-center">
                        <Ionicons 
                            name="send" 
                            size={20} 
                            color="white" 
                        />
                        <Text className="text-white font-bold text-lg ml-2">
                            {submitting ? '요청 전송 중...' : '면접 요청 보내기'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ModalComponent />
        </SafeAreaView>
    )
}