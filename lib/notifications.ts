import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { api } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: false,
    shouldShowList: false,
  }),
});

export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Check if we're on a physical device
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  // Check and request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  try {
    // Get the token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Push token:', token);
  } catch (error) {
    console.log('Error getting push token:', error);
  }

  // Android specific configuration
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

export async function savePushToken(userId: string, token: string): Promise<boolean> {
  try {
    const response = await api('PUT', '/api/profiles/push-token', { token });
    
    if (!response.success) {
      console.error('Error saving push token:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving push token:', error);
    return false;
  }
}

export async function removePushToken(userId: string): Promise<boolean> {
  try {
    const response = await api('DELETE', '/api/profiles/push-token');
    
    if (!response.success) {
      console.error('Error removing push token:', response.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error removing push token:', error);
    return false;
  }
}

// Notification response handler (when user taps on notification)
export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

// Notification received handler (when app receives notification)
export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(listener);
}