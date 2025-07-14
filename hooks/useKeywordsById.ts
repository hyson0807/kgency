// hooks/useKeywordsById.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Keyword {
    id: number;  // string에서 number로 변경
    keyword: string;
}

export const useKeywordsById = (userId: string | null) => {
    const [keywords, setKeywords] = useState<Keyword[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        fetchKeywords();
    }, [userId]);

    const fetchKeywords = async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('user_keyword')
                .select(`
                    keyword_id,
                    keywords (
                        id,
                        keyword
                    )
                `)
                .eq('user_id', userId);

            if (error) throw error;

            // any 타입으로 처리 후 안전하게 변환
            const formattedKeywords = (data as any[])?.map(item => {
                // keywords가 배열인 경우 첫 번째 요소 사용
                const keywordData = Array.isArray(item.keywords)
                    ? item.keywords[0]
                    : item.keywords;

                if (keywordData && keywordData.id && keywordData.keyword) {
                    return {
                        id: keywordData.id,
                        keyword: keywordData.keyword
                    };
                }
                return null;
            }).filter((item): item is Keyword => item !== null) || [];

            setKeywords(formattedKeywords);
        } catch (error) {
            console.error('키워드 조회 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        keywords,
        loading,
        fetchKeywords
    };
};