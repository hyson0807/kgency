import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Back from '@/components/back';

export default function Contact() {
  const handleEmailPress = () => {
    Linking.openURL('mailto:welkit.answer@gmail.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+82-2-1234-5678');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <Back />
        <Text className="text-xl font-bold text-gray-800 ml-2">연락처</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-lg font-bold mb-4">케이젠시 고객센터</Text>
        
        <Text className="text-base mb-6 text-gray-700">
          서비스 이용 중 문의사항이나 불편사항이 있으시면 언제든지 연락주세요.
        </Text>

        <View className="bg-gray-50 rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold mb-4">연락처 정보</Text>
          
          <TouchableOpacity 
            onPress={handleEmailPress}
            className="flex-row items-center mb-4 p-2"
          >
            <MaterialIcons name="email" size={24} color="#6366f1" />
            <View className="ml-3">
              <Text className="text-sm text-gray-600">이메일</Text>
              <Text className="text-base font-medium text-blue-600">welkit.answer@gmail.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handlePhonePress}
            className="flex-row items-center mb-4 p-2"
          >
            <MaterialIcons name="phone" size={24} color="#6366f1" />
            <View className="ml-3">
              <Text className="text-sm text-gray-600">전화번호</Text>
              <Text className="text-base font-medium text-blue-600">010-8335-7026</Text>
            </View>
          </TouchableOpacity>

          <View className="flex-row items-center p-2">
            <MaterialIcons name="schedule" size={24} color="#6366f1" />
            <View className="ml-3">
              <Text className="text-sm text-gray-600">운영시간</Text>
              <Text className="text-base font-medium">평일 09:00 - 18:00</Text>
              <Text className="text-sm text-gray-500">(토요일, 일요일, 공휴일 제외)</Text>
            </View>
          </View>
        </View>

        <View className="bg-blue-50 rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold mb-2">회사 정보</Text>
          <Text className="text-base mb-2"><Text className="font-medium">회사명:</Text> welkit</Text>
          <Text className="text-base mb-2"><Text className="font-medium">대표자:</Text> 유지원</Text>
          <Text className="text-base mb-2"><Text className="font-medium">사업자등록번호:</Text> 849-06-03189</Text>
          <Text className="text-base mb-2"><Text className="font-medium">주소:</Text> 경기도 수원시 영통구 센트럴파크로 33</Text>
        </View>

        <View className="bg-yellow-50 rounded-lg p-4">
          <Text className="text-lg font-bold mb-2">문의 분야별 안내</Text>
          <Text className="text-base mb-2"><Text className="font-medium">• 회원가입/로그인:</Text> 계정 관련 문의</Text>
          <Text className="text-base mb-2"><Text className="font-medium">• 매칭 서비스:</Text> 구인구직 매칭 관련</Text>
          <Text className="text-base mb-2"><Text className="font-medium">• 결제/환불:</Text> 토큰 구매 및 환불 문의</Text>
          <Text className="text-base mb-2"><Text className="font-medium">• 기술 지원:</Text> 앱 사용법 및 오류 신고</Text>
          <Text className="text-base"><Text className="font-medium">• 기타:</Text> 서비스 개선 제안 및 기타 문의</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}