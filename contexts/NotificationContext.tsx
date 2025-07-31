import React, { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';
import { addNotificationResponseReceivedListener, addNotificationReceivedListener } from '@/lib/notifications';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSettings {
  interviewProposal: boolean;
  interviewScheduleConfirmed?: boolean;
  interviewCancelled?: boolean;
  newApplication?: boolean;
  interviewRequestAccepted?: boolean;
  jobPostingInterviewProposal?: boolean;
  instantInterviewCancelled?: boolean;
  regularApplicationCancelled?: boolean;
}

interface NotificationContextType {
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<void>;
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
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    interviewProposal: true,
    interviewScheduleConfirmed: true,
    interviewCancelled: true,
    newApplication: true,
    interviewRequestAccepted: true,
    jobPostingInterviewProposal: true,
    instantInterviewCancelled: true,
    regularApplicationCancelled: true
  });

  // Configure notification handler
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const data = notification.request.content.data;
        
        // Check notification settings based on type
        if (data?.type === 'interview_proposal' && !notificationSettings.interviewProposal) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
        
        if (data?.type === 'interview_schedule_confirmed' && !notificationSettings.interviewScheduleConfirmed) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
        
        if (data?.type === 'interview_cancelled' && !notificationSettings.interviewCancelled) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
        
        if (data?.type === 'new_application' && !notificationSettings.newApplication) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
        
        if (data?.type === 'interview_request_accepted' && !notificationSettings.interviewRequestAccepted) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
        
        if (data?.type === 'job_posting_interview_proposal' && !notificationSettings.jobPostingInterviewProposal) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
        
        if (data?.type === 'instant_interview_cancelled' && !notificationSettings.instantInterviewCancelled) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
        
        if (data?.type === 'regular_application_cancelled' && !notificationSettings.regularApplicationCancelled) {
          return {
            shouldShowAlert: false,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: false,
            shouldShowList: false,
          };
        }
        
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });
  }, [notificationSettings]);

  // Load notification settings
  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('notificationSettings');
      if (saved) {
        setNotificationSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

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
      
      if (data?.type === 'interview_schedule_confirmed' && data?.applicationId) {
        // Navigate to the interview slots page for company
        if (user?.userType === 'company') {
          router.push(`/(company)/interview-calendar`);
        }
      }
      
      if (data?.type === 'interview_cancelled' && data?.applicationId) {
        // Navigate to the applications page for user to see cancelled interview
        if (user?.userType === 'user') {
          router.push(`/(user)/applications`);
        }
      }
      
      // Handle new application notifications for companies
      if (data?.type === 'new_application' && data?.applicationId) {
        if (user?.userType === 'company') {
          router.push(`/(company)/myJobPostings`);
        }
      }
      
      // Handle interview request acceptance notifications for companies
      if (data?.type === 'interview_request_accepted' && data?.applicationId) {
        if (user?.userType === 'company') {
          router.push(`/(company)/interview-calendar`);
        }
      }
      
      // Handle job posting interview proposals for users
      if (data?.type === 'job_posting_interview_proposal' && data?.applicationId) {
        if (user?.userType === 'user') {
          router.push(`/(user)/applications`);
        }
      }
      
      // Handle instant interview cancellation for users
      if (data?.type === 'instant_interview_cancelled' && data?.applicationId) {
        if (user?.userType === 'user') {
          router.push(`/(user)/applications`);
        }
      }
      
      // Handle regular application cancellation for users
      if (data?.type === 'regular_application_cancelled' && data?.applicationId) {
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
    notificationSettings,
    updateNotificationSettings,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};