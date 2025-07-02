// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import {jwtDecode} from "jwt-decode";
import {router} from "expo-router";
import {supabase} from "@/lib/supabase";


// 타입 정의
interface User {
    userId: string;
    phone: string;
    userType: 'user' | 'company';
}

interface LoginResult {
    success: boolean;
    error?: string;
}

interface Profile {
    id: string;
    user_type: 'user' | 'company';
    name: string;
    phone_number: string;
    visa: string;
    age: number;
    gender: string;
    korean_level: string;
    how_long: string;
    description: string;
    website: string;
    address: string;
    onboarding_completed: boolean;


}

interface AuthContextType {
    // 상태
    user: User | null;
    profile: Profile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    onboardingCompleted: boolean;

    // 함수
    login: (token: string, userData: User, onboardingStatus: any) => Promise<LoginResult>;
    logout: () => Promise<void>;
    checkAuthState: () => Promise<void>;
    authenticatedRequest: <T = any>(
        method: 'get' | 'post' | 'put' | 'delete',
        url: string,
        data?: any
    ) => Promise<T>;
    fetchProfile: () => Promise<void>;
    updateProfile: (updates: Partial<Profile>) => Promise<boolean>;

    // 유틸리티
    userType: 'user' | 'company' | null;
    isJobSeeker: boolean;
    isEmployer: boolean;
}

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Provider Props 타입
interface AuthProviderProps {
    children: ReactNode;
}

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
    const [profile, setProfile] = useState<Profile | null>(null);

    // 앱 시작 시 자동으로 세션 확인
    useEffect(() => {
        checkAuthState();
    }, []);

    // 세션 확인 함수
    const checkAuthState = async (): Promise<void> => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const userData = await AsyncStorage.getItem('userData');
            const onboardingStatus = await AsyncStorage.getItem('onboardingStatus');

            if (token) {
                const decoded = jwtDecode(token);
                const isExpired = decoded.exp! * 1000 < Date.now();

                if (!isExpired && userData) {
                    setUser(JSON.parse(userData));
                    setIsAuthenticated(true);

                    // 온보딩 상태도 복원
                    if (onboardingStatus) {
                        const status = JSON.parse(onboardingStatus);
                        setOnboardingCompleted(status.completed || false);
                    }
                }
            }
        } catch (error) {
            await clearAuth();
        } finally {
            setIsLoading(false);
        }
    };

    // 로그인 함수
    const login = async (token: string, userData: User, onboardingStatus: any): Promise<LoginResult> => {
        try {
            // AsyncStorage에 저장
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('onboardingStatus', JSON.stringify(onboardingStatus));
            await fetchProfile();

            // 상태 업데이트
            setUser(userData);
            setIsAuthenticated(true);
            setOnboardingCompleted(onboardingStatus.completed);

            // axios 헤더 설정
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            console.log('로그인 성공');
            return { success: true };

        } catch (error) {
            console.error('로그인 실패:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : '로그인 실패'
            };
        }
    };

    // 로그아웃 함수
    const logout = async (): Promise<void> => {
        // 로컬 스토리지만 삭제
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        delete axios.defaults.headers.common['Authorization'];

        setUser(null);
        setIsAuthenticated(false);

        router.replace('/start');
        console.log('로그아웃 완료');
    };

    // 인증 정보 초기화
    const clearAuth = async (): Promise<void> => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
    };

    const fetchProfile = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.userId)
                .single();

            if (data) {
                setProfile(data);
                // AsyncStorage에도 저장
                await AsyncStorage.setItem('userProfile', JSON.stringify(data));
            }
        } catch (error) {
            console.error('프로필 조회 실패:', error);
        }
    };

    // 프로필 업데이트 함수
    const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
        if (!user) {
            console.error('로그인이 필요합니다');
            return false;
        }

        try {
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
            return false;
        }
    };

    // API 요청 헬퍼 (자동으로 토큰 포함)
    const authenticatedRequest = async <T = any>(
        method: 'get' | 'post' | 'put' | 'delete',
        url: string,
        data: any = null
    ): Promise<T> => {
        try {
            const token = await AsyncStorage.getItem('authToken');

            if (!token) {
                throw new Error('인증이 필요합니다');
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };

            let response;

            switch (method.toLowerCase()) {
                case 'get':
                    response = await axios.get<T>(url, config);
                    break;
                case 'post':
                    response = await axios.post<T>(url, data, config);
                    break;
                case 'put':
                    response = await axios.put<T>(url, data, config);
                    break;
                case 'delete':
                    response = await axios.delete<T>(url, config);
                    break;
                default:
                    throw new Error('지원하지 않는 메소드');
            }

            return response.data;

        } catch (error) {
            // 401 에러면 자동 로그아웃
            if ((error as AxiosError)?.response?.status === 401) {
                await clearAuth();
                throw new Error('세션이 만료되었습니다');
            }
            throw error;
        }
    };

    // Context value
    const value: AuthContextType = {
        // 상태
        user,
        isLoading,
        isAuthenticated,
        onboardingCompleted,
        profile,

        // 함수
        login,
        logout,
        checkAuthState,
        authenticatedRequest,
        fetchProfile,
        updateProfile,

        // 유틸리티
        userType: user?.userType || null,
        isJobSeeker: user?.userType === 'user',
        isEmployer: user?.userType === 'company',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};