
// /lib/translations/types.ts
export type Language = 'en' | 'ja' | 'zh' | 'vi';

export interface TranslationEntry {
    en: string;
    ja: string;
    zh: string;
    vi: string;
}

export interface TranslationData {
    [key: string]: TranslationEntry;
}