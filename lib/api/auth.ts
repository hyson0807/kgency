import { api, ApiResponse } from './index';

export const authAPI = {
    sendOTP: (phone: string) =>
        api<ApiResponse>('POST', '/api/auth/send-otp', { phone }),
    
    verifyOTP: (phone: string, otp: string, userType?: 'user' | 'company', isDemoAccount?: boolean) =>
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
        }>>('POST', '/api/auth/verify-otp', { phone, otp, userType, isDemoAccount }),
    
    deleteAccount: () =>
        api<ApiResponse>('DELETE', '/api/auth/delete-account')
};