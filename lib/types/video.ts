export interface UserVideo {
  id: string;
  user_id: string;
  video_url: string;
  title: string | null;
  description: string | null;
  duration: number | null;
  file_size: number | null;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoUploadResponse {
  success: boolean;
  data?: UserVideo;
  error?: string;
}

export interface VideoListResponse {
  success: boolean;
  data?: UserVideo[];
  error?: string;
}

export interface PresignedUrlResponse {
  success: boolean;
  data?: {
    uploadUrl: string;
    key: string;
    videoUrl: string;
  };
  error?: string;
}