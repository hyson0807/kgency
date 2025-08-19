import { calendarConfig as ko } from './ko';
import { calendarConfig as en } from './en';
import { calendarConfig as ja } from './ja';
import { calendarConfig as zh } from './zh';
import { calendarConfig as vi } from './vi';
import { calendarConfig as hi } from './hi';
import { calendarConfig as si } from './si';
import { calendarConfig as ar } from './ar';
import { calendarConfig as tr } from './tr';
import { calendarConfig as my } from './my';
import { calendarConfig as ky } from './ky';
import { calendarConfig as ha } from './ha';
import { calendarConfig as mn } from './mn';

export interface CalendarConfig {
    monthNames: string[];
    monthNamesShort: string[];
    dayNames: string[];
    dayNamesShort: string[];
    today: string;
}

export const calendarConfigs: Record<string, CalendarConfig> = {
    ko,
    en,
    ja,
    zh,
    vi,
    hi,
    si,
    ar,
    tr,
    my,
    ky,
    ha,
    mn
};

// 특정 언어의 캘린더 설정을 가져오는 함수
export const getCalendarConfig = (locale: string): CalendarConfig => {
    return calendarConfigs[locale] || calendarConfigs.ko; // 기본값은 한국어
};