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
    visa?: string;
    age?: number;
    gender?: string;
    korean_level?: string;
    how_long?: string;
    description?: string;
    website?: string;
    address?: string;
    onboarding_completed: boolean;
    created_at?: string;
    experience?: string;
}

export const useProfile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
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
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.userId)
                .single();

            if (error) throw error;

            if (data) {
                setProfile(data);
                // AsyncStorage에도 저장
                await AsyncStorage.setItem('userProfile', JSON.stringify(data));
            }
        } catch (error) {
            console.error('프로필 조회 실패:', error);
            setError('프로필을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 프로필 업데이트
    const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
        if (!user) {
            console.error('로그인이 필요합니다');
            return false;
        }

        try {
            setError(null);

            // 1. Supabase에 업데이트
            const { data, error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.userId)
                .select()
                .single();

            if (error) throw error;

            // 2. 로컬 상태 업데이트
            setProfile(data);

            // 3. AsyncStorage 업데이트
            await AsyncStorage.setItem('userProfile', JSON.stringify(data));

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