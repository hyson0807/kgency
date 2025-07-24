// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from "expo-router";
import { api } from '@/lib/api';

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
    job_seeking_active?: boolean;
    created_at?: string;
}

interface UserInfo {
    id: string;
    user_id: string;
    name?: string;
    age?: number;
    gender?: string;
    visa?: string;
    korean_level?: string;
    how_long?: string;
    experience?: string;
    topic?: string;
    experience_content?: string;
}



type FullProfile = Profile & {
    user_info?: UserInfo;
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

            const response = await api('GET', '/api/profiles');

            if (!response.success) {
                if (response.error === '프로필이 존재하지 않습니다.') {
                    console.log('유저 프로필이 존재하지 않습니다');

                    // 로컬 스토리지 정리
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('userData');
                    await AsyncStorage.removeItem('userProfile');

                    // 로그인 페이지로 리다이렉트
                    router.replace('/start');
                    return;
                }
                throw new Error(response.error);
            }

            const fullProfile: FullProfile = response.data;
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
    const updateProfile = async (updates: { profile?: Partial<Profile>; userInfo?: Partial<UserInfo>; }): Promise<boolean> => {
        if (!user || !profile) {
            console.error('로그인이 필요합니다');
            return false;
        }

        try {
            setError(null);

            const response = await api('PUT', '/api/profiles', updates);

            if (!response.success) {
                throw new Error(response.error);
            }

            // 프로필 다시 가져오기
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
        try {
            const response = await api('POST', '/api/profiles/refresh');

            if (!response.success) {
                throw new Error(response.error);
            }

            const fullProfile: FullProfile = response.data;
            setProfile(fullProfile);
            // AsyncStorage에도 저장
            await AsyncStorage.setItem('userProfile', JSON.stringify(fullProfile));

        } catch (error) {
            console.error('프로필 새로고침 실패:', error);
            setError('프로필 새로고침에 실패했습니다.');
        }
    };

    // 컴포넌트 마운트 시 프로필 가져오기
    useEffect(() => {
        if (user?.userId) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, [user?.userId]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        refreshProfile,
        fetchProfile
    };
};