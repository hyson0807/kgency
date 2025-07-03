import {View, Text, FlatList, ActivityIndicator, RefreshControl} from 'react-native'
import React from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/contexts/AuthContext";
import {router} from "expo-router";
import Header_home from "@/components/Header_home";
import CompanyCard from "@/components/CompanyCard";
import CompanyDetailModal from "@/components/CompanyDetailModal";
import { useMatchedCompanies } from "@/hooks/useMatchedCompanies";
import {supabase} from "@/lib/supabase";

const Home = () => {
    const { logout, user } = useAuth();
    const { matchedCompanies, loading, error, totalCompanies, refreshCompanies } = useMatchedCompanies();
    const [refreshing, setRefreshing] = React.useState(false);
    const [selectedCompanyId, setSelectedCompanyId] = React.useState<string | null>(null);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [appliedCompanies, setAppliedCompanies] = React.useState<string[]>([]);

    // 지원한 회사 목록 가져오기
    React.useEffect(() => {
        const fetchAppliedCompanies = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('applications')
                    .select('company_id')
                    .eq('user_id', user.userId);

                if (error) throw error;

                if (data) {
                    const companyIds = data.map(app => app.company_id);
                    setAppliedCompanies(companyIds);
                }
            } catch (error) {
                console.error('지원 내역 조회 실패:', error);
            }
        };

        fetchAppliedCompanies();
    }, [user]);

    const handleCompanyPress = (companyId: string) => {
        setSelectedCompanyId(companyId);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setSelectedCompanyId(null);
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);

        // 회사 목록과 지원 내역 모두 새로고침
        await refreshCompanies();

        // 지원 내역도 다시 가져오기
        if (user) {
            try {
                const { data } = await supabase
                    .from('applications')
                    .select('company_id')
                    .eq('user_id', user.userId);

                if (data) {
                    setAppliedCompanies(data.map(app => app.company_id));
                }
            } catch (error) {
                console.error('지원 내역 새로고침 실패:', error);
            }
        }

        setRefreshing(false);
    }, [refreshCompanies, user]);

    const renderHeader = () => (
        <View className="bg-white p-4 mb-2">
            <Text className="text-lg font-bold text-gray-800">
                전체 일자리
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
                총 {totalCompanies}개의 회사
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header_home />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                    <Text className="text-gray-600 mt-2">로딩 중...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header_home />
                <View className="flex-1 items-center justify-center p-4">
                    <Text className="text-red-600 text-center">{error}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header_home />

            <FlatList
                data={matchedCompanies}
                keyExtractor={(item) => item.company.id}
                renderItem={({ item }) => (
                    <CompanyCard
                        company={item.company}
                        matchedCount={item.matchedCount}
                        matchedKeywords={item.matchedKeywords}
                        onPress={() => handleCompanyPress(item.company.id)}
                        hasApplied={appliedCompanies.includes(item.company.id)}
                    />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{
                    paddingBottom: 20
                }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3b82f6']} // Android
                        tintColor="#3b82f6"  // iOS
                    />
                }
            />

            {/* 디버그용 버튼들 - 나중에 제거 */}
            <View className="absolute bottom-4 right-4 gap-2">
                <Text
                    className="bg-gray-800 text-white px-4 py-2 rounded-full"
                    onPress={() => router.replace('/(user)/info')}
                >
                    조건 수정
                </Text>
                <Text
                    className="bg-red-500 text-white px-4 py-2 rounded-full"
                    onPress={logout}
                >
                    로그아웃
                </Text>
            </View>

            {/* 회사 상세 정보 모달 */}
            <CompanyDetailModal
                visible={modalVisible}
                companyId={selectedCompanyId}
                onClose={handleCloseModal}
            />
        </SafeAreaView>
    )
}

export default Home