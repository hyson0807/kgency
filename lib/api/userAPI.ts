import { api } from '../api';

export interface UserDetailsResponse {
    profile: {
        id: string;
        name: string;
        phone_number: string;
        user_type: string;
        email?: string;
        created_at: string;
    };
    userInfo: {
        user_id: string;
        name: string;
        age: number;
        gender: string;
        visa: string;
        korean_level: string;
        how_long: string;
        experience: string;
        experience_content?: string;
        topic?: string;
        preferred_days?: string[];
        preferred_times?: string[];
    };
    keywords: Array<{
        id: number;
        keyword: string;
        category: string;
    }>;
}

export const userAPI = {
    // 유저 상세 정보 조회 (profiles, user_info, keywords 통합)
    getUserDetails: async (userId: string): Promise<UserDetailsResponse> => {
        const response = await api('GET', `/api/users/${userId}/details`);
        return response.data;
    }
};