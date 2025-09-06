import {View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, Platform} from 'react-native'
import React, {useState, useEffect} from 'react'
import Animated, {
    FadeIn,
    SlideInDown,
    SlideInUp,
    SlideInLeft,
    SlideInRight,
    ZoomIn,
    BounceIn,
    FlipInXUp,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withRepeat,
    withSequence,
    interpolate,
    Extrapolation
} from 'react-native-reanimated'
import {router} from "expo-router";
import {useTranslation} from "@/contexts/TranslationContext";
import {Ionicons} from "@expo/vector-icons";
import { languages } from '@/lib/constants/languages';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const LanguageSelection = () => {
    const { language, changeLanguage } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
    
    // 애니메이션 값들
    const logoScale = useSharedValue(0);
    const floatingY = useSharedValue(0);
    
    useEffect(() => {
        // 로고 부드러운 스케일 애니메이션
        logoScale.value = withTiming(1, {
            duration: 1000
        });
        
        // 매우 부드러운 플로팅 애니메이션
        floatingY.value = withRepeat(
            withSequence(
                withTiming(-3, { duration: 3000 }),
                withTiming(3, { duration: 3000 }),
                withTiming(0, { duration: 3000 })
            ),
            -1,
            false
        );
        
    }, []);
    
    // 애니메이션 스타일들
    const logoAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: logoScale.value },
            { translateY: floatingY.value }
        ]
    }));

    const handleLanguageSelect = async (langCode: string) => {
        setSelectedLanguage(langCode);
        await changeLanguage(langCode);
    };

    const handleContinue = () => {
        router.replace('/start');
    };

    // 개발모드에서 테스트용
    const handleReset = async () => {
        if (__DEV__) {
            await AsyncStorage.removeItem('appLanguage');
            setSelectedLanguage('ko');
            console.log('Language setting reset for testing');
        }
    };

    const renderLanguageItem = ({ item, index }: { item: typeof languages[number], index: number }) => (
        <Animated.View 
            entering={FadeIn.delay(index * 30 + 900).duration(600)}
        >
            <TouchableOpacity
                onPress={() => handleLanguageSelect(item.code)}
                style={[
                    styles.languageItem,
                    selectedLanguage === item.code && styles.selectedLanguageItem
                ]}
            >
                <View className="flex-row items-center">
                    <Text className="text-3xl mr-4">
                        {item.flag}
                    </Text>
                    <Text 
                        className={`text-lg ${
                            selectedLanguage === item.code ? 'text-white font-bold' : 'text-gray-700 font-medium'
                        }`}
                    >
                        {item.name}
                    </Text>
                </View>
                {selectedLanguage === item.code && (
                    <Animated.View entering={FadeIn.duration(300)}>
                        <Ionicons name="checkmark-circle" size={28} color="#ffffff" />
                    </Animated.View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Background gradient */}
            <LinearGradient
                colors={['#f8fafc', '#e2e8f0']}
                style={StyleSheet.absoluteFillObject}
            />
            
            <View className="flex-1 px-6 py-12">
                {/* Header */}
                <Animated.View 
                    style={[styles.header]}
                    className="items-center mb-8"
                    entering={FadeIn.duration(1000)}
                >
                    {/* Logo */}
                    <Animated.View style={[logoAnimatedStyle]}>
                        <LinearGradient
                            colors={['#4A90E2', '#8FAFFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logoContainer}
                        >
                            <Animated.Text 
                                className="text-3xl font-extrabold text-white"
                                entering={FadeIn.delay(400).duration(800)}
                            >
                                K-Gency
                            </Animated.Text>
                        </LinearGradient>
                    </Animated.View>
                    
                    <Animated.Text 
                        className="text-2xl font-bold text-gray-800 text-center mt-6 mb-3"
                        entering={FadeIn.delay(600).duration(800)}
                    >
                        언어를 선택해주세요
                    </Animated.Text>
                    <Animated.Text 
                        className="text-lg font-bold text-gray-800 text-center mb-2"
                        entering={FadeIn.delay(700).duration(800)}
                    >
                        Please select your language
                    </Animated.Text>
                    <Animated.Text 
                        className="text-base text-gray-600 text-center"
                        entering={FadeIn.delay(800).duration(800)}
                    >
                        원하는 언어를 선택하여 K-Gency를 시작하세요
                    </Animated.Text>
                </Animated.View>

                {/* Language List */}
                <Animated.View 
                    style={[styles.languageContainer]}
                    className="flex-1"
                    entering={FadeIn.delay(900).duration(600)}
                >
                    <FlatList
                        data={languages}
                        renderItem={renderLanguageItem}
                        keyExtractor={(item) => item.code}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.languageList}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    />
                </Animated.View>

                {/* Continue Button */}
                <Animated.View 
                    className="mt-6"
                    entering={FadeIn.delay(1300).duration(800)}
                >
                    <TouchableOpacity
                        onPress={handleContinue}
                        style={styles.continueButton}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={['#4A90E2', '#8FAFFF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButtonGradient}
                        >
                            <Text className="text-white text-lg font-bold">
                                계속하기 / Continue
                            </Text>
                            <Ionicons name="arrow-forward" size={20} color="#ffffff" style={{ marginLeft: 8 }} />
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>

                {/* 개발모드 디버그 버튼 */}
                {__DEV__ && (
                    <Animated.View entering={FadeIn.delay(1500).duration(400)}>
                        <TouchableOpacity
                            onPress={handleReset}
                            style={styles.debugButton}
                        >
                            <Text style={styles.debugText}>🔧 Reset Language (DEV)</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginTop: 40,
    },
    logoContainer: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
    },
    languageContainer: {
        marginTop: 20,
    },
    languageList: {
        paddingVertical: 8,
    },
    languageItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        marginHorizontal: 4,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2,
        borderColor: 'rgba(226, 232, 240, 0.5)',
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    selectedLanguageItem: {
        backgroundColor: 'rgba(74, 144, 226, 0.9)',
        borderColor: '#4A90E2',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 6,
    },
    continueButton: {
        marginHorizontal: 4,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    continueButtonGradient: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    debugButton: {
        marginTop: 16,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
        alignSelf: 'center',
    },
    debugText: {
        fontSize: 12,
        color: '#ef4444',
        textAlign: 'center',
    },
});

export default LanguageSelection;