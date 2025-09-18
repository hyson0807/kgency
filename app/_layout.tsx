import {Stack} from "expo-router";
import "./global.css"
import {AuthProvider} from "@/contexts/AuthContext";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {TranslationProvider} from "@/contexts/TranslationContext";
import {NotificationProvider} from "@/contexts/NotificationContext";
import {TabBarProvider} from "@/contexts/TabBarContext";
import {ProfileProvider} from "@/contexts/ProfileContext";
import {UnreadMessageProvider} from "@/contexts/UnreadMessageContext";
import {UpdateManager} from "@/components/shared/update-manager";
import {AppBadgeManager} from "@/components/shared/AppBadgeManager";

export default function RootLayout() {
  return (
      <UpdateManager>
          <TranslationProvider>
                <AuthProvider>
                    <ProfileProvider>
                        <UnreadMessageProvider>
                            <NotificationProvider>
                                <TabBarProvider>
                                    <SafeAreaProvider>
                                        <AppBadgeManager />
                                        <Stack
                                            screenOptions={{
                                                headerShown: false, // ✅ 헤더 숨김
                                                gestureEnabled: false, // ✅ 스와이프 제스처 비활성화
                                            }}
                                        />
                                    </SafeAreaProvider>
                                </TabBarProvider>
                            </NotificationProvider>
                        </UnreadMessageProvider>
                    </ProfileProvider>
                </AuthProvider>
          </TranslationProvider>
      </UpdateManager>
  )
}
