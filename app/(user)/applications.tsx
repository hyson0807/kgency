import {View, Text, FlatList, RefreshControl} from 'react-native'
import React, {useCallback} from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/contexts/TranslationContext";
import {Empty} from "@/components/user/applications/submitted-applications/Empty";
import {ApplicationItem} from "@/components/user/applications/submitted-applications/ApplicationItem";
import LoadingScreen from "@/components/shared/common/LoadingScreen";
import {useApplications} from "@/lib/features/applications/hooks/useApplications";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const Applications = () => {
    const { user } = useAuth()
    const { t } = useTranslation()
    const insets = useSafeAreaInsets()
    //fetching applications
    const {
        applications,
        loading,
        refreshing,
        onRefresh,
        fetchApplications
    } = useApplications({ user })
    // 페이지 포커스 시 데이터 새로고침 (면접 선택 후 돌아올 때 상태 업데이트)
    useFocusEffect(
        useCallback(() => {
            if (user) {
                fetchApplications()
            }
        }, [user, fetchApplications])
    )
    if (loading) return <LoadingScreen />
    return (
        <View className="flex-1 bg-gray-50" style={{paddingTop: insets.top}}>
            {/* 헤더 */}
            <View className="bg-white border-b border-gray-200">
                <View className="p-4">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-bold">{t('applications.title', '지원 내역')}</Text>
                            <Text className="text-sm text-gray-600 mt-1">
                                {t('applications.total_applications', `총 ${applications.length}개의 지원`, { count: applications.length })}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
            {/* 지원 내역 리스트 */}
            <FlatList
                data={applications}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => <ApplicationItem item={item} t={t} />}
                contentContainerStyle={applications.length === 0 ? { flex: 1 } : { paddingVertical: 8 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3b82f6']}
                        tintColor="#3b82f6"
                    />
                }
                ListEmptyComponent={
                    <Empty t={t} />
                }
            />
        </View>
    )
}
export default Applications