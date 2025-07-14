import { View, Text, FlatList, RefreshControl } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import LoadingScreen from "@/components/common/LoadingScreen";
import { useProfile } from "@/hooks/useProfile";
import { useUserKeywords } from "@/hooks/useUserKeywords";
import { useMessages } from "@/hooks/useMessages";
import {MessageCard} from "@/components/inbox(company)/MessageCard";

interface Message {
    id: string;
    sender_id: string;
    subject: string;
    content: string;
    is_read: boolean;
    created_at: string;
    sender: {
        name: string;
        phone_number: string;
    };
}

const Inbox = () => {
    const { user } = useAuth();
    const { profile } = useProfile();
    const { user_keywords } = useUserKeywords();
    const { messages, loading, fetchMessages, markAsRead } = useMessages();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMessages();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <LoadingScreen />
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* 헤더 */}
            <View className="border-b border-gray-200 px-4 py-3">
                <Text className="text-2xl font-bold">받은 메시지</Text>
                <Text className="text-sm text-gray-600 mt-1">
                    총 {messages.length}개의 메시지
                </Text>
            </View>

            {/* 메시지 목록 */}
            <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({item}) => <MessageCard item={item} markAsRead={markAsRead} /> }
                contentContainerStyle={messages.length === 0 ? { flex: 1 } : {}}
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center p-8">
                        <Ionicons name="mail-outline" size={80} color="#9ca3af" />
                        <Text className="text-gray-500 text-lg mt-4">
                            아직 받은 메시지가 없습니다
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#3b82f6']}
                        tintColor="#3b82f6"
                    />
                }
            />
        </SafeAreaView>
    );
};

export default Inbox;