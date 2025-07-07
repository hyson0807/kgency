import {Slot} from "expo-router";
import "./global.css"
import {AuthProvider} from "@/contexts/AuthContext";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {TranslationProvider} from "@/contexts/TranslationContext";

export default function RootLayout() {
  return (
      <TranslationProvider>
            <AuthProvider>
                <SafeAreaProvider>
                        <Slot/>
                </SafeAreaProvider>
            </AuthProvider>
      </TranslationProvider>

  )
}
