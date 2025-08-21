import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Back from '@/components/back';
import { useTranslation } from '@/contexts/TranslationContext';
import { Profile } from '@/components/user/profile/keywords/Profile';
import { useUserInfoStore } from '@/stores/userInfoStore';
import { useProfile } from '@/hooks/useProfile';
import { useUserKeywords } from '@/hooks/useUserKeywords';
import { useModal } from '@/hooks/useModal';
import LoadingScreen from '@/components/shared/common/LoadingScreen';
const ProfilePage = () => {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const { keywords, loading } = useUserKeywords();
  const { showModal, ModalComponent } = useModal();
  const { 
    formData, 
    updateProfileInfo, 
    updateField,
    currentStep,
    nextStep,
    previousStep 
  } = useUserInfoStore();
  // 프로필 정보 로드
  useEffect(() => {
    if (profile) {
      updateProfileInfo({
        name: profile.name || '',
        profileImageUrl: profile.profile_image_url || null
      });
      if (profile.user_info) {
        updateProfileInfo({
          age: profile.user_info.age?.toString() || '',
          gender: profile.user_info.gender || null,
          visa: profile.user_info.visa || null,
          koreanLevel: profile.user_info.korean_level || null
        });
      }
    }
  }, [profile]);
  const handleNext = () => {
    // 필수 입력 확인
    if (!formData.name || !formData.age || !formData.gender || !formData.visa || !formData.koreanLevel) {
      showModal(
        t('alert.notification', '알림'), 
        t('info.fill_all_profile', '모든 프로필 정보를 입력해주세요')
      );
      return;
    }
    // 나이 유효성 검사
    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
      showModal(
        t('alert.notification', '알림'), 
        t('info.invalid_age', '올바른 나이를 입력해주세요')
      );
      return;
    }
    nextStep();
    router.push('/(pages)/(user)/(user-information)/others');
  };
  const handleBack = () => {
    // onboarding이 완료된 사용자만 뒤로 갈 수 있음
    if (profile?.onboarding_completed) {
      previousStep();
      router.back();
    } else {
      router.back();
    }
  };
  // 현재 스텝 계산 (onboarding 여부에 따라)
  const displayStep = profile?.onboarding_completed ? '2/3' : '1/3';
  if (loading) return <LoadingScreen />;
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleBack}>
                <Back />
              </TouchableOpacity>
              <Text className="text-lg font-bold ml-4">
                {t('info.profile_title', '프로필 정보')}
              </Text>
            </View>
            <Text className="text-sm text-gray-500">{displayStep}</Text>
          </View>
        </View>
        <ScrollView
          className="flex-1 bg-gray-50"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        >
          <Profile
            formData={{
              name: formData.name,
              age: formData.age,
              gender: formData.gender,
              visa: formData.visa,
              koreanLevel: formData.koreanLevel,
              profileImageUrl: formData.profileImageUrl,
            }}
            handler={{
              setName: (value) => updateField('name', value),
              setAge: (value) => updateField('age', value),
              setGender: (value) => updateField('gender', value),
              setVisa: (value) => updateField('visa', value),
              setKoreanLevel: (value) => updateField('koreanLevel', value),
              setProfileImageUrl: (value) => updateField('profileImageUrl', value),
            }}
            keywords={keywords}
          />
        </ScrollView>
        {/* 버튼 영역 */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-8">
          <TouchableOpacity
            className="w-full bg-blue-500 items-center justify-center py-4 rounded-2xl shadow-sm"
            onPress={handleNext}
          >
            <Text className="font-semibold text-base text-white">
              {t('info.next', '다음')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ModalComponent />
    </SafeAreaView>
  );
};
export default ProfilePage;