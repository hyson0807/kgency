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
      console.log('Notification data:', response.notification.request.content.data);
      console.log('Current user:', user);
      
      const data = response.notification.request.content.data;
      
      // Check if user is properly loaded with retry mechanism
      if (!user || !user.userType) {
        console.log('User not loaded yet, retrying navigation in 1 second');
        setTimeout(() => {
          if (user && user.userType) {
            handleNotificationNavigation(data, user);
          } else {
            console.log('User still not loaded after retry, skipping navigation');
          }
        }, 1000);
        return;
      }
      
      handleNotificationNavigation(data, user);
    });

    const handleNotificationNavigation = (data: any, user: any) => {
      try {
        console.log('🔔 Handling notification navigation:', { 
          type: data?.type, 
          applicationId: data?.applicationId,
          userType: user?.userType 
        });

        // Validate required data
        if (!data?.type || !data?.applicationId) {
          console.warn('❌ Missing required notification data:', { type: data?.type, applicationId: data?.applicationId });
          return;
        }

        if (!user?.userType) {
          console.warn('❌ User type not available:', user);
          return;
        }

        // Navigate based on notification type with proper route replacement
        let targetRoute = null;
        
        if (data.type === 'interview_proposal') {
          if (user.userType === 'user') {
            targetRoute = '/(user)/applications';
          } else if (user.userType === 'company') {
            targetRoute = '/(company)/interview-calendar';
          }
        }
        else if (data.type === 'interview_schedule_confirmed') {
          if (user.userType === 'company') {
            targetRoute = '/(company)/interview-calendar';
          } else if (user.userType === 'user') {
            targetRoute = '/(user)/user-calendar';
          }
        }
        else if (data.type === 'interview_cancelled') {
          if (user.userType === 'user') {
            targetRoute = '/(user)/applications';
          } else if (user.userType === 'company') {
            targetRoute = '/(company)/interview-calendar';
          }
        }
        else if (data.type === 'new_application') {
          if (user.userType === 'company') {
            targetRoute = '/(company)/myJobPostings';
          }
        }
        else if (data.type === 'interview_request_accepted') {
          if (user.userType === 'company') {
            targetRoute = '/(company)/interview-calendar';
          }
        }
        else if (data.type === 'job_posting_interview_proposal') {
          if (user.userType === 'user') {
            targetRoute = '/(user)/applications';
          }
        }
        else if (data.type === 'instant_interview_cancelled') {
          if (user.userType === 'user') {
            targetRoute = '/(user)/applications';
          }
        }
        else if (data.type === 'regular_application_cancelled') {
          if (user.userType === 'user') {
            targetRoute = '/(user)/applications';
          }
        }
        else {
          console.warn('❌ Unknown notification type:', data.type);
          return;
        }

        if (targetRoute) {
          console.log(`✅ Navigating to: ${targetRoute} for ${data.type}`);
          
          // Use a small delay to ensure the app is ready for navigation
          setTimeout(() => {
            try {
              router.replace(targetRoute as any);
              console.log(`🎯 Successfully navigated to: ${targetRoute}`);
            } catch (navError) {
              console.error('❌ Navigation error:', navError);
              console.log('🔄 Retrying with push navigation...');
              try {
                router.push(targetRoute as any);
              } catch (pushError) {
                console.error('❌ Push navigation also failed:', pushError);
              }
            }
          }, 100);
        } else {
          console.warn(`❌ No target route determined for ${data.type} with userType ${user.userType}`);
        }
      } catch (error) {
        console.error('❌ Error in notification navigation handler:', error);
      }
    };

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