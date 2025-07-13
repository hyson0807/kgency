import {Text, TextInput, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
import React from "react";
import {useTranslation} from "@/contexts/TranslationContext";


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
}

export const Profile = ({ formData, handler }:ProfileProps) => {
    const { t } = useTranslation();
    const { name, age, gender, visa, koreanLevel } = formData;
    const { setName, setAge, setGender, setVisa, setKoreanLevel } = handler;



    const genderOptions = [
        { label: t('info.gender_male', '남성'), value: '남성' },
        { label: t('info.gender_female', '여성'), value: '여성' }
    ];
    const visaOptions = [
        { label: 'F-2', value: 'F-2' },
        { label: 'F-4', value: 'F-4' },
        { label: 'F-5', value: 'F-5' },
        { label: 'F-6', value: 'F-6' },
        { label: 'E-9', value: 'E-9' },
        { label: 'H-2', value: 'H-2' },
        { label: 'D-2', value: 'D-2' },
        { label: 'D-4', value: 'D-4' }
    ];
    const koreanLevelOptions = [
        { label: t('info.korean_beginner', '초급'), value: '초급' },
        { label: t('info.korean_intermediate', '중급'), value: '중급' },
        { label: t('info.korean_advanced', '고급'), value: '고급' }
    ];

    return (
        <View className="p-4 border-b border-gray-100">
            <Text className="text-lg font-bold mb-4">{t('info.profile_info', '프로필 정보')}</Text>

            {/* 이름 */}
            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">{t('info.name', '이름')} *</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder={t('info.enter_name', '이름을 입력하세요')}
                    value={name}
                    onChangeText={setName}
                />
            </View>

            {/* 나이 */}
            <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">{t('info.age', '나이')} *</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder={t('info.enter_age', '나이를 입력하세요')}
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