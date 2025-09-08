import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useUnreadMessage } from '@/contexts/UnreadMessageContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 앱 배지 숫자 관리를 위한 커스텀 훅
 * 읽지 않은 메시지 수에 따라 앱 아이콘 배지를 자동으로 업데이트
 */
export const useAppBadge = () => {
  const { totalUnreadCount, refreshUnreadCount } = useUnreadMessage();
  const { user } = useAuth();
  const appState = useRef(AppState.currentState);
  const lastUpdatedCount = useRef<number | null>(null);
  const updateInProgress = useRef(false);

  // 중복 업데이트 방지를 위한 배지 업데이트 함수
  const updateBadgeIfNeeded = async (count: number, reason: string) => {
    // 이미 업데이트 중이거나 같은 값이면 스킵
    if (updateInProgress.current || lastUpdatedCount.current === count) {
      return;
    }

    updateInProgress.current = true;
    
    try {
      if (user) {
        await Notifications.setBadgeCountAsync(count);
        lastUpdatedCount.current = count;
        console.log(`배지 업데이트: ${count} (${reason})`);
      } else {
        await Notifications.setBadgeCountAsync(0);
        lastUpdatedCount.current = 0;
        console.log('로그아웃으로 배지 초기화');
      }
    } catch (error) {
      console.error(`배지 업데이트 실패 (${reason}):`, error);
    } finally {
      updateInProgress.current = false;
    }
  };

  // 읽지 않은 메시지 수가 변경될 때마다 앱 배지 업데이트
  useEffect(() => {
    updateBadgeIfNeeded(totalUnreadCount, '메시지 수 변경');
  }, [totalUnreadCount, user]);

  // 앱 상태 변화 감지 (포그라운드/백그라운드)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      console.log(`앱 상태 변경: ${appState.current} -> ${nextAppState}`);

      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // 백그라운드에서 포그라운드로 전환될 때
        console.log('앱이 포그라운드로 전환됨 - 배지 카운트 동기화');
        
        // 서버에서 최신 카운트를 가져와서 동기화
        if (user?.userId) {
          setTimeout(() => {
            refreshUnreadCount();
          }, 500); // 약간의 지연을 두어 앱이 완전히 활성화된 후 실행
        }
      }

      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [user?.userId, refreshUnreadCount]);

  // 수동으로 배지 숫자 설정하는 함수
  const setBadgeCount = async (count: number) => {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('배지 설정 실패:', error);
    }
  };

  // 배지 초기화 함수
  const clearBadge = async () => {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('배지 초기화 실패:', error);
    }
  };

  // 현재 배지 수 가져오기
  const getBadgeCount = async (): Promise<number> => {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('배지 수 조회 실패:', error);
      return 0;
    }
  };

  return {
    setBadgeCount,
    clearBadge,
    getBadgeCount,
    currentBadgeCount: totalUnreadCount
  };
};