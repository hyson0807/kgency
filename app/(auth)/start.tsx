import {View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Dimensions, ScrollView, Platform} from 'react-native'
import React, {useState, useEffect} from 'react'
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    withSequence,
    withDelay,
    Easing,
    FadeIn,
    SlideInDown
} from 'react-native-reanimated'
import {router} from "expo-router";
import {useTranslation} from "@/contexts/TranslationContext";
import {Ionicons} from "@expo/vector-icons";
import { languages } from '@/lib/constants/languages';
import { LinearGradient } from 'expo-linear-gradient';
const { width, height } = Dimensions.get('window');
const Start = () => {
    const { language, changeLanguage, t } = useTranslation();
    const [languageModalVisible, setLanguageModalVisible] = useState(false);
    
    // Animation values using Reanimated
    const fadeAnim = useSharedValue(0);
    const slideAnim = useSharedValue(30);
    const slideAnimDelay = useSharedValue(30);
    const floatAnim1 = useSharedValue(0);
    const floatAnim2 = useSharedValue(0);
    const floatAnim3 = useSharedValue(0);
    useEffect(() => {
        // Start fade and slide animations
        fadeAnim.value = withTiming(1, { duration: 800 });
        slideAnim.value = withTiming(0, { duration: 800 });
        slideAnimDelay.value = withDelay(300, withTiming(0, { duration: 800 }));
        
        // Floating animations
        floatAnim1.value = withRepeat(
            withSequence(
                withTiming(-20, { duration: 3000 }),
                withTiming(10, { duration: 3000 }),
                withTiming(0, { duration: 3000 })
            ),
            -1,
            false
        );
        
        floatAnim2.value = withDelay(2000, 
            withRepeat(
                withSequence(
                    withTiming(-20, { duration: 3000 }),
                    withTiming(10, { duration: 3000 }),
                    withTiming(0, { duration: 3000 })
                ),
                -1,
                false
            )
        );
        
        floatAnim3.value = withDelay(4000,
            withRepeat(
                withSequence(
                    withTiming(-20, { duration: 3000 }),
                    withTiming(10, { duration: 3000 }),
                    withTiming(0, { duration: 3000 })
                ),
                -1,
                false
            )
        );
    }, []);
    // Animated styles
    const fadeStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value
    }));
    
    const slideStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: slideAnim.value }]
    }));
    
    const slideDelayStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [{ translateY: slideAnimDelay.value }]
    }));
    
    const floatStyle1 = useAnimatedStyle(() => ({
        transform: [{ translateY: floatAnim1.value }]
    }));
    
    const floatStyle2 = useAnimatedStyle(() => ({
        transform: [{ translateY: floatAnim2.value }]
    }));
    
    const floatStyle3 = useAnimatedStyle(() => ({
        transform: [{ translateY: floatAnim3.value }]
    }));

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
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                {/* First section - Main landing */}
                <View style={styles.firstSection}>
                    {/* Floating circles */}
                    <View style={styles.floatingElements}>
                        <Animated.View 
                            style={[
                                styles.floatingCircle,
                                styles.circle1,
                                floatStyle1
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
                                floatStyle2
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
                                floatStyle3
                            ]}
                        >
                            <LinearGradient
                                colors={['rgba(74, 144, 226, 0.1)', 'rgba(143, 175, 255, 0.05)']}
                                style={{ width: '100%', height: '100%', borderRadius: 30 }}
                            />
                        </Animated.View>
                    </View>
                    <View className="flex-1 items-center justify-center px-6 py-8">
                {/* Main content */}
                <Animated.View 
                    className="w-full max-w-md flex-1 justify-center"
                    style={slideDelayStyle}
                >
                    {/* Logo */}
                    <Animated.View 
                        style={[
                            styles.logo,
                            fadeStyle,
                            slideStyle
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
                                    <View className={Platform.OS === 'web' && width > 1024 ? "items-center" : "flex-1"}>
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
                                    <View className={Platform.OS === 'web' && width > 1024 ? "items-center" : "flex-1"}>
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
                </View>
                {/* Platform Strengths Section */}
                <View style={styles.sectionContainer}>
                    <View className="px-6 py-16">
                        <View className="items-center mb-12">
                            <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
                                {t('start.strengths_title', 'K-Gency만의 특별한 강점')}
                            </Text>
                            <Text className="text-lg text-gray-600 text-center">
                                {t('start.strengths_subtitle', 'AI 기술로 완성된 혁신적인 채용 플랫폼')}
                            </Text>
                        </View>
                        
                        <View className={Platform.OS === 'web' && width > 1024 ? "flex-row flex-wrap justify-center gap-6" : "gap-6"}>
                            {/* Strength 1 */}
                            <View style={[styles.strengthCard, Platform.OS === 'web' && width > 1024 && { width: '45%' }]}>
                                <LinearGradient
                                    colors={['rgba(74, 144, 226, 0.1)', 'rgba(143, 175, 255, 0.05)']}
                                    style={styles.strengthGradient}
                                >
                                    <Text className="text-4xl mb-4">🎯</Text>
                                    <Text className="text-xl font-bold text-gray-800 mb-3">
                                        {t('start.strength1_title', '100% 매칭 확률')}
                                    </Text>
                                    <Text className="text-gray-600 leading-6">
                                        {t('start.strength1_desc', 'AI 분석을 통해 조건이 맞는 경우에만 매칭하여 면접 성사율 100%를 보장합니다')}
                                    </Text>
                                </LinearGradient>
                            </View>
                            
                            {/* Strength 2 */}
                            <View style={[styles.strengthCard, Platform.OS === 'web' && width > 1024 && { width: '45%' }]}>
                                <LinearGradient
                                    colors={['rgba(74, 144, 226, 0.1)', 'rgba(143, 175, 255, 0.05)']}
                                    style={styles.strengthGradient}
                                >
                                    <Text className="text-4xl mb-4">⚡</Text>
                                    <Text className="text-xl font-bold text-gray-800 mb-3">
                                        {t('start.strength2_title', '즉시 연결 시스템')}
                                    </Text>
                                    <Text className="text-gray-600 leading-6">
                                        {t('start.strength2_desc', '매칭 즉시 면접 일정이 자동 조율되어 빠른 채용 프로세스를 경험하세요')}
                                    </Text>
                                </LinearGradient>
                            </View>
                            
                            {/* Strength 3 */}
                            <View style={[styles.strengthCard, Platform.OS === 'web' && width > 1024 && { width: '45%' }]}>
                                <LinearGradient
                                    colors={['rgba(74, 144, 226, 0.1)', 'rgba(143, 175, 255, 0.05)']}
                                    style={styles.strengthGradient}
                                >
                                    <Text className="text-4xl mb-4">🛡️</Text>
                                    <Text className="text-xl font-bold text-gray-800 mb-3">
                                        {t('start.strength3_title', '검증된 프로필')}
                                    </Text>
                                    <Text className="text-gray-600 leading-6">
                                        {t('start.strength3_desc', '모든 구직자와 구인자의 정보를 철저히 검증하여 신뢰할 수 있는 매칭을 제공합니다')}
                                    </Text>
                                </LinearGradient>
                            </View>
                            
                            {/* Strength 4 */}
                            <View style={[styles.strengthCard, Platform.OS === 'web' && width > 1024 && { width: '45%' }]}>
                                <LinearGradient
                                    colors={['rgba(74, 144, 226, 0.1)', 'rgba(143, 175, 255, 0.05)']}
                                    style={styles.strengthGradient}
                                >
                                    <Text className="text-4xl mb-4">📊</Text>
                                    <Text className="text-xl font-bold text-gray-800 mb-3">
                                        {t('start.strength4_title', '실시간 분석')}
                                    </Text>
                                    <Text className="text-gray-600 leading-6">
                                        {t('start.strength4_desc', '채용 트렌드와 시장 데이터를 실시간으로 분석하여 최적의 매칭을 제공합니다')}
                                    </Text>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Statistics Section */}
                <LinearGradient colors={['#4A90E2', '#8FAFFF']} style={styles.statsSection}>
                    <View className="px-6 py-16">
                        <View className="flex-row flex-wrap justify-center gap-8">
                            <View className="items-center">
                                <Text className="text-4xl font-bold text-white mb-2">98%</Text>
                                <Text className="text-white text-lg">{t('start.stat1_label', '매칭 성공률')}</Text>
                            </View>
                            <View className="items-center">
                                <Text className="text-4xl font-bold text-white mb-2">24H</Text>
                                <Text className="text-white text-lg">{t('start.stat2_label', '평균 매칭 시간')}</Text>
                            </View>
                            {/*<View className="items-center">*/}
                            {/*    <Text className="text-4xl font-bold text-white mb-2">50,000+</Text>*/}
                            {/*    <Text className="text-white text-lg">{t('start.stat3_label', '누적 매칭 건수')}</Text>*/}
                            {/*</View>*/}
                            <View className="items-center">
                                <Text className="text-4xl font-bold text-white mb-2">95%</Text>
                                <Text className="text-white text-lg">{t('start.stat4_label', '고객 만족도')}</Text>
                            </View>
                        </View>
                    </View>
                </LinearGradient>
                {/* Features Section */}
                <View style={styles.sectionContainer}>
                    <View className="px-6 py-16">
                        <View className="items-center mb-12">
                            <Text className="text-3xl font-bold text-gray-800 text-center mb-4">
                                {t('start.features_title', '혁신적인 기능들')}
                            </Text>
                            <Text className="text-lg text-gray-600 text-center">
                                {t('start.features_subtitle', '채용의 모든 과정을 스마트하게')}
                            </Text>
                        </View>
                        
                        <View className={Platform.OS === 'web' && width > 1024 ? "flex-row flex-wrap justify-center gap-8" : "gap-8"}>
                            {/* Feature 1 */}
                            <View className={Platform.OS === 'web' && width > 1024 ? "w-[45%] flex-col gap-4" : "flex-row items-start gap-4"}>
                                <View style={[styles.featureIcon, Platform.OS === 'web' && width > 1024 && { alignSelf: 'center', marginBottom: 12 }]}>
                                    <Text className="text-2xl">🤖</Text>
                                </View>
                                <View className={Platform.OS === 'web' && width > 1024 ? "items-center" : "flex-1"}>
                                    <Text className="text-xl font-bold text-gray-800 mb-2">
                                        {t('start.feature1_title', 'AI 매칭 엔진')}
                                    </Text>
                                    <Text className="text-gray-600 leading-6">
                                        {t('start.feature1_desc', '머신러닝 알고리즘을 통해 경력, 스킬, 성향을 종합 분석하여 최적의 매칭을 제공합니다')}
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Feature 2 */}
                            <View className={Platform.OS === 'web' && width > 1024 ? "w-[45%] flex-col gap-4" : "flex-row items-start gap-4"}>
                                <View style={[styles.featureIcon, Platform.OS === 'web' && width > 1024 && { alignSelf: 'center', marginBottom: 12 }]}>
                                    <Text className="text-2xl">📅</Text>
                                </View>
                                <View className={Platform.OS === 'web' && width > 1024 ? "items-center" : "flex-1"}>
                                    <Text className="text-xl font-bold text-gray-800 mb-2">
                                        {t('start.feature2_title', '스마트 스케줄링')}
                                    </Text>
                                    <Text className="text-gray-600 leading-6">
                                        {t('start.feature2_desc', '양쪽 일정을 자동으로 조율하여 최적의 면접 시간을 제안하고 예약까지 완료합니다')}
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Feature 3 */}
                            <View className={Platform.OS === 'web' && width > 1024 ? "w-[45%] flex-col gap-4" : "flex-row items-start gap-4"}>
                                <View style={[styles.featureIcon, Platform.OS === 'web' && width > 1024 && { alignSelf: 'center', marginBottom: 12 }]}>
                                    <Text className="text-2xl">🔍</Text>
                                </View>
                                <View className={Platform.OS === 'web' && width > 1024 ? "items-center" : "flex-1"}>
                                    <Text className="text-xl font-bold text-gray-800 mb-2">
                                        {t('start.feature3_title', '스킬 검증 시스템')}
                                    </Text>
                                    <Text className="text-gray-600 leading-6">
                                        {t('start.feature3_desc', '포트폴리오 분석과 실무 능력 테스트를 통해 정확한 스킬 레벨을 검증합니다')}
                                    </Text>
                                </View>
                            </View>
                            
                            {/* Feature 4 */}
                            <View className={Platform.OS === 'web' && width > 1024 ? "w-[45%] flex-col gap-4" : "flex-row items-start gap-4"}>
                                <View style={[styles.featureIcon, Platform.OS === 'web' && width > 1024 && { alignSelf: 'center', marginBottom: 12 }]}>
                                    <Text className="text-2xl">💬</Text>
                                </View>
                                <View className={Platform.OS === 'web' && width > 1024 ? "items-center" : "flex-1"}>
                                    <Text className="text-xl font-bold text-gray-800 mb-2">
                                        {t('start.feature4_title', '실시간 소통')}
                                    </Text>
                                    <Text className="text-gray-600 leading-6">
                                        {t('start.feature4_desc', '매칭 후 실시간 채팅과 화상 면접 기능으로 원활한 소통을 지원합니다')}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Footer */}
                <View style={styles.footer}>
                    <LinearGradient colors={['#1f2937', '#374151']} style={{ flex: 1, paddingVertical: 40, paddingHorizontal: 24 }}>
                        <View className="items-center mb-8">
                            <Text className="text-3xl font-bold text-white mb-2">K-Gency</Text>
                            <Text className="text-gray-300 text-center">
                                {t('start.footer_desc', 'AI로 찾는 완벽한 매칭, 채용의 새로운 패러다임')}
                            </Text>
                        </View>
                        
                        <View className="gap-6 mb-8">
                            <View>
                                <Text className="text-lg font-bold text-white mb-3">
                                    {t('start.footer_service', '서비스')}
                                </Text>
                                <TouchableOpacity className="mb-2" onPress={() => router.push('/user_login')}>
                                    <Text className="text-gray-300">{t('start.footer_job_seeker', '구직자 서비스')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="mb-2" onPress={() => router.push('/company_login')}>
                                    <Text className="text-gray-300">{t('start.footer_employer', '구인자 서비스')}</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View>
                                <Text className="text-lg font-bold text-white mb-3">
                                    {t('start.footer_company', '회사')}
                                </Text>
                                <Text className="text-gray-300 mb-2">{t('start.footer_about', '회사 소개')}</Text>
                                <TouchableOpacity className="mb-2" onPress={() => router.push('/(pages)/(landing-page)/contact')}>
                                    <Text className="text-gray-300">{t('start.footer_contact', '문의하기')}</Text>
                                </TouchableOpacity>
                            </View>
                            
                            <View>
                                <Text className="text-lg font-bold text-white mb-3">
                                    {t('start.footer_legal', '약관 및 정책')}
                                </Text>
                                <TouchableOpacity className="mb-2" onPress={() => router.push('/(pages)/(landing-page)/faq')}>
                                    <Text className="text-gray-300">{t('start.footer_faq', 'FAQ')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="mb-2" onPress={() => router.push('/(pages)/(landing-page)/terms-of-service')}>
                                    <Text className="text-gray-300">{t('start.footer_terms', '이용약관')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="mb-2" onPress={() => router.push('/(pages)/(landing-page)/privacy-policy')}>
                                    <Text className="text-gray-300">{t('start.footer_privacy', '개인정보처리방침')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="mb-2" onPress={() => router.push('/(pages)/(landing-page)/account-deletion')}>
                                    <Text className="text-gray-300">{t('start.footer_account_deletion', '계정 삭제')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="mb-2" onPress={() => router.push('/(pages)/(landing-page)/refund-policy')}>
                                    <Text className="text-gray-300">{t('start.footer_refund', '환불정책')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="mb-2" onPress={() => router.push('/(pages)/(landing-page)/contact')}>
                                    <Text className="text-gray-300">{t('start.footer_help', '고객센터')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        
                        <View className="border-t border-gray-600 pt-6">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400">© 2024 K-Gency. All rights reserved.</Text>
                                <View className="flex-row gap-4">
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </View>
            </ScrollView>
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
        marginBottom: 40,
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
    firstSection: {
        minHeight: height,
        position: 'relative',
    },
    sectionContainer: {
        backgroundColor: '#ffffff',
    },
    strengthCard: {
        marginHorizontal: 4,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
    },
    strengthGradient: {
        borderRadius: 16,
        padding: 20,
    },
    statsSection: {
        marginVertical: 0,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        backgroundColor: '#1f2937',
    },
})
export default Start