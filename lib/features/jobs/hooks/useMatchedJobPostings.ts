// hooks/useMatchedJobPostings.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {api} from "@/lib/api"
import { SuitabilityResult } from '@/lib/features/jobs/matching';
interface JobPosting {
    id: string;
    title: string;
    description?: string;
    salary_range?: string;
    salary_range_negotiable?: boolean;
    working_hours?: string;
    working_hours_negotiable?: boolean;
    working_days?: string[];
    working_days_negotiable?: boolean;
    holiday_system?: string;
    hiring_count: number;
    per_day?: string;
    pay_day?: string; // pay_day 추가
    pay_day_negotiable?: boolean;
    is_active: boolean;
    created_at: string;
    job_address?: string; // job_address 추가
    company: {
        id: string;
        name: string;
        address?: string;
        description?: string;
        phone_number?: string;
    };
    job_posting_keywords?: {
        keyword: {
            id: number;
            keyword: string;
            category: string;
        };
    }[];
}
interface MatchedKeyword {
    id: number;
    keyword: string;
    category: string;
}
interface MatchedPosting {
    posting: JobPosting;
    matchedCount: number; // 기존 유지 (하위 호환성)
    matchedKeywords: {
        countries: MatchedKeyword[];
        jobs: MatchedKeyword[];
        conditions: MatchedKeyword[];
        location: MatchedKeyword[];
        moveable: MatchedKeyword[];
        gender: MatchedKeyword[];
        age: MatchedKeyword[];
        visa: MatchedKeyword[];
        koreanLevel: MatchedKeyword[];
        workDay: MatchedKeyword[];
    };
    suitability: SuitabilityResult; // 새로 추가
}
export const useMatchedJobPostings = () => {
    const { user } = useAuth();
    const [matchedPostings, setMatchedPostings] = useState<MatchedPosting[]>([]);
    const [appliedPostings, setAppliedPostings] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userKeywordIds, setUserKeywordIds] = useState<number[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchUserKeywords(),
            fetchAppliedPostings()
        ]);
        setRefreshing(false);
    };
    const fetchAppliedPostings = async () => {
        if (!user) return;
        try {
            const response = await api('GET', `/api/applications/user/${user.userId}`);
            if (response && response.data) {
                // API 응답에서 job_posting_id만 추출
                const postingIds = response.data
                    .map((app: any) => app.job_posting_id)
                    .filter(Boolean);
                setAppliedPostings(postingIds);
            }
        } catch (error) {
            // 지원 내역 조회 실패
        }
    };
    // 사용자 키워드 가져오기
    const fetchUserKeywords = async () => {
        if (!user) return;
        try {
            const response = await api('GET', '/api/user-keyword');
            if (response && response.data) {
                const keywordIds = response.data.map((uk: any) => uk.keyword_id);
                
                setUserKeywordIds(keywordIds);
            }
        } catch (error) {
            // 사용자 키워드 조회 실패
            setError('키워드를 불러오는데 실패했습니다.');
        }
    };
    // 매칭된 공고 가져오기 - 서버에서 적합도 계산 처리
    const fetchMatchedPostings = async () => {
        if (userKeywordIds.length === 0) {
            setLoading(false);
            return;
        }
        try {
            setError(null);
            // 서버에서 적합도 계산된 결과 요청
            const response = await api('GET', '/api/job-postings/matched');
            if (response && response.data) {
                // 서버에서 이미 적합도 계산과 정렬이 완료된 데이터
                setMatchedPostings(response.data);
            }
        } catch (error) {
            // 매칭된 공고 조회 실패
            setError('매칭된 공고를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };
    // 특정 공고 가져오기 - job_address 포함
    const fetchPostingById = async (postingId: string): Promise<JobPosting | null> => {
        try {
            const response = await api('GET', `/api/job-postings/${postingId}`);
            if (response && response.data) {
                return response.data as JobPosting;
            }
            return null;
        } catch (error) {
            // 공고 상세 조회 실패
            return null;
        }
    };
    // 공고의 키워드 가져오기
    const getPostingKeywords = (posting: JobPosting) => {
        if (!posting.job_posting_keywords) return { countries: [], jobs: [], conditions: [],location: [], moveable: [], gender: [], age: [], visa: [], koreanLevel: [], workDay: [] };
        const keywords = posting.job_posting_keywords;
        // "상관없음"을 "기타"로 표시하는 헬퍼 함수
        const transformKeywordForDisplay = (keyword: { id: number; keyword: string; category: string }) => {
            if (keyword.keyword === '상관없음') {
                return { ...keyword, keyword: '기타' };
            }
            return keyword;
        };
        return {
            countries: keywords.filter(k => k.keyword.category === '국가').map(k => transformKeywordForDisplay(k.keyword)),
            jobs: keywords.filter(k => k.keyword.category === '직종').map(k => k.keyword),
            conditions: keywords.filter(k => k.keyword.category === '근무조건').map(k => k.keyword),
            location: keywords.filter(k => k.keyword.category === '지역').map(k => k.keyword),
            moveable: keywords.filter(k => k.keyword.category === '지역이동').map(k => k.keyword),
            gender: keywords.filter(k => k.keyword.category === '성별').map(k => transformKeywordForDisplay(k.keyword)),
            age: keywords.filter(k => k.keyword.category === '나이대').map(k => transformKeywordForDisplay(k.keyword)),
            visa: keywords.filter(k => k.keyword.category === '비자').map(k => transformKeywordForDisplay(k.keyword)),
            koreanLevel: keywords.filter(k => k.keyword.category === '한국어수준').map(k => transformKeywordForDisplay(k.keyword)),
            workDay: keywords.filter(k => k.keyword.category === '근무요일').map(k => k.keyword),
        };
    };
    // 새로고침
    const refreshPostings = async () => {
        await fetchUserKeywords();
    };
    // 초기 로드
    useEffect(() => {
        if (user) {
            fetchUserKeywords();
            fetchAppliedPostings();
        } else {
            setLoading(false);
        }
    }, [user]);
    // 키워드가 로드되면 공고 가져오기
    useEffect(() => {
        if (userKeywordIds.length > 0) {
            fetchMatchedPostings();
        }
    }, [userKeywordIds]);
    return {
        matchedPostings,
        loading,
        error,
        totalPostings: matchedPostings.length,
        refreshPostings,
        fetchPostingById,
        getPostingKeywords,
        appliedPostings,
        refreshing,
        onRefresh,
    };
};