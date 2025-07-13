import {supabase} from "@/lib/supabase";
import {useCallback, useEffect, useState} from "react";

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

export const useApplications =  ({ user, activeFilter }: useApplicationsProps ): UseApplicationsReturn => {
    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchApplications = useCallback( async () => {
        if (!user) {
            setLoading(false)
            return
        }

        try {

            let query = supabase
                .from('applications')
                .select(`
                    *,
                    job_posting:job_posting_id (
                        id,
                        title,
                        is_active,
                        salary_range,
                        working_hours,
                        company:company_id (
                            id,
                            name,
                            address
                        )
                    ),
                    message:message_id (
                        content
                    )
                `)
                .eq('user_id', user.userId)
                // .is('deleted_at', null)
                .order('applied_at', { ascending: false })

            // 필터 적용
            if (activeFilter === 'pending') {
                query = query.eq('status', 'pending')
            } else if (activeFilter === 'reviewed') {
                query = query.in('status', ['reviewed', 'accepted', 'rejected'])
            }

            const { data, error } = await query

            if (error) throw error

            setApplications(data || [])
        } catch (error) {
            console.error('지원 내역 조회 실패:', error)
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