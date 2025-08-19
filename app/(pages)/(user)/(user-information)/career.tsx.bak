import { View, Text, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { router } from 'expo-router';
import Back from '@/components/back';
import { useTranslation } from '@/contexts/TranslationContext';
import { CareerInformation } from '@/components/user_keyword(info)/CareerInformation';
import { useUserInfoStore } from '@/stores/userInfoStore';
import { useProfile } from '@/hooks/useProfile';
import LoadingScreen from '@/components/common/LoadingScreen';

const CareerPage = () => {
  const { t } = useTranslation();
  const { profile } = useProfile();
  const { 
    formData, 
    updateCareerInfo, 
    updateField,
    nextStep 
  } = useUserInfoStore();

  // 프로필 정보에서 경력 정보 로드
  useEffect(() => {
    if (profile?.user_info) {
      updateCareerInfo({
        howLong: profile.user_info.how_long || null,
        experience: profile.user_info.experience || null,
        experienceContent: profile.user_info.experience_content || '',
        selectedDays: profile.user_info.preferred_days || [],
        selectedTimes: profile.user_info.preferred_times || []
      });
    }
  }, [profile]);

  const toggleDay = (day: string) => {
    const newDays = formData.selectedDays.includes(day)
      ? formData.selectedDays.filter(d => d !== day)
      : [...formData.selectedDays, day];
    updateField('selectedDays', newDays);
  };

  const toggleTime = (time: string) => {
    const newTimes = formData.selectedTimes.includes(time)
      ? formData.selectedTimes.filter(t => t !== time)
      : [...formData.selectedTimes, time];
    updateField('selectedTimes', newTimes);
  };

  const handleNext = () => {
    nextStep();
    router.push('/(pages)/(user)/(user-information)/profile');
  };

  const handleSkip = () => {
    // 경력 정보를 비우고 다음 단계로
    updateCareerInfo({
      howLong: null,
      selectedDays: [],
      selectedTimes: [],
      experience: null,
      experienceContent: ''
    });
    nextStep();
    router.push('/(pages)/(user)/(user-information)/profile');
  };

  if (!profile) return <LoadingScreen />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Back />
              <Text className="text-lg font-bold ml-4">
                {t('info.career_title', '경력 정보 입력')}
              </Text>
            </View>
            <Text className="text-sm text-gray-500">1/3</Text>
          </View>
        </View>

        <KeyboardAwareScrollView
          className="flex-1 bg-gray-50"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={100}
          enableOnAndroid={true}
          enableAutomaticScroll={true}
          keyboardOpeningTime={0}
        >
          <CareerInformation
            t={t}
            formData={{
              howLong: formData.howLong,
              selectedDays: formData.selectedDays,
              selectedTimes: formData.selectedTimes,
              experience: formData.experience,
              experienceContent: formData.experienceContent
            }}
            handlers={{
              setHowLong: (value) => updateField('howLong', value),
              toggleDay,
              setSelectedDays: (value) => updateField('selectedDays', value),
              toggleTime,
              setSelectedTimes: (value) => updateField('selectedTimes', value),
              setExperience: (value) => updateField('experience', value),
              setExperienceContent: (value) => updateField('experienceContent', value)
            }}
          />
        </KeyboardAwareScrollView>

        {/* 버튼 영역 - flex 사용 */}
        <View className="bg-white border-t border-gray-200 px-4 py-4 pb-8">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-gray-200 items-center justify-center py-4 rounded-2xl"
              onPress={handleSkip}
            >
              <Text className="font-semibold text-base text-gray-600">
                {t('info.skip', '건너뛰기')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-500 items-center justify-center py-4 rounded-2xl shadow-sm"
              onPress={handleNext}
            >
              <Text className="font-semibold text-base text-white">
                {t('info.next', '다음')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CareerPage;