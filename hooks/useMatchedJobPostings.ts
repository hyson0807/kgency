// hooks/useMatchedJobPostings.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface JobPosting {
    id: string;
    title: string;
    description?: string;
    salary_range?: string;
    salary_type?: string;
    working_hours?: string;
    working_hours_negotiable?: boolean;
    working_days?: string[];
    working_days_negotiable?: boolean;
    holiday_system?: string;
    hiring_count: number;
    per_day?: string;
    pay_day_negotiable?: boolean;
    is_active: boolean;
    created_at: string;
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

interface MatchedPosting {
    posting: JobPosting;
    matchedCount: number;
    matchedKeywords: {
        countries: string[];
        jobs: string[];
        conditions: string[];
        location: string[];
        moveable: string[];
    };
}

export const useMatchedJobPostings = () => {
    const { user } = useAuth();
    const [matchedPostings, setMatchedPostings] = useState<MatchedPosting[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userKeywordIds, setUserKeywordIds] = useState<number[]>([]);

    // 사용자 키워드 가져오기
    const fetchUserKeywords = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('user_keyword')
                .select('keyword_id')
                .eq('user_id', user.userId);

            if (error) throw error;

            if (data) {
                setUserKeywordIds(data.map(uk => uk.keyword_id));
            }
        } catch (error) {
            console.error('사용자 키워드 조회 실패:', error);
            setError('키워드를 불러오는데 실패했습니다.');
        }
    };

    // 매칭된 공고 가져오기
    const fetchMatchedPostings = async () => {
        if (userKeywordIds.length === 0) {
            setLoading(false);
            return;
        }

        try {
            setError(null);

            // 활성화된 모든 공고 가져오기
            const { data: postings, error } = await supabase
                .from('job_postings')
                .select(`
                    *,
                    company:company_id (
                        id,
                        name,
                        address,
                        description,
                        phone_number
                    ),
                    job_posting_keywords:job_posting_keyword (
                        keyword:keyword_id (
                            id,
                            keyword,
                            category
                        )
                    )
                `)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (postings) {
                // 매칭 점수 계산
                const matched = postings.map(posting => {
                    const postingKeywordIds = posting.job_posting_keywords?.map(
                        (jpk: any) => jpk.keyword.id
                    ) || [];

                    // 매칭된 키워드 찾기
                    const matchedKeywordIds = userKeywordIds.filter(ukId =>
                        postingKeywordIds.includes(ukId)
                    );

                    // 카테고리별로 분류
                    const matchedKeywords = {
                        countries: [] as string[],
                        jobs: [] as string[],
                        conditions: [] as string[],
                        location: [] as string[],
                        moveable: [] as string[],
                    };

                    posting.job_posting_keywords?.forEach((jpk: any) => {
                        if (matchedKeywordIds.includes(jpk.keyword.id)) {
                            switch (jpk.keyword.category) {
                                case '국가':
                                    matchedKeywords.countries.push(jpk.keyword.keyword);
                                    break;
                                case '직종':
                                    matchedKeywords.jobs.push(jpk.keyword.keyword);
                                    break;
                                case '근무조건':
                                    matchedKeywords.conditions.push(jpk.keyword.keyword);
                                    break;
                            }
                        }
                    });

                    return {
                        posting: posting as JobPosting,
                        matchedCount: matchedKeywordIds.length,
                        matchedKeywords
                    };
                });

                // 매칭 점수 높은 순으로 정렬
                matched.sort((a, b) => b.matchedCount - a.matchedCount);
                setMatchedPostings(matched);
            }
        } catch (error) {
            console.error('공고 조회 실패:', error);
            setError('공고를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 특정 공고 가져오기
    const fetchPostingById = async (postingId: string): Promise<JobPosting | null> => {
        try {
            const { data, error } = await supabase
                .from('job_postings')
                .select(`
                    *,
                    company:company_id (
                        id,
                        name,
                        address,
                        description,
                        phone_number
                    ),
                    job_posting_keywords:job_posting_keyword (
                        keyword:keyword_id (
                            id,
                            keyword,
                            category
                        )
                    )
                `)
                .eq('id', postingId)
                .single();

            if (error) throw error;
            return data as JobPosting;
        } catch (error) {
            console.error('공고 상세 조회 실패:', error);
            return null;
        }
    };

    // 공고의 키워드 가져오기
    const getPostingKeywords = (posting: JobPosting) => {
        if (!posting.job_posting_keywords) return { countries: [], jobs: [], conditions: [],location: [], moveable: [] };

        const keywords = posting.job_posting_keywords;

        return {
            countries: keywords.filter(k => k.keyword.category === '국가').map(k => k.keyword),
            jobs: keywords.filter(k => k.keyword.category === '직종').map(k => k.keyword),
            conditions: keywords.filter(k => k.keyword.category === '근무조건').map(k => k.keyword),
            location: keywords.filter(k => k.keyword.category === '지역').map(k => k.keyword),
            moveable: keywords.filter(k => k.keyword.category === '지역이동').map(k => k.keyword),

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
        getPostingKeywords
    };
};