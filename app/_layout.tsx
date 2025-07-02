import {Slot} from "expo-router";
import "./global.css"
import {AuthProvider} from "@/contexts/AuthContext";
import {SafeAreaProvider} from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <AuthProvider>
        <SafeAreaProvider>
            <Slot/>
        </SafeAreaProvider>
    </AuthProvider>
  )
}
