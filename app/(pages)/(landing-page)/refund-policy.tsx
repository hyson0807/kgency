import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Back from '@/components/back';

export default function RefundPolicy() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <Back />
        <Text className="text-xl font-bold text-gray-800 ml-2">환불정책</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-lg font-bold mb-4">케이젠시 환불정책</Text>
        
        <Text className="text-base mb-4">
          케이젠시는 공정하고 투명한 환불정책을 통해 이용자의 권익을 보호합니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제1조 (환불 대상)</Text>
        <Text className="text-base mb-4">
          1. 토큰 구매 후 7일 이내 미사용 토큰{'\n'}
          2. 서비스 장애로 인해 사용하지 못한 토큰{'\n'}
          3. 중복 결제로 인한 토큰{'\n'}
          4. 기타 회사의 귀책사유로 인한 경우
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제2조 (환불 불가 사항)</Text>
        <Text className="text-base mb-4">
          1. 이미 사용한 토큰에 대해서는 환불이 불가합니다{'\n'}
          2. 구매 후 7일이 경과한 미사용 토큰{'\n'}
          3. 이용자의 단순 변심으로 인한 환불 요청{'\n'}
          4. 무료로 지급된 토큰
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제3조 (환불 절차)</Text>
        <Text className="text-base mb-4">
          1. 환불 신청: 고객센터를 통해 환불 신청{'\n'}
          2. 환불 승인: 회사의 환불 정책에 따른 승인 여부 결정{'\n'}
          3. 환불 처리: 승인 후 3-5 영업일 내 환불 처리{'\n'}
          4. 환불 완료: 결제수단으로 환불 완료 안내
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제4조 (환불 기준)</Text>
        <Text className="text-base mb-4">
          1. 전액 환불: 구매 후 7일 이내 미사용 토큰의 경우{'\n'}
          2. 부분 환불: 사용한 토큰을 제외한 나머지 토큰에 대해 환불{'\n'}
          3. 환불 수수료: 환불 시 결제 수수료는 이용자 부담
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제5조 (환불 방법)</Text>
        <Text className="text-base mb-4">
          1. 신용카드 결제: 신용카드 승인 취소{'\n'}
          2. 계좌이체: 고객이 지정한 계좌로 입금{'\n'}
          3. 기타 결제수단: 각 결제수단의 정책에 따른 환불
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제6조 (분쟁 해결)</Text>
        <Text className="text-base mb-4">
          환불과 관련하여 분쟁이 발생한 경우, 회사는 이용자와 성실히 협의하여 해결하도록 노력하며, 
          필요시 소비자분쟁조정위원회 등 관련 기관의 조정을 받을 수 있습니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제7조 (고객센터)</Text>
        <Text className="text-base mb-4">
          환불 관련 문의사항이 있으신 경우 아래 연락처로 문의해 주시기 바랍니다:{'\n'}
          - 이메일: support@kgency.kr{'\n'}
          - 운영시간: 평일 09:00-18:00 (토요일, 일요일, 공휴일 제외)
        </Text>

        <Text className="text-sm text-gray-600 mt-8">
          시행일자: 2024년 1월 1일
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}