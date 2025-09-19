import { api } from '@/lib/core/api';

export interface UserAudio {
  id: string;
  user_id: string;
  audio_url: string;
  title?: string;
  description?: string;
  duration?: number;
  file_size?: number;
  created_at: string;
  updated_at?: string;
  is_active: boolean;
}

export interface AudioUploadResponse {
  success: boolean;
  data?: UserAudio;
  error?: string;
}

export interface AudioListResponse {
  success: boolean;
  data?: UserAudio[];
  error?: string;
}

export interface PresignedUrlResponse {
  success: boolean;
  data?: {
    uploadUrl: string;
    key: string;
    audioUrl: string;
  };
  error?: string;
}

export const audioAPI = {
  // Presigned URL 생성 (클라이언트 직접 업로드용)
  getUploadUrl: async (fileName: string, fileType: string): Promise<PresignedUrlResponse> => {
    return await api('POST', '/api/audios/upload-url', { fileName, fileType });
  },

  // 오디오 정보 저장 (클라이언트가 직접 업로드 후)
  saveAudioInfo: async (data: {
    audio_url: string;
    title?: string;
    description?: string;
    duration?: number;
    file_size?: number;
  }): Promise<AudioUploadResponse> => {
    return await api('POST', '/api/audios/save', data);
  },

  // 사용자 오디오 목록 조회
  getUserAudios: async (): Promise<AudioListResponse> => {
    return await api('GET', '/api/audios/user');
  },

  // 오디오 삭제
  deleteAudio: async (audioId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    return await api('DELETE', `/api/audios/${audioId}`);
  },

  // 오디오 조회 (Presigned URL 포함)
  getAudio: async (audioId: string): Promise<{ success: boolean; data?: UserAudio & { presigned_url: string }; error?: string }> => {
    return await api('GET', `/api/audios/${audioId}`);
  },

  // FormData를 사용한 오디오 업로드 (서버 경유)
  uploadAudio: async (formData: FormData): Promise<AudioUploadResponse> => {
    return await api('POST', '/api/audios/upload', formData, {
      'Content-Type': 'multipart/form-data',
    });
  },
};