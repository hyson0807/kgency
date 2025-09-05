import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/shared/common/LoadingScreen";
import { useEffect, useState } from "react";
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { initializeUserProfile } from '@/lib/initialization';
import { InitializationScreen } from '@/components/app-initializer/InitializationScreen';
import * as Notifications from 'expo-notifications';

// Reanimated 경고 비활성화
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

export default function Index() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [initState, setInitState] = useState({
    isLoading: true,
    error: null as string | null,
    progress: 0,
    currentOperation: '시작 중...'
  });

  useEffect(() => {
    const initialize = async () => {
      try {
        // Auth 로딩 대기
        if (authLoading) {
          setInitState(prev => ({ ...prev, progress: 20, currentOperation: '인증 확인 중...' }));
          return;
        }

        // 비로그인 사용자
        if (!isAuthenticated || !user) {
          router.replace('/start');
          return;
        }

        // 프로파일 로딩
        setInitState(prev => ({ ...prev, progress: 50, currentOperation: '프로파일 로딩 중...' }));
        
        const result = await initializeUserProfile(user);

        if (!result.success) {
          throw new Error(result.error || '초기화 실패');
        }

        setInitState(prev => ({ ...prev, progress: 90, currentOperation: '완료 중...' }));
        
        // 알림으로 시작되었는지 확인
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response?.notification) {
          console.log('알림으로 앱 시작됨, NotificationContext에서 처리하도록 기다림');
          // NotificationContext에서 처리하도록 하고 여기서는 라우팅하지 않음
          setInitState(prev => ({ ...prev, isLoading: false, progress: 100, currentOperation: '알림 처리 중...' }));
          return;
        }
        
        // 일반적인 라우팅 (알림이 없는 경우)
        setTimeout(() => {
          if (user.userType === 'user') {
            router.replace('/(user)/home');
          } else if (user.userType === 'company') {
            router.replace('/(company)/home2');
          }
        }, 300);
        
        setInitState(prev => ({ ...prev, isLoading: false, progress: 100 }));
        
      } catch (error) {
        console.error('초기화 오류:', error);
        setInitState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류'
        }));
      }
    };

    initialize();
  }, [authLoading, isAuthenticated, user]);

  const handleRetry = () => {
    setInitState({ isLoading: true, error: null, progress: 0, currentOperation: '재시도 중...' });
  };

  if (initState.isLoading || initState.error) {
    return (
      <InitializationScreen
        progress={initState.progress}
        currentOperation={initState.currentOperation}
        error={initState.error}
        onRetry={handleRetry}
      />
    );
  }

  return <LoadingScreen />;
}