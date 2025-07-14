import {supabase} from "@/lib/supabase";
import {useAuth} from "@/contexts/AuthContext";
import {useEffect, useState} from "react";

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
    }
}

export const useMessages = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);



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
                .is('is_deleted', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setMessages(data || []);
        } catch (error) {
            console.error('메시지 조회 실패:', error);
        } finally {
            setLoading(false);
        }
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

    useEffect(() => {
        if (user) {
            fetchMessages();
        }
    }, [user]);

    return {
        messages,
        loading,
        fetchMessages,
        markAsRead

    }
}