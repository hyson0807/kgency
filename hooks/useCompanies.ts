// hooks/useCompanies.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// 타입 정의
interface Company {
    id: string;
    name: string;
    description?: string;
    address?: string;
    phone_number?: string;
    user_type: 'company';
    created_at: string;
    company_info?: {
        id: string;
        website?: string;
        business_number?: string;
        business_type?: string;
        established_year?: number;
        employee_count?: string;
        working_hours?: string;
        break_time?: string;
        holiday_system?: string;
        salary_range?: string;
        insurance?: string[];
        benefits?: string[];
        hiring_process?: string;
        required_documents?: string[];
    };
}

interface   CompanyWithKeywords extends Company {
    company_keywords?: {
        keyword_id: number;
        keyword: {
            id: number;
            keyword: string;
            category: string;
        };
    }[];
}

interface UseCompaniesOptions {
    includeKeywords?: boolean;
    countryFilter?: number; // 국가 키워드 ID로 필터링
    jobFilter?: number[]; // 직종 키워드 ID 배열로 필터링
    conditionFilter?: number[]; // 근무조건 키워드 ID 배열로 필터링
}

export const useCompanies = (options?: UseCompaniesOptions) => {
    const [companies, setCompanies] = useState<CompanyWithKeywords[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 회사 목록 가져오기
    const fetchCompanies = async () => {
        try {
            setError(null);
            setLoading(true);

            // 키워드 포함 여부에 따라 다른 쿼리 실행
            if (options?.includeKeywords) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select(`
                        *,
                        company_info!company_info_company_id_fkey(
                            id,
                            website,
                            business_number,
                            business_type,
                            established_year,
                            employee_count,
                            working_hours,
                            break_time,
                            holiday_system,
                            salary_range,
                            insurance,
                            benefits,
                            hiring_process,
                            required_documents
                        ),
                        company_keywords:company_keyword(
                            keyword_id,
                            keyword:keyword_id(
                                id,
                                keyword,
                                category
                            )
                        )
                    `)
                    .eq('user_type', 'company')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    let filteredData = data as any as CompanyWithKeywords[];

                    // 필터링 적용
                    if (options?.countryFilter || options?.jobFilter?.length || options?.conditionFilter?.length) {
                        filteredData = filteredData.filter(company => {
                            if (!company.company_keywords) return false;

                            const companyKeywordIds = company.company_keywords.map(ck => ck.keyword_id);

                            // 국가 필터
                            if (options.countryFilter && !companyKeywordIds.includes(options.countryFilter)) {
                                return false;
                            }

                            // 직종 필터 (하나라도 매칭되면 통과)
                            if (options.jobFilter?.length) {
                                const hasMatchingJob = options.jobFilter.some(jobId =>
                                    companyKeywordIds.includes(jobId)
                                );
                                if (!hasMatchingJob) return false;
                            }

                            // 근무조건 필터 (하나라도 매칭되면 통과)
                            if (options.conditionFilter?.length) {
                                const hasMatchingCondition = options.conditionFilter.some(conditionId =>
                                    companyKeywordIds.includes(conditionId)
                                );
                                if (!hasMatchingCondition) return false;
                            }

                            return true;
                        });
                    }

                    setCompanies(filteredData);
                    console.log(`Fetched ${filteredData.length} companies with keywords`);
                }
            } else {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('user_type', 'company')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    setCompanies(data as Company[]);
                    console.log(`Fetched ${data.length} companies`);
                }
            }
        } catch (error) {
            console.error('회사 목록 조회 실패:', error);
            setError('회사 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 특정 회사 정보 가져오기
    const fetchCompanyById = async (companyId: string): Promise<CompanyWithKeywords | null> => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select(`
                    *,
                    company_info!company_info_company_id_fkey(
                        id,
                        website,
                        business_number,
                        business_type,
                        established_year,
                        employee_count,
                        working_hours,
                        break_time,
                        holiday_system,
                        salary_range,
                        insurance,
                        benefits,
                        hiring_process,
                        required_documents
                    ),
                    company_keywords:company_keyword(
                        keyword_id,
                        keyword:keyword_id(
                            id,
                            keyword,
                            category
                        )
                    )
                `)
                .eq('id', companyId)
                .eq('user_type', 'company')
                .single();

            if (error) throw error;
            return data as CompanyWithKeywords;
        } catch (error) {
            console.error('회사 정보 조회 실패:', error);
            return null;
        }
    };

    // 회사의 키워드 가져오기
    const getCompanyKeywords = (company: CompanyWithKeywords) => {
        if (!company.company_keywords) return { countries: [], jobs: [], conditions: [] };

        const keywords = company.company_keywords;

        return {
            countries: keywords.filter(k => k.keyword.category === '국가').map(k => k.keyword),
            jobs: keywords.filter(k => k.keyword.category === '직종').map(k => k.keyword),
            conditions: keywords.filter(k => k.keyword.category === '근무조건').map(k => k.keyword),
        };
    };

    // 새로고침
    const refreshCompanies = async () => {
        await fetchCompanies();
    };

    // 컴포넌트 마운트 시 자동으로 가져오기
    useEffect(() => {
        fetchCompanies();
    }, [options?.countryFilter, options?.jobFilter, options?.conditionFilter]);

    return {
        companies,
        loading,
        error,
        fetchCompanies,
        fetchCompanyById,
        getCompanyKeywords,
        refreshCompanies,
    };
};