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
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useModal } from '@/hooks/useModal'

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
    const [userSelectedTimesByDate, setUserSelectedTimesByDate] = useState<Record<string, string[]>>({})

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

    useEffect(() => {
        // 날짜 변경 시 해당 날짜에 이미 사용자가 선택한 시간대가 있으면 로드
        if (selectedDate) {
            const userSelectedForDate = userSelectedTimesByDate[selectedDate] || []
            const existingServerTimes = dateTimeMap[selectedDate]?.map(slot => slot.startTime) || []
            
            // 사용자 선택 + 서버에 저장된 시간대 합치기
            const combinedTimes = [...new Set([...userSelectedForDate, ...existingServerTimes])]
            setSelectedTimes(combinedTimes)
            
            // 면접 유형 설정 (기존 데이터 우선)
            if (dateTimeMap[selectedDate]?.length > 0) {
                setInterviewType(dateTimeMap[selectedDate][0].interviewType || '대면')
            } else {
                setInterviewType('대면')
            }
        }
    }, [selectedDate, dateTimeMap, userSelectedTimesByDate])

    const fetchInitialData = async () => {
        try {
            setLoading(true)
            
            // 회사 공고 목록 가져오기
            const { data: jobPostings, error: jobError } = await supabase
                .from('job_postings')
                .select('id, title')
                .eq('company_id', user?.userId)
                .eq('is_active', true)
                .is('deleted_at', null)

            if (jobError) throw jobError

            // 구직자의 기존 지원서 확인
            const { data: existingApplications, error: appError } = await supabase
                .from('applications')
                .select('job_posting_id')
                .eq('user_id', jobSeekerId)
                .eq('company_id', user?.userId)
                .is('deleted_at', null)

            if (appError) throw appError

            const appliedJobPostingIds = new Set(existingApplications?.map(app => app.job_posting_id) || [])

            // 공고에 지원 여부 정보 추가
            const jobPostingsWithStatus = (jobPostings || []).map(posting => ({
                ...posting,
                hasExistingApplication: appliedJobPostingIds.has(posting.id)
            }))

            setCompanyJobPostings(jobPostingsWithStatus)

            // 구직자 이름 가져오기
            const { data: jobSeeker, error: seekerError } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', jobSeekerId)
                .single()

            if (seekerError) throw seekerError
            setJobSeekerName(jobSeeker?.name || '')

        } catch (error) {
            console.error('데이터 로딩 실패:', error)
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
                    const startDateTime = new Date(slot.start_time)
                    const date = startDateTime.toISOString().split('T')[0]
                    const startTime = startDateTime.toTimeString().slice(0, 5)

                    const endDateTime = new Date(slot.end_time)
                    const endTime = endDateTime.toTimeString().slice(0, 5)

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
            }
        } catch (error) {
            console.error('면접 시간대 조회 실패:', error)
        }
    }

    const handleSendInterviewRequest = async () => {
        if (!selectedJobPostingId) {
            showModal('알림', '면접 제안할 공고를 선택해주세요.')
            return
        }

        if (selectedTimes.length === 0) {
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
            const { data: application, error: appError } = await supabase
                .from('applications')
                .insert({
                    user_id: jobSeekerId,
                    company_id: user?.userId,
                    job_posting_id: selectedJobPostingId,
                    type: 'company_invited',
                    status: 'invited'
                })
                .select()
                .single()

            if (appError) {
                // 중복 키 에러 체크
                if (appError.code === '23505' && appError.message.includes('unique_user_job_posting_application')) {
                    showModal('알림', '해당 구직자는 이미 이 공고에 지원했습니다.')
                    return
                }
                throw appError
            }

            // 3. 면접 제안 생성
            const response = await api('POST', '/api/interview-proposals/company', {
                applicationId: application.id,
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
    for (let hour = 10; hour < 18; hour++) {
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
        setUserSelectedTimesByDate(prev => ({
            ...prev,
            [selectedDate]: newSelectedTimes.filter(t => !dateTimeMap[selectedDate]?.some(slot => slot.startTime === t))
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
                <View className="px-4 mb-6">
                    <Text className="text-base font-semibold mb-3">면접 유형</Text>
                    <View className="flex-row gap-3">
                        {['대면', '화상', '전화'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                onPress={() => setInterviewType(type as '대면' | '화상' | '전화')}
                                className={`px-4 py-2 rounded-lg border ${
                                    interviewType === type
                                        ? 'bg-blue-500 border-blue-500'
                                        : 'bg-white border-gray-300'
                                }`}
                            >
                                <Text className={`text-center ${
                                    interviewType === type ? 'text-white' : 'text-gray-700'
                                }`}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 선택된 날짜의 시간대 선택 */}
                <View className="p-4">
                    <Text className="text-base font-semibold mb-3">
                        {formatDateHeader(selectedDate)} 면접 시간대 선택
                    </Text>
                    
                    <View className="flex-row flex-wrap gap-2">
                        {timeSlots.map((time) => {
                            const isSelected = selectedTimes.includes(time)
                            const isBooked = bookedSlots[selectedDate]?.includes(time)
                            
                            return (
                                <TouchableOpacity
                                    key={time}
                                    onPress={() => handleTimeToggle(time)}
                                    disabled={isBooked}
                                    className={`p-3 rounded-lg border min-w-[70px] ${
                                        isBooked
                                            ? 'bg-gray-100 border-gray-200'
                                            : isSelected
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-white border-gray-300'
                                    }`}
                                >
                                    <Text className={`text-sm font-medium text-center ${
                                        isBooked
                                            ? 'text-gray-400'
                                            : isSelected
                                            ? 'text-white'
                                            : 'text-gray-700'
                                    }`}>
                                        {time}
                                    </Text>
                                    {isBooked && (
                                        <Text className="text-xs text-gray-400 text-center mt-1">
                                            예약됨
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                    
                    {/* 현재 날짜 선택된 시간대 */}
                    {selectedTimes.length > 0 && (
                        <View className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <Text className="text-sm text-blue-600 font-medium mb-1">
                                {formatDateHeader(selectedDate)} 선택된 시간대 ({selectedTimes.length}개)
                            </Text>
                            <Text className="text-sm text-blue-600 mb-2">
                                {selectedTimes.sort().join(', ')}
                            </Text>
                        </View>
                    )}
                    
                    {/* 전체 날짜의 선택된 시간대 요약 */}
                    {(() => {
                        // 모든 날짜의 시간대 수집: 서버 데이터 + 사용자 선택
                        const allDatesWithTimes: Record<string, string[]> = {}
                        
                        // 서버에 저장된 시간대 추가
                        Object.entries(dateTimeMap).forEach(([date, slots]) => {
                            allDatesWithTimes[date] = slots.map(slot => slot.startTime)
                        })
                        
                        // 사용자가 선택한 시간대 추가
                        Object.entries(userSelectedTimesByDate).forEach(([date, times]) => {
                            if (times.length > 0) {
                                const existingTimes = allDatesWithTimes[date] || []
                                allDatesWithTimes[date] = [...new Set([...existingTimes, ...times])]
                            }
                        })
                        
                        // 현재 날짜의 선택된 시간대 추가
                        if (selectedTimes.length > 0) {
                            const existingTimes = allDatesWithTimes[selectedDate] || []
                            allDatesWithTimes[selectedDate] = [...new Set([...existingTimes, ...selectedTimes])]
                        }
                        
                        const hasAnyTimes = Object.values(allDatesWithTimes).some(times => times.length > 0)
                        
                        return hasAnyTimes ? (
                            <View className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                                <Text className="text-sm text-green-700 font-medium mb-2">
                                    📅 전체 면접 가능 시간대 요약
                                </Text>
                                {Object.entries(allDatesWithTimes)
                                    .filter(([_, times]) => times.length > 0)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([date, times]) => (
                                        <View key={date} className="mb-2">
                                            <Text className={`text-xs font-medium ${
                                                date === selectedDate ? 'text-blue-600' : 'text-green-600'
                                            }`}>
                                                {formatDateHeader(date)} {date === selectedDate ? '(현재 편집중)' : ''}
                                            </Text>
                                            <Text className={`text-xs ml-2 ${
                                                date === selectedDate ? 'text-blue-600' : 'text-green-600'
                                            }`}>
                                                {times.sort().join(', ')} ({times.length}개)
                                            </Text>
                                        </View>
                                    ))}
                                <View className="flex-row items-start mt-2 pt-2 border-t border-green-200">
                                    <Ionicons name="information-circle-outline" size={16} color="#059669" />
                                    <Text className="text-xs text-green-600 ml-1 flex-1">
                                        면접 요청 시 위의 모든 시간대가 구직자에게 전송됩니다.
                                    </Text>
                                </View>
                            </View>
                        ) : null
                    })()}
                </View>
            </ScrollView>

            {/* 하단 버튼 */}
            <View className="border-t border-gray-200 p-4">
                <TouchableOpacity
                    onPress={handleSendInterviewRequest}
                    disabled={submitting || !selectedJobPostingId || selectedTimes.length === 0 || !interviewLocation.trim()}
                    className={`py-4 rounded-xl ${
                        submitting || !selectedJobPostingId || selectedTimes.length === 0 || !interviewLocation.trim()
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