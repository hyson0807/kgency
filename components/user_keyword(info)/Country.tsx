import {Text, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import React from "react";
import {useTranslation} from "@/contexts/TranslationContext";
interface Keyword {
    id: number;
    keyword: string;
    category: string;
}
interface CountryProps {
    keywords: Keyword[],
    selectedCountry: number | null,
    setSelectedCountry: (countryId: number | null) => void,
}
export const Country = ({
    keywords,
    selectedCountry,
    setSelectedCountry,
                        }: CountryProps) => {
    const {t, translateDB} = useTranslation();
    const countryKeywords = keywords.filter(k => k.category.trim() === '국가')
    const anyCountryKeyword = countryKeywords.find(k => k.keyword === '상관없음')
    
    const countryOptions = [
        // 상관없음을 "기타"로 표시하여 맨 위로
        ...(anyCountryKeyword 
            ? [{
                label: t('common.other', '기타'),  // 상관없음을 기타로 표시
                value: anyCountryKeyword.id
            }]
            : []),
        // 나머지 국가들
        ...countryKeywords
            .filter(country => country.keyword !== '상관없음')
            .map(country => ({
                label: translateDB('keyword', 'keyword', country.id.toString(), country.keyword),
                value: country.id
            }))
    ];
    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">{t('info.country', '국가')}</Text>
            <Dropdown
                style={{
                    height: 48,
                    borderColor: '#e5e7eb',
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    backgroundColor: '#f9fafb',
                }}
                placeholderStyle={{
                    fontSize: 14,
                    color: '#9ca3af'
                }}
                selectedTextStyle={{
                    fontSize: 14,
                    color: '#111827'
                }}
                inputSearchStyle={{
                    height: 40,
                    fontSize: 14,
                    borderRadius: 8,
                }}
                iconStyle={{
                    width: 20,
                    height: 20,
                }}
                data={countryOptions}
                search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={t('info.select_country', '국가를 선택하세요')}
                searchPlaceholder={t('info.search', '검색...')}
                value={selectedCountry}
                onChange={item => {
                    setSelectedCountry(item.value);
                }}
            />
        </View>
    )
}