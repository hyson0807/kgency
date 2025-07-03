import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

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
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
    }, [user]);

    const fetchMessages = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
                    *,
                    sender:sender_id (
                        name,
                        phone_number
                    )
                `)
                .eq('receiver_id', user.userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setMessages(data || []);
        } catch (error) {
            console.error('메시지 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMessages();
        setRefreshing(false);
    };

    const handleMessagePress = (message: Message) => {
        // 메시지를 읽음 표시
        if (!message.is_read) {
            markAsRead(message.id);
        }

        // 메시지 상세 페이지로 이동
        // router.push({
        //     pathname: '/(company)/message-detail',
        //     params: {
        //         messageId: message.id,
        //         senderName: message.sender.name,
        //         senderPhone: message.sender.phone_number,
        //         subject: message.subject,
        //         content: message.content,
        //         createdAt: message.created_at
        //     }
        // });
    };

    const markAsRead = async (messageId: string) => {
        try {
            await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', messageId);

            // 로컬 상태 업데이트
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? { ...msg, is_read: true } : msg
                )
            );
        } catch (error) {
            console.error('읽음 표시 실패:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return `오늘 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else if (diffDays === 1) {
            return '어제';
        } else if (diffDays < 7) {
            return `${diffDays}일 전`;
        } else {
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
    };

    const renderMessage = ({ item }: { item: Message }) => (
        <TouchableOpacity
            onPress={() => handleMessagePress(item)}
            className={`px-4 py-4 border-b border-gray-200 ${
                !item.is_read ? 'bg-blue-50' : 'bg-white'
            }`}
        >
            <View className="flex-row justify-between items-start mb-1">
                <View className="flex-row items-center flex-1">
                    {!item.is_read && (
                        <View className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                    )}
                    <Text className={`font-bold ${!item.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {item.sender.name || '지원자'}
                    </Text>
                </View>
                <Text className="text-sm text-gray-500">{formatDate(item.created_at)}</Text>
            </View>

            <Text className={`text-base mb-1 ${!item.is_read ? 'font-semibold' : ''}`}>
                {item.subject}
            </Text>

            <Text className="text-sm text-gray-600" numberOfLines={2}>
                {item.content}
            </Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </SafeAreaView>
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
                renderItem={renderMessage}
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