import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';
import { addNotificationResponseReceivedListener, addNotificationReceivedListener } from '@/lib/notifications';
import * as Notifications from 'expo-notifications';

interface NotificationContextType {
  // 나중에 필요한 메서드들을 추가할 수 있습니다
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    // Handle notification when app receives it
    notificationListener.current = addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Handle notification when user taps on it
    responseListener.current = addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const data = response.notification.request.content.data;
      
      // Navigate based on notification type
      if (data?.type === 'interview_proposal' && data?.applicationId) {
        // Navigate to the application detail or interview proposal page
        if (user?.userType === 'user') {
          router.push(`/(user)/applications`);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user]);

  const value: NotificationContextType = {
    // 나중에 필요한 메서드들을 추가할 수 있습니다
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};