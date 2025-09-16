import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Back from '@/components/shared/common/back';
import { useTranslation } from '@/contexts/TranslationContext';
import { useUserInfoStore } from '@/stores/userInfoStore';
import { useProfile } from '@/lib/features/profile/hooks/useProfile';
import { useUserKeywords } from '@/lib/features/profile/hooks/useUserKeywords';
import { useKeywordSelection } from '@/lib/shared/ui/hooks/useKeywordSelection';
import { useModal } from '@/lib/shared/ui/hooks/useModal';
import { KeywordMapper } from "@/lib/features/jobs/keywords";
import LoadingScreen from '@/components/shared/common/LoadingScreen';

// Step Components
import LocationStep from '@/components/onboarding/LocationStep';
import CountryStep from '@/components/onboarding/CountryStep';
import JobStep from '@/components/onboarding/JobStep';
import WorkConditionStep from '@/components/onboarding/WorkConditionStep';

const OnboardingFunnel = () => {
  const { t } = useTranslation();
  const { profile, updateProfile } = useProfile();
  const { keywords, user_keywords, loading, fetchKeywords, updateKeywords } = useUserKeywords();
  const { showModal, ModalComponent } = useModal();

  // Local state for step management
  const [currentStep, setCurrentStep] = useState(1);

  const {
    formData,
    updateField,
    resetForm
  } = useUserInfoStore();

  const jobKeywords = keywords.filter(k => k.category === '직종');
  const conditionKeywords = keywords.filter(k => k.category === '근무조건');

  // 컴포넌트 마운트 시 키워드 목록 가져오기
  useEffect(() => {
    fetchKeywords();
  }, []);

  // 기존에 선택된 키워드들 설정
  useEffect(() => {
    if (user_keywords.length > 0) {
      // 지역이동 가능
      const existingMoveable = user_keywords.find(uk =>
        uk.keyword && uk.keyword.category === '지역이동'
      );
      if (existingMoveable) {
        updateField('selectedMoveable', existingMoveable.keyword_id);
      }

      // 지역 - 다중 선택
      const existingLocations = user_keywords
        .filter(uk => uk.keyword && uk.keyword.category === '지역')
        .map(uk => uk.keyword_id);
      updateField('selectedLocations', existingLocations);

      // 국가
      const existingCountry = user_keywords.find(uk =>
        uk.keyword && uk.keyword.category === '국가'
      );
      if (existingCountry) {
        updateField('selectedCountry', existingCountry.keyword_id);
      }

      // 직종
      const existingJobs = user_keywords
        .filter(uk => uk.keyword && uk.keyword.category === '직종')
        .map(uk => uk.keyword_id);
      updateField('selectedJobs', existingJobs);

      // 근무조건
      const existingConditions = user_keywords
        .filter(uk => uk.keyword && uk.keyword.category === '근무조건')
        .map(uk => uk.keyword_id);
      updateField('selectedConditions', existingConditions);
    }
  }, [user_keywords]);

  // useKeywordSelection 훅 사용
  const { handleToggle: toggleJob } = useKeywordSelection({
    keywords: jobKeywords,
    selectedIds: formData.selectedJobs,
    onSelectionChange: (ids) => updateField('selectedJobs', ids)
  });

  const { handleToggle: toggleCondition } = useKeywordSelection({
    keywords: conditionKeywords,
    selectedIds: formData.selectedConditions,
    onSelectionChange: (ids) => updateField('selectedConditions', ids)
  });

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleSaveAndComplete = async () => {
    try {
      // KeywordMapper 인스턴스 생성
      const keywordMapper = new KeywordMapper(keywords);

      // 1. 프로필 및 user_info 업데이트
      const profileUpdated = await updateProfile({
        profile: {
          name: formData.name,
          onboarding_completed: true,
        },
        userInfo: {
          age: parseInt(formData.age),
          gender: formData.gender || undefined,
          visa: formData.visa || undefined,
          korean_level: formData.koreanLevel || undefined,
          how_long: formData.howLong || undefined,
          experience: formData.experience || undefined,
          experience_content: formData.experienceContent,
          preferred_days: formData.selectedDays,
          preferred_times: formData.selectedTimes
        }
      });

      if (!profileUpdated) {
        return;
      }

      // 2. 프로필 관련 키워드 ID 가져오기
      const ageKeywordId = keywordMapper.getAgeKeywordId(formData.age);
      const genderKeywordId = formData.gender ? keywordMapper.getGenderKeywordId(formData.gender) : null;
      const visaKeywordId = formData.visa ? keywordMapper.getVisaKeywordId(formData.visa) : null;
      const koreanLevelKeywordId = formData.koreanLevel ? keywordMapper.getKoreanLevelKeywordId(formData.koreanLevel) : null;
      const preferredDayKeywordIds = keywordMapper.getPreferredDayKeywordIds(formData.selectedDays);

      // 3. 모든 선택된 키워드 ID 모으기
      const allSelectedKeywords = [
        ...formData.selectedLocations,
        formData.selectedCountry,
        ...formData.selectedJobs,
        ...formData.selectedConditions,
        ...preferredDayKeywordIds,
        ageKeywordId,
        genderKeywordId,
        visaKeywordId,
        koreanLevelKeywordId
      ].filter((id): id is number => id !== null && id !== undefined);

      // 지역이동 가능이 선택되었으면 추가
      if (formData.selectedMoveable) {
        allSelectedKeywords.push(formData.selectedMoveable);
      }

      // 4. 키워드 업데이트
      const keywordsUpdated = await updateKeywords(allSelectedKeywords);

      if (keywordsUpdated) {
        resetForm(); // 저장 후 폼 초기화
        router.replace('/(user)/home');
      } else {
        router.replace('/(user)/home');
      }
    } catch (error) {
      router.replace('/(user)/home');
    }
  };

  // Progress bar component
  const ProgressBar = () => {
    const totalSteps = 4;
    const progress = (currentStep / totalSteps) * 100;

    return (
      <View className="px-4 py-3 bg-white">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-medium text-gray-700">
            {currentStep === 1 && t('user.location.title', '희망 지역')}
            {currentStep === 2 && t('user.country.title', '국가 선택')}
            {currentStep === 3 && t('user.job.title', '희망 직종')}
            {currentStep === 4 && t('user.condition.title', '근무 조건')}
          </Text>
          <Text className="text-sm text-gray-500">{currentStep}/4</Text>
        </View>
        <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </View>
      </View>
    );
  };

  if (loading) return <LoadingScreen />;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1">
        {/* Header */}
        <View className="p-4 border-b border-gray-200">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleBack}>
              <Back />
            </TouchableOpacity>
            <Text className="text-lg font-bold ml-4">
              {t('user.preferences.title', '희망 조건 설정')}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <ProgressBar />

        {/* Content */}
        <ScrollView
          className="flex-1 bg-gray-50"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
        >
          {/* Step 1: Location */}
          {currentStep === 1 && (
            <LocationStep
              keywords={keywords}
              selectedLocations={formData.selectedLocations}
              selectedMoveable={formData.selectedMoveable}
              onLocationChange={(ids) => updateField('selectedLocations', ids)}
              onMoveableToggle={(id) => updateField('selectedMoveable', id)}
              onNext={handleNext}
            />
          )}

          {/* Step 2: Country */}
          {currentStep === 2 && (
            <CountryStep
              keywords={keywords}
              selectedCountry={formData.selectedCountry}
              setSelectedCountry={(id) => updateField('selectedCountry', id)}
              onNext={handleNext}
              onBack={() => setCurrentStep(1)}
            />
          )}

          {/* Step 3: Job */}
          {currentStep === 3 && (
            <JobStep
              jobs={jobKeywords}
              selectedJobs={formData.selectedJobs}
              onToggle={toggleJob}
              onNext={handleNext}
              onBack={() => setCurrentStep(2)}
            />
          )}

          {/* Step 4: Work Conditions */}
          {currentStep === 4 && (
            <WorkConditionStep
              conditions={conditionKeywords}
              selectedConditions={formData.selectedConditions}
              onToggle={toggleCondition}
              onComplete={handleSaveAndComplete}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </ScrollView>
      </View>
      <ModalComponent />
    </SafeAreaView>
  );
};

export default OnboardingFunnel;