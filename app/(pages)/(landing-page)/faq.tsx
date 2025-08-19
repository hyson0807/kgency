import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
interface FAQItem {
    id: string;
    question: string;
    answer: string;
    category: string;
}
const FAQ = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const faqData: FAQItem[] = [
        {
            id: '1',
            category: '일반',
            question: 'K-Gency는 어떤 서비스인가요?',
            answer: 'K-Gency는 AI 기반의 구인구직 매칭 플랫폼입니다. 구직자와 구인기업의 조건을 AI가 분석하여 최적의 매칭을 제공하며, 매칭이 성사되면 100% 면접이 보장됩니다.'
        },
        {
            id: '2',
            category: '일반',
            question: '서비스 이용료가 있나요?',
            answer: 'K-Gency는 기본적으로 무료 서비스입니다. 일부 프리미엄 기능(즉시면접 등)은 토큰을 사용하며, 토큰은 앱 내에서 구매할 수 있습니다.'
        },
        {
            id: '3',
            category: '계정',
            question: '회원가입은 어떻게 하나요?',
            answer: '휴대폰 번호를 통한 OTP 인증으로 간단하게 가입할 수 있습니다. 구직자 또는 구인자를 선택하여 가입하시면 됩니다.'
        },
        {
            id: '4',
            category: '계정',
            question: '비밀번호를 잊었어요.',
            answer: 'K-Gency는 휴대폰 인증 방식을 사용하므로 별도의 비밀번호가 없습니다. 등록된 휴대폰 번호로 OTP 인증을 통해 로그인하시면 됩니다.'
        },
        {
            id: '5',
            category: '매칭',
            question: '매칭은 어떻게 이루어지나요?',
            answer: 'AI가 구직자의 경력, 희망조건, 스킬과 기업의 요구사항을 종합 분석하여 적합도를 계산합니다. 조건이 맞을 경우에만 매칭이 이루어져 면접 성사율 100%를 보장합니다.'
        },
        {
            id: '6',
            category: '매칭',
            question: '매칭 후 거절할 수 있나요?',
            answer: '네, 매칭 제안을 받은 후 구직자와 구인기업 모두 검토 후 수락 또는 거절할 수 있습니다. 하지만 신중하게 검토 후 결정하시기 바랍니다.'
        },
        {
            id: '7',
            category: '면접',
            question: '면접 일정은 어떻게 잡나요?',
            answer: '구인기업이 면접 가능한 시간대를 등록하고, 구직자가 그 중에서 선택하는 방식입니다. 매칭 후 자동으로 면접 일정을 조율할 수 있습니다.'
        },
        {
            id: '8',
            category: '면접',
            question: '면접 취소나 변경이 가능한가요?',
            answer: '면접 24시간 전까지는 취소나 변경이 가능합니다. 다만 무단 취소가 반복될 경우 서비스 이용에 제한이 있을 수 있습니다.'
        },
        {
            id: '9',
            category: '개인정보',
            question: '개인정보는 안전한가요?',
            answer: '모든 개인정보는 암호화되어 안전하게 저장되며, 개인정보보호법에 따라 엄격하게 관리됩니다. 동의 없이 제3자에게 제공되지 않습니다.'
        },
        {
            id: '10',
            category: '개인정보',
            question: '이력서 정보는 언제까지 보관되나요?',
            answer: '회원 탈퇴 후 즉시 삭제됩니다. 다만 관련 법령에 따라 일부 정보는 일정 기간 보관될 수 있습니다.'
        },
        {
            id: '11',
            category: '기술지원',
            question: '앱이 제대로 작동하지 않아요.',
            answer: '앱을 완전히 종료한 후 다시 시작해보세요. 문제가 지속되면 앱 스토어에서 최신 버전으로 업데이트하거나 고객센터로 문의해주세요.'
        },
        {
            id: '12',
            category: '기술지원',
            question: '알림이 오지 않아요.',
            answer: '설정 > 알림에서 K-Gency 알림이 허용되어 있는지 확인해주세요. iOS의 경우 집중모드나 방해금지 모드도 확인해보시기 바랍니다.'
        }
    ];
    const categories = Array.from(new Set(faqData.map(item => item.category)));
    const filteredFAQs = faqData.filter(item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const toggleExpanded = (id: string) => {
        setExpandedItems(prev => 
            prev.includes(id) 
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };
    const renderFAQItem = (item: FAQItem) => {
        const isExpanded = expandedItems.includes(item.id);
        
        return (
            <View key={item.id} className="mb-4">
                <TouchableOpacity
                    onPress={() => toggleExpanded(item.id)}
                    className="bg-white rounded-lg p-4 shadow-sm"
                >
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 pr-4">
                            <View className="flex-row items-center mb-2">
                                <Text className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full font-medium">
                                    {item.category}
                                </Text>
                            </View>
                            <Text className="text-gray-800 font-medium leading-6">
                                {item.question}
                            </Text>
                        </View>
                        <Ionicons 
                            name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                            size={20} 
                            color="#6b7280" 
                        />
                    </View>
                    
                    {isExpanded && (
                        <View className="mt-4 pt-4 border-t border-gray-100">
                            <Text className="text-gray-600 leading-6">
                                {item.answer}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>
        );
    };
    return (
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
            <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={{ flex: 1 }}>
            <ScrollView className="flex-1 px-6 py-4">
                <View className="flex-row items-center mb-6 mt-4">
                    <TouchableOpacity 
                        onPress={() => router.back()}
                        className="mr-4 p-2 -ml-2"
                    >
                        <Ionicons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-gray-800">자주 묻는 질문</Text>
                </View>
                {/* Search Bar */}
                <View className="mb-6">
                    <View className="bg-white rounded-xl p-4 shadow-sm flex-row items-center">
                        <Ionicons name="search" size={20} color="#6b7280" />
                        <TextInput
                            className="flex-1 ml-3 text-gray-800"
                            placeholder="궁금한 내용을 검색해보세요"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {/* Category Filter */}
                {searchQuery.length === 0 && (
                    <View className="mb-6">
                        <Text className="text-lg font-bold text-gray-800 mb-4">카테고리별 FAQ</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                            <View className="flex-row gap-2 px-1">
                                {categories.map((category) => (
                                    <TouchableOpacity
                                        key={category}
                                        className="bg-white px-4 py-2 rounded-full shadow-sm"
                                    >
                                        <Text className="text-gray-700 font-medium">{category}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}
                {/* FAQ Items */}
                <View className="mb-6">
                    {searchQuery.length > 0 && (
                        <Text className="text-gray-600 mb-4">
                            '{searchQuery}'에 대한 검색결과 {filteredFAQs.length}개
                        </Text>
                    )}
                    
                    {filteredFAQs.length === 0 ? (
                        <View className="bg-white rounded-xl p-8 items-center shadow-sm">
                            <Ionicons name="search" size={48} color="#d1d5db" />
                            <Text className="text-gray-500 mt-4 text-center">
                                검색 결과가 없습니다.{'\n'}다른 키워드로 검색해보세요.
                            </Text>
                        </View>
                    ) : (
                        searchQuery.length > 0 ? (
                            filteredFAQs.map(renderFAQItem)
                        ) : (
                            categories.map((category) => (
                                <View key={category} className="mb-8">
                                    <Text className="text-lg font-bold text-gray-800 mb-4">{category}</Text>
                                    {faqData
                                        .filter(item => item.category === category)
                                        .map(renderFAQItem)
                                    }
                                </View>
                            ))
                        )
                    )}
                </View>
                {/* Contact Section */}
                <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <Text className="text-lg font-bold text-gray-800 mb-4">더 궁금한 사항이 있으신가요?</Text>
                    <Text className="text-gray-600 leading-6 mb-4">
                        찾으시는 답변이 없다면 고객센터로 직접 문의해주세요. 빠르고 정확한 답변을 드리겠습니다.
                    </Text>
                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <Ionicons name="mail" size={16} color="#6b7280" />
                            <Text className="text-gray-600 ml-2">welkit.answer@gmail.com</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="time" size={16} color="#6b7280" />
                            <Text className="text-gray-600 ml-2">평일 09:00 - 18:00 (주말 및 공휴일 휴무)</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="call" size={16} color="#6b7280" />
                            <Text className="text-gray-600 ml-2">1588-0000</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};
export default FAQ;