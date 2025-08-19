// lib/dateUtils.ts
// 모든 날짜/시간 처리를 통일하기 위한 유틸리티 함수들

/**
 * ISO 날짜 문자열을 로컬 시간 기준 YYYY-MM-DD 형태로 변환
 * UTC 변환으로 인한 날짜 오차를 방지
 */
export const getLocalDateString = (dateTimeString: string): string => {
  const date = new Date(dateTimeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * ISO 날짜 문자열을 로컬 시간 기준 HH:MM 형태로 변환
 */
export const getLocalTimeString = (dateTimeString: string): string => {
  const date = new Date(dateTimeString)
  return date.toTimeString().slice(0, 5)
}

/**
 * 날짜 문자열을 한국어 형태로 포맷 (예: 8월 7일 (수))
 */
export const formatKoreanDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })
}

/**
 * 시간 문자열을 24시간 형태로 포맷 (HH:MM)
 */
export const formatTime24 = (timeString: string): string => {
  // 이미 HH:MM 형태인 경우 그대로 반환
  if (timeString.match(/^\d{2}:\d{2}$/)) {
    return timeString
  }
  
  // ISO 형태인 경우 Date 객체로 변환하여 로컬 시간으로 표시
  if (timeString.includes('T') || timeString.includes('Z')) {
    const date = new Date(timeString)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }
  
  return timeString
}

/**
 * 배열의 객체들을 날짜별로 그룹화
 * @param items 그룹화할 객체 배열
 * @param dateKeyExtractor 객체에서 날짜 문자열을 추출하는 함수
 */
export const groupByDate = <T>(
  items: T[],
  dateKeyExtractor: (item: T) => string
): Record<string, T[]> => {
  const grouped: Record<string, T[]> = {}
  
  items.forEach(item => {
    const dateTimeString = dateKeyExtractor(item)
    const dateKey = getLocalDateString(dateTimeString)
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = []
    }
    grouped[dateKey].push(item)
  })
  
  return grouped
}