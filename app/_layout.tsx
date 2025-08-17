import {Stack} from "expo-router";
import "./global.css"
import {AuthProvider} from "@/contexts/AuthContext";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {TranslationProvider} from "@/contexts/TranslationContext";
import {NotificationProvider} from "@/contexts/NotificationContext";
import {TabBarProvider} from "@/contexts/TabBarContext";

export default function RootLayout() {

  return (
      <TranslationProvider>
            <AuthProvider>
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
            </AuthProvider>
      </TranslationProvider>

  )
}
