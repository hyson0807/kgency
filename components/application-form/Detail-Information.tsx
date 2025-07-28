import React from 'react'
import {Text, TextInput, TouchableOpacity, View} from "react-native";


interface DetailInformationProps {
    t: (key: string, defaultText: string, variables?: { [key: string]: string | number }) => string;
    formData: {
        howLong: string | null;
        selectedDays: string[];
        daysNegotiable: boolean;
        selectedTimes: string[];
        timesNegotiable: boolean;
        experience: string | null;
        experienceContent: string;
        koreanLevel: string | null;
        topic: string | null;
        question: string;
    };
    handlers: {
        setHowLong: (value: string | null) => void;
        toggleDay: (day: string) => void;
        setDaysNegotiable: (value: boolean) => void;
        setSelectedDays: (days: string[]) => void;
        toggleTime: (time: string) => void;
        setTimesNegotiable: (value: boolean) => void;
        setSelectedTimes: (times: string[]) => void;
        setExperience: (value: string | null) => void;
        setExperienceContent: (value: string) => void;
        setKoreanLevel: (value: string | null) => void;
        setTopic: (value: string | null) => void;
        setQuestion: (value: string) => void;
    };
}


export const DetailInfromation = ({
    t,
    formData,
    handlers

}: DetailInformationProps) => {
    const {
        howLong,
        selectedDays,
        daysNegotiable,
        selectedTimes,
        timesNegotiable,
        experience,
        experienceContent,
        koreanLevel,
        topic,
        question
    } = formData;

    const {
        setHowLong,
        toggleDay,
        setDaysNegotiable,
        setSelectedDays,
        toggleTime,
        setTimesNegotiable,
        setSelectedTimes,
        setExperience,
        setExperienceContent,
        setKoreanLevel,
        setTopic,
        setQuestion
    } = handlers;

    const workPeriodOptions = [
        { label: t('apply.period_1month', '1개월'), value: '1개월' },
        { label: t('apply.period_3months', '3개월'), value: '3개월' },
        { label: t('apply.period_6months', '6개월'), value: '6개월' },
        { label: t('apply.period_1year', '1년'), value: '1년' },
        { label: t('apply.period_long', '장기'), value: '장기' }
    ]
    const experienceOptions = [
        { label: t('apply.exp_none', '처음'), value: '처음' },
        { label: t('apply.exp_1month', '1개월'), value: '1개월' },
        { label: t('apply.exp_6months', '6개월'), value: '6개월' },
        { label: t('apply.exp_1year', '1년'), value: '1년' },
        { label: t('apply.exp_3years', '3년이상'), value: '3년이상' }
    ]
    const koreanLevelOptions = [
        { label: t('apply.korean_beginner', '초급'), value: '초급' },
        { label: t('apply.korean_intermediate', '중급'), value: '중급' },
        { label: t('apply.korean_advanced', '고급'), value: '고급' }
    ]
    const topicOptions = [
        { label: t('apply.topik_1', '1급'), value: '1급' },
        { label: t('apply.topik_2', '2급'), value: '2급' },
        { label: t('apply.topik_3plus', '3급이상'), value: '3급이상' }
    ]
    const dayOptions = [
        { label: t('apply.day_mon', '월'), value: '월' },
        { label: t('apply.day_tue', '화'), value: '화' },
        { label: t('apply.day_wed', '수'), value: '수' },
        { label: t('apply.day_thu', '목'), value: '목' },
        { label: t('apply.day_fri', '금'), value: '금' },
        { label: t('apply.day_sat', '토'), value: '토' },
        { label: t('apply.day_sun', '일'), value: '일' }
    ]
    const timeOptions = [
        { label: t('apply.time_morning', '오전'), value: '오전' },
        { label: t('apply.time_afternoon', '오후'), value: '오후' },
        { label: t('apply.time_evening', '저녁'), value: '저녁' },
        { label: t('apply.time_dawn', '새벽'), value: '새벽' }
    ]

    return (
        <View className="mb-6 gap-4">
            <Text className="text-lg font-bold mb-4">{t('apply.career_info', '경력 및 정보')}</Text>

            <View className="mb-4">
                <Text className="text-gray-700 mb-2">{t('apply.desired_period', '희망 근무 기간')}</Text>
                <View className="flex-row gap-2 flex-wrap">
                    {workPeriodOptions.map((period) => (
                        <TouchableOpacity
                            key={period.value}
                            onPress={() => setHowLong(howLong === period.value ? null : period.value)}
                            className={`px-4 py-2 rounded-lg border ${
                                howLong === period.value
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <Text className={`${
                                howLong === period.value ? 'text-white' : 'text-gray-700'
                            }`}>{period.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 희망 근무 요일 */}
            <View className="mb-4">
                <View className="flex-row items-center justify-start gap-4 mb-2">
                    <Text className="text-gray-700">{t('apply.preferred_days', '희망 근무 요일')}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            const allDays = dayOptions.map(d => d.value);
                            if (selectedDays.length === allDays.length) {
                                // 모두 선택된 상태면 모두 해제
                                setSelectedDays([]);
                            } else {
                                // 하나라도 선택 안된 상태면 모두 선택
                                setSelectedDays(allDays);
                            }
                        }}
                        className={`px-3 py-1 rounded-lg border ${
                            selectedDays.length === dayOptions.length
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-300'
                        }`}
                    >
                        <Text className={`text-sm ${
                            selectedDays.length === dayOptions.length ? 'text-white' : 'text-gray-700'
                        }`}>{t('apply.negotiable', '협의가능')}</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row gap-2">
                    {dayOptions.map((day) => (
                        <TouchableOpacity
                            key={day.value}
                            onPress={() => toggleDay(day.value)}
                            className={`flex-1 py-2 rounded-lg border items-center ${
                                selectedDays.includes(day.value)
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <Text className={`text-sm font-medium ${
                                selectedDays.includes(day.value) ? 'text-white' : 'text-gray-700'
                            }`}>{day.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 희망 시간대 */}
            <View className="mb-4">
                <View className="flex-row items-center justify-start gap-4 mb-2">
                    <Text className="text-gray-700">{t('apply.preferred_time', '희망 시간대')}</Text>
                    <TouchableOpacity
                        onPress={() => {
                            const allTimes = timeOptions.map(t => t.value);
                            if (selectedTimes.length === allTimes.length) {
                                // 모두 선택된 상태면 모두 해제
                                setSelectedTimes([]);
                            } else {
                                // 하나라도 선택 안된 상태면 모두 선택
                                setSelectedTimes(allTimes);
                            }
                        }}
                        className={`px-3 py-1 rounded-lg border ${
                            selectedTimes.length === timeOptions.length
                                ? 'bg-blue-500 border-blue-500'
                                : 'bg-white border-gray-300'
                        }`}
                    >
                        <Text className={`text-sm ${
                            selectedTimes.length === timeOptions.length ? 'text-white' : 'text-gray-700'
                        }`}>{t('apply.negotiable', '협의가능')}</Text>
                    </TouchableOpacity>
                </View>
                <View className="flex-row gap-2">
                    {timeOptions.map((time) => (
                        <TouchableOpacity
                            key={time.value}
                            onPress={() => toggleTime(time.value)}
                            className={`flex-1 py-2 rounded-lg border items-center ${
                                selectedTimes.includes(time.value)
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <Text className={`font-medium ${
                                selectedTimes.includes(time.value) ? 'text-white' : 'text-gray-700'
                            }`}>{time.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 관련 경력 */}
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">{t('apply.related_experience', '관련 경력')}</Text>
                <View className="flex-row gap-2 flex-wrap">
                    {experienceOptions.map((exp) => (
                        <TouchableOpacity
                            key={exp.value}
                            onPress={() => setExperience(experience === exp.value ? null : exp.value)}
                            className={`px-4 py-2 rounded-lg border ${
                                experience === exp.value
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <Text className={`${
                                experience === exp.value ? 'text-white' : 'text-gray-700'
                            }`}>{exp.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 경력 내용 */}
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">{t('apply.experience_detail', '경력 내용')}</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 h-24"
                    placeholder={t('apply.enter_experience', '간단한 경력 내용을 입력하세요')}
                    value={experienceContent}
                    onChangeText={setExperienceContent}
                    multiline
                    textAlignVertical="top"
                />
            </View>

            {/* 한국어 실력 */}
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">{t('apply.korean_level', '한국어 실력')}</Text>
                <View className="flex-row gap-2">
                    {koreanLevelOptions.map((level) => (
                        <TouchableOpacity
                            key={level.value}
                            onPress={() => setKoreanLevel(level.value)}
                            className={`flex-1 py-3 rounded-lg border items-center ${
                                koreanLevel === level.value
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <Text className={`font-medium ${
                                koreanLevel === level.value ? 'text-white' : 'text-gray-700'
                            }`}>{level.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 토픽 급수 */}
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">{t('apply.topik_level', '토픽 급수')}</Text>
                <View className="flex-row gap-2">
                    {topicOptions.map((grade) => (
                        <TouchableOpacity
                            key={grade.value}
                            onPress={() => setTopic(topic === grade.value ? null : grade.value)}
                            className={`flex-1 py-3 rounded-lg border items-center ${
                                topic === grade.value
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-white border-gray-300'
                            }`}
                        >
                            <Text className={`font-medium ${
                                topic === grade.value ? 'text-white' : 'text-gray-700'
                            }`}>{grade.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 경력 내용 */}
            <View className="mb-4">
                <Text className="text-gray-700 mb-2">{t('apply.questions', '사장님께 물어보고 싶은 내용')}</Text>
                <TextInput
                    className="border border-gray-300 rounded-lg p-3 h-24"
                    placeholder={t('apply.questions_placeholder', '질문사항')}
                    value={question}
                    onChangeText={setQuestion}
                    multiline
                    textAlignVertical="top"
                />
            </View>
        </View>
    )
}