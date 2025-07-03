// hooks/useMatchedCompanies.ts
import { useState, useEffect } from 'react';
import { useCompanies } from './useCompanies';
import { useUserKeywords } from './useUserKeywords';

interface MatchedCompany {
    company: any; // CompanyWithKeywords 타입
    matchedCount: number; // 매칭된 키워드 개수
    matchedKeywords: {
        countries: string[];
        jobs: string[];
        conditions: string[];
    };
}

export const useMatchedCompanies = () => {
    const { companies, loading: companiesLoading, error: companiesError, getCompanyKeywords, refreshCompanies: refreshCompaniesFn } = useCompanies({
        includeKeywords: true
    });
    const { user_keywords, loading: keywordsLoading, fetchUserKeywords } = useUserKeywords();
    const [matchedCompanies, setMatchedCompanies] = useState<MatchedCompany[]>([]);
    const [loading, setLoading] = useState(true);

    // 매칭된 키워드 찾기
    const findMatchedKeywords = (company: any) => {
        if (!company.company_keywords || user_keywords.length === 0) {
            return { count: 0, matched: { countries: [], jobs: [], conditions: [] } };
        }

        // 사용자가 선택한 키워드 ID 목록
        const userKeywordIds = user_keywords.map(uk => uk.keyword.id);

        // 회사의 키워드 가져오기
        const companyKeywords = getCompanyKeywords(company);

        // 매칭된 키워드 찾기
        const matchedCountries = companyKeywords.countries
            .filter(ck => userKeywordIds.includes(ck.id))
            .map(k => k.keyword);

        const matchedJobs = companyKeywords.jobs
            .filter(ck => userKeywordIds.includes(ck.id))
            .map(k => k.keyword);

        const matchedConditions = companyKeywords.conditions
            .filter(ck => userKeywordIds.includes(ck.id))
            .map(k => k.keyword);

        // 총 매칭된 키워드 개수
        const totalMatched = matchedCountries.length + matchedJobs.length + matchedConditions.length;

        return {
            count: totalMatched,
            matched: {
                countries: matchedCountries,
                jobs: matchedJobs,
                conditions: matchedConditions
            }
        };
    };

    // 회사들을 매칭 개수 기준으로 정렬
    useEffect(() => {
        if (!companiesLoading && !keywordsLoading && companies.length > 0) {
            const matched = companies
                .map(company => {
                    const { count, matched } = findMatchedKeywords(company);
                    return {
                        company,
                        matchedCount: count,
                        matchedKeywords: matched
                    };
                })
                .sort((a, b) => b.matchedCount - a.matchedCount); // 매칭 개수 많은 순으로 정렬

            setMatchedCompanies(matched);
            setLoading(false);
        }
    }, [companies, user_keywords, companiesLoading, keywordsLoading]);

    return {
        matchedCompanies,
        loading: loading || companiesLoading || keywordsLoading,
        error: companiesError,
        totalCompanies: companies.length,
        refreshCompanies: async () => {
            // 회사 목록과 사용자 키워드 모두 새로고침
            await Promise.all([
                refreshCompaniesFn(),
                fetchUserKeywords()
            ]);
        }
    };
};