import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect } from "react";

export default function Index() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/start');
      } else if (user.userType === 'user') {
        router.replace('/(user)/home');
      } else if (user.userType === 'company') {
        router.replace('/(company)/home2');
      } else {
        console.log('⚠️ [Index] 알 수 없는 userType:', user.userType);
      }
    }
  }, [user, isLoading]);

  return <LoadingScreen />;
}