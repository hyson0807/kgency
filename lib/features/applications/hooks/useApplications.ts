import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/core/api"
interface userType {
    userId: string;
    phone: string;
    userType: 'user' | 'company';
}
interface useApplicationsProps {
    user: userType | null;
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
    type: 'user_initiated' | 'company_invited' | 'user_instant_interview'
    job_posting: {
        id: string
        title: string
        is_active: boolean
        deleted_at: string
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
export const useApplications = ({ user }: useApplicationsProps): UseApplicationsReturn => {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    // 각 지원에 대한 면접 상태를 확인하는 함수 - 최적화된 버전
    const checkInterviewStatuses = async (applications: Application[]): Promise<Application[]> => {
        if (applications.length === 0) {
            return applications;
        }
        try {
            // 단일 API 호출로 모든 면접 정보 조회
            const applicationIds = applications.map(app => app.id);
            const response = await api('POST', '/api/interview-proposals/bulk-check', {
                applicationIds
            });
            if (response?.success && response.data) {
                // 결과 매핑 - 서버에서 { [applicationId]: proposal } 형태로 반환
                return applications.map(app => ({
                    ...app,
                    interviewProposal: response.data[app.id] || null
                }));
            }
            
            // 서버 에러인 경우 면접 정보 없이 반환
            // Bulk interview status check failed
            return applications.map(app => ({
                ...app,
                interviewProposal: null
            }));
        } catch (error) {
            // Interview status check error
            // 에러 발생 시에도 앱이 작동하도록 면접 정보 없이 반환
            return applications.map(app => ({
                ...app,
                interviewProposal: null
            }));
        }
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
                // 데이터 조회 실패
                setApplications([])
                return
            }
            const allData = response.data || []
            // 면접 상태 확인
            const applicationsWithInterview = await checkInterviewStatuses(allData)
            setApplications(applicationsWithInterview)
        } catch (error) {
            // 지원 내역 조회 실패
            setApplications([])
        } finally {
            setLoading(false)
        }
    }, [user?.userId])
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