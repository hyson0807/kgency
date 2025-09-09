import React, { createContext, useContext, useEffect, useRef, ReactNode, useState } from 'react';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';
import { addNotificationResponseReceivedListener, addNotificationReceivedListener } from '@/lib/shared/services/notifications';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
interface NotificationSettings {
  newApplication?: boolean;
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
  const authContext = useAuth();
  const { user } = authContext;
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const lastProcessedNotificationId = useRef<string | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newApplication: true,
    chatMessage: true
  });
  // Configure notification handler
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const data = notification.request.content.data;
        
        // Check notification settings based on type
        if (data?.type === 'new_application' && !notificationSettings.newApplication) {
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
        console.log('🔄 사용자 정보 로딩 대기 중, AsyncStorage에서 직접 확인 시도');
        
        // AsyncStorage에서 직접 사용자 정보 확인
        AsyncStorage.getItem('authToken').then(token => {
          if (token) {
            AsyncStorage.getItem('userData').then(userData => {
              if (userData) {
                try {
                  const parsedUser = JSON.parse(userData);
                  console.log('💾 AsyncStorage에서 사용자 정보 발견:', { 
                    userId: parsedUser.userId, 
                    userType: parsedUser.userType 
                  });
                  
                  // AsyncStorage에서 가져온 사용자 정보로 바로 처리
                  handleNotificationNavigation(data, parsedUser);
                  return;
                } catch (parseError) {
                  console.log('❌ 사용자 데이터 파싱 실패:', parseError);
                }
              }
              
              // AsyncStorage에서도 실패한 경우 재시도 로직 실행
              startRetryLogic();
            }).catch(error => {
              console.log('❌ userData 가져오기 실패:', error);
              startRetryLogic();
            });
          } else {
            console.log('❌ authToken이 없음');
            startRetryLogic();
          }
        }).catch(error => {
          console.log('❌ authToken 가져오기 실패:', error);
          startRetryLogic();
        });
        
        const startRetryLogic = () => {
          console.log('🔄 AsyncStorage에서도 사용자 정보 없음, 재시도 로직 시작');
          
          // User not loaded yet, implementing multiple retries for app cold start
          const retryNavigation = (retryCount: number = 0) => {
            const maxRetries = 20; // 최대 20회 재시도 (총 10초)
            const retryDelay = 500; // 0.5초 간격
            
            if (retryCount >= maxRetries) {
              console.log('❌ 알림 라우팅: 최대 재시도 횟수 초과, 라우팅 취소');
              
              // 마지막 시도: 사용자 정보를 강제로 다시 로드
              console.log('🔄 사용자 정보 강제 재로드 시도');
              
              // AuthContext의 checkAuthState 메서드 호출
              authContext.checkAuthState().then(() => {
                console.log('✅ 사용자 정보 재로드 완료');
                
                // 재로드 후 한번 더 시도
                setTimeout(() => {
                  const reloadedUser = authContext.user;
                  if (reloadedUser && reloadedUser.userType) {
                    console.log('🎉 재로드 후 알림 처리 재시도 성공:', reloadedUser.userType);
                    handleNotificationNavigation(data, reloadedUser);
                  } else {
                    console.log('❌ 재로드 후에도 사용자 정보 없음');
                  }
                }, 1000);
              }).catch((error: any) => {
                console.log('❌ 사용자 정보 재로드 실패:', error);
              });
              return;
            }
            
            setTimeout(() => {
              // 현재 AuthContext에서 사용자 정보를 다시 확인
              const currentUser = authContext.user;
              console.log(`🔍 재시도 ${retryCount + 1}/${maxRetries} - AuthContext 상태:`, {
                user: currentUser ? { userId: currentUser.userId, userType: currentUser.userType } : null,
                isLoading: authContext.isLoading,
                isAuthenticated: authContext.isAuthenticated,
                authToken: authContext.authToken ? 'exists' : 'null'
              });
              
              if (currentUser && currentUser.userType) {
                console.log(`✅ 알림 라우팅: 재시도 ${retryCount + 1}회 성공, 사용자 유형:`, currentUser.userType);
                handleNotificationNavigation(data, currentUser);
              } else {
                console.log(`🔄 알림 라우팅: 재시도 ${retryCount + 1}/${maxRetries}, 사용자 정보 대기 중...`);
                retryNavigation(retryCount + 1);
              }
            }, retryDelay);
          };
        
          retryNavigation();
        };
        
        return;
      }
      
      handleNotificationNavigation(data, user);
    });
    const handleNotificationNavigation = (data: any, user: any) => {
      try {
        console.log('🔔 알림 네비게이션 시작:', { data, userType: user?.userType });
        
        // Validate required data
        if (!data?.type) {
          console.log('❌ 알림 타입이 없음');
          return;
        }
        
        // Chat messages don't require applicationId
        if (data.type !== 'chat_message' && !data?.applicationId) {
          console.log('❌ applicationId 없음 (chat_message가 아닌 알림)');
          return;
        }
        
        if (!user?.userType) {
          console.log('❌ 사용자 타입 없음');
          return;
        }
        
        // Navigate based on notification type with proper route replacement
        let targetRoute = null;
        
        if (data.type === 'new_application') {
          if (user.userType === 'company') {
            if (data.jobPostingId) {
              targetRoute = `/(pages)/(company)/posting-detail2?id=${data.jobPostingId}&tab=applicants`;
            } else {
              targetRoute = '/(company)/myJobPostings';
            }
          }
          console.log('📋 새로운 지원 알림:', { targetRoute, jobPostingId: data.jobPostingId });
        }
        else if (data.type === 'chat_message') {
          // Navigate to chat room when chat notification is tapped
          if (data.roomId) {
            targetRoute = `/(pages)/chat/${data.roomId}?fromNotification=true`;
          }
          console.log('💬 채팅 메시지 알림:', { roomId: data.roomId, targetRoute });
        }
        else {
          console.log('❓ 알 수 없는 알림 타입:', data.type);
          return;
        }
        
        if (targetRoute) {
          console.log('🚀 네비게이션 시작:', targetRoute);
          
          // Use a small delay to ensure the app is ready for navigation
          setTimeout(() => {
            try {
              router.replace(targetRoute as any);
              console.log('✅ 네비게이션 성공 (replace):', targetRoute);
            } catch (navError) {
              console.log('⚠️ replace 실패, push 시도:', navError);
              try {
                router.push(targetRoute as any);
                console.log('✅ 네비게이션 성공 (push):', targetRoute);
              } catch (pushError) {
                console.log('❌ push도 실패:', pushError);
              }
            }
          }, 100);
        } else {
          console.log('❌ targetRoute가 null');
        }
      } catch (error) {
        console.log('❌ 알림 네비게이션 에러:', error);
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
      if (!authContext.user || !authContext.user.userType) {
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
          if (!authContext.user?.userType) return;
          
          let targetRoute = null;
          
          console.log('🔄 초기 알림 처리:', { type: data.type, roomId: data.roomId, userType: authContext.user.userType });
          
          if (data.type === 'chat_message' && data.roomId) {
            targetRoute = `/(pages)/chat/${data.roomId}?fromNotification=true`;
          } else if (data.type === 'new_application') {
            if (authContext.user.userType === 'company') {
              if (data.jobPostingId) {
                targetRoute = `/(pages)/(company)/posting-detail2?id=${data.jobPostingId}&tab=applicants`;
              } else {
                targetRoute = '/(company)/myJobPostings';
              }
            }
          }
          
          console.log('🎯 초기 알림 타겟 라우트:', targetRoute);
          
          if (targetRoute) {
            setTimeout(() => {
              try {
                console.log('🚀 초기 알림 네비게이션 (replace):', targetRoute);
                router.replace(targetRoute as any);
              } catch (navError) {
                try {
                  console.log('🚀 초기 알림 네비게이션 (push):', targetRoute);
                  router.push(targetRoute as any);
                } catch (pushError) {
                  console.error('❌ 초기 알림 라우팅 실패:', pushError);
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
    if (authContext.user && authContext.user.userType) {
      checkInitialNotification();
    }
  }, [authContext.user]);

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