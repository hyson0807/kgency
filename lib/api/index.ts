import axios, { Method } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 서버 주소 설정
const SERVER_URL = __DEV__
    ? process.env.EXPO_PUBLIC_DEV_SERVER_URL || 'http://192.168.0.15:5004'
    : process.env.EXPO_PUBLIC_PROD_SERVER_URL || 'https://kgency-server.onrender.com';

// 토큰 메모리 캐시
let cachedToken: string | null = null;
let tokenCacheInitialized = false;

// API 응답 타입 (서버 응답에 맞춰 수정)
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// 토큰 캐시 초기화 함수
const initializeTokenCache = async (): Promise<void> => {
    if (!tokenCacheInitialized) {
        cachedToken = await AsyncStorage.getItem('authToken');
        tokenCacheInitialized = true;
    }
};

// 토큰 캐시 업데이트 함수 (외부에서 호출 가능)
export const updateTokenCache = (token: string | null): void => {
    cachedToken = token;
    tokenCacheInitialized = true;
};

// API 요청 함수
export const api = async <T = any>(
    method: Method,
    endpoint: string,
    data?: any,
    customHeaders?: Record<string, string>
): Promise<T> => {
    try {
        // 토큰 캐시 초기화
        await initializeTokenCache();
        
        const config: any = {
            method,
            url: `${SERVER_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...customHeaders,
            },
        };
        
        // 토큰이 있으면 헤더에 추가
        if (cachedToken) {
            config.headers.Authorization = `Bearer ${cachedToken}`;
        }
        
        // GET 요청이 아닌 경우에만 data 추가
        if (method !== 'GET' && data) {
            config.data = data;
        }

        const response = await axios({
            ...config,
            timeout: 10000 // 10초 timeout 설정
        });
        return response.data;
    } catch (error: any) {
        // axios 에러 구조를 유지하면서 throw
        throw error;
    }
};