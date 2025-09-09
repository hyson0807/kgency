import React, { useRef } from "react";
import {Text, TextInput, View, ScrollView} from "react-native";
import {Dropdown} from "react-native-element-dropdown";
interface Keyword {
    id: number;
    keyword: string;
    category: string;
}
interface PersonalInformationProps {
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
    translateDB: (tableName: string, columnName: string, rowId: string, defaultText: string) => string;
    name: string ,
    setName: (name: string) => void,
    age: string | '',
    setAge: (age: string) => void,
    gender: string | null,
    setGender: (gender: string) => void,
    visa: string | null,
    setVisa: (visa: string) => void,
    keywords?: Keyword[];
}
export const PersonalInformation = ({
    t,
    translateDB,
    name,
    setName,
    age,
    setAge,
    gender,
    setGender,
    visa,
    setVisa,
    keywords = []
}: PersonalInformationProps) => {
    const scrollViewRef = useRef<ScrollView>(null)
    
    const handleInputFocus = (inputName: string) => {
        // 각 입력창에 대한 대략적인 Y 위치 설정
        const approximatePositions: {[key: string]: number} = {
            'name': 50,
            'age': 150,
            'gender': 150, // age와 같은 줄
            'visa': 300 // 드롭다운 리스트를 고려해서 더 아래로
        }
        
        // 드롭다운의 경우 더 긴 지연시간을 줘서 리스트가 완전히 열린 후 스크롤
        const delay = inputName === 'visa' || inputName === 'gender' ? 300 : 100
        
        setTimeout(() => {
            if (scrollViewRef.current) {
                // 비자 드롭다운의 경우 끝까지 스크롤
                if (inputName === 'visa') {
                    scrollViewRef.current.scrollToEnd({ animated: true })
                } else {
                    const targetY = approximatePositions[inputName] || 0
                    scrollViewRef.current.scrollTo({
                        x: 0,
                        y: targetY,
                        animated: true
                    })
                }
            }
        }, delay)
    }
    
    // DB에서 카테고리별 키워드 필터링
    const genderKeywords = keywords.filter(k => k.category === '성별' && k.keyword !== '상관없음')
    const anyGenderKeyword = keywords.find(k => k.category === '성별' && k.keyword === '상관없음')
    
    const visaKeywords = keywords.filter(k => k.category === '비자' && k.keyword !== '상관없음')
    
    // 드롭다운 옵션 생성
    const genderOptions = [
        // 나머지 성별들
        ...genderKeywords
            .map(keyword => ({
                label: translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword),
                value: keyword.keyword
            })),
        // 상관없음을 "기타"로 표시하여 맨 아래로
        ...(anyGenderKeyword 
            ? [{
                label: translateDB('keyword', 'keyword', anyGenderKeyword.id.toString(), '기타'),
                value: anyGenderKeyword.keyword  // 실제 DB 값은 '상관없음'
            }]
            : [])
    ];
    
    const visaOptions = [
        // 비자는 상관없음 제외
        ...visaKeywords
            .map(keyword => ({
                label: translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword),
                value: keyword.keyword
            }))
    ];
    return (
        <ScrollView 
            ref={scrollViewRef}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 200 }}
            automaticallyAdjustKeyboardInsets={true}
        >
            <View className="mb-6 p-6">
                <Text className="text-lg font-bold mb-4">{t('apply.basic_info', '기본 정보')}</Text>
                <View className="mb-4">
                    <Text className="text-gray-700 mb-2">{t('apply.name', '이름')} *</Text>
                    <TextInput
                        className="border border-gray-300 rounded-lg p-3 h-[50px]"
                        placeholder={t('apply.enter_name', '한국 이름을 입력해주세요')}
                        placeholderTextColor="#6B7280"
                        value={name}
                        onChangeText={setName}
                        onFocus={() => handleInputFocus('name')}
                    />
        </View>
        <View className="flex-row gap-4 mb-4">
            <View className="flex-1">
                <Text className="text-gray-700 mb-2">{t('apply.age', '나이')}</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 h-[50px]"
                    placeholder={t('apply.age', '나이')}
                    placeholderTextColor="#6B7280"
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                    onFocus={() => handleInputFocus('age')}
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
                    placeholderStyle={{fontSize: 14, color: '#6B7280'}}
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
                placeholderStyle={{fontSize: 14, color: '#6B7280'}}
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
        </ScrollView>
    )
}
