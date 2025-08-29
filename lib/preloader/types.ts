export interface PreloadResult {
  success: boolean;
  canProceed: boolean;
  data?: Record<string, any>;
  errors?: PreloadError[];
}

export interface PreloadError {
  operation: string;
  message: string;
  code?: string;
}

export type ProgressCallback = (progress: number, operation: string) => void;

export interface AppInitializationData {
  keywords?: any[];
  keywordsByCategory?: Record<string, any[]>;
  profile?: any;
  userKeywords?: any[];
  companyKeywords?: any[];
  recentApplications?: any[];
  activeJobPostings?: any[];
  appConfig?: any;
}

export interface InitializationState {
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  progress: number;
  currentOperation: string;
}