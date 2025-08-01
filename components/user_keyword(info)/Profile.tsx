import {Text, TextInput, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import React from "react";
import {useTranslation} from "@/contexts/TranslationContext";

interface Keyword {
    id: number;
    keyword: string;
    category: string;
}

interface ProfileProps {
    formData: {
        name: string,
        age: string,
        gender: string | null,
        visa: string | null,
        koreanLevel: string | null,
    }
    handler: {
        setName: (name: string) => void,
        setAge: (age: string) => void,
        setGender: (gender: string | null) => void,
        setVisa: (visa: string | null) => void,
        setKoreanLevel: (koreanLevel: string | null) => void,
    }
    keywords: Keyword[];
}

export const Profile = ({ formData, handler, keywords }:ProfileProps) => {
    const { t } = useTranslation();
    const { name, age, gender, visa, koreanLevel } = formData;
    const { setName, setAge, setGender, setVisa, setKoreanLevel } = handler;

    // DB에서 카테고리별 키워드 필터링
    const genderKeywords = keywords.filter(k => k.category === '성별')
    const anyGenderKeyword = genderKeywords.find(k => k.keyword === '상관없음')
    
    const visaKeywords = keywords.filter(k => k.category === '비자')
    const anyVisaKeyword = visaKeywords.find(k => k.keyword === '상관없음')
    
    const koreanLevelKeywords = keywords.filter(k => k.category === '한국어수준')
    const anyKoreanLevelKeyword = koreanLevelKeywords.find(k => k.keyword === '상관없음')

    // 드롭다운 옵션 생성
    const genderOptions = [
        // 나머지 성별들
        ...genderKeywords
            .filter(keyword => keyword.keyword !== '상관없음')
            .map(keyword => ({
                label: keyword.keyword,
                value: keyword.keyword
            })),
        // 상관없음을 "기타"로 표시하여 맨 아래로
        ...(anyGenderKeyword 
            ? [{
                label: '기타',
                value: anyGenderKeyword.keyword  // 실제 DB 값은 '상관없음'
            }]
            : [])
    ];
    
    const visaOptions = [
        // 비자는 기타 옵션 숨김 - 상관없음 제외
        ...visaKeywords
            .filter(keyword => keyword.keyword !== '상관없음')
            .map(keyword => ({
                label: keyword.keyword,
                value: keyword.keyword
            }))
    ];
    
    const koreanLevelOptions = [
        // 한국어수준도 기타 옵션 숨김 - 상관없음 제외
        ...koreanLevelKeywords
            .filter(keyword => keyword.keyword !== '상관없음')
            .sort((a, b) => {
                const order = ['초급', '중급', '고급'];
                return order.indexOf(a.keyword) - order.indexOf(b.keyword);
            })
            .map(keyword => ({
                label: keyword.keyword,
                value: keyword.keyword
            }))
    ];

    return (
        <View className="mx-4 mb-4 p-5 bg-white rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold mb-4 text-gray-900">{t('info.profile_info', '프로필 정보')}</Text>

            {/* 이름 */}
            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">{t('info.name', '이름')} *</Text>
                <TextInput
                    className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                    placeholder={t('info.enter_name', '이름을 입력하세요')}
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                />
            </View>

            {/* 나이 */}
            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">{t('info.age', '나이')} *</Text>
                <TextInput
                    className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50"
                    placeholder={t('info.enter_age', '나이를 입력하세요')}
                    placeholderTextColor="#9ca3af"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    maxLength={3}
                />
            </View>

            {/* 성별 */}
            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">{t('info.gender', '성별')} *</Text>
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
                    }}
                    data={genderOptions}
                    labelField="label"
                    valueField="value"
                    placeholder={t('info.select_gender', '성별을 선택하세요')}
                    value={gender}
                    onChange={item => {
                        setGender(item.value);
                    }}
                />
            </View>

            {/* 비자 */}
            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">{t('info.visa_type', '비자 종류')} *</Text>
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
                    }}
                    data={visaOptions}
                    labelField="label"
                    valueField="value"
                    placeholder={t('info.select_visa', '비자를 선택하세요')}
                    value={visa}
                    onChange={item => {
                        setVisa(item.value);
                    }}
                />
            </View>

            {/* 한국어 실력 */}
            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">{t('info.korean_level', '한국어 실력')} *</Text>
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
                    }}
                    data={koreanLevelOptions}
                    labelField="label"
                    valueField="value"
                    placeholder={t('info.select_korean_level', '한국어 실력을 선택하세요')}
                    value={koreanLevel}
                    onChange={item => {
                        setKoreanLevel(item.value);
                    }}
                />
            </View>
        </View>
    )
}