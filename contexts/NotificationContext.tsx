import React, { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';
import { addNotificationResponseReceivedListener, addNotificationReceivedListener } from '@/lib/shared/services/notifications';
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
  chatMessage?: boolean;
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
  const lastProcessedNotificationId = useRef<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    interviewProposal: true,
    interviewScheduleConfirmed: true,
    interviewCancelled: true,
    newApplication: true,
    interviewRequestAccepted: true,
    jobPostingInterviewProposal: true,
    instantInterviewCancelled: true,
    regularApplicationCancelled: true,
    chatMessage: true
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
        
        if (data?.type === 'chat_message' && !notificationSettings.chatMessage) {
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
      // Failed to load notification settings
    }
  };
  const updateNotificationSettings = async (settings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(settings));
      setNotificationSettings(settings);
    } catch (error) {
      // Failed to save notification settings
    }
  };
  useEffect(() => {
    // Handle notification when app receives it
    notificationListener.current = addNotificationReceivedListener(notification => {
      // Notification received
    });

    // Handle notification when user taps on it (while app is running)
    responseListener.current = addNotificationResponseReceivedListener(response => {
      // Notification response received
      const notificationId = response.notification.request.identifier;
      
      // Prevent duplicate processing (already handled by getLastNotificationResponseAsync)
      if (lastProcessedNotificationId.current === notificationId) {
        console.log('이미 처리된 알림 (실시간), 건너뜀');
        return;
      }
      
      lastProcessedNotificationId.current = notificationId;
      const data = response.notification.request.content.data;
      
      // Check if user is properly loaded with enhanced retry mechanism
      if (!user || !user.userType) {
        // User not loaded yet, implementing multiple retries for app cold start
        const retryNavigation = (retryCount: number = 0) => {
          const maxRetries = 10; // 최대 10회 재시도 (총 5초)
          const retryDelay = 500; // 0.5초 간격
          
          if (retryCount >= maxRetries) {
            console.log('알림 라우팅: 최대 재시도 횟수 초과, 라우팅 취소');
            return;
          }
          
          setTimeout(() => {
            if (user && user.userType) {
              console.log(`알림 라우팅: 재시도 ${retryCount + 1}회 성공, 사용자 유형:`, user.userType);
              handleNotificationNavigation(data, user);
            } else {
              console.log(`알림 라우팅: 재시도 ${retryCount + 1}/${maxRetries}, 사용자 정보 대기 중...`);
              retryNavigation(retryCount + 1);
            }
          }, retryDelay);
        };
        
        retryNavigation();
        return;
      }
      
      handleNotificationNavigation(data, user);
    });
    const handleNotificationNavigation = (data: any, user: any) => {
      try {
        // Handling notification navigation
        // Validate required data
        if (!data?.type) {
          // Missing notification type
          return;
        }
        
        // Chat messages don't require applicationId
        if (data.type !== 'chat_message' && !data?.applicationId) {
          // Missing required notification data for non-chat notifications
          return;
        }
        
        if (!user?.userType) {
          // User type not available
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
        else if (data.type === 'chat_message') {
          // Navigate to chat room when chat notification is tapped
          if (data.roomId) {
            targetRoute = `/(pages)/chat/${data.roomId}?fromNotification=true`;
          }
        }
        else {
          // Unknown notification type
          return;
        }
        if (targetRoute) {
          // Navigating to target route
          
          // Use a small delay to ensure the app is ready for navigation
          setTimeout(() => {
            try {
              router.replace(targetRoute as any);
              // Successfully navigated
            } catch (navError) {
              // Navigation error, retrying with push navigation
              try {
                router.push(targetRoute as any);
              } catch (pushError) {
                // Push navigation also failed
              }
            }
          }, 100);
        } else {
          // No target route determined
        }
      } catch (error) {
        // Error in notification navigation handler
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
  }, []); // user 의존성 제거하여 웹소켓 연결이 재시작되지 않도록 함

  // 별도 useEffect로 초기 알림 확인 (user가 로드된 후)
  useEffect(() => {
    const checkInitialNotification = async () => {
      // Only check when user is available
      if (!user || !user.userType) {
        return;
      }
      
      try {
        // 웹에서는 알림 기능이 지원되지 않으므로 건너뛰기
        if (Platform.OS === 'web') {
          console.log('웹 환경에서는 초기 알림 체크를 건너뜁니다.');
          return;
        }
        
        const response = await Notifications.getLastNotificationResponseAsync();
        if (response?.notification) {
          const notificationId = response.notification.request.identifier;
          console.log('앱 시작 시 초기 알림 감지:', response.notification.request.content.data);
          
          // Prevent duplicate processing
          if (lastProcessedNotificationId.current === notificationId) {
            console.log('이미 처리된 알림, 건너뜸');
            return;
          }
          
          lastProcessedNotificationId.current = notificationId;
          const data = response.notification.request.content.data;
          
          console.log('초기 알림 라우팅: 사용자 정보 확인됨, 처리 시작');
          
          // handleNotificationNavigation 함수를 여기서 직접 구현 (의존성 문제 해결)
          if (!data?.type) return;
          if (data.type !== 'chat_message' && !data?.applicationId) return;
          if (!user?.userType) return;
          
          let targetRoute = null;
          
          if (data.type === 'chat_message' && data.roomId) {
            targetRoute = `/(pages)/chat/${data.roomId}?fromNotification=true`;
          } else if (data.type === 'interview_proposal') {
            targetRoute = user.userType === 'user' ? '/(user)/applications' : '/(company)/interview-calendar';
          } else if (data.type === 'interview_schedule_confirmed') {
            targetRoute = user.userType === 'company' ? '/(company)/interview-calendar' : '/(user)/user-calendar';
          } else if (data.type === 'interview_cancelled') {
            targetRoute = user.userType === 'user' ? '/(user)/applications' : '/(company)/interview-calendar';
          } else if (data.type === 'new_application') {
            if (user.userType === 'company') targetRoute = '/(company)/myJobPostings';
          } else if (data.type === 'interview_request_accepted') {
            if (user.userType === 'company') targetRoute = '/(company)/interview-calendar';
          } else if (data.type === 'job_posting_interview_proposal') {
            if (user.userType === 'user') targetRoute = '/(user)/applications';
          } else if (data.type === 'instant_interview_cancelled') {
            if (user.userType === 'user') targetRoute = '/(user)/applications';
          } else if (data.type === 'regular_application_cancelled') {
            if (user.userType === 'user') targetRoute = '/(user)/applications';
          }
          
          if (targetRoute) {
            setTimeout(() => {
              try {
                router.replace(targetRoute as any);
              } catch (navError) {
                try {
                  router.push(targetRoute as any);
                } catch (pushError) {
                  console.error('알림 라우팅 실패:', pushError);
                }
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error('초기 알림 확인 오류:', error);
      }
    };

    // Check for initial notification when user becomes available
    if (user && user.userType) {
      checkInitialNotification();
    }
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