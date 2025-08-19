import { Ionicons } from '@expo/vector-icons'

export interface TimeSlot {
    date: string
    startTime: string
    endTime: string
    interviewType: '대면' | '화상' | '전화'
}

export interface InterviewCalendarSelectorProps {
    companyId: string
    onConfirm: (selectedDate: string, selectedTime: string, interviewType: string) => void
}

export interface TimePeriod {
    id: string
    name: string
    icon: keyof typeof Ionicons.glyphMap
    times: string[]
}