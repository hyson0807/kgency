import {supabase} from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {router} from "expo-router";
import {useEffect, useState} from "react";
import {useAuth} from "@/contexts/AuthContext";


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

export const useProfileById = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<FullProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfileById = async (targetId: string) => {
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
                    .eq('id', targetId)
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
                        .eq('user_id', targetId)
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

    }



    return {
        profile,
        loading,
        error,
        fetchProfileById,
    }
}