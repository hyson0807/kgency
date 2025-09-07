import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socketManager } from '@/lib/features/chat/services/socketManager';

interface UnreadMessageContextType {
  totalUnreadCount: number;
  setTotalUnreadCount: (count: number) => void;
  updateChatRoom: (roomId: string, data: { last_message?: string; last_message_at?: string; unread_count?: number }) => void;
  refreshUnreadCount: () => Promise<void>;
}

const UnreadMessageContext = createContext<UnreadMessageContextType | undefined>(undefined);

interface UnreadMessageProviderProps {
  children: ReactNode;
}

export const UnreadMessageProvider: React.FC<UnreadMessageProviderProps> = ({ children }) => {
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  const { user } = useAuth();

  // singleton 소켓 매니저를 사용한 전역 웹소켓 연결
  useEffect(() => {
    if (__DEV__) {
      console.log('UnreadMessageContext: 초기화 시작', { userId: user?.userId });
    }

    if (!user?.userId) {
      if (__DEV__) {
        console.log('UnreadMessageContext: 사용자 없음, 소켓 이벤트 구독 건너뜀');
      }
      return;
    }

    // 총 안읽은 메시지 카운트 업데이트 구독 (가장 신뢰할 수 있는 소스)
    const unsubscribeTotalCount = socketManager.onTotalUnreadCountUpdated((data) => {
      // 배포 환경에서도 로깅하여 이벤트 수신 확인
      console.log('전역 소켓: 총 안읽은 메시지 카운트 업데이트:', {
        totalUnreadCount: data.totalUnreadCount,
        timestamp: new Date().toISOString(),
        isDev: __DEV__
      });
      setTotalUnreadCount(data.totalUnreadCount);
    });

    return () => {
      unsubscribeTotalCount();
    };
  }, [user?.userId]);

  // 초기 안읽은 메시지 카운트 조회
  const refreshUnreadCount = async () => {
    if (!user?.userId) return;

    try {
      const { api } = await import('@/lib/api');
      const response = await api('GET', '/api/chat/unread-count');
      
      if (response.success) {
        setTotalUnreadCount(response.data.totalUnreadCount);
      }
    } catch (error) {
      console.error('안읽은 메시지 카운트 조회 실패:', error);
    }
  };

  // 특정 채팅방 정보 업데이트 (채팅방 목록에서 사용)
  const updateChatRoom = (roomId: string, data: { last_message?: string; last_message_at?: string; unread_count?: number }) => {
    // 이 함수는 채팅방 목록 컴포넌트에서 사용될 수 있음
    console.log(`채팅방 ${roomId} 업데이트:`, data);
  };

  // 사용자가 변경될 때 안읽은 메시지 카운트 초기화
  useEffect(() => {
    if (user?.userId) {
      // 즉시 초기 카운트 조회
      console.log('사용자 로그인, 초기 안읽은 메시지 카운트 조회', { userId: user.userId });
      refreshUnreadCount();
      
      // 추가로 지연 후 다시 한번 조회 (웹소켓 연결 확실히 하기 위해)
      const timer = setTimeout(() => {
        console.log('지연 후 안읽은 메시지 카운트 재조회');
        refreshUnreadCount();
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setTotalUnreadCount(0);
    }
  }, [user?.userId]);

  const value: UnreadMessageContextType = {
    totalUnreadCount,
    setTotalUnreadCount,
    updateChatRoom,
    refreshUnreadCount,
  };

  return (
    <UnreadMessageContext.Provider value={value}>
      {children}
    </UnreadMessageContext.Provider>
  );
};

export const useUnreadMessage = (): UnreadMessageContextType => {
  const context = useContext(UnreadMessageContext);
  if (context === undefined) {
    throw new Error('useUnreadMessage must be used within an UnreadMessageProvider');
  }
  return context;
};