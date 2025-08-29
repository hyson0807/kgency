import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/shared/common/LoadingScreen";
import { useEffect, useState } from "react";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { preloadAppData } from '@/lib/preloader';
import { InitializationScreen } from '@/components/app-initializer/InitializationScreen';
import { SkeletonScreen } from '@/components/app-initializer/SkeletonScreen';

// Reanimated 경고 비활성화
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // strict mode 비활성화
});

export default function Index() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [delayComplete, setDelayComplete] = useState(false);
  const [initState, setInitState] = useState({
    isInitialized: false,
    isLoading: true,
    error: null as string | null,
    progress: 0,
    currentOperation: '초기화 준비 중...',
    showSkeleton: false
  });

  const updateProgress = (progress: number, operation: string) => {
    setInitState(prev => ({ ...prev, progress, currentOperation: operation }));
  };

  const handleRetry = () => {
    setInitState(prev => ({
      ...prev,
      error: null,
      progress: 0,
      currentOperation: '재시도 중...'
    }));
  };

  // 적은 딸레이 추가 (deep linking 우선순위)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // 메인 초기화 로직
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Auth 로딩 완료 대기
        if (authLoading || !delayComplete) {
          updateProgress(10, '인증 상태 확인 중...');
          return;
        }

        // 비로그인 사용자는 시작 페이지로
        if (!isAuthenticated || !user) {
          router.replace('/start');
          return;
        }

        // 로그인된 사용자는 데이터 프리로딩 실행
        updateProgress(30, '데이터 로딩 중...');
        
        // 70% 진행 후 스켈레톤 표시
        setTimeout(() => {
          setInitState(prev => ({ ...prev, showSkeleton: true }));
        }, 1500);

        const result = await preloadAppData(user, updateProgress);

        if (!result || !result.canProceed) {
          throw new Error(result?.errors?.[0]?.message || '초기화 실패');
        }

        updateProgress(100, '초기화 완료');
        
        // 성공 시 라우팅
        if (user.userType === 'user') {
          router.replace('/(user)/home');
        } else if (user.userType === 'company') {
          router.replace('/(company)/home2');
        }
        
        setInitState(prev => ({ ...prev, isInitialized: true, isLoading: false, showSkeleton: false }));
        
      } catch (error) {
        console.error('초기화 오류:', error);
        setInitState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류',
          showSkeleton: false
        }));
      }
    };

    initializeApp();
  }, [authLoading, isAuthenticated, user, delayComplete]);

  // 스켈레톤 스크린 표시
  if (initState.showSkeleton && user) {
    return (
      <SkeletonScreen 
        variant="home" 
        userType={user.userType} 
        animated={true}
      />
    );
  }

  // 에러 또는 로딩 중일 때
  if (initState.error || initState.isLoading) {
    return (
      <InitializationScreen
        progress={initState.progress}
        currentOperation={initState.currentOperation}
        error={initState.error}
        onRetry={handleRetry}
      />
    );
  }

  // 기본 로딩 스크린
  return <LoadingScreen />;
}