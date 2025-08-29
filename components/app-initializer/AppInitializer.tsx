import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { preloadAppData } from '@/lib/preloader';
import { InitializationScreen } from './InitializationScreen';
import { ErrorBoundary } from './ErrorBoundary';
import { InitializationState } from '@/lib/preloader/types';

interface AppInitializerProps {
  children: ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [state, setState] = useState<InitializationState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    progress: 0,
    currentOperation: '초기화 준비 중...'
  });

  const updateProgress = (progress: number, operation: string) => {
    setState(prev => ({
      ...prev,
      progress,
      currentOperation: operation
    }));
  };

  const initializeApp = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // AuthContext 로딩이 완료될 때까지 대기
      if (authLoading) {
        updateProgress(10, '인증 상태 확인 중...');
        return;
      }

      // 비로그인 사용자는 초기화 스킵
      if (!isAuthenticated || !user) {
        setState(prev => ({
          ...prev,
          isInitialized: true,
          isLoading: false,
          progress: 100,
          currentOperation: '완료'
        }));
        return;
      }

      updateProgress(20, '필수 데이터 로딩 중...');

      // 메인 데이터 프리로딩
      const result = await preloadAppData(user, updateProgress);

      if (!result.success) {
        // 부분 실패의 경우 필수 데이터가 있으면 진행
        if (result.canProceed) {
          console.warn('일부 데이터 로딩 실패:', result.errors);
          updateProgress(90, '부분 데이터로 시작...');
        } else {
          throw new Error(result.errors?.[0]?.message || '초기화 실패');
        }
      }

      updateProgress(100, '초기화 완료');
      
      // 초기화 완료
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false
      }));

    } catch (error) {
      console.error('앱 초기화 실패:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'
      }));
    }
  };

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      error: null,
      progress: 0,
      currentOperation: '재시도 중...'
    }));
    initializeApp();
  };

  // AuthContext 상태 변화 감지
  useEffect(() => {
    initializeApp();
  }, [authLoading, isAuthenticated, user?.userId]);

  // 초기화 중이거나 에러가 있는 경우 로딩 화면 표시
  if (state.isLoading || state.error) {
    return (
      <ErrorBoundary>
        <InitializationScreen
          progress={state.progress}
          currentOperation={state.currentOperation}
          error={state.error}
          onRetry={handleRetry}
        />
      </ErrorBoundary>
    );
  }

  // 초기화 완료 후 메인 앱 렌더링
  return <>{children}</>;
};