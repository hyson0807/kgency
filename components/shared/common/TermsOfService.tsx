import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '@/contexts/TranslationContext';
interface TermsOfServiceProps {
  onClose: () => void;
}
const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* 헤더 */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <Text className="text-xl font-bold">{t('terms.title', '이용약관')}</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Ionicons name="close" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 p-4">
        {/* 제1조 목적 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제1조 (목적)</Text>
          <Text className="text-sm text-gray-700 leading-6">
            이 약관은 kgency(이하 "회사")가 제공하는 구인구직 매칭 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </Text>
        </View>
        {/* 제2조 정의 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제2조 (정의)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. "서비스"란 회사가 제공하는 구인구직 매칭 플랫폼 및 관련 제반 서비스를 의미합니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. "회원"이란 서비스에 개인정보를 제공하여 회원등록을 한 자로서, 서비스를 계속적으로 이용할 수 있는 자를 말합니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              3. "구직자"란 취업을 희망하는 회원을 의미합니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              4. "구인기업"이란 인재 채용을 희망하는 회원을 의미합니다.
            </Text>
          </View>
        </View>
        {/* 제3조 약관의 게시와 개정 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제3조 (약관의 게시와 개정)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 회사는 필요하다고 인정되는 경우 이 약관을 개정할 수 있으며, 개정된 약관은 적용일자 7일 이전부터 공지합니다.
            </Text>
          </View>
        </View>
        {/* 제4조 서비스의 제공 및 변경 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제4조 (서비스의 제공 및 변경)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회사가 제공하는 서비스는 다음과 같습니다:
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 구인구직 정보 매칭 서비스
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 이력서 작성 및 관리 서비스
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 면접 일정 관리 서비스
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 채용 관련 메시징 서비스
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 회사는 서비스의 내용을 변경할 수 있으며, 변경 시 사전에 공지합니다.
            </Text>
          </View>
        </View>
        {/* 제5조 회원가입 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제5조 (회원가입)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회원가입은 서비스 이용을 희망하는 자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 하여 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않을 수 있습니다:
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 실명이 아니거나 타인의 명의를 이용한 경우
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 허위 정보를 기재한 경우
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              - 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우
            </Text>
          </View>
        </View>
        {/* 제6조 회원의 의무 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제6조 (회원의 의무)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              회원은 다음 행위를 하여서는 안 됩니다:
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              1. 신청 또는 변경 시 허위내용의 등록
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              2. 타인의 정보 도용
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              3. 회사가 게시한 정보의 변경
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              4. 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시
            </Text>
            <Text className="text-sm text-gray-700 leading-6 ml-4">
              5. 회사 기타 제3자의 저작권 등 지적재산권에 대한 침해
            </Text>
          </View>
        </View>
        {/* 제7조 서비스 이용의 제한 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제7조 (서비스 이용의 제한)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회사는 회원이 이 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 회사는 전항에도 불구하고, 주민등록법을 위반한 명의도용 및 결제도용, 전화번호 도용, 저작권법 및 컴퓨터프로그램보호법을 위반한 불법프로그램의 제공 및 운영방해, 정보통신망법을 위반한 불법통신 및 해킹, 악성프로그램의 배포, 접속권한 초과행위 등과 같이 관련법을 위반한 경우에는 즉시 영구이용정지를 할 수 있습니다.
            </Text>
          </View>
        </View>
        {/* 제8조 면책조항 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제8조 (면책조항)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              3. 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않습니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              4. 회사는 회원간 또는 회원과 제3자 상호간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임을 지지 않습니다.
            </Text>
          </View>
        </View>
        {/* 제9조 분쟁해결 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">제9조 (분쟁해결)</Text>
          <View className="space-y-2">
            <Text className="text-sm text-gray-700 leading-6">
              1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
            </Text>
            <Text className="text-sm text-gray-700 leading-6">
              2. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.
            </Text>
          </View>
        </View>
        {/* 부칙 */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-3 text-gray-900">부칙</Text>
          <Text className="text-sm text-gray-700 leading-6">
            이 약관은 2024년 1월 1일부터 적용됩니다.
          </Text>
        </View>
        {/* 연락처 */}
        <View className="bg-gray-50 p-4 rounded-xl mt-4 mb-40">
          <Text className="text-sm font-medium text-gray-900 mb-2">문의사항</Text>
          <Text className="text-sm text-gray-600">
            이용약관에 관한 문의사항이 있으시면 고객센터로 연락해 주세요.
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            이메일: support@kgency.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};
export default TermsOfService;