// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';
import {jwtDecode} from "jwt-decode";
import {router} from "expo-router";
import { registerForPushNotificationsAsync, savePushToken, removePushToken } from '@/lib/notifications';
import { updateTokenCache } from '@/lib/api';

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

interface AuthContextType {
    // 상태
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    onboardingCompleted: boolean;
    authToken: string | null;

    // 함수
    login: (token: string, userData: User, onboardingStatus: any) => Promise<LoginResult>;
    logout: (skipPushTokenRemoval?: boolean) => Promise<void>;
    checkAuthState: () => Promise<void>;
    authenticatedRequest: <T = any>(
        method: 'get' | 'post' | 'put' | 'delete',
        url: string,
        data?: any
    ) => Promise<T>;

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
    const [authToken, setAuthToken] = useState<string | null>(null);

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
                    setAuthToken(token); // 메모리에 토큰 캐시
                    updateTokenCache(token); // api.ts 토큰 캐시도 업데이트

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
            // 🔒 기존 데이터 삭제 (덮어쓰기 대신 명시적으로 클리어)
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('onboardingStatus');
            await AsyncStorage.removeItem('userProfile'); // 혹시 남아있을 경우 대비

            // ✅ 새로운 로그인 데이터 저장
            await AsyncStorage.setItem('authToken', token);
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('onboardingStatus', JSON.stringify(onboardingStatus));

            // 상태 반영
            setUser(userData);
            setIsAuthenticated(true);
            setOnboardingCompleted(onboardingStatus.completed);
            setAuthToken(token); // 메모리에 토큰 캐시
            updateTokenCache(token); // api.ts 토큰 캐시도 업데이트

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '로그인 실패'
            };
        }
    };

    // 로그아웃 함수
    const logout = async (skipPushTokenRemoval = false): Promise<void> => {
        // Remove push token before logout (unless explicitly skipped)
        if (!skipPushTokenRemoval && user?.userId) {
            try {
                await removePushToken(user.userId);
            } catch (error) {
                // Ignore push token removal errors during logout
                console.log('Push token removal skipped:', error);
            }
        }
        
        // 로컬 스토리지만 삭제
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userProfile');
        delete axios.defaults.headers.common['Authorization'];

        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null); // 메모리 캐시도 클리어
        updateTokenCache(null); // api.ts 토큰 캐시도 클리어

        router.replace('/start');
        console.log('로그아웃 완료');
    };

    // 인증 정보 초기화
    const clearAuth = async (): Promise<void> => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userProfile');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null); // 메모리 캐시도 클리어
        updateTokenCache(null); // api.ts 토큰 캐시도 클리어
    };

    // API 요청 헬퍼 (자동으로 토큰 포함)
    const authenticatedRequest = async <T = any>(
        method: 'get' | 'post' | 'put' | 'delete',
        url: string,
        data: any = null
    ): Promise<T> => {
        try {
            // 메모리 캐시에서 토큰 가져오기 (AsyncStorage 접근 제거)
            if (!authToken) {
                throw new Error('인증이 필요합니다');
            }

            const config = {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
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

    // Memoize user object to prevent unnecessary re-renders
    const memoizedUser = useMemo(() => user, [user?.userId, user?.phone, user?.userType]);

    // Context value
    const value: AuthContextType = useMemo(() => ({
        // 상태
        user: memoizedUser,
        isLoading,
        isAuthenticated,
        onboardingCompleted,
        authToken,

        // 함수
        login,
        logout,
        checkAuthState,
        authenticatedRequest,

        // 유틸리티
        userType: memoizedUser?.userType || null,
        isJobSeeker: memoizedUser?.userType === 'user',
        isEmployer: memoizedUser?.userType === 'company',
    }), [memoizedUser, isLoading, isAuthenticated, onboardingCompleted, authToken]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};