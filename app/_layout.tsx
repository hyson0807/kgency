import {Stack} from "expo-router";
import "./global.css"
import {AuthProvider} from "@/contexts/AuthContext";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {TranslationProvider} from "@/contexts/TranslationContext";

export default function RootLayout() {

  return (
      <TranslationProvider>
            <AuthProvider>
                <SafeAreaProvider>
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
