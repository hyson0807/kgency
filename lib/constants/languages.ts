export const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
    { code: 'ar', name: 'العربية', flag: '🇩🇿' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
    { code: 'ky', name: 'Кыргызча', flag: '🇰🇬' },
    { code: 'ha', name: 'Hausa', flag: '🇳🇬' },
    { code: 'mn', name: 'Монгол', flag: '🇲🇳' }
] as const;

export type LanguageCode = typeof languages[number]['code'];