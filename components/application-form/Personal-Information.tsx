import React from "react";
import {Text, TextInput, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";


interface PersonalInformationProps {
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
    name: string ,
    setName: (name: string) => void,
    age: string | '',
    setAge: (age: string) => void,
    gender: string | null,
    setGender: (gender: string) => void,
    visa: string | null,
    setVisa: (visa: string) => void,
}



export const PersonalInformation = ({
    t,
    name,
    setName,
    age,
    setAge,
    gender,
    setGender,
    visa,
    setVisa,

}: PersonalInformationProps) => {

    const genderOptions = [
        { label: t('apply.gender_male', '남성'), value: '남성' },
        { label: t('apply.gender_female', '여성'), value: '여성' },
        { label: t('apply.gender_other', '기타'), value: '기타' }
    ]

    const visaOptions = [
        { label: t('apply.visa_f2', 'F-2 (거주비자)'), value: 'F-2' },
        { label: t('apply.visa_f4', 'F-4 (재외동포)'), value: 'F-4' },
        { label: t('apply.visa_f5', 'F-5 (영주)'), value: 'F-5' },
        { label: t('apply.visa_f6', 'F-6 (결혼이민)'), value: 'F-6' },
        { label: t('apply.visa_e9', 'E-9 (비전문취업)'), value: 'E-9' },
        { label: t('apply.visa_h2', 'H-2 (방문취업)'), value: 'H-2' },
        { label: t('apply.visa_d2', 'D-2 (유학)'), value: 'D-2' },
        { label: t('apply.visa_d4', 'D-4 (일반연수)'), value: 'D-4' },
        { label: t('apply.visa_other', '기타'), value: '기타' }
    ];

    return (

    <View className="mb-6">
        <Text className="text-lg font-bold mb-4">{t('apply.basic_info', '기본 정보')}</Text>
        <View className="mb-4">
            <Text className="text-gray-700 mb-2">{t('apply.name', '이름')} *</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-3"
                placeholder={t('apply.enter_name', '이름을 입력하세요')}
                value={name}
                onChangeText={setName}
            />
        </View>
        <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
                <Text className="text-gray-700 mb-2">{t('apply.age', '나이')}</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3"
                    placeholder={t('apply.age', '나이')}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                />
            </View>
            <View className="flex-1">
                <Text className="text-gray-700 mb-2">{t('apply.gender', '성별')}</Text>
                <Dropdown
                    style={{
                        height: 50,
                        borderColor: '#d1d5db',
                        borderWidth: 1,
                        borderRadius: 8,
                        paddingHorizontal: 12,
                    }}
                    placeholderStyle={{fontSize: 14, color: '#9ca3af'}}
                    selectedTextStyle={{fontSize: 14}}
                    data={genderOptions}
                    labelField="label"
                    valueField="value"
                    placeholder={t('apply.select', '선택')}
                    value={gender}
                    onChange={item => setGender(item.value)}
                />
            </View>
        </View>

        <View className="mb-4">
            <Text className="text-gray-700 mb-2">{t('apply.visa_type', '비자 종류')}</Text>
            <Dropdown
                style={{
                    height: 50,
                    borderColor: '#d1d5db',
                    borderWidth: 1,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                }}
                placeholderStyle={{fontSize: 14, color: '#9ca3af'}}
                selectedTextStyle={{fontSize: 14}}
                data={visaOptions}
                labelField="label"
                valueField="value"
                placeholder={t('apply.select_visa', '비자 종류 선택')}
                value={visa}
                onChange={item => setVisa(item.value)}
            />
        </View>
    </View>

    )
}
