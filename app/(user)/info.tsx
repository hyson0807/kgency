import {View, Text, ScrollView, TextInput, Switch, TouchableOpacity, Alert} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useAuth} from "@/contexts/AuthContext";
import {useUserKeywords} from "@/hooks/useUserKeywords";
import {useProfile} from "@/hooks/useProfile";
import LoadingScreen from "@/components/LoadingScreen";
import WorkConditionsSelector from "@/components/WorkConditionsSelector";
import JobPreferencesSelector from "@/components/JobPreferencesSelector";
import { Dropdown } from 'react-native-element-dropdown';
import { router } from 'expo-router';

const Info = () => {
    const {logout} = useAuth();
    const {profile, updateProfile} = useProfile();
    const [address, setAddress] = useState('');
    const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
    const [isLocationFlexible, setIsLocationFlexible] = useState(false);
    const [selectedJobs, setSelectedJobs] = useState<number[]>([]);
    const [selectedConditions, setSelectedConditions] = useState<number[]>([]);

    const { keywords, user_keywords, loading, fetchKeywords, updateKeywords } = useUserKeywords();

    // 카테고리별 키워드 필터링
    const countryOptions = keywords
        .filter(k => k.category === '국가')
        .map(country => ({
            label: country.keyword,
            value: country.id
        }));

    const jobKeywords = keywords.filter(k => k.category === '직종');
    const conditionKeywords = keywords.filter(k => k.category === '근무조건');

    // 프로필이 로드되면 주소 설정
    useEffect(() => {
        if (profile?.address) {
            setAddress(profile.address);
        }
    }, [profile]);

    // 컴포넌트 마운트 시 키워드 목록 가져오기
    useEffect(() => {
        fetchKeywords();
    }, []);

    // 기존에 선택된 키워드들 설정
    useEffect(() => {
        if (user_keywords.length > 0) {
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
    }, [user_keywords]);

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

    const handleSaveAndNext = async () => {
        // 국가 선택 확인
        if (!selectedCountry) {
            Alert.alert('알림', '국가를 선택해주세요.');
            return;
        }

        // 주소 입력 확인
        if (!address.trim()) {
            Alert.alert('알림', '거주지를 입력해주세요.');
            return;
        }

        try {
            // 1. 프로필 업데이트 (주소)
            const profileUpdated = await updateProfile({
                address,
                onboarding_completed: true
            });

            if (!profileUpdated) {
                Alert.alert('오류', '프로필 업데이트에 실패했습니다.');
                return;
            }

            // 2. 모든 선택된 키워드 ID 모으기
            const allSelectedKeywords = [
                selectedCountry,
                ...selectedJobs,
                ...selectedConditions
            ];

            // 3. 키워드 업데이트
            const keywordsUpdated = await updateKeywords(allSelectedKeywords);

            if (keywordsUpdated) {
                Alert.alert('성공', '정보가 저장되었습니다!', [
                    {
                        text: '확인',
                        onPress: () => router.replace('/(user)/home')
                    }
                ]);
            } else {
                Alert.alert('오류', '키워드 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('저장 실패:', error);
            Alert.alert('오류', '저장 중 문제가 발생했습니다.');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
                <View className="w-full bg-purple-600 p-6">
                    <Text className="text-3xl font-bold text-white">원하는 조건을 선택해 주세요</Text>
                    <Text className="text-xl text-white mt-2">중요한 것만 골라주세요</Text>
                </View>

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                >

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

                    {/* 거주지 & 이동 가능 섹션 */}
                    <View className="p-6">
                        <Text className="text-2xl font-bold mb-4">거주지 & 이동 가능</Text>
                        <View className="p-4 gap-4 bg-gray-50 rounded-xl">
                            <TextInput
                                className="w-full border-2 border-gray-300 p-4 rounded-xl bg-white"
                                placeholder="현재 거주지 입력(예: 서울 강남구)"
                                value={address}
                                onChangeText={setAddress}
                            />
                            <View className="flex-row items-center justify-between">
                                <Text className="text-lg">지역이동 가능</Text>
                                <Switch
                                    value={isLocationFlexible}
                                    onValueChange={setIsLocationFlexible}
                                />
                            </View>
                        </View>
                    </View>

                    {/* 국가 선택 섹션 */}
                    <View className="p-6">
                        <Text className="text-2xl font-bold mb-4">국가</Text>
                        <View className="p-4 bg-gray-50 rounded-xl">
                            <Dropdown
                                style={{
                                    height: 50,
                                    borderColor: '#d1d5db',
                                    borderWidth: 2,
                                    borderRadius: 12,
                                    paddingHorizontal: 16,
                                    backgroundColor: 'white',
                                }}
                                placeholderStyle={{
                                    fontSize: 16,
                                    color: '#9ca3af'
                                }}
                                selectedTextStyle={{
                                    fontSize: 16,
                                }}
                                inputSearchStyle={{
                                    height: 40,
                                    fontSize: 16,
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
                                placeholder="국가를 선택하세요"
                                searchPlaceholder="검색..."
                                value={selectedCountry}
                                onChange={item => {
                                    setSelectedCountry(item.value);
                                }}
                            />
                        </View>
                    </View>



                    {/* 저장 버튼 */}
                    <View className="p-6">
                        <TouchableOpacity
                            className="w-full bg-blue-500 items-center justify-center py-5 rounded-2xl"
                            onPress={handleSaveAndNext}
                        >
                            <Text className="font-bold text-xl text-white">매칭 일자리 보기</Text>
                        </TouchableOpacity>
                    </View>


                </ScrollView>
            </View>
        </SafeAreaView>
    )
}

export default Info