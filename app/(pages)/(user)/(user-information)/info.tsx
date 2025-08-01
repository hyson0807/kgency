import {View, Text, ScrollView, TouchableOpacity} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useUserKeywords} from "@/hooks/useUserKeywords";
import {useProfile} from "@/hooks/useProfile";
import LoadingScreen from "@/components/common/LoadingScreen";
import WorkConditionsSelector from "@/components/WorkConditionsSelector";
import JobPreferencesSelector from "@/components/JobPreferencesSelector";
import { useKeywordSelection } from '@/hooks/useKeywordSelection';
import { router } from 'expo-router';
import Back from "@/components/back";
import {useModal} from "@/hooks/useModal";
import { useTranslation } from "@/contexts/TranslationContext"
import { KeywordMapper } from '@/utils/keywordMapper';
import {Profile} from "@/components/user_keyword(info)/Profile";
import {LocationSelector} from "@/components/user_keyword(info)/Location";
import {Country} from "@/components/user_keyword(info)/Country";
import {CareerInformation} from "@/components/user_keyword(info)/CareerInformation";

const Info = () => {
    const {profile, updateProfile} = useProfile();
    const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
    const [selectedMoveable, setSelectedMoveable] = useState<number | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
    const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<number[]>([]);
    const { keywords, user_keywords, loading, fetchKeywords, updateKeywords } = useUserKeywords();
    const { showModal, ModalComponent } = useModal();
    const { t } = useTranslation()

    // 프로필 정보 상태
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<string | null>(null);
    const [visa, setVisa] = useState<string | null>(null);
    const [koreanLevel, setKoreanLevel] = useState<string | null>(null);

    // 경력 정보 상태
    const [howLong, setHowLong] = useState<string | null>(null);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
    const [experience, setExperience] = useState<string | null>(null);
    const [experienceContent, setExperienceContent] = useState('');



    const moveableKeyword = keywords.find(k => k.category === '지역이동');
    const jobKeywords = keywords.filter(k => k.category === '직종');
    const conditionKeywords = keywords.filter(k => k.category === '근무조건');


    // 프로필 정보 로드
    useEffect(() => {
        if (profile) {
            setName(profile.name || '');

            if (profile.user_info) {
                setAge(profile.user_info.age?.toString() || '');
                setGender(profile.user_info.gender || null);
                setVisa(profile.user_info.visa || null);
                setKoreanLevel(profile.user_info.korean_level || null);
                
                // 경력 정보 로드
                setHowLong(profile.user_info.how_long || null);
                setExperience(profile.user_info.experience || null);
                setExperienceContent(profile.user_info.experience_content || '');
                
                // 희망 근무일/시간 정보 로드
                setSelectedDays(profile.user_info.preferred_days || []);
                setSelectedTimes(profile.user_info.preferred_times || []);
            }
        }
    }, [profile]);

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

            // 지역 - 다중 선택으로 변경
            const existingLocations = user_keywords
                .filter(uk => uk.keyword && uk.keyword.category === '지역')
                .map(uk => uk.keyword_id);
            setSelectedLocations(existingLocations);

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

        }
    }, [user_keywords, moveableKeyword]);

    // KeywordMapper 인스턴스 생성
    const keywordMapper = new KeywordMapper(keywords);

    // useKeywordSelection 훅을 사용한 키워드 선택 로직
    const { handleToggle: toggleJob } = useKeywordSelection({
        keywords: jobKeywords,
        selectedIds: selectedJobs,
        onSelectionChange: setSelectedJobs
    })

    const { handleToggle: toggleCondition } = useKeywordSelection({
        keywords: conditionKeywords,
        selectedIds: selectedConditions,
        onSelectionChange: setSelectedConditions
    })


    // 경력 정보 핸들러들
    const toggleDay = (day: string) => {
        setSelectedDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const toggleTime = (time: string) => {
        setSelectedTimes(prev =>
            prev.includes(time)
                ? prev.filter(t => t !== time)
                : [...prev, time]
        );
    };



    const handleSaveAndNext = async () => {
        // 프로필 정보 필수 입력 확인
        if (!name || !age || !gender || !visa || !koreanLevel) {
            showModal(t('alert.notification', '알림'), t('info.fill_all_profile', '모든 프로필 정보를 입력해주세요'));
            return;
        }

        // 나이 유효성 검사
        const ageNum = parseInt(age);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
            showModal(t('alert.notification', '알림'), t('info.invalid_age', '올바른 나이를 입력해주세요'));
            return;
        }

        // 국가 선택 확인
        if (!selectedCountry) {
            showModal(t('alert.notification', '알림'), t('info.select_country_required', '국가를 선택해주세요'))
            return;
        }

        try {
            // 1. 프로필 및 user_info 업데이트
            const profileUpdated = await updateProfile({
                profile: {
                    name: name,
                    onboarding_completed: true,
                },
                userInfo: {
                    age: ageNum,
                    gender: gender,
                    visa: visa,
                    korean_level: koreanLevel,
                    how_long: howLong,
                    experience: experience,
                    experience_content: experienceContent,
                    preferred_days: selectedDays,
                    preferred_times: selectedTimes
                }
            });

            if (!profileUpdated) {
                console.error('프로필 업데이트 실패');
                return;
            }

            // 2. 프로필 관련 키워드 ID 가져오기
            const ageKeywordId = keywordMapper.getAgeKeywordId(age);
            const genderKeywordId = keywordMapper.getGenderKeywordId(gender!);
            const visaKeywordId = keywordMapper.getVisaKeywordId(visa!);
            const koreanLevelKeywordId = keywordMapper.getKoreanLevelKeywordId(koreanLevel!);
            const preferredDayKeywordIds = keywordMapper.getPreferredDayKeywordIds(selectedDays);

            // 키워드 ID가 없는 경우 경고
            if (!ageKeywordId) {
                console.warn('나이대 키워드를 찾을 수 없습니다:', age);
            }
            if (!genderKeywordId) {
                console.warn('성별 키워드를 찾을 수 없습니다:', gender);
            }
            if (!visaKeywordId) {
                console.warn('비자 키워드를 찾을 수 없습니다:', visa);
            }
            if (!koreanLevelKeywordId) {
                console.warn('한국어수준 키워드를 찾을 수 없습니다:', koreanLevel);
            }

            // 3. 모든 선택된 키워드 ID 모으기
            const allSelectedKeywords = [
                ...selectedLocations,  // 다중 지역 선택
                selectedCountry,
                ...selectedJobs,
                ...selectedConditions,
                ...preferredDayKeywordIds,  // 경력정보에서 입력받은 희망근무요일
                ageKeywordId,
                genderKeywordId,
                visaKeywordId,
                koreanLevelKeywordId  // 한국어수준 추가
            ].filter((id): id is number => id !== null && id !== undefined);

            // 지역이동 가능이 선택되었으면 추가
            if (selectedMoveable) {
                allSelectedKeywords.push(selectedMoveable);
            }

            // 4. 키워드 업데이트
            const keywordsUpdated = await updateKeywords(allSelectedKeywords);

            if (keywordsUpdated) {
                router.replace('/(user)/home');
            } else {
                console.error('키워드 저장 실패');
                router.replace('/(user)/home');
            }
        } catch (error) {
            console.error('저장 실패:', error);
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
                    className="flex-1 bg-gray-50"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
                >


                    {/* 경력 정보 섹션 - onboarding 완료된 사용자에게만 표시 */}
                    {profile?.onboarding_completed && (


                        <CareerInformation
                            t={t}
                            formData={{
                                howLong,
                                selectedDays,
                                selectedTimes,
                                experience,
                                experienceContent
                            }}
                            handlers={{
                                setHowLong,
                                toggleDay,
                                setSelectedDays,
                                toggleTime,
                                setSelectedTimes,
                                setExperience,
                                setExperienceContent
                            }}
                        />
                    )}

                    {/* 프로필 정보 섹션 */}
                    <Profile
                        formData={{
                            name,
                            age,
                            gender,
                            visa,
                            koreanLevel,
                        }}
                        handler={{
                            setName,
                            setAge,
                            setGender,
                            setVisa,
                            setKoreanLevel,
                        }}
                        keywords={keywords}
                    />

                    {/* 지역 선택 섹션 */}
                    <LocationSelector
                        keywords={keywords}
                        selectedLocations={selectedLocations}
                        selectedMoveable={selectedMoveable}
                        onLocationChange={setSelectedLocations}
                        onMoveableToggle={setSelectedMoveable}
                    />


                    {/* 국가 선택 섹션 */}
                    <Country keywords={keywords} selectedCountry={selectedCountry} setSelectedCountry={setSelectedCountry} />

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

                </ScrollView>
                
                {/* 저장 버튼 - 고정 위치 */}
                <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 pb-8">
                    <TouchableOpacity
                        className="w-full bg-blue-500 items-center justify-center py-4 rounded-2xl shadow-sm"
                        onPress={handleSaveAndNext}
                    >
                        <Text className="font-semibold text-base text-white">{t('info.save', '저장하기')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <ModalComponent/>
        </SafeAreaView>
    )
}

export default Info