import {Stack} from "expo-router";
import "./global.css"
import {AuthProvider} from "@/contexts/AuthContext";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {TranslationProvider} from "@/contexts/TranslationContext";
import {NotificationProvider} from "@/contexts/NotificationContext";
import {TabBarProvider} from "@/contexts/TabBarContext";
import {UpdateManager} from "@/components/shared/update-manager";
import {AppInitializer} from "@/components/app-initializer/AppInitializer";

export default function RootLayout() {
  return (
      <UpdateManager>
          <TranslationProvider>
                <AuthProvider>
                    <AppInitializer>
                        <NotificationProvider>
                            <TabBarProvider>
                                <SafeAreaProvider>
                                    <Stack
                                        screenOptions={{
                                            headerShown: false, // ✅ 헤더 숨김
                                        }}
                                    />
                                </SafeAreaProvider>
                            </TabBarProvider>
                        </NotificationProvider>
                    </AppInitializer>
                </AuthProvider>
          </TranslationProvider>
      </UpdateManager>
  )
}
