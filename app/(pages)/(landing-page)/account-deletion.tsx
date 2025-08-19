import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useModal } from '@/hooks/useModal';
const AccountDeletion = () => {
    const { showModal, ModalComponent } = useModal();
    const [formData, setFormData] = useState({
        phoneNumber: '',
        reason: '',
        additionalComments: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const reasons = [
        { key: 'no_longer_need', label: '더 이상 서비스가 필요하지 않음' },
        { key: 'privacy_concerns', label: '개인정보 보호 우려' },
        { key: 'found_alternative', label: '다른 서비스를 찾음' },
        { key: 'technical_issues', label: '기술적 문제' },
        { key: 'other', label: '기타' }
    ];
    const sendDeletionEmail = async () => {
        const reasonLabels: { [key: string]: string } = {
            'no_longer_need': '더 이상 서비스가 필요하지 않음',
            'privacy_concerns': '개인정보 보호 우려',
            'found_alternative': '다른 서비스를 찾음',
            'technical_issues': '기술적 문제',
            'other': '기타'
        };
        const subject = 'K-Gency 계정 삭제 요청';
        const bodyText = 
            `계정 삭제 요청 정보:\n\n` +
            `• 전화번호: ${formData.phoneNumber}\n` +
            `• 삭제 사유: ${reasonLabels[formData.reason] || formData.reason}\n` +
            `• 추가 의견: ${formData.additionalComments || '없음'}\n\n` +
            `요청 일시: ${new Date().toLocaleString('ko-KR')}\n\n` +
            `처리 부탁드립니다.`;
        const emailUrl = `mailto:welkit.answer@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        
        try {
            // 웹 환경 처리
            if (Platform.OS === 'web') {
                // @ts-ignore - web환경에서는 window 객체 사용 가능
                if (typeof window !== 'undefined') {
                    window.location.href = emailUrl;
                    return true;
                }
                return false;
            }
            
            // 네이티브 앱 환경 처리
            const supported = await Linking.canOpenURL(emailUrl);
            if (supported) {
                await Linking.openURL(emailUrl);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            return false;
        }
    };
    const copyToClipboardAndShowModal = async () => {
        const reasonLabels: { [key: string]: string } = {
            'no_longer_need': '더 이상 서비스가 필요하지 않음',
            'privacy_concerns': '개인정보 보호 우려',
            'found_alternative': '다른 서비스를 찾음',
            'technical_issues': '기술적 문제',
            'other': '기타'
        };
        const emailContent = 
            `받는 사람: welkit.answer@gmail.com\n` +
            `제목: K-Gency 계정 삭제 요청\n\n` +
            `계정 삭제 요청 정보:\n\n` +
            `• 전화번호: ${formData.phoneNumber}\n` +
            `• 삭제 사유: ${reasonLabels[formData.reason] || formData.reason}\n` +
            `• 추가 의견: ${formData.additionalComments || '없음'}\n\n` +
            `요청 일시: ${new Date().toLocaleString('ko-KR')}\n\n` +
            `처리 부탁드립니다.`;
        try {
            await Clipboard.setStringAsync(emailContent);
            showModal(
                '이메일 내용 복사됨',
                '이메일 내용이 클립보드에 복사되었습니다.\n\nwelkit.answer@gmail.com으로 직접 이메일을 보내주세요.',
                'info',
                () => router.back(),
                false,
                '확인'
            );
            return true;
        } catch (error) {
            return false;
        }
    };
    const handleSubmit = async () => {
        if (!formData.phoneNumber || !formData.reason) {
            showModal(
                '입력 오류',
                '전화번호와 삭제 사유를 모두 입력해주세요.',
                'warning'
            );
            return;
        }
        setIsSubmitting(true);
        
        try {
            const emailSent = await sendDeletionEmail();
            
            if (emailSent) {
                showModal(
                    '이메일 앱 열림',
                    '이메일 앱이 열렸습니다.\n\n미리 작성된 내용을 확인하고 전송 버튼을 눌러주세요.',
                    'confirm',
                    () => router.back(),
                    false,
                    '확인'
                );
            } else {
                // Fallback: 클립보드에 복사
                const copied = await copyToClipboardAndShowModal();
                if (!copied) {
                    showModal(
                        '전송 오류',
                        '이메일을 열 수 없고 클립보드 복사도 실패했습니다.\n\nwelkit.answer@gmail.com으로 직접 계정 삭제를 요청해주세요.',
                        'warning'
                    );
                }
            }
        } catch (error) {
            // 에러 발생시에도 클립보드 복사 시도
            const copied = await copyToClipboardAndShowModal();
            if (!copied) {
                showModal(
                    '오류 발생',
                    '요청 처리 중 문제가 발생했습니다.\n\nwelkit.answer@gmail.com으로 직접 계정 삭제를 요청해주세요.',
                    'warning'
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={{ flex: 1 }}>
                <ScrollView className="flex-1 px-6 py-4">
                    <View className="flex-row items-center mb-6 mt-4">
                        <TouchableOpacity 
                            onPress={() => router.back()}
                            className="mr-4 p-2 -ml-2"
                        >
                            <Ionicons name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold text-gray-800">계정 삭제 요청</Text>
                    </View>
                    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                        <View className="flex-row items-center mb-4">
                            <Ionicons name="warning" size={24} color="#f59e0b" />
                            <Text className="text-lg font-bold text-gray-800 ml-3">중요 안내</Text>
                        </View>
                        
                        <View className="space-y-3">
                            <Text className="text-gray-600 leading-6">
                                • 계정 삭제 시 모든 개인정보와 데이터가 영구적으로 삭제됩니다
                            </Text>
                            <Text className="text-gray-600 leading-6">
                                • 삭제된 계정과 데이터는 복구할 수 없습니다
                            </Text>
                            <Text className="text-gray-600 leading-6">
                                • 처리 완료까지 최대 30일이 소요될 수 있습니다
                            </Text>
                            <Text className="text-gray-600 leading-6">
                                • 일부 법정 보존 의무 데이터는 관련 법령에 따라 일정 기간 보관될 수 있습니다
                            </Text>
                        </View>
                    </View>
                    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                        <Text className="text-lg font-bold text-gray-800 mb-4">삭제 요청 정보</Text>
                        
                        <View className="mb-4">
                            <Text className="text-gray-700 font-medium mb-2">전화번호 *</Text>
                            <TextInput
                                className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 bg-gray-50"
                                placeholder="등록된 전화번호를 입력해주세요 (예: 010-1234-5678)"
                                value={formData.phoneNumber}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, phoneNumber: text }))}
                                keyboardType="phone-pad"
                            />
                        </View>
                        <View className="mb-4">
                            <Text className="text-gray-700 font-medium mb-2">삭제 사유 *</Text>
                            <View className="space-y-2">
                                {reasons.map((reason) => (
                                    <TouchableOpacity
                                        key={reason.key}
                                        onPress={() => setFormData(prev => ({ ...prev, reason: reason.key }))}
                                        className={`flex-row items-center p-3 rounded-lg border ${
                                            formData.reason === reason.key 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <View className={`w-4 h-4 rounded-full border-2 mr-3 ${
                                            formData.reason === reason.key 
                                                ? 'border-blue-500 bg-blue-500' 
                                                : 'border-gray-300'
                                        }`}>
                                            {formData.reason === reason.key && (
                                                <View className="w-2 h-2 rounded-full bg-white m-0.5" />
                                            )}
                                        </View>
                                        <Text className={`flex-1 ${
                                            formData.reason === reason.key 
                                                ? 'text-blue-700 font-medium' 
                                                : 'text-gray-700'
                                        }`}>
                                            {reason.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <View className="mb-6">
                            <Text className="text-gray-700 font-medium mb-2">추가 의견 (선택사항)</Text>
                            <TextInput
                                className="border border-gray-200 rounded-lg px-4 py-3 text-gray-800 bg-gray-50 h-24"
                                placeholder="서비스 개선을 위한 의견이 있으시면 작성해주세요"
                                value={formData.additionalComments}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, additionalComments: text }))}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isSubmitting || !formData.phoneNumber || !formData.reason}
                            className={`p-4 rounded-lg ${
                                isSubmitting || !formData.phoneNumber || !formData.reason
                                    ? 'bg-gray-300'
                                    : 'bg-red-500'
                            }`}
                        >
                            <Text className={`text-center font-bold ${
                                isSubmitting || !formData.phoneNumber || !formData.reason
                                    ? 'text-gray-500'
                                    : 'text-white'
                            }`}>
                                {isSubmitting ? '처리 중...' : '계정 삭제 요청'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                        <Text className="text-lg font-bold text-gray-800 mb-4">문의하기</Text>
                        <Text className="text-gray-600 leading-6 mb-4">
                            계정 삭제와 관련하여 궁금한 사항이 있으시면 고객센터로 문의해주세요.
                        </Text>
                        <View className="space-y-2">
                            <View className="flex-row items-center">
                                <Ionicons name="mail" size={16} color="#6b7280" />
                                <Text className="text-gray-600 ml-2">welkit.answer@gmail.com</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Ionicons name="time" size={16} color="#6b7280" />
                                <Text className="text-gray-600 ml-2">평일 09:00 - 18:00 (주말 및 공휴일 휴무)</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                </LinearGradient>
            </KeyboardAvoidingView>
            <ModalComponent />
        </SafeAreaView>
    );
};
export default AccountDeletion;