import {View, Text, FlatList, ActivityIndicator, RefreshControl} from 'react-native'
import React from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/contexts/AuthContext";
import {router} from "expo-router";
import Header_home from "@/components/Header_home";
import CompanyCard from "@/components/CompanyCard";
import { useMatchedCompanies } from "@/hooks/useMatchedCompanies";

const Home = () => {
    const { logout } = useAuth();
    const { matchedCompanies, loading, error, totalCompanies, refreshCompanies } = useMatchedCompanies();
    const [refreshing, setRefreshing] = React.useState(false);

    const handleCompanyPress = (companyId: string) => {
        // TODO: 회사 상세 페이지로 이동
        console.log('Company pressed:', companyId);
        // router.push(`/(user)/company/${companyId}`);
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await refreshCompanies();
        setRefreshing(false);
    }, [refreshCompanies]);

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

        </SafeAreaView>
    )
}

export default Home