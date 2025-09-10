import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Back from '@/components/shared/common/back';
import { useTranslation } from '@/contexts/TranslationContext';
import { LocationSelector } from '@/components/user/profile/keywords/Location';
import { Country } from '@/components/user/profile/keywords/Country';
import JobPreferencesSelector from '@/components/shared/keyword/JobPreferencesSelector';
import WorkConditionsSelector from '@/components/shared/keyword/WorkConditionsSelector';
import { useUserInfoStore } from '@/stores/userInfoStore';
import { useProfile } from '@/lib/features/profile/hooks/useProfile';
import { useUserKeywords } from '@/lib/features/profile/hooks/useUserKeywords';
import { useKeywordSelection } from '@/lib/shared/ui/hooks/useKeywordSelection';
import { useModal } from '@/lib/shared/ui/hooks/useModal';
import { KeywordMapper } from "@/lib/features/jobs/keywords";
import LoadingScreen from '@/components/shared/common/LoadingScreen';
const OthersPage = () => {
  const { t } = useTranslation();
  const { profile, updateProfile } = useProfile();
  const { keywords, user_keywords, loading, fetchKeywords, updateKeywords } = useUserKeywords();
  const { showModal, ModalComponent } = useModal();
  const { 
    formData, 
    updateLocationInfo,
    updateJobConditions,
    updateField,
    previousStep,
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
    previousStep();
    router.back();
  };
  const handleSaveAndComplete = async () => {
    // 지역 선택 확인 (지역이동 가능을 선택하지 않은 경우 필수)
    if (!formData.selectedMoveable && formData.selectedLocations.length === 0) {
      showModal(
        t('alert.notification', '알림'), 
        t('info.select_location_required', '지역을 선택하거나 지역이동 가능을 선택해주세요')
      );
      return;
    }
    // 직종 선택 확인 (최소 1개 이상)
    if (formData.selectedJobs.length === 0) {
      showModal(
        t('alert.notification', '알림'), 
        t('info.select_job_required', '최소 하나 이상의 희망직종을 선택해주세요')
      );
      return;
    }
    // 국가 선택 확인
    if (!formData.selectedCountry) {
      showModal(
        t('alert.notification', '알림'), 
        t('info.select_country_required', '국가를 선택해주세요')
      );
      return;
    }
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
  // 현재 스텝 계산 (onboarding 여부에 따라)
  const displayStep = profile?.onboarding_completed ? '3/3' : '2/3';
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
                {t('user.preferences.title', '희망 조건 설정')}
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
          {/* 지역 선택 섹션 - 필수 */}
          <View>
            <View className="px-4 mb-2">
              <Text className="text-red-500 text-xs">* {t('common.required_select_location', '필수 선택 (지역 또는 지역이동 가능 선택)')}</Text>
            </View>
            <LocationSelector
              keywords={keywords}
              selectedLocations={formData.selectedLocations}
              selectedMoveable={formData.selectedMoveable}
              onLocationChange={(ids) => updateField('selectedLocations', ids)}
              onMoveableToggle={(id) => updateField('selectedMoveable', id)}
            />
          </View>
          {/* 국가 선택 섹션 - 필수 */}
          <View>
            <View className="px-4 mb-2">
              <Text className="text-red-500 text-xs">* {t('common.required_select', '필수 선택')}</Text>
            </View>
            <Country 
              keywords={keywords} 
              selectedCountry={formData.selectedCountry} 
              setSelectedCountry={(id) => updateField('selectedCountry', id)} 
            />
          </View>
          {/* 희망직종 섹션 - 필수 */}
          <View>
            <View className="px-4 mb-2">
              <Text className="text-red-500 text-xs">* {t('common.required_select_min_one', '필수 선택 (최소 1개)')}</Text>
            </View>
            <JobPreferencesSelector
              jobs={jobKeywords}
              selectedJobs={formData.selectedJobs}
              onToggle={toggleJob}
            />
          </View>
          {/* 근무조건 섹션 */}
          <WorkConditionsSelector
            conditions={conditionKeywords}
            selectedConditions={formData.selectedConditions}
            onToggle={toggleCondition}
          />
        </ScrollView>
        {/* 저장 버튼 - 고정 위치 */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-8">
          <TouchableOpacity
            className={`w-full items-center justify-center py-4 rounded-2xl shadow-sm ${
              (!formData.selectedMoveable && formData.selectedLocations.length === 0) || 
              formData.selectedJobs.length === 0 || 
              !formData.selectedCountry
                ? 'bg-gray-300'
                : 'bg-blue-500'
            }`}
            onPress={handleSaveAndComplete}
            disabled={
              (!formData.selectedMoveable && formData.selectedLocations.length === 0) || 
              formData.selectedJobs.length === 0 || 
              !formData.selectedCountry
            }
          >
            <Text className="font-semibold text-base text-white">
              {(!formData.selectedMoveable && formData.selectedLocations.length === 0) || 
               formData.selectedJobs.length === 0 || 
               !formData.selectedCountry
                ? t('common.select_required_items', '필수 항목을 선택해주세요')
                : t('info.save', '저장하기')
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ModalComponent />
    </SafeAreaView>
  );
};
export default OthersPage;