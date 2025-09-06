import { DATE_CONFIG } from '@/lib/core/config';

/**
 * 날짜/시간 관련 유틸리티 함수들
 */

/**
 * 채팅방 목록에서 사용할 마지막 메시지 시간 포맷
 * 24시간 이내: 시:분 (예: 14:30)
 * 24시간 이후: 월 일 (예: 1월 15일)
 */
export const formatLastMessageTime = (timestamp?: string): string => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 3600);

  if (diffInHours < 24) {
    // 24시간 이내면 시간만 표시
    return date.toLocaleTimeString(DATE_CONFIG.LOCALE, DATE_CONFIG.TIME_FORMAT);
  } else {
    // 24시간 이후면 날짜 표시
    return date.toLocaleDateString(DATE_CONFIG.LOCALE, DATE_CONFIG.DATE_FORMAT);
  }
};

/**
 * 채팅 메시지에서 사용할 시간 포맷
 * 24시간 이내: 시:분 (예: 14:30)
 * 24시간 이후: 월 일 시:분 (예: 1월 15일 14:30)
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffInHours = diff / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    // 24시간 이내면 시간만 표시
    return date.toLocaleTimeString(DATE_CONFIG.LOCALE, DATE_CONFIG.TIME_FORMAT);
  } else {
    // 24시간 이후면 날짜와 시간 표시
    return date.toLocaleDateString(DATE_CONFIG.LOCALE, {
      ...DATE_CONFIG.DATE_FORMAT,
      ...DATE_CONFIG.TIME_FORMAT
    });
  }
};

/**
 * ISO 문자열을 Date 객체로 안전하게 변환
 */
export const parseDate = (dateString: string): Date => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', dateString);
    return new Date();
  }
  
  return date;
};

/**
 * 현재 시간을 ISO 문자열로 반환
 */
export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};