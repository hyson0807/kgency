import {View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Modal} from 'react-native'
import React, {useState, useEffect, useRef} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import Back from "@/components/back";
import {useAuth} from "@/contexts/AuthContext";
import {router} from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import {useTranslation} from "@/contexts/TranslationContext";
import { api } from '@/lib/api';

const UserLogin = () => {
    const { login } = useAuth();
    const { t } = useTranslation();

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

    const otpInputRef = useRef<TextInput>(null);
    const hasAttemptedRef = useRef(false);
    
    // 모달 표시 함수
    const showModal = (title: string, message: string, type: 'info' | 'warning' = 'info') => {
        // 이미 모달이 열려있거나 로딩 중이면 반환
        if (modalVisible || loading) return;
        
        // 약간의 지연을 두어 안전하게 모달 표시
        setTimeout(() => {
            setModalTitle(title);
            setModalMessage(message);
            setModalType(type);
            setModalVisible(true);
        }, 100);
    };
    
    // 모달 닫기
    const hideModal = () => {
        setModalVisible(false);
    };

    // OTP 재전송 타이머
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const handlePhoneChange = (text: string) => {
        const formatted = formatPhoneNumber(text);
        setPhone(formatted);
    };

    const sendOtp = async () => {
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        if(!cleanPhone || cleanPhone.length !== 11) {
            showModal(t('alert.notification', '알림'), t('alert.enter_valid_phone', '올바른 휴대폰 번호를 입력해주세요'));
            return;
        }
        setLoading(true);

        try {
            const formattedPhone = `+82${cleanPhone.slice(1)}`;

            const response = await api ('POST','/api/auth/send-otp', {phone: formattedPhone})
            if (response.success) {
                setInputOtp(true);
                setResendTimer(180); // 3분 타이머
                setTimeout(() => otpInputRef.current?.focus(), 100);
            } else {
                showModal(t('alert.send_failed', '전송 실패'), response.data.error || t('alert.code_send_error', '인증번호 전송에 실패했습니다'), 'warning');
            }
        } catch (error) {
            console.error(error);
            showModal(t('alert.error', '오류'), t('alert.check_network', '네트워크 연결을 확인해주세요'), 'warning');
        } finally {
            setLoading(false);
        }
    }

    const verifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            showModal(t('alert.notification', '알림'), t('alert.enter_6_digits', '6자리 인증번호를 입력해주세요'));
            return;
        }
        setLoading(true);
        try{
            const cleanPhone = phone.replace(/-/g, '');
            const formattedPhone = `+82${cleanPhone.slice(1)}`;

            try {
                const response = await api ('POST','/api/auth/verify-otp', {
                    phone: formattedPhone,
                    otp: otp,
                    userType: 'user'
                });

                // 성공한 경우
                const result = await login(
                    response.token,
                    response.user,
                    response.onboardingStatus
                );

                if (result.success) {
                    if (response.onboardingStatus.completed) {
                        router.replace('/(user)/home');
                    } else {
                        router.replace('/(pages)/(user)/info');
                    }
                } else {
                    // 인증 시도 플래그 즉시 리셋
                    hasAttemptedRef.current = false;
                    setOtp('');
                    showModal(t('alert.error', '오류'), t('alert.auth_error', '로그인 처리 중 오류가 발생했습니다'), 'warning');
                }
                
            } catch (apiError: any) {

                // 인증 시도 플래그 즉시 리셋
                hasAttemptedRef.current = false;
                setOtp('');
                
                // 서버 에러 응답에서 메시지 추출
                const errorMessage = apiError?.response?.data?.error;
                const isWrongAccountType = errorMessage?.includes('구인자 계정입니다');
                
                showModal(
                    isWrongAccountType ? t('alert.wrong_account_type', '잘못된 계정 유형') : t('alert.error', '인증 실패'),
                    isWrongAccountType
                        ? t('alert.use_company_login', '이 전화번호는 구인자 계정입니다. 구인자 로그인을 이용해주세요.')
                        : errorMessage || t('alert.auth_error', '인증번호가 일치하지 않거나 오류가 발생했습니다'),
                    'warning'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // OTP 입력 처리 (6자리 입력 시 자동 인증)
    useEffect(() => {
        if (otp.length === 6 && inputOtp && !loading && !hasAttemptedRef.current) {
            hasAttemptedRef.current = true;
            verifyOtp();
        } else if (otp.length < 6) {
            hasAttemptedRef.current = false;
        }
    }, [otp, loading, inputOtp]);

    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="px-6 pt-2 pb-4">
                    <Back />
                </View>

                <View className="flex-1 px-6">
                    {/* 헤더 영역 */}
                    <View className="mt-8 mb-12">
                        <Text className="text-3xl font-bold text-gray-900 mb-3">
                            {t('login.phone_auth', '전화번호 인증')}
                        </Text>
                        <Text className="text-base text-gray-600">
                            {t('login.subtitle', '원활한 서비스 이용을 위해 본인인증을 해주세요')}
                        </Text>
                    </View>

                    {/* 휴대폰 번호 입력 */}
                    <View className="mb-8">
                        <Text className="text-sm font-medium text-gray-700 mb-3" >{t('login.phone_number', '휴대폰 번호')}</Text>
                        <View style={{ borderBottomWidth: 2, borderBottomColor: '#d1d5db', paddingBottom: 8 }}>
                            <View className=" flex-row items-center" style={{ height: 40 }}>
                                <TextInput
                                    className="flex-1 text-lg text-gray-900 py-2"

                                    placeholder="010-0000-0000"
                                    placeholderTextColor="#9ca3af"
                                    maxLength={13}
                                    value={phone}
                                    onChangeText={handlePhoneChange}
                                    keyboardType="phone-pad"
                                    editable={!inputOtp}
                                    style={{  lineHeight: 19, textAlignVertical: 'center' }}
                                />
                                {phone.replace(/[^0-9]/g, '').length === 11 && !inputOtp && (
                                    <TouchableOpacity
                                        onPress={sendOtp}
                                        disabled={loading}
                                        className="bg-blue-500 px-4 py-2 rounded-lg ml-2"
                                    >
                                        {loading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className="text-white font-medium">{t('login.get_code', '인증번호 받기')}</Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* OTP 입력 */}
                    {inputOtp && (
                        <View className="mb-8">
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-sm font-medium text-gray-700">{t('login.verification_code', '인증번호')}</Text>
                                {resendTimer > 0 && (
                                    <Text className="text-sm text-gray-500">
                                        {t('login.resend_available', '재전송 가능')} {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, '0')}
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
                                        autoFocus
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
                                            <Text className="text-white font-medium">{t('login.verify', '인증하기')}</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* 재전송 버튼 */}
                            {resendTimer === 0 && (
                                <TouchableOpacity
                                    onPress={() => {
                                        setOtp('');
                                        sendOtp();
                                    }}
                                    className="mt-4"
                                >
                                    <Text className="text-blue-500 text-center">{t('login.resend', '인증번호 재전송')}</Text>
                                </TouchableOpacity>
                            )}

                            {/* 자동 인증 안내 */}
                            <View className="mt-6 bg-blue-50 p-4 rounded-xl flex-row items-start">
                                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                                <Text className="text-sm text-blue-700 ml-2 flex-1">
                                    {t('login.auto_verify_info', '6자리 인증번호 입력 시 자동으로 인증됩니다')}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* 개발 모드 테스트 계정 */}
                    {__DEV__ && (
                        <View className="mt-auto mb-8">
                            <Text className="text-center text-gray-500 mb-3">테스트 계정</Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setPhone('010-1111-1111');
                                    setOtp('123456');
                                    setInputOtp(true);
                                }}
                                className="bg-gray-100 p-3 rounded-lg"
                            >
                                <Text className="text-gray-700 text-center">테스트 로그인 (010-1111-1111)</Text>
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

                        {/* 확인 버튼 */}
                        <TouchableOpacity
                            onPress={hideModal}
                            className={`w-full py-3 rounded-xl ${
                                modalType === 'warning' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                        >
                            <Text className="text-center text-white font-medium">
                                {t('button.confirm', '확인')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}



export default UserLogin