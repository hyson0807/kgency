import React, { useState, useEffect, ReactNode } from 'react';
import { View, Text, Alert, AppState } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { preloadAppData, useOfflineStatus } from '@/lib/preloader';
import { InitializationScreen } from './InitializationScreen';
import { SkeletonScreen } from './SkeletonScreen';
import { ErrorBoundary } from './ErrorBoundary';
import { InitializationState } from '@/lib/preloader/types';
import { offlineManager } from '@/lib/offline/OfflineManager';

interface AppInitializerProps {
  children: ReactNode;
}

interface ExtendedInitializationState extends InitializationState {
  isOfflineMode?: boolean;
  showSkeletonScreen?: boolean;
  networkStatus?: any;
  lastSync?: string;
  hoursSinceSync?: number;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { isOffline, networkStatus, offlineInfo } = useOfflineStatus();
  const [state, setState] = useState<ExtendedInitializationState>({
    isInitialized: false,
    isLoading: true,
    error: null,
    progress: 0,
    currentOperation: '초기화 준비 중...',
    showSkeletonScreen: false,
    isOfflineMode: false
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
      setState(prev => ({ ...prev, isLoading: true, error: null, showSkeletonScreen: false }));

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

      // 오프라인 상태 확인 및 알림
      if (isOffline && offlineInfo) {
        console.log('📱 오프라인 모드 감지:', offlineInfo.message);
        
        // 오프라인 데이터 가용성 첫 번째 확인
        const availability = await offlineManager.checkOfflineAvailability(user.userId, user.userType);
        if (!availability.available) {
          // 오프라인 데이터가 없으면 사용자에게 알림
          Alert.alert(
            '오프라인 모드',
            `${availability.reason}\n${availability.recommendation}`,
            [
              { text: '재시도', onPress: () => initializeApp().catch(console.error) },
              { text: '종료', style: 'destructive' }
            ]
          );
          return;
        }
      }

      updateProgress(30, isOffline ? '오프라인 데이터 로딩 중...' : '온라인 데이터 로딩 중...');

      // 70% 진행 후에는 스켈레톤 스크린 표시
      setTimeout(() => {
        setState(prev => ({ ...prev, showSkeletonScreen: true }));
      }, 1500);

      // 메인 데이터 프리로딩
      const result = await preloadAppData(user, updateProgress);
      
      // 결과 타입 안전성 검사
      if (!result) {
        const error = new Error('초기화 결과가 없습니다.');
        console.error('초기화 결과 없음:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
          showSkeletonScreen: false
        }));
        return;
      }

      if (!result.success) {
        // 부분 실패의 경우 필수 데이터가 있으면 진행
        if (result.canProceed) {
          console.warn('일부 데이터 로딩 실패:', result.errors);
          
          // 오프라인 모드 경고 표시
          if (result.isOfflineMode) {
            const warningMessage = result.hoursSinceSync ? 
              `오프라인 모드: ${result.hoursSinceSync}시간 전 데이터를 사용 중입니다.` : 
              '오프라인 모드: 캐시된 데이터를 사용 중입니다.';
            
            updateProgress(90, warningMessage);
          } else {
            updateProgress(90, '부분 데이터로 시작...');
          }
        } else {
          const error = new Error(result.errors?.[0]?.message || '초기화 실패');
          console.error('초기화 실패:', error);
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error.message,
            showSkeletonScreen: false
          }));
          return;
        }
      }

      updateProgress(100, '초기화 완료');
      
      // 초기화 완료
      setState(prev => ({
        ...prev,
        isInitialized: true,
        isLoading: false,
        isOfflineMode: result.isOfflineMode || false,
        networkStatus: result.networkStatus || null,
        lastSync: result.lastSync || new Date().toISOString(),
        hoursSinceSync: result.hoursSinceSync || 0,
        showSkeletonScreen: false
      }));

    } catch (error) {
      console.error('앱 초기화 실패:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        showSkeletonScreen: false
      }));
    }
  };

  const handleRetry = async () => {
    setState(prev => ({
      ...prev,
      error: null,
      progress: 0,
      currentOperation: '재시도 중...'
    }));
    try {
      await initializeApp();
    } catch (error) {
      console.error('재시도 실패:', error);
    }
  };

  // AuthContext 상태 변화 감지
  useEffect(() => {
    initializeApp().catch(console.error);
  }, [authLoading, isAuthenticated, user?.userId]);
  
  // 앱 상태 변화 감지 (백그라운드에서 돌아오면 다시 초기화)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && state.isInitialized && isAuthenticated && user) {
        // 백그라운드에서 돌아오고 1시간 이상 지나면 다시 초기화
        const now = Date.now();
        const lastInitTime = state.lastSync ? new Date(state.lastSync).getTime() : 0;
        const hoursSinceInit = (now - lastInitTime) / (1000 * 60 * 60);
        
        if (hoursSinceInit > 1) {
          console.log('백그라운드에서 돌아오고 1시간 지나서 재초기화');
          initializeApp().catch(console.error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [state.isInitialized, state.lastSync, isAuthenticated, user]);

  // 스켈레톤 스크린 표시 (진행률 70% 이상 + 데이터 로딩 중)
  if (state.showSkeletonScreen && user) {
    return (
      <ErrorBoundary>
        <SkeletonScreen 
          variant="home" 
          userType={user.userType} 
          animated={true}
        />
      </ErrorBoundary>
    );
  }

  // 초기화 중이거나 에러가 있는 경우 로딩 화면 표시
  if (state.isLoading || state.error) {
    return (
      <ErrorBoundary>
        <InitializationScreen
          progress={state.progress}
          currentOperation={state.currentOperation}
          error={state.error}
          onRetry={handleRetry}
          isOfflineMode={state.isOfflineMode}
          networkStatus={networkStatus}
          offlineInfo={offlineInfo}
        />
      </ErrorBoundary>
    );
  }

  // 초기화 완료 후 메인 앱 렌더링
  return (
    <ErrorBoundary>
      {children}
      {/* 오프라인 모드 상태 알림 (옵션) */}
      {state.isOfflineMode && offlineInfo && (
        <View style={{
          position: 'absolute',
          top: 50,
          left: 16,
          right: 16,
          backgroundColor: '#ff9500',
          padding: 8,
          borderRadius: 8,
          zIndex: 1000
        }}>
          <Text style={{ color: 'white', fontSize: 12, textAlign: 'center' }}>
            📱 {offlineInfo.message}
          </Text>
        </View>
      )}
    </ErrorBoundary>
  );
};

