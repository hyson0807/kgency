import { View, Text, Modal, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useCompanies } from '@/hooks/useCompanies'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

interface CompanyDetailModalProps {
    visible: boolean;
    companyId: string | null;
    onClose: () => void;
}

const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ visible, companyId, onClose }) => {
    const { fetchCompanyById, getCompanyKeywords } = useCompanies();
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const screenHeight = Dimensions.get('window').height;
    const modalHeight = screenHeight * 0.9; // 화면의 90%

    useEffect(() => {
        if (companyId && visible) {
            loadCompanyDetail();
        }
    }, [companyId, visible]);

    const loadCompanyDetail = async () => {
        if (!companyId) return;

        setLoading(true);
        try {
            const data = await fetchCompanyById(companyId);
            setCompany(data);
        } catch (error) {
            console.error('회사 정보 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    const keywords = company ? getCompanyKeywords(company) : null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/30">
                <View
                    className="bg-white rounded-t-3xl"
                    style={{ height: modalHeight }}
                >
                    {/* 헤더 */}
                    <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
                        <View className="flex-row items-center flex-1">
                            <TouchableOpacity onPress={onClose} className="mr-3">
                                <Ionicons name="close" size={24} color="#000" />
                            </TouchableOpacity>
                            <Text className="text-lg font-bold">회사 정보</Text>
                        </View>
                    </View>

                    {loading ? (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#3b82f6" />
                        </View>
                    ) : company ? (
                        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                            {/* 기본 정보 */}
                            <View className="p-6 border-b border-gray-100">
                                <Text className="text-2xl font-bold mb-2">{company.name}</Text>
                                {company.address && (
                                    <View className="flex-row items-center mb-2">
                                        <Ionicons name="location-outline" size={16} color="#6b7280" />
                                        <Text className="text-gray-600 ml-2">{company.address}</Text>
                                    </View>
                                )}
                                {company.phone_number && (
                                    <View className="flex-row items-center">
                                        <Ionicons name="call-outline" size={16} color="#6b7280" />
                                        <Text className="text-gray-600 ml-2">{company.phone_number}</Text>
                                    </View>
                                )}
                            </View>

                            {/* 회사 소개 */}
                            {company.description && (
                                <View className="p-6 border-b border-gray-100">
                                    <Text className="text-lg font-semibold mb-2">회사 소개</Text>
                                    <Text className="text-gray-700 leading-6">{company.description}</Text>
                                </View>
                            )}

                            {/* 상세 정보 (company_info) */}
                            {company.company_info && (
                                <>
                                    {/* 기본 정보 */}
                                    <View className="p-6 border-b border-gray-100">
                                        <Text className="text-lg font-semibold mb-4">기본 정보</Text>
                                        <View className="space-y-3">
                                            {company.company_info.website && (
                                                <InfoRow
                                                    icon="globe-outline"
                                                    label="웹사이트"
                                                    value={company.company_info.website}
                                                />
                                            )}
                                            {company.company_info.business_type && (
                                                <InfoRow
                                                    icon="briefcase-outline"
                                                    label="업종"
                                                    value={company.company_info.business_type}
                                                />
                                            )}
                                            {company.company_info.employee_count && (
                                                <InfoRow
                                                    icon="people-outline"
                                                    label="직원 수"
                                                    value={company.company_info.employee_count}
                                                />
                                            )}
                                            {company.company_info.established_year && (
                                                <InfoRow
                                                    icon="calendar-outline"
                                                    label="설립연도"
                                                    value={`${company.company_info.established_year}년`}
                                                />
                                            )}
                                        </View>
                                    </View>

                                    {/* 근무 조건 */}
                                    <View className="p-6 border-b border-gray-100">
                                        <Text className="text-lg font-semibold mb-4">근무 조건</Text>
                                        <View className="space-y-3">
                                            {company.company_info.working_hours && (
                                                <InfoRow
                                                    icon="time-outline"
                                                    label="근무시간"
                                                    value={company.company_info.working_hours}
                                                />
                                            )}
                                            {company.company_info.break_time && (
                                                <InfoRow
                                                    icon="cafe-outline"
                                                    label="휴게시간"
                                                    value={company.company_info.break_time}
                                                />
                                            )}
                                            {company.company_info.holiday_system && (
                                                <InfoRow
                                                    icon="today-outline"
                                                    label="휴무"
                                                    value={company.company_info.holiday_system}
                                                />
                                            )}
                                            {company.company_info.salary_range && (
                                                <InfoRow
                                                    icon="cash-outline"
                                                    label="급여"
                                                    value={company.company_info.salary_range}
                                                />
                                            )}
                                        </View>
                                    </View>

                                    {/* 복지 */}
                                    {(company.company_info.insurance?.length > 0 || company.company_info.benefits?.length > 0) && (
                                        <View className="p-6 border-b border-gray-100">
                                            <Text className="text-lg font-semibold mb-4">복지</Text>
                                            {company.company_info.insurance?.length > 0 && (
                                                <View className="mb-3">
                                                    <Text className="text-gray-600 font-medium mb-2">보험</Text>
                                                    <View className="flex-row flex-wrap gap-2">
                                                        {company.company_info.insurance.map((item: any, index: any) => (
                                                            <View key={index} className="bg-blue-100 px-3 py-1 rounded-full">
                                                                <Text className="text-blue-700 text-sm">{item}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}
                                            {company.company_info.benefits?.length > 0 && (
                                                <View>
                                                    <Text className="text-gray-600 font-medium mb-2">혜택</Text>
                                                    <View className="flex-row flex-wrap gap-2">
                                                        {company.company_info.benefits.map((item: any, index: any) => (
                                                            <View key={index} className="bg-green-100 px-3 py-1 rounded-full">
                                                                <Text className="text-green-700 text-sm">{item}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </>
                            )}

                            {/* 채용 키워드 */}
                            {keywords && (
                                <View className="p-6">
                                    <Text className="text-lg font-semibold mb-4">채용 분야</Text>

                                    {keywords.countries.length > 0 && (
                                        <View className="mb-4">
                                            <Text className="text-gray-600 font-medium mb-2">국가</Text>
                                            <View className="flex-row flex-wrap gap-2">
                                                {keywords.countries.map((keyword) => (
                                                    <View key={keyword.id} className="bg-purple-100 px-3 py-1 rounded-full">
                                                        <Text className="text-purple-700 text-sm">{keyword.keyword}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {keywords.jobs.length > 0 && (
                                        <View className="mb-4">
                                            <Text className="text-gray-600 font-medium mb-2">직종</Text>
                                            <View className="flex-row flex-wrap gap-2">
                                                {keywords.jobs.map((keyword) => (
                                                    <View key={keyword.id} className="bg-orange-100 px-3 py-1 rounded-full">
                                                        <Text className="text-orange-700 text-sm">{keyword.keyword}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}

                                    {keywords.conditions.length > 0 && (
                                        <View>
                                            <Text className="text-gray-600 font-medium mb-2">근무조건</Text>
                                            <View className="flex-row flex-wrap gap-2">
                                                {keywords.conditions.map((keyword) => (
                                                    <View key={keyword.id} className="bg-teal-100 px-3 py-1 rounded-full">
                                                        <Text className="text-teal-700 text-sm">{keyword.keyword}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* 하단 여백 */}
                            <View className="h-20" />
                        </ScrollView>
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-gray-500">회사 정보를 불러올 수 없습니다.</Text>
                        </View>
                    )}

                    {/* 지원하기 버튼 */}
                    {company && !loading && (
                        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                            <TouchableOpacity
                                className="bg-blue-500 py-4 rounded-xl items-center"
                                onPress={() => {
                                    onClose(); // 모달 닫기
                                    // 이력서 작성 페이지로 이동하면서 회사 정보 전달
                                    router.push({
                                        pathname: '/(pages)/apply',
                                        params: {
                                            companyId: company.id,
                                            companyName: company.name
                                        }
                                    });
                                }}
                            >
                                <Text className="text-white text-lg font-bold">지원하기</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

// 정보 행 컴포넌트
const InfoRow: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => (
    <View className="flex-row items-center">
        <Ionicons name={icon as any} size={20} color="#6b7280" />
        <Text className="text-gray-600 ml-3 mr-2">{label}:</Text>
        <Text className="text-gray-800 flex-1">{value}</Text>
    </View>
);

export default CompanyDetailModal;