import { api } from '@/lib/api';
import { UserVideo, VideoUploadResponse, VideoListResponse, PresignedUrlResponse } from '@/lib/types/video';

export const videoAPI = {
  // Presigned URL 생성 (클라이언트 직접 업로드용)
  getUploadUrl: async (fileName: string, fileType: string): Promise<PresignedUrlResponse> => {
    return await api('POST', '/api/videos/upload-url', { fileName, fileType });
  },

  // 비디오 정보 저장 (클라이언트가 직접 업로드 후)
  saveVideoInfo: async (data: {
    video_url: string;
    title?: string;
    description?: string;
    duration?: number;
    file_size?: number;
    thumbnail_url?: string;
  }): Promise<VideoUploadResponse> => {
    return await api('POST', '/api/videos/save', data);
  },

  // 사용자 비디오 목록 조회
  getUserVideos: async (): Promise<VideoListResponse> => {
    return await api('GET', '/api/videos/user');
  },

  // 비디오 삭제
  deleteVideo: async (videoId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    return await api('DELETE', `/api/videos/${videoId}`);
  },

  // 비디오 조회 (Presigned URL 포함)
  getVideo: async (videoId: string): Promise<{ success: boolean; data?: UserVideo & { presigned_url: string }; error?: string }> => {
    return await api('GET', `/api/videos/${videoId}`);
  },

  // FormData를 사용한 비디오 업로드 (서버 경유)
  uploadVideo: async (formData: FormData): Promise<VideoUploadResponse> => {
    return await api('POST', '/api/videos/upload', formData, {
      'Content-Type': 'multipart/form-data',
    });
  },
};