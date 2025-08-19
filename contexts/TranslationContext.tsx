// contexts/TranslationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from '@/lib/translations';
import { Language } from '@/lib/translations/types';
import { api } from '@/lib/api';
interface TranslationCache {
    [key: string]: string;
}
interface TranslationContextType {
    language: string;
    changeLanguage: (lang: string) => Promise<void>;
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
    translateDB: (tableName: string, columnName: string, rowId: string, defaultText: string) => string;
    loading: boolean;
}
const TranslationContext = createContext<TranslationContextType | undefined>(undefined);
export const useTranslation = (): TranslationContextType => {
    const context = useContext(TranslationContext);
    if (!context) {
        throw new Error('useTranslation must be used within TranslationProvider');
    }
    return context;
};
interface TranslationProviderProps {
    children: ReactNode;
}
export const TranslationProvider: React.FC<TranslationProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState<string>('ko');
    const [dbCache, setDbCache] = useState<TranslationCache>({});
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadLanguage();
    }, []);
    const loadLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('appLanguage');
            if (savedLanguage) {
                setLanguage(savedLanguage);
                // DB 번역 캐시 로드
                const cache = await AsyncStorage.getItem(`translations_${savedLanguage}`);
                if (cache) {
                    setDbCache(JSON.parse(cache));
                }
            }
        } catch (error) {
            // 언어 설정 로드 실패
        } finally {
            setLoading(false);
        }
    };
    const changeLanguage = async (newLanguage: string) => {
        try {
            await AsyncStorage.setItem('appLanguage', newLanguage);
            setLanguage(newLanguage);
            // 언어 변경 시 DB 캐시 로드
            if (newLanguage !== 'ko') {
                const cache = await AsyncStorage.getItem(`translations_${newLanguage}`);
                if (cache) {
                    setDbCache(JSON.parse(cache));
                } else {
                    // 캐시가 없으면 DB에서 로드
                    await preloadDBTranslations(newLanguage);
                }
            } else {
                setDbCache({});
            }
        } catch (error) {
            // 언어 변경 실패
        }
    };
    const preloadDBTranslations = async (lang: string) => {
        try {
            const response = await api('GET', `/api/translate/db-translations/${lang}`);
            
            if (response.success && response.data) {
                setDbCache(response.data);
                await AsyncStorage.setItem(
                    `translations_${lang}`,
                    JSON.stringify(response.data)
                );
            }
        } catch (error) {
            // DB 번역 로드 실패
        }
    };
    const t = (key: string, defaultText: string, variables?: { [key: string]: string | number }): string => {
        if (language === 'ko') {
            return replaceVariables(defaultText, variables);
        }
        // 타입 안전성을 위해 언어 코드 확인
        const translationEntry = translations[key];
        if (!translationEntry) {
            return replaceVariables(defaultText, variables);
        }
        // Language 타입으로 캐스팅하여 안전하게 접근
        const text = translationEntry[language as Language] || defaultText;
        return replaceVariables(text, variables);
    };
    const replaceVariables = (text: string, variables?: { [key: string]: string | number }): string => {
        if (!variables) return text;
        let result = text;
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            result = result.replace(regex, String(variables[key]));
        });
        return result;
    };
    const translateDB = (tableName: string, columnName: string, rowId: string, defaultText: string): string => {
        if (language === 'ko') return defaultText;
        const key = `${tableName}.${columnName}.${rowId}`;
        return dbCache[key] || defaultText;
    };
    const value: TranslationContextType = {
        language,
        changeLanguage,
        t,
        translateDB,
        loading
    };
    return (
        <TranslationContext.Provider value={value}>
            {children}
        </TranslationContext.Provider>
    );
};