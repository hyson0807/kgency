import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface userType {
    userId: string;
    phone: string;
    userType: 'user' | 'company';
}

interface useApplicationsProps {
    user: userType | null;
    activeFilter: 'all' | 'user_initiated' | 'company_invited';
}

interface InterviewProposal {
    id: string
    application_id: string
    company_id: string
    location: string
    status: string
    created_at: string
    profiles?: {
        id: string
        name: string
    }
}

interface Application {
    id: string
    applied_at: string
    status: string
    type: 'user_initiated' | 'company_invited'
    job_posting: {
        id: string
        title: string
        is_active: boolean
        salary_range?: string
        working_hours?: string
        company: {
            id: string
            name: string
            address?: string
        }
    }
    message?: {
        content: string
    }
    // 면접 제안 정보 추가
    interviewProposal?: InterviewProposal | null
}

interface UseApplicationsReturn {
    applications: Application[];
    loading: boolean;
    fetchApplications: () => Promise<void>;
    refreshing: boolean;
    onRefresh: () => Promise<void>;
}

export const useApplications = ({ user, activeFilter }: useApplicationsProps): UseApplicationsReturn => {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // 각 지원에 대한 면접 상태를 확인하는 함수
    const checkInterviewStatuses = async (applications: Application[]): Promise<Application[]> => {
        // 모든 지원에 대해 병렬로 면접 상태 확인
        const applicationsWithInterview = await Promise.all(
            applications.map(async (app) => {
                try {
                    const response = await api('GET', `/api/interview-proposals/user/${app.id}`)

                    // pending 또는 scheduled 상태의 면접 제안이 있는 경우
                    if (response?.success && response.data?.proposal &&
                        (response.data.proposal.status === 'pending' || response.data.proposal.status === 'scheduled')) {
                        return {
                            ...app,
                            interviewProposal: response.data.proposal
                        }
                    }
                } catch (error) {
                    // 404 에러는 정상적인 케이스 (제안이 없는 경우)
                    console.log('No interview proposal found for application:', app.id)
                }

                // 면접 제안이 없는 경우
                return {
                    ...app,
                    interviewProposal: null
                }
            })
        )

        return applicationsWithInterview
    }

    const fetchApplications = useCallback(async () => {
        if (!user) {
            setLoading(false)
            return
        }

        try {
            // API 엔드포인트 호출
            const response = await api('GET', `/api/applications/user/${user.userId}`)


            // response 자체가 이미 { success: true, data: [...] } 형태
            if (!response.success) {
                throw new Error('데이터 조회 실패')
            }

            let filteredData = response.data || []

            // 클라이언트 사이드 필터링 - type 기반
            if (activeFilter === 'user_initiated') {
                filteredData = filteredData.filter((app: Application) => app.type === 'user_initiated')
            } else if (activeFilter === 'company_invited') {
                filteredData = filteredData.filter((app: Application) => app.type === 'company_invited')
            }

            // 면접 상태 확인
            const applicationsWithInterview = await checkInterviewStatuses(filteredData)

            setApplications(applicationsWithInterview)
        } catch (error) {
            console.error('지원 내역 조회 실패:', error)
            setApplications([])
        } finally {
            setLoading(false)
        }
    }, [user, activeFilter])

    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await fetchApplications()
        setRefreshing(false)
    }, [fetchApplications])

    useEffect(() => {
        fetchApplications()
    }, [fetchApplications]);

    return {
        applications,
        loading,
        refreshing,
        fetchApplications,
        onRefresh,
    }
}