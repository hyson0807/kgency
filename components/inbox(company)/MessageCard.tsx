import {Text, TouchableOpacity, View} from "react-native";
import React, {useEffect} from "react";
import {router} from "expo-router";
import {useProfileById} from "@/hooks/useProfileById";


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

interface MessageCardProps {
    item: Message;
    markAsRead: (messageId: string) => void;
}

export const MessageCard = ({
    item,
    markAsRead,
                            }: MessageCardProps) => {

    const { fetchProfileById, profile } = useProfileById();
    const senderId = item.sender_id

    useEffect(() => {
       fetchProfileById(senderId)
    }, [])
    console.log(profile?.user_info?.age)



    const handleMessagePress = (message: Message) => {
        // 메시지를 읽음 표시
        if (!message.is_read) {
            markAsRead(message.id);
        }

        // view-resume 페이지로 이동
        router.push({
            pathname: '/(pages)/(company)/view-resume',
            params: {
                messageId: message.id,
                userName: message.sender.name,
                userPhone: message.sender.phone_number,
                resume: message.content,
                subject: message.subject,
                createdAt: message.created_at
            }
        });
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

    return (
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
    )
}