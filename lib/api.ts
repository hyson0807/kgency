import axios, { Method } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 서버 주소 설정
const SERVER_URL = __DEV__
    ? 'http://192.168.0.15:5004'
    : 'https://kgencyserver-production.up.railway.app';

// API 응답 타입 (서버 응답에 맞춰 수정)
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// API 요청 함수
export const api = async <T = any>(
    method: Method,
    endpoint: string,
    data: any = null  // any 타입으로 변경
): Promise<T> => {
    try {
        const token = await AsyncStorage.getItem('authToken');

        console.log('API 요청:', `${SERVER_URL}${endpoint}`);

        const response = await axios({
            method,
            url: `${SERVER_URL}${endpoint}`,
            data,
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error: any) {
        throw error.response?.data || error;
    }
};

// 자주 쓰는 API들 (타입 안전성 추가)
export const authAPI = {
    sendOTP: (phone: string) =>
        api<ApiResponse>('POST', '/api/auth/send-otp', { phone }),

    verifyOTP: (phone: string, otp: string, userType?: 'user' | 'company') =>
        api<ApiResponse<{
            token: string;
            user: {
                userId: string;
                phone: string;
                userType: string;
                isNewUser: boolean;
            };
            onboardingStatus: {
                completed: boolean;
            };
        }>>('POST', '/api/auth/verify-otp', { phone, otp, userType }),

    deleteAccount: () =>
        api<ApiResponse>('DELETE', '/api/auth/delete-account')
};

export const profileAPI = {
    get: () => api<any>('GET', '/api/profile'),
    update: (data: any) => api<any>('PUT', '/api/profile', data)
};