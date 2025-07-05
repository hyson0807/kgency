import {View, Text, StyleSheet, TextInput, TouchableOpacity, Alert} from 'react-native'
import React, {useState} from 'react'
import {LinearGradient} from "expo-linear-gradient";
import {SafeAreaView} from "react-native-safe-area-context";
import Back from "@/components/back";
import axios from "axios";
import {useAuth} from "@/contexts/AuthContext";
import {router} from "expo-router";

const CompanyLogin = () => {
    const { login } = useAuth();

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [inputOtp, setInputOtp] = useState(false);

    const sendOtp = async () => {
        if(!phone || phone.replace(/[^0-9]/g, '').length !== 11) {
            Alert.alert('올바른 번호를 입력해주세요')
            return;
        }
        setLoading(true);

        try {
            const cleanPhone = phone.replace(/-/g, '');
            const formattedPhone = `+82${cleanPhone.slice(1)}`;

            const response = await axios.post('https://1232-production.up.railway.app/send-otp', {phone: formattedPhone})
            if (response.data.success) {
                Alert.alert('성공', 'OTP가 전송되었습니다');
                setInputOtp(true);

            } else {
                Alert.alert('실패', response.data.error || 'OTP 전송에 실패했습니다');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '네트워크 연결을 확인해주세요');
        } finally {
            setLoading(false);
        }
    }

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert('오류', '6자리 인증번호를 입력해주세요');
            return;
        }
        setLoading(true);
        try{
            const cleanPhone = phone.replace(/-/g, '');
            const formattedPhone = `+82${cleanPhone.slice(1)}`;

            const response = await axios.post('https://kgencyserver-production.up.railway.app/verify-otp', {
                phone: formattedPhone,
                otp: otp,
                userType: 'company'  // 회사 타입으로 설정
            });

            if (response.data.success) {
                const result = await login(
                    response.data.token,
                    response.data.user,
                    response.data.onboardingStatus
                );

                if (result.success) {
                    Alert.alert('성공', '로그인되었습니다!');

                    if (response.data.onboardingStatus.completed) {
                        // 온보딩 완료된 유저 → 홈으로
                        router.replace('/(company)/home');
                    } else {
                        // 온보딩 미완료 유저 → info 페이지로
                        router.replace('/(pages)/(company)/register');
                    }

                } else {
                    Alert.alert('오류', '로그인 처리 중 오류가 발생했습니다');
                }
            } else {
                Alert.alert('실패', response.data.error || 'OTP 인증에 실패했습니다');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('오류', '인증 처리 중 오류가 발생했습니다');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-[#6e65c6]">
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.container}
            >
                <Back/>
                <View className="w-full pl-12 mt-10 gap-4">
                    <Text className="font-bold text-4xl text-white">회사 로그인</Text>
                    <Text className="text-white">구인자용 로그인 페이지입니다.</Text>
                </View>
                <View className="w-full pl-12 mt-12 gap-10">
                    <Text className="text-white font-bold">회사 전화번호</Text>
                    <View className="flex-row items-center gap-10">

                        <TextInput
                            className="w-56 border-b-2 border-white p-4 text-white"
                            placeholder="010-0000-0000"
                            placeholderTextColor="rgba(255,255,255,0.7)"
                            maxLength={11}
                            value={phone}
                            onChangeText={setPhone}
                        />
                        {(phone.length === 11) && (
                            <View className="flex items-center justify-center">
                                <TouchableOpacity
                                    onPress={sendOtp}
                                    disabled={loading}
                                >
                                    <Text className="text-white text">인증번호 받기</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {(inputOtp && (
                        <View className="flex-row items-center gap-10">
                            <TextInput
                                className="w-56 border-b-2 border-white p-4 text-white"
                                placeholder="000000"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                maxLength={6}
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="numeric"
                            />
                            <View className="flex items-center justify-center">
                                <TouchableOpacity
                                    onPress={verifyOtp}
                                    disabled={loading}
                                >
                                    <Text className="text-white text">인증하기</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* 개발 모드에서만 표시되는 테스트 계정 버튼 */}
                {__DEV__ && (
                    <View className="mt-10 px-12">
                        <Text className="text-white text-center mb-3">테스트 계정</Text>
                        <View className="gap-3">
                            <TouchableOpacity
                                onPress={() => {
                                    setPhone('010-1111-1111');
                                    setOtp('123456');
                                    setInputOtp(true);  // OTP 입력 필드 표시
                                }}
                                className="bg-white/20 p-3 rounded-lg"
                            >
                                <Text className="text-white text-center">구직자 테스트 계정</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    setPhone('010-2222-2222');
                                    setOtp('123456');
                                    setInputOtp(true);  // OTP 입력 필드 표시
                                }}
                                className="bg-white/20 p-3 rounded-lg"
                            >
                                <Text className="text-white text-center">회사 테스트 계정</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}


            </LinearGradient>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
export default CompanyLogin