import { api } from './index';

export const profileAPI = {
    get: () => api<any>('GET', '/api/profile'),
    update: (data: any) => api<any>('PUT', '/api/profile', data)
};