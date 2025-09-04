// hooks/useProfile.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileContext } from '@/contexts/ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {router} from "expo-router";
import { api } from "@/lib/api"
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
    profile_image_url?: string | null;
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
    how_long?: string | null;
    experience?: string | null;
    topic?: string;
    experience_content?: string | null;
    preferred_days?: string[];
    preferred_times?: string[];
}
type FullProfile = Profile & {
    user_info?: UserInfo;
};
export const useProfile = () => {
    const { user } = useAuth();
    const { preloadedProfile, setPreloadedProfile } = useProfileContext();
    const [profile, setProfile] = useState<FullProfile | null>(preloadedProfile);
    const [loading, setLoading] = useState(!preloadedProfile);
    const [error, setError] = useState<string | null>(null);
    // 프로필 가져오기 (cache-first 전략)
    const fetchProfile = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        // 이미 preloaded 프로필이 있으면 사용
        if (preloadedProfile) {
            setProfile(preloadedProfile);
            setLoading(false);
            return;
        }

        try {
            setError(null);
            const response = await api('GET', '/api/profiles');
            if (!response.success) {
                if (response.error === '프로필이 존재하지 않습니다.') {
                    // 유저 프로필이 존재하지 않습니다
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
            setPreloadedProfile(fullProfile); // Context에도 저장
            // AsyncStorage에도 저장
            await AsyncStorage.setItem('userProfile', JSON.stringify(fullProfile));
        } catch (error) {
            // 프로필 조회 실패
            setError('프로필을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };
    // 프로필 업데이트
    const updateProfile = async (updates: { profile?: Partial<Profile>; userInfo?: Partial<UserInfo>; }): Promise<boolean> => {
        if (!user || !profile) {
            // 로그인이 필요합니다
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
            // Context의 preloaded 프로필도 무효화
            setPreloadedProfile(null);
            // 프로필 업데이트 성공
            return true;
        } catch (error) {
            // 프로필 업데이트 실패
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
            setPreloadedProfile(fullProfile); // Context에도 저장
            // AsyncStorage에도 저장
            await AsyncStorage.setItem('userProfile', JSON.stringify(fullProfile));
        } catch (error) {
            // 프로필 새로고침 실패
            setError('프로필 새로고침에 실패했습니다.');
        }
    };
    // 사용자 변경 감지 및 캐시 초기화
    useEffect(() => {
        const checkUserChange = async () => {
            if (user?.userId) {
                // 캐시된 프로필 확인
                const cachedProfile = await AsyncStorage.getItem('userProfile');
                if (cachedProfile) {
                    const parsed = JSON.parse(cachedProfile);
                    // 캐시된 프로필의 사용자 ID가 현재 사용자 ID와 다르면 캐시 삭제
                    if (parsed.id !== user.userId) {
                        await AsyncStorage.removeItem('userProfile');
                        setPreloadedProfile(null); // Context 초기화
                        setProfile(null); // 현재 프로필 초기화
                    }
                }
                
                // preloaded 프로필이 있고 사용자 ID가 일치하면 사용
                if (preloadedProfile && preloadedProfile.id === user.userId) {
                    setProfile(preloadedProfile);
                    setLoading(false);
                } else {
                    // 프로필 새로 가져오기
                    fetchProfile();
                }
            } else {
                setProfile(null);
                setLoading(false);
            }
        };
        
        checkUserChange();
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