import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/common/LoadingScreen";
import { useEffect, useState } from "react";

export default function Index() {
  const { user, isLoading } = useAuth();
  const [delayComplete, setDelayComplete] = useState(false);

  // Add a small delay to allow notification deep linking to take precedence
  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayComplete(true);
    }, 500); // 500ms delay to allow notification navigation to process first

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && delayComplete) {
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
  }, [user, isLoading, delayComplete]);

  return <LoadingScreen />;
}