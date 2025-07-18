import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface userType {
    userId: string;
    phone: string;
    userType: 'user' | 'company';
}

interface useApplicationsProps {
    user: userType | null;
    activeFilter: 'all' | 'pending' | 'reviewed';
}

interface Application {
    id: string
    applied_at: string
    status: string
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

    const fetchApplications = useCallback(async () => {
        if (!user) {
            setLoading(false)
            return
        }

        try {
            // API 엔드포인트 호출
            const response = await api('GET', `/api/applications/user/${user.userId}`)

            console.log('API 응답:', response)

            // response 자체가 이미 { success: true, data: [...] } 형태
            if (!response.success) {
                throw new Error('데이터 조회 실패')
            }

            let filteredData = response.data || []

            // 클라이언트 사이드 필터링
            if (activeFilter === 'pending') {
                filteredData = filteredData.filter((app: Application) => app.status === 'pending')
            } else if (activeFilter === 'reviewed') {
                filteredData = filteredData.filter((app: Application) =>
                    ['reviewed', 'accepted', 'rejected'].includes(app.status)
                )
            }

            setApplications(filteredData)
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