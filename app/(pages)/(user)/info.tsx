import {View, Text, ScrollView, TouchableOpacity} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useUserKeywords} from "@/hooks/useUserKeywords";
import {useProfile} from "@/hooks/useProfile";
import LoadingScreen from "@/components/LoadingScreen";
import WorkConditionsSelector from "@/components/WorkConditionsSelector";
import JobPreferencesSelector from "@/components/JobPreferencesSelector";
import { Dropdown } from 'react-native-element-dropdown';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Back from "@/components/back";
import {useModal} from "@/hooks/useModal";
import { useTranslation } from "@/contexts/TranslationContext"

const Info = () => {
    const {updateProfile} = useProfile();
    const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
    const [selectedMoveable, setSelectedMoveable] = useState<number | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
    const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<number[]>([]);
    const { keywords, user_keywords, loading, fetchKeywords, updateKeywords } = useUserKeywords();
    const { showModal, hideModal, ModalComponent } = useModal();
    const { t } = useTranslation()

    // 카테고리별 키워드 필터링
    const locationOptions = [
        // "상관없음" 옵션을 첫 번째로 추가
        {
            label: t('info.location_no_preference', '상관없음'),
            value: null
        },
        ...keywords
            .filter(k => k.category === '지역')
            .map(location => ({
                label: location.keyword,
                value: location.id,
            }))
    ];

    const countryOptions = keywords
        .filter(k => k.category === '국가')
        .map(country => ({
            label: country.keyword,
            value: country.id
        }));

    // 지역이동 가능 키워드 찾기 (단일 키워드)
    const moveableKeyword = keywords.find(k => k.category === '지역이동');
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
            if(existingMoveable && moveableKeyword) {
                setSelectedMoveable(existingMoveable.keyword_id);
            }

            // 지역
            const existingLocation = user_keywords.find(uk =>
                uk.keyword && uk.keyword.category === '지역'
            );
            if(existingLocation) {
                setSelectedLocation(existingLocation.keyword_id);
            }

            // 국가
            const existingCountry = user_keywords.find(uk =>
                uk.keyword && uk.keyword.category === '국가'
            );
            if (existingCountry) {
                setSelectedCountry(existingCountry.keyword_id);
            }

            // 직종
            const existingJobs = user_keywords
                .filter(uk => uk.keyword && uk.keyword.category === '직종')
                .map(uk => uk.keyword_id);
            setSelectedJobs(existingJobs);

            // 근무조건
            const existingConditions = user_keywords
                .filter(uk => uk.keyword && uk.keyword.category === '근무조건')
                .map(uk => uk.keyword_id);
            setSelectedConditions(existingConditions);
        } else {
            // 기존 키워드가 없으면 "상관없음"을 기본값으로 설정
            setSelectedLocation(null);
        }
    }, [user_keywords, moveableKeyword]);

    // 직종 선택/해제 토글
    const toggleJob = (jobId: number) => {
        setSelectedJobs(prev =>
            prev.includes(jobId)
                ? prev.filter(id => id !== jobId)
                : [...prev, jobId]
        );
    };

    // 근무조건 선택/해제 토글
    const toggleCondition = (conditionId: number) => {
        setSelectedConditions(prev =>
            prev.includes(conditionId)
                ? prev.filter(id => id !== conditionId)
                : [...prev, conditionId]
        );
    };

    // 지역이동 가능 토글
    const toggleMoveable = () => {
        if (moveableKeyword) {
            if (selectedMoveable === moveableKeyword.id) {
                setSelectedMoveable(null);
            } else {
                setSelectedMoveable(moveableKeyword.id);
            }
        }
    };

    const handleSaveAndNext = async () => {
        // 국가 선택 확인 (지역은 "상관없음"이 기본값이므로 체크하지 않음)
        if (!selectedCountry) {
            showModal(t('alert.notification', '알림'), t('info.select_country_required', '국가를 선택해주세요'))
            return;
        }

        try {
            // 1. 프로필 업데이트 (온보딩 상태만)
            const profileUpdated = await updateProfile({
                profile: {
                    onboarding_completed: true
                }
            });

            if (!profileUpdated) {
                // Alert 제거하고 콘솔 로그만 남김
                console.error('프로필 업데이트 실패');
                return;
            }

            // 2. 모든 선택된 키워드 ID 모으기
            const allSelectedKeywords = [
                // selectedLocation이 null이면 포함하지 않음
                ...(selectedLocation !== null ? [selectedLocation] : []),
                selectedCountry,
                ...selectedJobs,
                ...selectedConditions
            ].filter(Boolean); // null 값 제거

            // 지역이동 가능이 선택되었으면 추가
            if (selectedMoveable) {
                allSelectedKeywords.push(selectedMoveable);
            }

            // 3. 키워드 업데이트
            const keywordsUpdated = await updateKeywords(allSelectedKeywords);

            if (keywordsUpdated) {
                // 성공 메시지 없이 바로 페이지 이동
                router.replace('/(user)/home');
            } else {
                // 실패해도 그냥 페이지 이동
                console.error('키워드 저장 실패');
                router.replace('/(user)/home');
            }
        } catch (error) {
            console.error('저장 실패:', error);
            // 에러가 나도 페이지 이동
            router.replace('/(user)/home');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
                <View className="p-4 border-b border-gray-200">
                    <View className="flex-row items-center">
                        <Back/>
                        <Text className="text-lg font-bold ml-4">{t('info.title', '희망 조건 설정')}</Text>
                    </View>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {/* 지역 선택 섹션 */}
                    <View className="p-4">
                        <Text className="text-base font-semibold mb-3">{t('info.desired_location', '희망 근무 지역')}</Text>
                        <View className="p-3 bg-gray-50 rounded-xl">
                            <Dropdown
                                style={{
                                    height: 45,
                                    borderColor: '#d1d5db',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                    backgroundColor: 'white',
                                }}
                                placeholderStyle={{
                                    fontSize: 14,
                                    color: '#9ca3af'
                                }}
                                selectedTextStyle={{
                                    fontSize: 14,
                                }}
                                inputSearchStyle={{
                                    height: 40,
                                    fontSize: 14,
                                }}
                                iconStyle={{
                                    width: 20,
                                    height: 20,
                                }}
                                data={locationOptions}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={t('info.location_no_preference', '선호지역 없음')}
                                searchPlaceholder={t('info.search', '검색...')}
                                value={selectedLocation}
                                onChange={item => {
                                    setSelectedLocation(item.value);
                                }}
                            />

                            {/* 지역이동 가능 토글 - 상관없음을 선택해도 표시 */}
                            {moveableKeyword && (
                                <TouchableOpacity
                                    onPress={toggleMoveable}
                                    className="mt-3 flex-row items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                >
                                    <Text className="text-sm text-gray-700">
                                        {moveableKeyword.keyword}
                                    </Text>
                                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                                        selectedMoveable === moveableKeyword.id
                                            ? 'bg-blue-500 border-blue-500'
                                            : 'bg-white border-gray-300'
                                    }`}>
                                        {selectedMoveable === moveableKeyword.id && (
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* 국가 선택 섹션 */}
                    <View className="p-4">
                        <Text className="text-base font-semibold mb-3">{t('info.country', '국가')}</Text>
                        <View className="p-3 bg-gray-50 rounded-xl">
                            <Dropdown
                                style={{
                                    height: 45,
                                    borderColor: '#d1d5db',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                    backgroundColor: 'white',
                                }}
                                placeholderStyle={{
                                    fontSize: 14,
                                    color: '#9ca3af'
                                }}
                                selectedTextStyle={{
                                    fontSize: 14,
                                }}
                                inputSearchStyle={{
                                    height: 40,
                                    fontSize: 14,
                                }}
                                iconStyle={{
                                    width: 20,
                                    height: 20,
                                }}
                                data={countryOptions}
                                search
                                maxHeight={300}
                                labelField="label"
                                valueField="value"
                                placeholder={t('info.select_country', '국가를 선택하세요')}
                                searchPlaceholder={t('info.search', '검색...')}
                                value={selectedCountry}
                                onChange={item => {
                                    setSelectedCountry(item.value);
                                }}
                            />
                        </View>
                    </View>

                    {/* 희망직종 섹션 */}
                    <JobPreferencesSelector
                        jobs={jobKeywords}
                        selectedJobs={selectedJobs}
                        onToggle={toggleJob}
                    />

                    {/* 근무조건 섹션 */}
                    <WorkConditionsSelector
                        conditions={conditionKeywords}
                        selectedConditions={selectedConditions}
                        onToggle={toggleCondition}
                    />

                    {/* 저장 버튼 */}
                    <View className="p-4">
                        <TouchableOpacity
                            className="w-full bg-blue-500 items-center justify-center py-3 rounded-xl"
                            onPress={handleSaveAndNext}
                        >
                            <Text className="font-semibold text-base text-white">{t('info.save', '저장하기')}</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
            <ModalComponent/>

        </SafeAreaView>
    )
}

export default Info