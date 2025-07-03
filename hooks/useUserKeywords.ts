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
    keyword: Keyword;  // 단일 객체로 수정
}

export const useUserKeywords = () => {
    const { user } = useAuth();
    const [user_keywords, setUser_keywords] = useState<UserKeyword[]>([]);
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchKeywords = async () => {
        // user 체크 제거 - 키워드는 모든 사용자가 볼 수 있어야 함
        try {
            const { data, error } = await supabase
                .from('keyword')
                .select('*')
                .order('keyword', { ascending: true });

            if (error) throw error;
            if(data) {
                setKeywords(data);
            }

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

            if (error) throw error;
            if (data) {
                // 타입 캐스팅을 통해 명확하게 처리
                const typedData = data as unknown as UserKeyword[];
                setUser_keywords(typedData);
            }
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

    // 컴포넌트 마운트 시 키워드 목록 가져오기
    useEffect(() => {
        fetchKeywords();
    }, []);

    // user가 있을 때 user의 키워드 가져오기
    useEffect(() => {
        if (user) {
            fetchUserKeywords();
        } else {
            setLoading(false);
        }
    }, [user]);

    return { keywords, user_keywords, loading, fetchKeywords, fetchUserKeywords, updateKeywords };
};