// hooks/useUserKeywords.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// 타입 정의
interface Keyword {
    id: number;
    keyword: string;
    category: string;
}

interface UserKeyword {
    keyword_id: number;
    keyword: Keyword[];
}


export const useUserKeywords = () => {
    const { user } = useAuth();
    const [user_keywords, setUser_keywords] = useState<UserKeyword[]>([]);
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchKeywords = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('keyword')
                .select('*')
                .order('keyword', { ascending: true });

            if (error) throw error;
            if(data) setKeywords(data);

        } catch (error) {
            console.error('Error fetching keywords:', error);
        }
    }

    const fetchUserKeywords = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('user_keyword')
                .select(`
                      keyword_id,
                      keyword:keyword_id (
                        id,
                        keyword,
                        category
                      )
                `)
                .eq('user_id', user.userId);

            if (data) setUser_keywords(data);
        } catch (error) {
            console.error('키워드 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateKeywords = async (newKeywordIds: number[]) => {
        if (!user) return false;

        try {
            // 기존 삭제
            await supabase
                .from('user_keyword')
                .delete()
                .eq('user_id', user.userId);

            // 새로 추가
            if (newKeywordIds.length > 0) {
                const inserts = newKeywordIds.map(kid => ({
                    user_id: user.userId,
                    keyword_id: kid
                }));

                await supabase
                    .from('user_keyword')
                    .insert(inserts);
            }

            await fetchUserKeywords(); // 새로고침
            return true;
        } catch (error) {
            console.error('키워드 업데이트 실패:', error);
            return false;
        }
    };

    useEffect(() => {
        fetchUserKeywords();
    }, [user]);

    return { keywords, user_keywords, loading, fetchKeywords,fetchUserKeywords, updateKeywords };
};