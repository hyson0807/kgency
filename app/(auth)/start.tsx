import {View, Text, SafeAreaView, StyleSheet, TouchableOpacity, Modal} from 'react-native'
import React, {useState} from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {router} from "expo-router";
import {useTranslation} from "@/contexts/TranslationContext";
import {Ionicons} from "@expo/vector-icons";

const Start = () => {
    const { language, changeLanguage, t } = useTranslation();
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    const languages = [
        { code: 'ko', name: '한국어', flag: '🇰🇷' },
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'ja', name: '日本語', flag: '🇯🇵' },
        { code: 'zh', name: '中文', flag: '🇨🇳' },
        { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
    ];

    const handleLanguageChange = async (langCode: string) => {
        await changeLanguage(langCode);
        setLanguageModalVisible(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View className="flex-1 items-center justify-center px-6">
                {/* 로고 영역 */}
                <View className="mb-8">
                    <View className="w-24 h-24 bg-blue-100 rounded-3xl items-center justify-center mb-6">
                        <MaterialIcons name="work" size={48} color="#3b82f6" />
                    </View>
                </View>

                {/* 메인 텍스트 */}
                <View className="mb-12 gap-4">
                    <Text className="text-3xl font-bold text-gray-900 text-center">
                        {t('start.title', '일자리 찾고 있나요?')}
                    </Text>
                    <Text className="text-lg text-center text-gray-600 leading-7">
                        {t('start.subtitle', '30초만에 나에게 딱 맞는\n일자리를 찾아드릴께요')}
                    </Text>
                </View>

                {/* 시작하기 버튼 */}
                <TouchableOpacity
                    className="w-[240px] h-16 bg-blue-500 rounded-full items-center justify-center shadow-lg mb-8"
                    onPress={() => router.push('/user_login')}
                    style={{
                        shadowColor: '#3b82f6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 8,
                    }}
                >
                    <Text className="text-white text-xl font-bold">
                        {t('start.button', '시작하기')}
                    </Text>
                </TouchableOpacity>

                {/* 하단 옵션 */}
                <View className="flex-row items-center justify-center gap-6">
                    <TouchableOpacity
                        className="p-2"
                        onPress={() => setLanguageModalVisible(true)}
                    >
                        <MaterialIcons name="language" size={28} color="#6b7280" />
                    </TouchableOpacity>

                    <View className="w-px h-6 bg-gray-300" />

                    <TouchableOpacity
                        className="py-2 px-4"
                        onPress={() => router.push('/company_login')}
                    >
                        <Text className="text-gray-600 font-medium">
                            {t('start.employer_login', '구인자 로그인')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* 언어 선택 모달 */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold">
                                {t('language.select', '언어 선택')}
                            </Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {languages.map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                onPress={() => handleLanguageChange(lang.code)}
                                className={`flex-row items-center justify-between p-4 rounded-lg mb-2 ${
                                    language === lang.code ? 'bg-blue-50' : 'bg-gray-50'
                                }`}
                            >
                                <View className="flex-row items-center">
                                    <Text className="text-2xl mr-3">{lang.flag}</Text>
                                    <Text className={`text-lg ${
                                        language === lang.code ? 'text-blue-600 font-bold' : 'text-gray-700'
                                    }`}>{lang.name}</Text>
                                </View>
                                {language === lang.code && (
                                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
})

export default Start