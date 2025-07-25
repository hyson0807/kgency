import {View, Text, ScrollView, TouchableOpacity} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useUserKeywords} from "@/hooks/useUserKeywords";
import {useProfile} from "@/hooks/useProfile";
import LoadingScreen from "@/components/common/LoadingScreen";
import WorkConditionsSelector from "@/components/WorkConditionsSelector";
import JobPreferencesSelector from "@/components/JobPreferencesSelector";
import { router } from 'expo-router';
import Back from "@/components/back";
import {useModal} from "@/hooks/useModal";
import { useTranslation } from "@/contexts/TranslationContext"
import {Profile} from "@/components/user_keyword(info)/Profile";
import {LocationSelector} from "@/components/user_keyword(info)/Location";
import {Country} from "@/components/user_keyword(info)/Country";
import {WorkdaySelector} from "@/components/user_keyword(info)/WorkdaySelector";

const Info = () => {
    const {profile, updateProfile} = useProfile();
    const [selectedLocations, setSelectedLocations] = useState<number[]>([]);
    const [selectedMoveable, setSelectedMoveable] = useState<number | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
    const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<number[]>([]);
    const [selectedWorkDays, setSelectedWorkDays] = useState<number[]>([]);
    const { keywords, user_keywords, loading, fetchKeywords, updateKeywords } = useUserKeywords();
    const { showModal, ModalComponent } = useModal();
    const { t } = useTranslation()

    // 프로필 정보 상태
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<string | null>(null);
    const [visa, setVisa] = useState<string | null>(null);
    const [koreanLevel, setKoreanLevel] = useState<string | null>(null);



    const moveableKeyword = keywords.find(k => k.category === '지역이동');
    const jobKeywords = keywords.filter(k => k.category === '직종');
    const conditionKeywords = keywords.filter(k => k.category === '근무조건');

    // 근무요일 정렬 함수
    const sortWorkDays = (a: any, b: any) => {
        const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
        const aIndex = dayOrder.indexOf(a.keyword);
        const bIndex = dayOrder.indexOf(b.keyword);
        return aIndex - bIndex;
    };

    const workDayKeywords = keywords
        .filter(k => k.category === '근무요일')
        .sort(sortWorkDays);

    // 프로필 정보 로드
    useEffect(() => {
        if (profile) {
            setName(profile.name || '');

            if (profile.user_info) {
                setAge(profile.user_info.age?.toString() || '');
                setGender(profile.user_info.gender || null);
                setVisa(profile.user_info.visa || null);
                setKoreanLevel(profile.user_info.korean_level || null);
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

            // 근무요일
            const existingWorkDays = user_keywords
                .filter(uk => uk.keyword && uk.keyword.category === '근무요일')
                .map(uk => uk.keyword_id);
            setSelectedWorkDays(existingWorkDays);
        }
    }, [user_keywords, moveableKeyword]);

    // 나이를 나이대 키워드 ID로 변환
    const getAgeKeywordId = (ageValue: string): number | null => {
        const ageNum = parseInt(ageValue);
        if (isNaN(ageNum)) return null;

        const ageKeyword = keywords.find(k => {
            if (k.category !== '나이대') return false;

            if (ageNum >= 20 && ageNum < 25 && k.keyword === '20-24세') return true;
            if (ageNum >= 25 && ageNum < 30 && k.keyword === '25-29세') return true;
            if (ageNum >= 30 && ageNum < 35 && k.keyword === '30-34세') return true;
            if (ageNum >= 35 && k.keyword === '35세 이상') return true;

            return false;
        });

        return ageKeyword?.id || null;
    };

    // 성별을 키워드 ID로 변환
    const getGenderKeywordId = (genderValue: string): number | null => {
        const genderKeyword = keywords.find(k =>
            k.category === '성별' && k.keyword === genderValue
        );
        return genderKeyword?.id || null;
    };

    // 비자를 키워드 ID로 변환
    const getVisaKeywordId = (visaValue: string): number | null => {
        const visaKeyword = keywords.find(k =>
            k.category === '비자' && k.keyword === visaValue
        );
        return visaKeyword?.id || null;
    };

    // 한국어수준을 키워드 ID로 변환
    const getKoreanLevelKeywordId = (koreanLevelValue: string): number | null => {
        const koreanLevelKeyword = keywords.find(k =>
            k.category === '한국어수준' && k.keyword === koreanLevelValue
        );
        return koreanLevelKeyword?.id || null;
    };

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

    // 근무요일 선택/해제 토글
    const toggleWorkDay = (workDayId: number) => {
        setSelectedWorkDays(prev =>
            prev.includes(workDayId)
                ? prev.filter(id => id !== workDayId)
                : [...prev, workDayId]
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
                    korean_level: koreanLevel
                }
            });

            if (!profileUpdated) {
                console.error('프로필 업데이트 실패');
                return;
            }

            // 2. 프로필 관련 키워드 ID 가져오기
            const ageKeywordId = getAgeKeywordId(age);
            const genderKeywordId = getGenderKeywordId(gender);
            const visaKeywordId = getVisaKeywordId(visa);
            const koreanLevelKeywordId = getKoreanLevelKeywordId(koreanLevel);

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
                ...selectedWorkDays,  // 근무요일 추가
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
                        }} />

                    {/* 지역 선택 섹션 */}
                    <LocationSelector
                        keywords={keywords}
                        selectedLocations={selectedLocations}
                        selectedMoveable={selectedMoveable}
                        onLocationChange={setSelectedLocations}
                        onMoveableToggle={setSelectedMoveable}
                    />

                    {/* 희망근무 요일 섹션 */}
                    <WorkdaySelector workDayKeywords={workDayKeywords} selectedWorkDays={selectedWorkDays} toggleWorkDay={toggleWorkDay} />

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