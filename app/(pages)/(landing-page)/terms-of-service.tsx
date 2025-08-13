import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Back from '@/components/back';

export default function TermsOfService() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <Back />
        <Text className="text-xl font-bold text-gray-800 ml-2">서비스 이용약관</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-lg font-bold mb-4">케이젠시 서비스 이용약관</Text>
        
        <Text className="text-base mb-4">
          본 약관은 케이젠시(이하 "회사")가 제공하는 구인구직 매칭 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제1조 (목적)</Text>
        <Text className="text-base mb-4">
          본 약관은 케이젠시가 제공하는 구인구직 매칭 플랫폼 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제2조 (정의)</Text>
        <Text className="text-base mb-4">
          1. "서비스"라 함은 회사가 제공하는 구인구직 매칭 플랫폼을 의미합니다.{'\n'}
          2. "회원"이라 함은 본 약관에 따라 이용계약을 체결하고 서비스를 이용하는 자를 의미합니다.{'\n'}
          3. "구직자"라 함은 취업을 목적으로 서비스를 이용하는 개인회원을 의미합니다.{'\n'}
          4. "기업회원"이라 함은 인재채용을 목적으로 서비스를 이용하는 법인 또는 개인사업자를 의미합니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제3조 (약관의 효력 및 변경)</Text>
        <Text className="text-base mb-4">
          1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.{'\n'}
          2. 회사는 관련법을 위배하지 않는 범위에서 본 약관을 개정할 수 있습니다.{'\n'}
          3. 약관이 변경되는 경우 회사는 변경사유 및 적용일자를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일 7일 이전부터 적용일 전일까지 공지합니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제4조 (서비스의 제공 및 변경)</Text>
        <Text className="text-base mb-4">
          1. 회사는 다음과 같은 서비스를 제공합니다:{'\n'}
          - 구인구직 정보 매칭 서비스{'\n'}
          - 면접 일정 관리 서비스{'\n'}
          - 지원서 관리 서비스{'\n'}
          - 기타 회사가 정하는 서비스{'\n'}
          2. 회사는 서비스의 내용 및 제공일정을 변경할 수 있으며, 이 경우 변경된 서비스의 내용 및 제공일정을 명시하여 서비스를 통해 통지합니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제5조 (회원가입)</Text>
        <Text className="text-base mb-4">
          1. 회원가입은 이용자가 약관의 내용에 대하여 동의를 하고 회원가입신청을 한 후 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.{'\n'}
          2. 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다:{'\n'}
          - 실명이 아니거나 타인의 명의를 이용한 경우{'\n'}
          - 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우{'\n'}
          - 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제6조 (회원정보의 변경)</Text>
        <Text className="text-base mb-4">
          회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 다만, 서비스 관리를 위해 필요한 실명, 휴대폰번호 등은 수정이 제한될 수 있습니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제7조 (개인정보보호)</Text>
        <Text className="text-base mb-4">
          회사는 관계법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련법 및 회사의 개인정보처리방침이 적용됩니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제8조 (회원의 의무)</Text>
        <Text className="text-base mb-4">
          1. 회원은 다음 행위를 하여서는 안됩니다:{'\n'}
          - 신청 또는 변경시 허위내용의 등록{'\n'}
          - 타인의 정보도용{'\n'}
          - 회사가 게시한 정보의 변경{'\n'}
          - 회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시{'\n'}
          - 회사 기타 제3자의 저작권 등 지적재산권에 대한 침해{'\n'}
          - 회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위{'\n'}
          - 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제9조 (서비스 이용제한)</Text>
        <Text className="text-base mb-4">
          회사는 회원이 본 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 서비스 이용을 단계적으로 제한할 수 있습니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제10조 (손해배상)</Text>
        <Text className="text-base mb-4">
          회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 동 손해가 회사의 고의 또는 중대한 과실에 의한 경우를 제외하고 이에 대하여 책임을 부담하지 아니합니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제11조 (면책조항)</Text>
        <Text className="text-base mb-4">
          1. 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.{'\n'}
          2. 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.{'\n'}
          3. 회사는 회원이 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 그 밖의 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.
        </Text>

        <Text className="text-lg font-bold mb-2 mt-6">제12조 (재판권 및 준거법)</Text>
        <Text className="text-base mb-4">
          본 약관에 관하여 분쟁이 있을 때에는 대한민국 법을 적용하며, 서울중앙지방법원을 관할법원으로 합니다.
        </Text>

        <Text className="text-sm text-gray-600 mt-8">
          시행일자: 2024년 1월 1일
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}