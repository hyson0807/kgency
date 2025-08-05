import {View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Animated, Dimensions} from 'react-native'
import React, {useState, useEffect, useRef} from 'react'
import {router} from "expo-router";
import {useTranslation} from "@/contexts/TranslationContext";
import {Ionicons} from "@expo/vector-icons";
import { languages } from '@/lib/constants/languages';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const Start = () => {
    const { language, changeLanguage, t } = useTranslation();
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const slideAnimDelay = useRef(new Animated.Value(30)).current;
    const floatAnim1 = useRef(new Animated.Value(0)).current;
    const floatAnim2 = useRef(new Animated.Value(0)).current;
    const floatAnim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start animations
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnimDelay, {
                toValue: 0,
                duration: 800,
                delay: 300,
                useNativeDriver: true,
            })
        ]).start();

        // Floating animations
        const createFloatingAnimation = (animValue: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.timing(animValue, {
                        toValue: -20,
                        duration: 3000,
                        delay,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 10,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0,
                        duration: 3000,
                        useNativeDriver: true,
                    })
                ])
            );
        };

        createFloatingAnimation(floatAnim1, 0).start();
        createFloatingAnimation(floatAnim2, 2000).start();
        createFloatingAnimation(floatAnim3, 4000).start();
    }, []);

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
            {/* Background gradient */}
            <LinearGradient
                colors={['#f8fafc', '#e2e8f0']}
                style={StyleSheet.absoluteFillObject}
            />
            
            {/* Floating circles */}
            <View style={styles.floatingElements}>
                <Animated.View 
                    style={[
                        styles.floatingCircle,
                        styles.circle1,
                        { transform: [{ translateY: floatAnim1 }] }
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(74, 144, 226, 0.1)', 'rgba(143, 175, 255, 0.05)']}
                        style={{ width: '100%', height: '100%', borderRadius: 60 }}
                    />
                </Animated.View>
                
                <Animated.View 
                    style={[
                        styles.floatingCircle,
                        styles.circle2,
                        { transform: [{ translateY: floatAnim2 }] }
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(74, 144, 226, 0.1)', 'rgba(143, 175, 255, 0.05)']}
                        style={{ width: '100%', height: '100%', borderRadius: 40 }}
                    />
                </Animated.View>
                
                <Animated.View 
                    style={[
                        styles.floatingCircle,
                        styles.circle3,
                        { transform: [{ translateY: floatAnim3 }] }
                    ]}
                >
                    <LinearGradient
                        colors={['rgba(74, 144, 226, 0.1)', 'rgba(143, 175, 255, 0.05)']}
                        style={{ width: '100%', height: '100%', borderRadius: 30 }}
                    />
                </Animated.View>
            </View>

            <View className="flex-1 items-center justify-center px-6 py-8">
                {/* Logo */}
                <Animated.View 
                    style={[
                        styles.logo,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['#4A90E2', '#8FAFFF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.logoTextGradient}
                    >
                        <Text className="text-4xl font-extrabold text-white">K-Gency</Text>
                    </LinearGradient>
                    <Text className="text-gray-600 text-sm font-medium mt-1">{t('start.logo_subtitle', 'AI로 찾는 완벽한 매칭')}</Text>
                </Animated.View>

                {/* Main content */}
                <Animated.View 
                    className="w-full max-w-md flex-1 justify-center"
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnimDelay }]
                    }}
                >
                    {/* Title section */}
                    <View className="items-center mb-6">
                        <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
                            {t('start.main_title', '100% 확정 면접을 원하시나요?')}
                        </Text>
                        <Text className="text-base text-gray-600 text-center leading-6">
                            {t('start.main_subtitle', '답장 걱정 없는 매칭과\n시간 낭비 없는 채용의 시작')}
                        </Text>
                    </View>

                    {/* Option cards */}
                    <View className="gap-4">
                        {/* Job seeker card */}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.push('/user_login')}
                            style={styles.optionCard}
                        >
                            <LinearGradient
                                colors={['rgba(74, 144, 226, 0.05)', 'rgba(143, 175, 255, 0.1)']}
                                style={[styles.gradientCard, { borderWidth: 2, borderColor: '#4A90E2' }]}
                            >
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-3">
                                            <LinearGradient
                                                colors={['#4A90E2', '#8FAFFF']}
                                                style={styles.iconContainer}
                                            >
                                                <Text className="text-2xl">👤</Text>
                                            </LinearGradient>
                                        </View>
                                        <Text className="text-xl font-bold text-gray-800 mb-2">{t('start.job_seeker', '구직자')}</Text>
                                        <Text className="text-gray-600 text-sm leading-5">
                                            {t('start.job_seeker_card_desc', '조건만 맞으면 100% 면접 확정!\n답장 안 올까 걱정은 이제 끝이에요')}
                                        </Text>
                                    </View>
                                    <Text className="text-2xl text-gray-400 mt-1">→</Text>
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Employer card */}
                        <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => router.push('/company_login')}
                            style={styles.optionCard}
                        >
                            <View style={[styles.gradientCard, styles.employerCard]}>
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <View className="flex-row items-center mb-3">
                                            <LinearGradient
                                                colors={['#64748b', '#94a3b8']}
                                                style={styles.iconContainer}
                                            >
                                                <Text className="text-2xl">🏢</Text>
                                            </LinearGradient>
                                        </View>
                                        <Text className="text-xl font-bold text-gray-800 mb-2">{t('start.employer', '구인자')}</Text>
                                        <Text className="text-gray-600 text-sm leading-5">
                                            {t('start.employer_card_desc', 'AI 매칭률로 딱 맞는 인재만!\n정해진 시간에 바로 면접 보세요')}
                                        </Text>
                                    </View>
                                    <Text className="text-2xl text-gray-400 mt-1">→</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Language selector */}
                    <TouchableOpacity
                        className="mt-6 self-center"
                        onPress={() => setLanguageModalVisible(true)}
                        style={styles.languageButton}
                    >
                        <Text className="text-2xl mr-2">🌐</Text>
                        <Text className="text-gray-600 font-medium">{t('start.language', 'Language')}</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            {/* Language modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={languageModalVisible}
                onRequestClose={() => setLanguageModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl px-6 pt-6 pb-10 max-h-[500px]">
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-xl font-bold">{t('start.language', 'Language')}</Text>
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
    },
    floatingElements: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
    },
    floatingCircle: {
        position: 'absolute',
    },
    circle1: {
        width: 100,
        height: 100,
        top: height * 0.1,
        right: width * 0.15,
    },
    circle2: {
        width: 70,
        height: 70,
        bottom: height * 0.2,
        left: width * 0.1,
    },
    circle3: {
        width: 50,
        height: 50,
        top: height * 0.6,
        right: width * 0.2,
    },
    logo: {
        marginBottom: 24,
        alignItems: 'center',
    },
    logoTextGradient: {
        paddingHorizontal: 4,
        paddingVertical: 2,
    },
    optionCard: {
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 40,
        elevation: 8,
    },
    gradientCard: {
        borderRadius: 20,
        padding: 20,
        overflow: 'hidden',
    },
    employerCard: {
        backgroundColor: 'rgba(248, 250, 252, 0.9)',
        borderWidth: 2,
        borderColor: '#e2e8f0',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    languageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
})

export default Start