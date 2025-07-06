// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from "expo-router";

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

            // 기본 프로필 정보 가져오기
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.userId)
                .single();

            // 유저가 삭제된 경우 처리
            if (profileError && profileError.code === 'PGRST116') {
                console.log('유저 프로필이 존재하지 않습니다');

                // 로컬 스토리지 정리
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('userData');
                await AsyncStorage.removeItem('userProfile');

                // 로그인 페이지로 리다이렉트
                router.replace('/start');
                return;
            }

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