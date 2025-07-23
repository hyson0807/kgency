import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {  useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';

interface PrivacyPolicyProps {
  onClose: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-xl font-bold">{t('privacy.title', '개인정보처리방침')}</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {/* 개요 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">개인정보처리방침</Text>
          <Text className="text-sm text-gray-700 leading-6">
            kgency(이하 "회사")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
          </Text>
        </View>

        {/* 제1조 개인정보의 처리목적 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제1조 (개인정보의 처리목적)</Text>
          <Text className="text-sm text-gray-700 leading-6 mb-2">
            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지 목적
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 구인구직 매칭 서비스 제공: 구직자와 구인기업 간의 매칭, 이력서 관리, 채용정보 제공, 면접 일정 관리
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              3. 고충처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보
            </Text>
          </View>
        </View>

        {/* 제2조 개인정보의 처리 및 보유기간 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제2조 (개인정보의 처리 및 보유기간)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 회원 가입 및 관리: 회원 탈퇴 시까지
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 구인구직 서비스 제공: 회원 탈퇴 시까지 (단, 채용 관련 기록은 3년)
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 접속 로그 기록: 3개월
            </Text>
          </View>
        </View>

        {/* 제3조 처리하는 개인정보 항목 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제3조 (처리하는 개인정보 항목)</Text>
          <View className="space-y-3">
            <View>
              <Text className="text-sm font-medium text-gray-800">1. 회원가입 시 수집항목</Text>
              <Text className="text-sm text-gray-700 leading-6 ml-4">
                필수항목: 전화번호, 이름, 사용자 유형(구직자/구인기업)
              </Text>
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-800">2. 구직자 프로필 정보</Text>
              <Text className="text-sm text-gray-700 leading-6 ml-4">
                선택항목: 나이, 성별, 비자상태, 한국 거주기간, 관심분야, 한국어 수준, 경력사항, 경력내용, 주소, 희망 키워드
              </Text>
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-800">3. 구인기업 프로필 정보</Text>
              <Text className="text-sm text-gray-700 leading-6 ml-4">
                선택항목: 회사명, 주소, 업종, 회사규모, 채용 키워드, 공고 정보
              </Text>
            </View>
            <View>
              <Text className="text-sm font-medium text-gray-800">4. 자동 수집 정보</Text>
              <Text className="text-sm text-gray-700 leading-6 ml-4">
                접속 IP 정보, 쿠키, 접속 일시, 서비스 이용 기록, 불량 이용 기록
              </Text>
            </View>
          </View>
        </View>

        {/* 제4조 개인정보의 제3자 제공 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제4조 (개인정보의 제3자 제공)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 구인구직 매칭 서비스의 특성상 다음과 같은 경우 개인정보가 제공됩니다:
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 구직자가 구인기업에 지원할 때: 구직자의 프로필 정보가 해당 기업에 제공
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 구인기업이 구직자에게 면접을 제안할 때: 기업 정보가 해당 구직자에게 제공
            </Text>
          </View>
        </View>

        {/* 제5조 개인정보처리의 위탁 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제5조 (개인정보처리의 위탁)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다:
            </Text>
            <View className="bg-gray-50 p-3 rounded-lg">
              <Text className="text-sm font-medium text-gray-800">위탁받는 자(수탁자): Supabase</Text>
              <Text className="text-sm text-gray-700">위탁하는 업무의 내용: 데이터베이스 관리 및 서버 호스팅</Text>
              <Text className="text-sm text-gray-700">위탁기간: 서비스 제공 기간</Text>
            </View>
          </View>
        </View>

        {/* 제6조 정보주체의 권리·의무 및 행사방법 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제6조 (정보주체의 권리·의무 및 행사방법)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다:
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 개인정보 처리현황 통지요구
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 개인정보 열람요구
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 개인정보 정정·삭제요구
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 개인정보 처리정지요구
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 제1항에 따른 권리 행사는 개인정보보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.
            </Text>
          </View>
        </View>

        {/* 제7조 개인정보의 파기 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제7조 (개인정보의 파기)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 파기의 절차 및 방법은 다음과 같습니다:
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 파기절차: 불필요한 개인정보 및 개인정보파일은 개인정보보호책임자의 승인을 거쳐 파기
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 파기방법: 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 로우레벨포맷 등의 방법을 이용하여 파기
            </Text>
          </View>
        </View>

        {/* 제8조 개인정보의 안전성 확보조치 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제8조 (개인정보의 안전성 확보조치)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다:
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              1. 개인정보 취급 직원의 최소화 및 교육
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              2. 개인정보에 대한 접근 제한
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              3. 개인정보의 암호화
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              4. 해킹 등에 대비한 기술적 대책
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              5. 개인정보처리시스템 등의 접근기록 보관 및 위변조 방지
            </Text>
          </View>
        </View>

        {/* 제9조 개인정보보호책임자 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제9조 (개인정보보호책임자)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다:
            </Text>
            <View className="bg-blue-50 p-4 rounded-lg">
              <Text className="text-sm font-medium text-gray-900 mb-2">▶ 개인정보보호책임자</Text>
              <Text className="text-sm text-gray-700">성명: 개인정보보호책임자</Text>
              <Text className="text-sm text-gray-700">연락처: privacy@kgency.com</Text>
              <Text className="text-sm text-gray-700 mt-2">
                ※ 개인정보보호 담당부서로 연결됩니다.
              </Text>
            </View>
          </View>
        </View>

        {/* 제10조 권익침해 구제방법 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제10조 (권익침해 구제방법)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              정보주체는 아래의 기관에 대해 개인정보 침해신고, 상담등을 문의하실 수 있습니다.
            </Text>
            <View className="space-y-3">
              <View className="bg-gray-50 p-3 rounded-lg">
                <Text className="text-sm font-medium text-gray-800">▶ 개인정보보호위원회</Text>
                <Text className="text-sm text-gray-700">소관업무: 개인정보보호법 위반신고</Text>
                <Text className="text-sm text-gray-700">홈페이지: privacy.go.kr</Text>
                <Text className="text-sm text-gray-700">전화: (국번없이) 182</Text>
              </View>
              <View className="bg-gray-50 p-3 rounded-lg">
                <Text className="text-sm font-medium text-gray-800">▶ 개인정보 침해신고센터</Text>
                <Text className="text-sm text-gray-700">소관업무: 개인정보 침해신고접수 및 처리</Text>
                <Text className="text-sm text-gray-700">홈페이지: privacy.kisa.or.kr</Text>
                <Text className="text-sm text-gray-700">전화: (국번없이) 118</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 제11조 개인정보 처리방침 변경 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제11조 (개인정보 처리방침 변경)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
            </Text>
          </View>
        </View>

        {/* 부칙 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">부칙</Text>
          <Text className="text-sm text-gray-700 leading-6">
            이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.
          </Text>
        </View>

        {/* 연락처 */}
        <View className="bg-gray-50 p-4 rounded-xl mt-4 mb-40">
          <Text className="text-sm font-medium text-gray-900 mb-2">문의사항</Text>
          <Text className="text-sm text-gray-600">
            개인정보처리방침에 관한 문의사항이 있으시면 아래 연락처로 문의해 주세요.
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            이메일: privacy@kgency.com
          </Text>
          <Text className="text-sm text-gray-600">
            고객센터: 1588-0000
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default PrivacyPolicy;