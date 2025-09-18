// hooks/useUserKeywords.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from "@/lib/core/api"
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
            const response = await api('GET', '/api/user-keyword/keywords');
            if (!response.success) {
                throw new Error(response.error);
            }
            if (response.data) {
                setKeywords(response.data);
            }
        } catch (error) {
            // Error fetching keywords
        }
    }
    const fetchUserKeywords = async () => {
        if (!user) return;
        try {
            const response = await api('GET', '/api/user-keyword');
            if (!response.success) {
                throw new Error(response.error);
            }
            if (response.data) {
                // 타입 캐스팅을 통해 명확하게 처리
                const typedData = response.data as unknown as UserKeyword[];
                setUser_keywords(typedData);
            }
        } catch (error) {
            // 키워드 조회 실패
        } finally {
            setLoading(false);
        }
    };
    const updateKeywords = async (newKeywordIds: number[]) => {
        if (!user) return false;
        try {
            const response = await api('PUT', '/api/user-keyword', {
                keywordIds: newKeywordIds
            });
            if (!response.success) {
                throw new Error(response.error);
            }
            await fetchUserKeywords(); // 새로고침
            return true;
        } catch (error) {
            // 키워드 업데이트 실패
            return false;
        }
    };
    // 컴포넌트 마운트 시 키워드 목록 가져오기
    useEffect(() => {
        fetchKeywords();
    }, []);
    // user가 있을 때 user의 키워드 가져오기
    useEffect(() => {
        if (user?.userId) {
            fetchUserKeywords();
        } else {
            setLoading(false);
        }
    }, [user?.userId]);
    return { keywords, user_keywords, loading, fetchKeywords, fetchUserKeywords, updateKeywords };
};