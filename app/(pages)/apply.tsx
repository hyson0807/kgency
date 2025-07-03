import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { Dropdown } from 'react-native-element-dropdown'
import Back from '@/components/back'
import { useProfile } from '@/hooks/useProfile'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import LoadingScreen from '@/components/LoadingScreen'


// Apply 페이지 상단에 타입 정의 추가
interface UserInfoUpdate {
    age?: number;
    gender?: string;
    visa?: string;
    how_long?: string;
    experience?: string;
    korean_level?: string;
    nationality?: string;
    visa_expiry_date?: string;
    education?: string;
    has_car?: boolean;
    has_license?: boolean;
}


export default function Apply() {
    const params = useLocalSearchParams();
    const { companyId, companyName, companyPhone } = params;
    const { profile, updateProfile, loading: profileLoading } = useProfile();
    const { authenticatedRequest } = useAuth();

    // 폼 상태
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<string | null>(null);
    const [visa, setVisa] = useState<string | null>(null);
    const [howLong, setHowLong] = useState('');
    const [experience, setExperience] = useState('');
    const [koreanLevel, setKoreanLevel] = useState<string | null>(null);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);


    // 2. 중복 지원 확인 useEffect (주석 해제하고 수정)
    useEffect(() => {
        const checkExistingApplication = async () => {
            if (profile?.id && companyId) {
                try {
                    const { data, error } = await supabase
                        .from('applications')
                        .select('id')
                        .eq('user_id', profile.id)
                        .eq('company_id', companyId)
                        .maybeSingle(); // single() 대신 maybeSingle() 사용

                    if (error && error.code !== 'PGRST116') {
                        console.error('지원 내역 확인 오류:', error);
                    }

                    setHasApplied(!!data);
                } catch (error) {
                    console.error('지원 내역 확인 실패:', error);
                }
            }
        };

        checkExistingApplication();
    }, [profile?.id, companyId]);

    // 드롭다운 옵션들
    const genderOptions = [
        { label: '남성', value: '남성' },
        { label: '여성', value: '여성' },
    ];

    const visaOptions = [
        { label: 'E-9 (비전문취업)', value: 'E-9' },
        { label: 'H-2 (방문취업)', value: 'H-2' },
        { label: 'F-4 (재외동포)', value: 'F-4' },
        { label: 'F-5 (영주)', value: 'F-5' },
        { label: 'F-6 (결혼이민)', value: 'F-6' },
        { label: 'D-2 (유학)', value: 'D-2' },
    ];

    const koreanLevelOptions = [
        { label: '상 (일상대화 및 업무 가능)', value: '상' },
        { label: '중 (일상대화 가능)', value: '중' },
        { label: '하 (간단한 대화 가능)', value: '하' },
        { label: '불가', value: '불가' },
    ];

    const workPeriodOptions = [
        { label: '3개월', value: '3개월' },
        { label: '6개월', value: '6개월' },
        { label: '1년', value: '1년' },
        { label: '장기근무', value: '장기' },
    ];

    const experienceOptions = [
        { label: '처음', value: '처음' },
        { label: '6개월', value: '6개월' },
        { label: '1년', value: '1년' },
        { label: '3년이상', value: '3년이상' },
    ]

    // 프로필 정보로 폼 초기화
    useEffect(() => {
        if (profile) {
            setName(profile.name || '');

            if (profile.user_info) {
                setAge(profile.user_info.age?.toString() || '');
                setGender(profile.user_info.gender || null);
                setVisa(profile.user_info.visa || null);
                setHowLong(profile.user_info.how_long || '');
                setExperience(profile.user_info.experience || '');
                setKoreanLevel(profile.user_info.korean_level || null);
            }
        }
    }, [profile]);

    // 3. handleSubmit 함수 수정
    const handleSubmit = async () => {
        // 중복 지원 체크
        if (hasApplied) {
            Alert.alert(
                '이미 지원한 회사',
                '이 회사에는 이미 지원하셨습니다. 그래도 이력서를 다시 작성하시겠습니까?',
                [
                    { text: '취소', style: 'cancel' },
                    {
                        text: '계속하기',
                        onPress: () => proceedToResume()
                    }
                ]
            );
            return;
        }

        // 유효성 검사
        if (!name || !age || !gender || !visa || !koreanLevel || !howLong || !experience) {
            Alert.alert('알림', '모든 필수 항목을 입력해주세요.');
            return;
        }

        proceedToResume();
    };

    // 4. 새로운 함수 추가
    const proceedToResume = async () => {
        setLoading(true);
        try {
            // userInfo 객체 생성 - null 체크 추가
            const userInfoData: UserInfoUpdate = {
                age: parseInt(age),
                how_long: howLong,
                experience,
            };

            // null이 아닌 경우에만 추가
            if (gender) userInfoData.gender = gender;
            if (visa) userInfoData.visa = visa;
            if (koreanLevel) userInfoData.korean_level = koreanLevel;

            // 프로필 정보 업데이트
            const updated = await updateProfile({
                profile: {
                    name,
                },
                userInfo: userInfoData
            });

            if (!updated) {
                throw new Error('프로필 업데이트 실패');
            }

            // Resume 페이지로 이동
            router.push({
                pathname: '/resume',
                params: {
                    companyId: String(companyId),
                    companyName: String(companyName),
                }
            });

        } catch (error) {
            console.error('프로필 업데이트 실패:', error);
            Alert.alert('오류', '프로필 업데이트 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (profileLoading) return <LoadingScreen />;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center p-4 border-b border-gray-200">
                <Back />
                <Text className="text-lg font-bold ml-4">이력서 작성</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {/* 지원 회사 */}
                    <View className="mb-6 p-4 bg-blue-50 rounded-xl">
                        <Text className="text-sm text-gray-600">지원 회사</Text>
                        <Text className="text-lg font-bold text-blue-600">{companyName}</Text>
                        {hasApplied && (
                            <Text className="text-sm text-orange-600 mt-2">
                                ⚠️ 이미 지원한 회사입니다
                            </Text>
                        )}
                    </View>

                    {/* 기본 정보 카드 */}
                    <View className="bg-gray-50 rounded-xl p-4 mb-6">
                        <Text className="text-lg font-bold mb-4">기본 정보</Text>

                        {/* 첫번째 줄: 이름 */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2 text-sm">이름 *</Text>
                            <TextInput
                                className="bg-white border border-gray-300 rounded-lg p-3"
                                placeholder="이름을 입력하세요"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {/* 두번째 줄: 나이와 성별 */}
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-gray-700 mb-2 text-sm">나이 *</Text>
                                <TextInput
                                    className="bg-white border border-gray-300 rounded-lg p-3"
                                    placeholder="나이"
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                />
                            </View>

                            <View className="flex-1">
                                <Text className="text-gray-700 mb-2 text-sm">성별 *</Text>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        className={`flex-1 py-3 rounded-lg items-center ${
                                            gender === '남성' ? 'bg-blue-500' : 'bg-white border border-gray-300'
                                        }`}
                                        onPress={() => setGender('남성')}
                                    >
                                        <Text className={gender === '남성' ? 'text-white font-medium' : 'text-gray-700'}>
                                            남성
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className={`flex-1 py-3 rounded-lg items-center ${
                                            gender === '여성' ? 'bg-blue-500' : 'bg-white border border-gray-300'
                                        }`}
                                        onPress={() => setGender('여성')}
                                    >
                                        <Text className={gender === '여성' ? 'text-white font-medium' : 'text-gray-700'}>
                                            여성
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* 경력 및 정보 카드 */}
                    <View className="bg-gray-50 rounded-xl p-4 mb-6">
                        <Text className="text-lg font-bold mb-4">경력 및 정보</Text>

                        {/* 비자 종류 */}
                        <View className="mb-4">
                            <Text className="text-gray-700 mb-2 text-sm">비자 종류 *</Text>
                            <Dropdown
                                style={{
                                    height: 45,
                                    backgroundColor: 'white',
                                    borderColor: '#d1d5db',
                                    borderWidth: 1,
                                    borderRadius: 8,
                                    paddingHorizontal: 12,
                                }}
                                placeholderStyle={{ fontSize: 14, color: '#9ca3af' }}
                                selectedTextStyle={{ fontSize: 14 }}
                                data={visaOptions}
                                labelField="label"
                                valueField="value"
                                placeholder="비자 종류를 선택하세요"
                                value={visa}
                                onChange={item => setVisa(item.value)}
                            />
                        </View>

                        {/* 희망 근무기간 & 관련 경력 (2열) */}
                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-gray-700 mb-2 text-sm">희망 근무기간 *</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    <View className="flex-row gap-2">
                                        {workPeriodOptions.map((period:any) => (
                                            <TouchableOpacity
                                                key={period.value}
                                                className={`px-3 py-2 rounded-lg ${
                                                    howLong === period.value ? 'bg-blue-500' : 'bg-white border border-gray-300'
                                                }`}
                                                onPress={() => setHowLong(period.value)}
                                            >
                                                <Text className={`text-xs ${
                                                    howLong === period.value ? 'text-white font-medium' : 'text-gray-700'
                                                }`}>
                                                    {period.value}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        </View>

                        <View className="mt-4">
                            <Text className="text-gray-700 mb-2 text-sm">관련 경력 *</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-2">
                                    {experienceOptions.map((exp: any) => (
                                        <TouchableOpacity
                                            key={exp.value}
                                            className={`px-4 py-2 rounded-lg ${
                                                experience === exp.value ? 'bg-blue-500' : 'bg-white border border-gray-300'
                                            }`}
                                            onPress={() => setExperience(exp.value)}
                                        >
                                            <Text className={`text-sm ${
                                                experience === exp.value ? 'text-white font-medium' : 'text-gray-700'
                                            }`}>
                                                {exp.value}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    </View>

                    {/* 한국어 능력 카드 */}
                    <View className="bg-gray-50 rounded-xl p-4 mb-6">
                        <Text className="text-lg font-bold mb-4">한국어 능력</Text>
                        <View className="flex-row gap-3">
                            {koreanLevelOptions.map((level) => (
                                <TouchableOpacity
                                    key={level.value}
                                    className={`flex-1 py-3 rounded-lg items-center ${
                                        koreanLevel === level.value ? 'bg-blue-500' : 'bg-white border border-gray-300'
                                    }`}
                                    onPress={() => setKoreanLevel(level.value)}
                                >
                                    <Text className={`font-medium ${
                                        koreanLevel === level.value ? 'text-white' : 'text-gray-700'
                                    }`}>
                                        {level.value}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* 제출 버튼 */}
                    <TouchableOpacity
                        className={`mt-8 py-4 rounded-xl items-center ${
                            loading ? 'bg-gray-400' : 'bg-blue-500'
                        }`}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        <Text className="text-white text-lg font-bold">
                            {loading ? '처리 중...' : hasApplied ? 'AI 이력서 다시 작성' : 'AI 이력서 작성하기'}
                        </Text>
                    </TouchableOpacity>


                    <Text className="text-center text-gray-500 text-sm mt-4 mb-8">
                        * 표시는 필수 입력 항목입니다
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}



