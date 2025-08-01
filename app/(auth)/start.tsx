import {View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Image} from 'react-native'
import React, {useState} from 'react'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {router} from "expo-router";
import {useTranslation} from "@/contexts/TranslationContext";
import {Ionicons} from "@expo/vector-icons";
import { languages } from '@/lib/constants/languages';

const Start = () => {
    const { language, changeLanguage, t } = useTranslation();
    const [languageModalVisible, setLanguageModalVisible] = useState(false);

    const handleLanguageChange = async (langCode: string) => {
        await changeLanguage(langCode);
        setLanguageModalVisible(false);
    };

    const renderLanguageItem = ({ item }: { item: typeof languages[number] }) => (
        <TouchableOpacity
            onPress={() => handleLanguageChange(item.code)}
            className={`flex-row items-center justify-between p-4 rounded-lg mb-2 ${
                language === item.code ? 'bg-blue-50' : 'bg-gray-50'
            }`}
        >
            <View className="flex-row items-center">
                <Text className="text-2xl mr-3">{item.flag}</Text>
                <Text className={`text-lg ${
                    language === item.code ? 'text-blue-600 font-bold' : 'text-gray-700'
                }`}>{item.name}</Text>
            </View>
            {language === item.code && (
                <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View className="flex-1">
                {/* 상단 이미지 섹션 */}
                <View className="flex-1 relative">
                    <Image 
                        source={require('@/assets/images/startImage.png')}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                    
                    {/* 메인 텍스트 - 이미지 위에 오버레이 */}
                    <View className="absolute top-20 left-7  p-6">
                        <Text className="text-3xl font-bold text-gray-900 text-center mb-3">
                            {t('start.title', '일자리 찾고 있나요?')}
                        </Text>
                        <Text className="text-base text-center text-gray-600">
                            {t('start.subtitle', '30초만에 나에게 딱 맞는\n일자리를 찾아드릴게요')}
                        </Text>
                    </View>
                </View>

                {/* 하단 카드 섹션 */}
                <View 
                    className="px-6 pb-8"
                    style={{
                        backgroundColor: '#eff6ff', // 부드러운 회색빛 흰색
                        borderTopLeftRadius: 30,
                        borderTopRightRadius: 30,
                        marginTop: -20,
                        paddingTop: 24,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 10,
                    }}
                >
                    {/* 상단 핸들 바 */}
                    <View className="items-center mb-4">
                        <View className="w-12 h-1 bg-gray-300 rounded-full" />
                    </View>

                    {/* 카드 스타일 버튼들 */}
                    <View className="space-y-4 gap-5">
                        {/* 구직자 카드 */}
                        <TouchableOpacity
                            className="bg-blue-500 p-6 rounded-2xl shadow-lg"
                            onPress={() => router.push('/user_login')}
                            style={{
                                shadowColor: '#3b82f6',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 8,
                            }}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                                            <Ionicons name="person" size={24} color="white" />
                                        </View>
                                        <Text className="text-white text-xl font-bold ml-3">
                                            {t('start.job_seeker', '구직자')}
                                        </Text>
                                    </View>
                                    <Text className="text-white/90 text-sm">
                                        {t('start.job_seeker_desc', '일자리를 찾고 계신가요?\n맞춤 일자리를 추천해드려요')}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="white" />
                            </View>
                        </TouchableOpacity>

                        {/* 구인자 카드 */}
                        <TouchableOpacity
                            className="bg-white border-2 border-gray-200 p-6 rounded-2xl shadow-sm"
                            onPress={() => router.push('/company_login')}
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 4,
                                elevation: 2,
                            }}
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center">
                                            <Ionicons name="business" size={24} color="#4b5563" />
                                        </View>
                                        <Text className="text-gray-800 text-xl font-bold ml-3">
                                            {t('start.employer', '구인자')}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-600 text-sm">
                                        {t('start.employer_desc', '직원을 찾고 계신가요?\n인재를 매칭해드려요')}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
                            </View>
                        </TouchableOpacity>

                        {/* 언어 선택 버튼 */}
                        <View className="items-center mb-2">
                            <TouchableOpacity
                                className="flex-row items-center bg-gray-200 px-4 py-3 rounded-xl"
                                onPress={() => setLanguageModalVisible(true)}
                            >
                                <MaterialIcons name="language" size={24} color="#6b7280" />
                                <Text className="ml-2 text-gray-600 font-medium">
                                    {t('language.select', 'Language')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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
                    <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-[500px]">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold">
                                {t('language.select', 'Language')}
                            </Text>
                            <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={[...languages]}
                            renderItem={renderLanguageItem}
                            keyExtractor={(item) => item.code}
                            showsVerticalScrollIndicator={true}
                            style={{ flexGrow: 0 }}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
})

export default Start