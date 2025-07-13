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
    const countryOptions = keywords
        .filter(k => k.category === '국가')
        .map(country => ({
            label: translateDB('keyword', 'keyword', country.id.toString(), country.keyword),
            value: country.id
        }));

    return (
        <View className="p-4">
            <Text className="text-base font-semibold mb-3">{t('info.country', '국가')}</Text>
            <View className="p-3 bg-gray-50 rounded-xl">
                <Dropdown
                    style={{
                        height: 45,
                        borderColor: '#d1d5db',
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        backgroundColor: 'white',
                    }}
                    placeholderStyle={{
                        fontSize: 14,
                        color: '#9ca3af'
                    }}
                    selectedTextStyle={{
                        fontSize: 14,
                    }}
                    inputSearchStyle={{
                        height: 40,
                        fontSize: 14,
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
        </View>
    )
}