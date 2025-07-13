import { View, Text, FlatList, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { useTranslation } from "@/contexts/TranslationContext";
import {Tap} from "@/components/submitted-applications/Tap";
import {Empty} from "@/components/submitted-applications/Empty";
import {ApplicationItem} from "@/components/submitted-applications/ApplicationItem";
import LoadingScreen from "@/components/LoadingScreen";
import {useApplications} from "@/hooks/useApplications";



const Applications = () => {
    const { user } = useAuth()
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'reviewed'>('all')
    const { t } = useTranslation()


    //fetching applications
    const {
        applications,
        loading,
        refreshing,
        onRefresh
    } = useApplications({ user, activeFilter })

    if (loading) return <LoadingScreen />

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* 헤더 */}
            <View className="bg-white border-b border-gray-200">
                <View className="p-4">
                    <Text className="text-2xl font-bold">{t('applications.title', '지원 내역')}</Text>
                    <Text className="text-sm text-gray-600 mt-1">
                        {t('applications.total_applications', `총 ${applications.length}개의 지원`, { count: applications.length })}
                    </Text>
                </View>
                {/* 필터 탭 */}
                <Tap setActiveFilter={setActiveFilter} activeFilter={activeFilter} t={t} />
            </View>


            {/* 지원 내역 리스트 */}
            <FlatList
                data={applications}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => <ApplicationItem item={item} t={t} /> }
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
                    <Empty activeFilter={activeFilter} t={t} />
                }
            />
        </SafeAreaView>
    )
}

export default Applications