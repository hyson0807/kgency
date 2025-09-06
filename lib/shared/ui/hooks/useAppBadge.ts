import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useUnreadMessage } from '@/contexts/UnreadMessageContext';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 앱 배지 숫자 관리를 위한 커스텀 훅
 * 읽지 않은 메시지 수에 따라 앱 아이콘 배지를 자동으로 업데이트
 */
export const useAppBadge = () => {
  const { totalUnreadCount } = useUnreadMessage();
  const { user } = useAuth();

  // 읽지 않은 메시지 수가 변경될 때마다 앱 배지 업데이트
  useEffect(() => {
    const updateBadge = async () => {
      try {
        // 사용자가 로그인되어 있을 때만 배지 설정
        if (user) {
          await Notifications.setBadgeCountAsync(totalUnreadCount);
        } else {
          // 로그아웃 시 배지 초기화
          await Notifications.setBadgeCountAsync(0);
        }
      } catch (error) {
        console.error('앱 배지 업데이트 실패:', error);
      }
    };

    updateBadge();
  }, [totalUnreadCount, user]);

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