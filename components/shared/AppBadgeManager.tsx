import React, { useEffect } from 'react';
import { useAppBadge } from '@/hooks/useAppBadge';

/**
 * 앱 배지 관리 컴포넌트
 * 앱의 전역에서 배지 상태를 관리하기 위해 root layout에 추가
 * 메시지 수 변경을 자동으로 감지하여 앱 아이콘 배지를 업데이트
 */
export const AppBadgeManager: React.FC = () => {
  const { currentBadgeCount } = useAppBadge();

  useEffect(() => {
    console.log('AppBadgeManager: 배지 수 업데이트됨', currentBadgeCount);
  }, [currentBadgeCount]);

  // 이 컴포넌트는 UI를 렌더링하지 않고, 백그라운드에서 배지만 관리
  return null;
};