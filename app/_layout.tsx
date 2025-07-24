import {Stack, router} from "expo-router";
import "./global.css"
import {AuthProvider, useAuth} from "@/contexts/AuthContext";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {TranslationProvider} from "@/contexts/TranslationContext";
import { useEffect, useRef } from "react";
import { addNotificationResponseReceivedListener, addNotificationReceivedListener } from "@/lib/notifications";
import * as Notifications from 'expo-notifications';

function NotificationHandler() {
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

  return null;
}

export default function RootLayout() {

  return (
      <TranslationProvider>
            <AuthProvider>
                <SafeAreaProvider>
                    <NotificationHandler />
                    <Stack
                        screenOptions={{
                            headerShown: false, // ✅ 헤더 숨김
                        }}
                    />
                </SafeAreaProvider>
            </AuthProvider>
      </TranslationProvider>

  )
}
