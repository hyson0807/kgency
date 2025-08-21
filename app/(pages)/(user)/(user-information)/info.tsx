import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { useProfile } from '@/hooks/useProfile';
import { useUserInfoStore } from '@/stores/userInfoStore';
import LoadingScreen from '@/components/shared/common/LoadingScreen';
const Info = () => {
    const { profile, loading } = useProfile();
    const { resetForm, setCurrentStep } = useUserInfoStore();
    useEffect(() => {
        if (!loading && profile) {
            // 폼 초기화 및 적절한 페이지로 리다이렉트
            resetForm();
            
            // onboarding이 완료된 사용자는 경력 정보 페이지로
            if (profile.onboarding_completed) {
                setCurrentStep(1);
                router.replace('/(pages)/(user)/(user-information)/career');
            } else {
                // onboarding이 완료되지 않은 사용자는 프로필 페이지로
                setCurrentStep(1);
                router.replace('/(pages)/(user)/(user-information)/profile');
            }
        }
    }, [profile, loading]);
    // 로딩 중이거나 리다이렉트 대기 중
    return <LoadingScreen />;
};
export default Info;