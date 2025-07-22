// hooks/useMatchedJobPostings.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {useTranslation} from "@/contexts/TranslationContext";
import {api} from "@/lib/api";
import { SuitabilityCalculator, SuitabilityResult } from '@/lib/suitability';

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

interface MatchedPosting {
    posting: JobPosting;
    matchedCount: number; // 기존 유지 (하위 호환성)
    matchedKeywords: {
        countries: string[];
        jobs: string[];
        conditions: string[];
        location: string[];
        moveable: string[];
        gender: string[];
        age: string[];
        visa: string[];
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
    const { translateDB } = useTranslation();
    const [refreshing, setRefreshing] = useState(false);

    // 적합도 계산기 인스턴스
    const suitabilityCalculator = new SuitabilityCalculator();


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
            console.error('지원 내역 조회 실패:', error);
        }
    };

    // 사용자 키워드 가져오기
    const fetchUserKeywords = async () => {
        if (!user) return;

        try {
            const response = await api('GET', '/api/user-keyword');

            if (response && response.data) {
                setUserKeywordIds(response.data.map((uk: any) => uk.keyword_id));
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

            const response = await api('GET', '/api/job-postings');

            if (response && response.data) {
                const postings = response.data;

                // 적합도 계산 및 매칭 처리
                const matched: MatchedPosting[] = postings.map((posting: JobPosting): MatchedPosting => {
                    // 적합도 계산
                    const suitability = suitabilityCalculator.calculate(
                        userKeywordIds,
                        posting.job_posting_keywords || []
                    );

                    // 번역된 키워드로 변환 (UI 표시용)
                    const translatedMatchedKeywords = {
                        countries: [] as string[],
                        jobs: [] as string[],
                        conditions: [] as string[],
                        location: [] as string[],
                        moveable: [] as string[],
                        gender: [] as string[],
                        age: [] as string[],
                        visa: [] as string[],
                    };

                    // 매칭된 키워드만 번역
                    posting.job_posting_keywords?.forEach((jpk: any) => {
                        if (userKeywordIds.includes(jpk.keyword.id)) {
                            const translatedKeyword = translateDB(
                                'keyword',
                                'keyword',
                                jpk.keyword.id?.toString() || '',
                                jpk.keyword.keyword || ''
                            );

                            switch (jpk.keyword.category) {
                                case '국가':
                                    translatedMatchedKeywords.countries.push(translatedKeyword);
                                    break;
                                case '직종':
                                    translatedMatchedKeywords.jobs.push(translatedKeyword);
                                    break;
                                case '근무조건':
                                    translatedMatchedKeywords.conditions.push(translatedKeyword);
                                    break;
                                case '지역':
                                    translatedMatchedKeywords.location.push(translatedKeyword);
                                    break;
                                case '지역이동':
                                    translatedMatchedKeywords.moveable.push(translatedKeyword);
                                    break;
                                case '성별':
                                    translatedMatchedKeywords.gender.push(translatedKeyword);
                                    break;
                                case '나이대':
                                    translatedMatchedKeywords.age.push(translatedKeyword);
                                    break;
                                case '비자':
                                    translatedMatchedKeywords.visa.push(translatedKeyword);
                                    break;
                            }
                        }
                    });

                    return {
                        posting: posting as JobPosting,
                        matchedCount: suitability.details.matchedKeywords.countries.length +
                            suitability.details.matchedKeywords.jobs.length +
                            suitability.details.matchedKeywords.conditions.length +
                            suitability.details.matchedKeywords.location.length +
                            suitability.details.matchedKeywords.moveable.length +
                            suitability.details.matchedKeywords.gender.length +
                            suitability.details.matchedKeywords.age.length +
                            suitability.details.matchedKeywords.visa.length,
                        matchedKeywords: translatedMatchedKeywords,
                        suitability
                    };
                });

                // 적합도 점수 높은 순으로 정렬
                matched.sort((a, b) => b.suitability.score - a.suitability.score);

                setMatchedPostings(matched);
            }
        } catch (error) {
            console.error('공고 조회 실패:', error);
            setError('공고를 불러오는데 실패했습니다.');
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
            console.error('공고 상세 조회 실패:', error);
            return null;
        }
    };

    // 공고의 키워드 가져오기
    const getPostingKeywords = (posting: JobPosting) => {
        if (!posting.job_posting_keywords) return { countries: [], jobs: [], conditions: [],location: [], moveable: [], gender: [], age: [], visa: [] };

        const keywords = posting.job_posting_keywords;

        return {
            countries: keywords.filter(k => k.keyword.category === '국가').map(k => k.keyword),
            jobs: keywords.filter(k => k.keyword.category === '직종').map(k => k.keyword),
            conditions: keywords.filter(k => k.keyword.category === '근무조건').map(k => k.keyword),
            location: keywords.filter(k => k.keyword.category === '지역').map(k => k.keyword),
            moveable: keywords.filter(k => k.keyword.category === '지역이동').map(k => k.keyword),
            gender: keywords.filter(k => k.keyword.category === '성별').map(k => k.keyword),
            age: keywords.filter(k => k.keyword.category === '나이대').map(k => k.keyword),
            visa: keywords.filter(k => k.keyword.category === '비자').map(k => k.keyword),

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