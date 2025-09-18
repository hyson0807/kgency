// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {jwtDecode} from "jwt-decode";
import {router} from "expo-router";
import { removePushToken } from '@/lib/shared/services/notifications';
import { updateTokenCache } from "@/lib/core/api";
import { clearAllUserCaches } from '@/lib/shared/utils/storage';
import { socketManager } from '@/lib/features/chat/services/socketManager';
// 타입 정의
export interface User {
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
                    // Socket 재초기화
                    console.log('기존 세션 복원 - Socket 재초기화');
                    await socketManager.reinitialize();
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
            // 🔒 기존 데이터 완전 삭제 (다른 사용자 데이터 제거)
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('userData');
            await AsyncStorage.removeItem('onboardingStatus');
            await AsyncStorage.removeItem('userProfile'); // 프로필 캐시 삭제
            // 다른 캐싱 데이터들도 삭제
            const keys = await AsyncStorage.getAllKeys();
            const profileRelatedKeys = keys.filter(key => 
                key.includes('profile') || 
                key.includes('user_') || 
                key.includes('company_')
            );
            if (profileRelatedKeys.length > 0) {
                await AsyncStorage.multiRemove(profileRelatedKeys);
            }
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
            
            // Socket 재초기화
            console.log('로그인 성공 - Socket 재초기화 시작');
            await socketManager.reinitialize();
            
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
        console.log('로그아웃 시작...', { userId: user?.userId, userType: user?.userType });
        
        // Remove push token before logout (unless explicitly skipped)
        if (!skipPushTokenRemoval && user?.userId) {
            try {
                await removePushToken(user.userId);
            } catch (error) {
                // Ignore push token removal errors during logout
                console.log('Push token 제거 무시:', error);
            }
        }
        
        // 1. Socket 연결 정리
        try {
            console.log('Socket 연결 정리 중...');
            socketManager.destroy();
        } catch (error) {
            console.error('Socket 정리 오류:', error);
        }
        
        // 2. 모든 사용자 관련 캐시 정리 (AsyncStorage + Zustand persist)
        try {
            console.log('모든 캐시 정리 중...');
            await clearAllUserCaches();
        } catch (error) {
            console.error('캐시 정리 오류:', error);
        }
        
        // 3. 기본 인증 정보 정리
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userProfile');
        delete axios.defaults.headers.common['Authorization'];
        
        // 4. 상태 초기화
        setUser(null);
        setIsAuthenticated(false);
        setAuthToken(null);
        updateTokenCache(null);
        
        // 5. Zustand 스토어 메모리 상태 리셋
        try {
            console.log('Zustand 스토어 리셋 중...');
            // 동적 import로 스토어들을 리셋 (순환 참조 방지)
            const { useJobPostingStore } = await import('@/stores/jobPostingStore');
            const { useApplicationFormStore } = await import('@/stores/applicationFormStore');
            const { useUserInfoStore } = await import('@/stores/userInfoStore');
            const { useCompanyKeywordsStore } = await import('@/stores/companyKeywordsStore');
            
            useJobPostingStore.getState().resetAllData();
            useApplicationFormStore.getState().resetAllData();
            useUserInfoStore.getState().resetForm();
            useCompanyKeywordsStore.getState().resetAllData();
            
            console.log('모든 스토어 리셋 완료');
        } catch (error) {
            console.error('스토어 리셋 오류:', error);
        }
        
        console.log('로그아웃 완료');
        router.replace('/start');
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