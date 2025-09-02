import { api } from '@/lib/api';
import { User } from '@/contexts/AuthContext';

export interface InitResult {
  success: boolean;
  profile?: any;
  error?: string;
}

export const initializeUserProfile = async (user: User): Promise<InitResult> => {
  try {
    console.log(`🚀 사용자 초기화: ${user.userType}(${user.userId})`);
    
    const response = await api('GET', '/api/profiles');
    
    if (!response.success) {
      throw new Error(response.error || '프로파일 로딩 실패');
    }

    console.log('✅ 초기화 완료');
    return {
      success: true,
      profile: response.data
    };

  } catch (error: any) {
    console.error('초기화 실패:', error);
    
    let errorMessage = '알 수 없는 오류';
    
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      errorMessage = '서버 연결 시간 초과. 네트워크를 확인해주세요.';
    } else if (error.response?.status === 401) {
      errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
    } else if (error.response?.status >= 500) {
      errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};