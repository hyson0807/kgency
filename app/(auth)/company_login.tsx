import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Modal
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Back from '@/components/back';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/lib/api';

const CompanyLogin = () => {
    const { login } = useAuth();

    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [inputOtp, setInputOtp] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    
    // 모달 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalType, setModalType] = useState<'info' | 'warning'>('info');
    const [showUserLoginButton, setShowUserLoginButton] = useState(false);

    const otpInputRef = useRef<TextInput>(null);
    const hasAttemptedRef = useRef(false);
    
    // 모달 표시 함수
    const showModal = (title: string, message: string, type: 'info' | 'warning' = 'info', showUserLogin = false) => {
        // 이미 모달이 열려있거나 로딩 중이면 반환
        if (modalVisible || loading) return;
        
        // 약간의 지연을 두어 안전하게 모달 표시
        setTimeout(() => {
            setModalTitle(title);
            setModalMessage(message);
            setModalType(type);
            setShowUserLoginButton(showUserLogin);
            setModalVisible(true);
        }, 100);
    };
    
    // 모달 닫기
    const hideModal = () => {
        setModalVisible(false);
    };

    // 타이머 감소
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    // 숫자만 남기기
    const sanitizePhoneNumber = (value: string): string => {
        return value.replace(/\D/g, '');
    };

    const handlePhoneChange = (text: string) => {
        const formatted = sanitizePhoneNumber(text);
        setPhone(formatted);
    };

    // 국제 포맷
    const formatPhone = (rawPhone: string): string => {
        const cleaned = sanitizePhoneNumber(rawPhone);
        if (cleaned.length < 10) return '';
        return `+82${cleaned.slice(1)}`;
    };

    const sendOtp = async () => {
        const cleanPhone = sanitizePhoneNumber(phone);
        if (!cleanPhone) {
            showModal('알림', '회사 전화번호를 입력해주세요');
            return;
        }
        
        // 애플 심사용 데모 계정은 OTP 전송 스킵
        if (cleanPhone === '01088888888') {
            setInputOtp(true);
            setResendTimer(180);
            setTimeout(() => otpInputRef.current?.focus(), 100);
            return;
        }

        setLoading(true);
        try {
            const formattedPhone = formatPhone(phone);
            const response = await api('POST', '/api/auth/send-otp', { phone: formattedPhone });

            if (response.success) {
                setInputOtp(true);
                setResendTimer(180);
                setTimeout(() => otpInputRef.current?.focus(), 100);
            } else {
                showModal('전송 실패', response.error || '인증번호 전송에 실패했습니다', 'warning');
            }
        } catch (error) {
            console.error(error);
            showModal('오류', '네트워크 연결을 확인해주세요', 'warning');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            showModal('알림', '6자리 인증번호를 입력해주세요');
            return;
        }

        setLoading(true);
        try {
            const cleanPhone = sanitizePhoneNumber(phone);
            const formattedPhone = formatPhone(phone);
            
            // 애플 심사용 데모 계정 체크
            const isDemoAccount = cleanPhone === '01088888888' && otp === '888888';
            
            try {
                const response = await api('POST', '/api/auth/verify-otp', {
                    phone: formattedPhone,
                    otp,
                    userType: 'company',
                    isDemoAccount: isDemoAccount // 데모 계정 플래그 추가
                });

                // 성공한 경우
                const result = await login(response.token, response.user, response.onboardingStatus);

                if (result.success) {
                    if (response.onboardingStatus.completed) {
                        router.replace('/(company)/home2');
                    } else {
                        router.replace('/(pages)/(company)/(company-information)/register');
                    }
                } else {
                    // 인증 시도 플래그 즉시 리셋
                    hasAttemptedRef.current = false;
                    setOtp('');
                    showModal('오류', '로그인 처리 중 오류가 발생했습니다', 'warning');
                }
                
            } catch (apiError: any) {

                // 인증 시도 플래그 즉시 리셋
                hasAttemptedRef.current = false;
                setOtp('');
                
                // 서버 에러 응답에서 메시지 추출
                const errorMessage = apiError?.response?.data?.error;
                const isWrongAccountType = errorMessage?.includes('구직자 계정입니다');
                
                showModal(
                    isWrongAccountType ? '잘못된 계정 유형' : '인증 실패',
                    isWrongAccountType
                        ? '이 전화번호는 구직자 계정입니다. 구직자 로그인을 이용해주세요.'
                        : errorMessage || '인증번호가 일치하지 않거나 오류가 발생했습니다',
                    'warning',
                    isWrongAccountType
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // 자동 인증 트리거
    useEffect(() => {
        if (otp.length === 6 && inputOtp && !loading && !hasAttemptedRef.current) {
            hasAttemptedRef.current = true;
            verifyOtp();
        } else if (otp.length < 6) {
            hasAttemptedRef.current = false;
        }
    }, [otp, loading, inputOtp]);

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="px-6 pt-2 pb-4">
                    <Back />
                </View>

                <View className="flex-1 px-6">
                    {/* 헤더 */}
                    <View className="mt-8 mb-12">
                        <View className="flex-row items-center mb-3">
                            <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mr-3">
                                <Ionicons name="business" size={20} color="#3b82f6" />
                            </View>
                            <Text className="text-3xl font-bold text-gray-900">회사 로그인</Text>
                        </View>
                        <Text className="text-base text-gray-600">구인자용 로그인 페이지입니다</Text>
                    </View>

                    {/* 전화번호 입력 */}
                    <View className="mb-8">
                        <Text className="text-sm font-medium text-gray-700 mb-3">회사 전화번호</Text>
                        <View style={{ borderBottomWidth: 2, borderBottomColor: '#d1d5db', paddingBottom: 8 }}>
                            <View className="flex-row items-center">
                                <TextInput
                                    className="flex-1 text-lg text-gray-900 py-2"
                                    placeholder="02-0000-0000"
                                    placeholderTextColor="#9ca3af"
                                    maxLength={20}
                                    value={phone}
                                    onChangeText={handlePhoneChange}
                                    keyboardType="phone-pad"
                                    editable={!inputOtp && !loading}
                                    style={{ lineHeight: 19, textAlignVertical: 'center' }}
                                />
                                {phone.length > 0 && !inputOtp && (
                                    <TouchableOpacity
                                        onPress={sendOtp}
                                        disabled={loading}
                                        className="bg-blue-500 px-4 py-2 rounded-lg ml-2"
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className="text-white font-medium">인증번호 받기</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <Text className="text-xs text-gray-500 mt-2">
                            * 회사 대표번호 또는 담당자 휴대폰 번호를 입력하세요
                        </Text>
                    </View>

                    {/* OTP 입력 */}
                    {inputOtp && (
                        <View className="mb-8">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-sm font-medium text-gray-700">인증번호</Text>
                                {resendTimer > 0 && (
                                    <Text className="text-sm text-gray-500">
                                        재전송 가능 {Math.floor(resendTimer / 60)}:
                                        {(resendTimer % 60).toString().padStart(2, '0')}
                                    </Text>
                                )}
                            </View>
                            <View style={{ borderBottomWidth: 2, borderBottomColor: '#d1d5db', paddingBottom: 8 }}>
                                <View className="flex-row items-center">
                                    <TextInput
                                        ref={otpInputRef}
                                        className="flex-1 text-xl text-gray-900 py-2 tracking-widest"
                                        placeholder="000000"
                                        placeholderTextColor="#9ca3af"
                                        maxLength={6}
                                        value={otp}
                                        onChangeText={setOtp}
                                        keyboardType="number-pad"
                                        editable={!loading}
                                        autoFocus
                                        autoComplete="sms-otp"
                                        textContentType="oneTimeCode"
                                        style={{ lineHeight: 19, textAlignVertical: 'center' }}
                                    />
                                    <TouchableOpacity
                                        onPress={verifyOtp}
                                        disabled={loading || otp.length !== 6}
                                        className={`px-4 py-2 rounded-lg ml-2 ${
                                            otp.length === 6 ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className="text-white font-medium">인증하기</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {resendTimer === 0 && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setOtp('');
                                        sendOtp();
                                    }}
                                    className="mt-4"
                                >
                                    <Text className="text-blue-500 text-center">인증번호 재전송</Text>
                                </TouchableOpacity>
                            )}

                            <View className="mt-6 bg-blue-50 p-4 rounded-xl flex-row items-start">
                                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                                <Text className="text-sm text-blue-700 ml-2 flex-1">
                                    6자리 인증번호 입력 시 자동으로 인증됩니다
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 테스트 계정 */}
                    {__DEV__ && (
                        <View className="mt-auto mb-8">
                            <Text className="text-center text-gray-500 mb-3">테스트 계정</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setPhone('01022222222');
                                    setOtp('123456');
                                    setInputOtp(true);
                                    setTimeout(() => otpInputRef.current?.focus(), 100);
                                }}
                                className="bg-gray-100 p-3 rounded-lg"
                            >
                                <Text className="text-gray-700 text-center">회사 테스트 로그인 (010-2222-2222)</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* 커스텀 모달 */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={hideModal}
            >
                <View className="flex-1 bg-black/50 justify-center px-4">
                    <View className="bg-white rounded-2xl p-6">
                        {/* 아이콘 */}
                        <View className="items-center mb-4">
                            <View className={`w-16 h-16 ${modalType === 'warning' ? 'bg-red-100' : 'bg-blue-100'} rounded-full items-center justify-center mb-3`}>
                                <Ionicons
                                    name={modalType === 'warning' ? 'warning' : 'information-circle'}
                                    size={32}
                                    color={modalType === 'warning' ? '#ef4444' : '#3b82f6'}
                                />
                            </View>
                            <Text className="text-xl font-bold text-gray-900 text-center">
                                {modalTitle}
                            </Text>
                        </View>

                        {/* 메시지 */}
                        <Text className="text-gray-600 text-center mb-6">
                            {modalMessage}
                        </Text>

                        {/* 버튼들 */}
                        {showUserLoginButton ? (
                            <View className="space-y-3">
                                <TouchableOpacity
                                    onPress={() => {
                                        hideModal();
                                        router.replace('/(auth)/user_login');
                                    }}
                                    className="w-full py-3 rounded-xl bg-blue-500"
                                >
                                    <Text className="text-center text-white font-medium">
                                        구직자 로그인으로 이동
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={hideModal}
                                    className="w-full py-3 rounded-xl bg-gray-300"
                                >
                                    <Text className="text-center text-gray-700 font-medium">
                                        취소
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={hideModal}
                                className={`w-full py-3 rounded-xl ${
                                    modalType === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                            >
                                <Text className="text-center text-white font-medium">
                                    확인
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    }
});

export default CompanyLogin;
