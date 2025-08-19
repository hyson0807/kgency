import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from '@/contexts/TranslationContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
const PrivacyPolicy = () => {
    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <View className="mb-6">
            <Text className="text-lg font-bold mb-3 text-gray-900">{title}</Text>
            {children}
        </View>
    );
    const Paragraph = ({ children }: { children: React.ReactNode }) => (
        <Text className="text-sm text-gray-700 leading-6 mb-3">{children}</Text>
    );
    const ListItem = ({ children }: { children: React.ReactNode }) => (
        <Text className="text-sm text-gray-700 leading-6 mb-2">{children}</Text>
    );
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
                    <Text className="text-2xl font-bold text-gray-800">개인정보처리방침</Text>
                </View>
                <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
                    <Section title="개인정보처리방침">
                        <Paragraph>
                            kgency(이하 "회사")는 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 관계 법령이 정한 바를 준수하여, 적법하게 개인정보를 처리하고 안전하게 관리하고 있습니다. 이에 「개인정보 보호법」 제30조에 따라 정보주체에게 개인정보 처리에 관한 절차 및 기준을 안내하고, 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
                        </Paragraph>
                    </Section>
                    <Section title="제1조 (개인정보의 처리목적)">
                        <Paragraph>
                            회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                        </Paragraph>
                        <View className="space-y-2">
                            <ListItem>
                                1. 회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지
                            </ListItem>
                            <ListItem>
                                2. 구인구직 매칭 서비스 제공: 구직자와 구인기업 간의 매칭, 이력서 관리, 채용정보 제공, 면접 일정 관리
                            </ListItem>
                            <ListItem>
                                3. 고충처리: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보
                            </ListItem>
                        </View>
                    </Section>
                    <Section title="제2조 (개인정보의 처리 및 보유기간)">
                        <Paragraph>
                            ① 회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
                        </Paragraph>
                        <Paragraph>
                            ② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                        </Paragraph>
                        <View className="space-y-2">
                            <ListItem>
                                1. 회원정보: 회원 탈퇴 시까지 (단, 관계법령에 보존의무가 있는 경우 해당 기간까지 보존)
                            </ListItem>
                            <ListItem>
                                2. 면접 및 채용 관련 기록: 3년
                            </ListItem>
                            <ListItem>
                                3. 부정이용 기록: 1년
                            </ListItem>
                        </View>
                    </Section>
                    <Section title="제3조 (개인정보의 제3자 제공)">
                        <Paragraph>
                            ① 회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
                        </Paragraph>
                        <Paragraph>
                            ② 회사는 다음과 같은 경우에 개인정보를 제3자에게 제공하고 있습니다.
                        </Paragraph>
                        <View className="space-y-2">
                            <ListItem>
                                1. 구인구직 매칭 서비스 제공을 위한 구직자와 구인기업 간의 정보 공유 (사전 동의를 받은 경우에 한함)
                            </ListItem>
                            <ListItem>
                                2. 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우
                            </ListItem>
                        </View>
                    </Section>
                    <Section title="제4조 (개인정보처리의 위탁)">
                        <Paragraph>
                            ① 회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
                        </Paragraph>
                        <View className="space-y-2">
                            <ListItem>
                                1. SMS 발송 업무: 문자메시지 발송을 위한 통신사 및 SMS 발송 대행업체
                            </ListItem>
                            <ListItem>
                                2. 클라우드 서비스 제공업체: 서버 운영 및 데이터 저장
                            </ListItem>
                        </View>
                        <Paragraph>
                            ② 위탁계약 체결시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.
                        </Paragraph>
                    </Section>
                    <Section title="제5조 (정보주체의 권리·의무 및 행사방법)">
                        <Paragraph>
                            ① 정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
                        </Paragraph>
                        <View className="space-y-2">
                            <ListItem>
                                1. 개인정보 처리현황 통지요구
                            </ListItem>
                            <ListItem>
                                2. 개인정보 열람요구
                            </ListItem>
                            <ListItem>
                                3. 개인정보 정정·삭제요구
                            </ListItem>
                            <ListItem>
                                4. 개인정보 처리정지요구
                            </ListItem>
                        </View>
                        <Paragraph>
                            ② 제1항에 따른 권리 행사는 회사에 대해 서면, 전화, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체없이 조치하겠습니다.
                        </Paragraph>
                    </Section>
                    <Section title="제6조 (처리하는 개인정보 항목)">
                        <Paragraph>
                            회사는 다음의 개인정보 항목을 처리하고 있습니다.
                        </Paragraph>
                        <View className="space-y-2">
                            <ListItem>
                                1. 필수항목: 휴대폰번호, 이름, 연령, 성별, 이메일주소(선택)
                            </ListItem>
                            <ListItem>
                                2. 구직자 추가 정보: 경력사항, 학력사항, 희망근무조건, 자기소개서
                            </ListItem>
                            <ListItem>
                                3. 구인기업 추가 정보: 회사명, 사업자등록번호, 회사주소, 담당자 정보
                            </ListItem>
                            <ListItem>
                                4. 자동 수집 정보: 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보, 결제기록
                            </ListItem>
                        </View>
                    </Section>
                    <Section title="제7조 (개인정보의 파기)">
                        <Paragraph>
                            ① 회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.
                        </Paragraph>
                        <Paragraph>
                            ② 개인정보 파기의 절차 및 방법은 다음과 같습니다.
                        </Paragraph>
                        <View className="space-y-2">
                            <ListItem>
                                1. 파기절차: 불필요한 개인정보 및 개인정보파일은 개인정보보호책임자의 승인을 받아 파기합니다.
                            </ListItem>
                            <ListItem>
                                2. 파기방법: 전자적 파일형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 로우레벨포맷(Low Level Format) 등의 방법을 이용하여 파기하며, 종이문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
                            </ListItem>
                        </View>
                    </Section>
                    <Section title="제8조 (개인정보의 안전성 확보조치)">
                        <Paragraph>
                            회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.
                        </Paragraph>
                        <View className="space-y-2">
                            <ListItem>
                                1. 개인정보 취급 직원의 최소화 및 교육: 개인정보를 취급하는 직원을 지정하고 담당자에 한정시켜 최소화하여 개인정보를 관리하는 대책을 시행하고 있습니다.
                            </ListItem>
                            <ListItem>
                                2. 정기적인 자체 감사: 개인정보 취급 관련 안정성 확보를 위해 정기적으로 자체 감사를 실시하고 있습니다.
                            </ListItem>
                            <ListItem>
                                3. 개인정보의 암호화: 개인정보는 암호화 등을 통해 안전하게 저장 및 관리되고 있습니다.
                            </ListItem>
                            <ListItem>
                                4. 해킹 등에 대비한 기술적 대책: 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적/물리적으로 감시 및 차단하고 있습니다.
                            </ListItem>
                        </View>
                    </Section>
                    <Section title="제9조 (개인정보보호책임자)">
                        <Paragraph>
                            ① 회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다.
                        </Paragraph>
                        <View className="bg-gray-50 p-4 rounded-lg mt-3">
                            <Text className="font-bold text-gray-800 mb-2">▶ 개인정보보호책임자</Text>
                            <View className="space-y-1">
                                <Text className="text-sm text-gray-700">성명: 개인정보보호책임자</Text>
                                <Text className="text-sm text-gray-700">연락처: support@kgency.co.kr</Text>
                                <Text className="text-sm text-gray-700">전화번호: 1588-0000</Text>
                            </View>
                        </View>
                        <Paragraph>
                            ② 정보주체께서는 회사의 서비스(또는 사업)를 이용하시면서 발생한 모든 개인정보 보호 관련 문의, 불만처리, 피해구제 등에 관한 사항을 개인정보보호책임자 및 담당부서로 문의하실 수 있습니다.
                        </Paragraph>
                    </Section>
                    <Section title="제10조 (개인정보 처리방침 변경)">
                        <Paragraph>
                            ① 이 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.
                        </Paragraph>
                        <Paragraph>
                            ② 이전의 개인정보 처리방침은 아래에서 확인하실 수 있습니다.
                        </Paragraph>
                    </Section>
                    <View className="border-t border-gray-200 pt-6 mt-6">
                        <Text className="text-center text-gray-500 text-sm">
                            최종 수정일: 2024년 1월 1일
                        </Text>
                    </View>
                </View>
            </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
};
export default PrivacyPolicy;