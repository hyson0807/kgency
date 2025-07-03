// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 타입 정의
interface Profile {
    id: string;
    user_type: 'user' | 'company';
    name: string;
    phone_number: string;
    email?: string;
    address?: string;
    description?: string;
    onboarding_completed: boolean;
    created_at?: string;
}

interface UserInfo {
    id: string;
    user_id: string;
    age?: number;
    gender?: string;
    nationality?: string;
    visa?: string;
    visa_expiry_date?: string;
    korean_level?: string;
    how_long?: string;
    experience?: string;
    education?: string;
    has_car?: boolean;
    has_license?: boolean;
}

interface CompanyInfo {
    id: string;
    company_id: string;
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
}

type FullProfile = Profile & {
    user_info?: UserInfo;
    company_info?: CompanyInfo;
};

export const useProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<FullProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 프로필 가져오기
    const fetchProfile = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            setError(null);

            // 기본 프로필 정보 가져오기
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.userId)
                .single();

            if (profileError) throw profileError;

            let fullProfile: FullProfile = profileData;

            // user 타입인 경우 user_info 가져오기
            if (profileData.user_type === 'user') {
                const { data: userInfo, error: userInfoError } = await supabase
                    .from('user_info')
                    .select('*')
                    .eq('user_id', user.userId)
                    .single();

                if (!userInfoError && userInfo) {
                    fullProfile.user_info = userInfo;
                }
            }
            // company 타입인 경우 company_info 가져오기
            else if (profileData.user_type === 'company') {
                const { data: companyInfo, error: companyInfoError } = await supabase
                    .from('company_info')
                    .select('*')
                    .eq('company_id', user.userId)
                    .single();

                if (!companyInfoError && companyInfo) {
                    fullProfile.company_info = companyInfo;
                }
            }

            setProfile(fullProfile);
            // AsyncStorage에도 저장
            await AsyncStorage.setItem('userProfile', JSON.stringify(fullProfile));

        } catch (error) {
            console.error('프로필 조회 실패:', error);
            setError('프로필을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 프로필 업데이트
    const updateProfile = async (updates: {
        profile?: Partial<Profile>;
        userInfo?: Partial<UserInfo>;
        companyInfo?: Partial<CompanyInfo>;
    }): Promise<boolean> => {
        if (!user || !profile) {
            console.error('로그인이 필요합니다');
            return false;
        }

        try {
            setError(null);

            // 1. profiles 테이블 업데이트
            if (updates.profile) {
                const { error } = await supabase
                    .from('profiles')
                    .update(updates.profile)
                    .eq('id', user.userId);

                if (error) throw error;
            }

            // 2. user_info 테이블 업데이트
            if (updates.userInfo && profile.user_type === 'user') {
                // user_info가 이미 있는지 확인
                const { data: existing } = await supabase
                    .from('user_info')
                    .select('id')
                    .eq('user_id', user.userId)
                    .single();

                if (existing) {
                    // 업데이트
                    const { error } = await supabase
                        .from('user_info')
                        .update(updates.userInfo)
                        .eq('user_id', user.userId);

                    if (error) throw error;
                } else {
                    // 새로 생성
                    const { error } = await supabase
                        .from('user_info')
                        .insert({
                            ...updates.userInfo,
                            user_id: user.userId
                        });

                    if (error) throw error;
                }
            }

            // 3. company_info 테이블 업데이트
            if (updates.companyInfo && profile.user_type === 'company') {
                const { data: existing } = await supabase
                    .from('company_info')
                    .select('id')
                    .eq('company_id', user.userId)
                    .single();

                if (existing) {
                    const { error } = await supabase
                        .from('company_info')
                        .update(updates.companyInfo)
                        .eq('company_id', user.userId);

                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('company_info')
                        .insert({
                            ...updates.companyInfo,
                            company_id: user.userId
                        });

                    if (error) throw error;
                }
            }

            // 4. 다시 가져오기
            await fetchProfile();

            console.log('프로필 업데이트 성공');
            return true;

        } catch (error) {
            console.error('프로필 업데이트 실패:', error);
            setError('프로필 업데이트에 실패했습니다.');
            return false;
        }
    };

    // 프로필 새로고침
    const refreshProfile = async () => {
        await fetchProfile();
    };

    // 컴포넌트 마운트 시 프로필 가져오기
    useEffect(() => {
        if (user) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile,
        fetchProfile
    };
};