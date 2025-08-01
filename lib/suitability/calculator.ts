// lib/suitability/calculator.ts
import {
    SuitabilityResult,
    SuitabilityRules,
    CombinationBonus
} from './types';
import { defaultSuitabilityRules } from './rules';

interface JobKeyword {
    keyword: {
        id: number;
        keyword: string;
        category: string;
    };
}

export class SuitabilityCalculator {
    private rules: SuitabilityRules;

    constructor(rules?: SuitabilityRules) {
        this.rules = rules || defaultSuitabilityRules;
    }

    /**
     * 특정 카테고리에서 "상관없음" 키워드 ID 찾기
     */
    private findNoPreferenceKeywordId(jobKeywords: JobKeyword[], category: string): number | null {
        const noPreferenceKeyword = jobKeywords.find(k => 
            k.keyword.category === category && k.keyword.keyword === '상관없음'
        );
        return noPreferenceKeyword ? noPreferenceKeyword.keyword.id : null;
    }

    /**
     * 유저 또는 공고에서 "상관없음"이 선택되었는지 확인
     */
    private isNoPreferenceSelected(
        userKeywordIds: number[], 
        jobKeywords: JobKeyword[], 
        category: string
    ): { userHasNoPreference: boolean; jobHasNoPreference: boolean; noPreferenceId: number | null } {
        const noPreferenceId = this.findNoPreferenceKeywordId(jobKeywords, category);
        
        if (!noPreferenceId) {
            return { userHasNoPreference: false, jobHasNoPreference: false, noPreferenceId: null };
        }

        const userHasNoPreference = userKeywordIds.includes(noPreferenceId);
        const jobHasNoPreference = jobKeywords.some(k => k.keyword.id === noPreferenceId);

        return { userHasNoPreference, jobHasNoPreference, noPreferenceId };
    }

    /**
     * 적합도 계산 메인 함수 (새로운 방식)
     */
    calculate(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[]
    ): SuitabilityResult {
        let totalScore = 0;
        const categoryScores: Record<string, { matched: number; total: number; score: number; weight: number }> = {};
        const matchedKeywords = this.initializeMatchedKeywords();

        // 먼저 지역 매칭 확인 (필수)
        const locationMatch = this.checkLocationMatch(userKeywordIds, jobKeywords, matchedKeywords);
        const hasLocationMatch = locationMatch.matched > 0;

        // 지역 점수 계산 추가 (38%)
        if (hasLocationMatch) {
            totalScore += 38; // 지역 매칭 시 38점 추가
        }
        categoryScores['지역'] = { ...locationMatch, score: hasLocationMatch ? 38 : 0, weight: 38 };

        // 성별 매칭 확인 (필수)
        const genderMatch = this.checkGenderMatchRequired(userKeywordIds, jobKeywords, matchedKeywords);
        const hasGenderMatch = genderMatch.matched > 0;
        categoryScores['성별필수체크'] = { ...genderMatch, weight: 0 };

        // 1. 희망직종 (33%)
        const jobScore = this.calculateJobMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += jobScore.score;
        categoryScores['직종'] = { ...jobScore, weight: 33 };

        // 2. 근무 가능 요일 (11%)
        const workDayScore = this.calculateWorkDayMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += workDayScore.score;
        categoryScores['근무요일'] = { ...workDayScore, weight: 11 };

        // 3. 한국어 실력 (5% 보너스)
        const koreanScore = this.calculateKoreanLevelMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += koreanScore.score;
        categoryScores['한국어수준'] = { ...koreanScore, weight: 5 };

        // 4. 비자 유형 (5%)
        const visaScore = this.calculateVisaMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += visaScore.score;
        categoryScores['비자'] = { ...visaScore, weight: 5 };

        // 5. 성별 (4%)
        const genderScore = this.calculateGenderMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += genderScore.score;
        categoryScores['성별'] = { ...genderScore, weight: 4 };

        // 6. 나이대 (3%)
        const ageScore = this.calculateAgeMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += ageScore.score;
        categoryScores['나이대'] = { ...ageScore, weight: 3 };

        // 7. 비자지원 여부 (2%)
        const visaSupportScore = this.calculateVisaSupportMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += visaSupportScore.score;
        categoryScores['비자지원'] = { ...visaSupportScore, weight: 2 };

        // 8. 식사 제공 여부 (2%)
        const mealScore = this.calculateMealProvidedMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += mealScore.score;
        categoryScores['식사제공'] = { ...mealScore, weight: 2 };

        // 9. 국적 (2%)
        const countryScore = this.calculateCountryMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += countryScore.score;
        categoryScores['국가'] = { ...countryScore, weight: 2 };

        // 10. 기타 근무조건 (2%)
        const otherConditionsScore = this.calculateOtherConditionsMatch(userKeywordIds, jobKeywords, matchedKeywords);
        totalScore += otherConditionsScore.score;
        categoryScores['기타조건'] = { ...otherConditionsScore, weight: 2 };

        // 필수 항목 미매칭 시 패널티
        const missingRequired = [];
        if (!hasLocationMatch) {
            totalScore = totalScore * 0.3; // 30%만 남김
            missingRequired.push('지역');
        }

        if (!hasGenderMatch) {
            totalScore = Math.max(0, totalScore - 20); // 20점 고정 감점
            missingRequired.push('성별');
        }

        // 레벨 결정
        const level = this.determineLevel(totalScore);

        return {
            score: Math.round(totalScore),
            level,
            details: {
                categoryScores,
                bonusPoints: 0, // 새 방식에서는 보너스 없음
                matchedKeywords,
                missingRequired,
                appliedBonuses: []
            }
        };
    }

    /**
     * 1. 희망직종 매칭 (30%)
     */
    private calculateJobMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        const jobKeywordsInPosting = jobKeywords.filter(k => k.keyword.category === '직종');
        const matchedJobs = jobKeywordsInPosting.filter(k => userKeywordIds.includes(k.keyword.id));

        matchedJobs.forEach(k => matchedKeywords.jobs.push(k.keyword.keyword));

        if (jobKeywordsInPosting.length === 0) {
            return { matched: 1, total: 1, score: 33 }; // 직종 무관인 경우 만점
        }

        // 매칭된 직종이 있으면 33점, 없으면 0점
        if (matchedJobs.length > 0) {
            return {
                matched: matchedJobs.length,
                total: jobKeywordsInPosting.length,
                score: 33
            };
        }

        return {
            matched: 0,
            total: jobKeywordsInPosting.length,
            score: 0
        };
    }

    /**
     * 2. 근무 가능 요일 매칭 (10%)
     */
    private calculateWorkDayMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        const workDayKeywordsInPosting = jobKeywords.filter(k => k.keyword.category === '근무요일');

        // 공고의 요구 요일이 없으면 0점 (없을 수 없다고 했지만 안전장치)
        if (workDayKeywordsInPosting.length === 0) {
            return { matched: 0, total: 0, score: 0 };
        }

        // 유저의 근무 가능 요일
        const userWorkDayKeywords = jobKeywords.filter(k =>
            k.keyword.category === '근무요일' && userKeywordIds.includes(k.keyword.id)
        );

        // 유저가 요일을 선택하지 않은 경우 0점
        if (userWorkDayKeywords.length === 0) {
            return { matched: 0, total: workDayKeywordsInPosting.length, score: 0 };
        }

        // 공고 요일 중 유저가 가능한 요일 찾기
        const matchedWorkDays = workDayKeywordsInPosting.filter(k =>
            userKeywordIds.includes(k.keyword.id)
        );

        matchedWorkDays.forEach(k => matchedKeywords.workDays?.push(k.keyword.keyword));

        // 매칭률 = 매칭된 요일 수 / 공고 요구 요일 수
        const matchRate = matchedWorkDays.length / workDayKeywordsInPosting.length;

        return {
            matched: matchedWorkDays.length,
            total: workDayKeywordsInPosting.length,
            score: matchRate * 11  // 11점으로 변경
        };
    }

    /**
     * 3. 한국어 실력 매칭 (5% 보너스)
     */
    private calculateKoreanLevelMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        // "상관없음" 키워드 확인
        const { userHasNoPreference, jobHasNoPreference, noPreferenceId } = 
            this.isNoPreferenceSelected(userKeywordIds, jobKeywords, '한국어수준');

        // 유저나 공고 중 하나라도 "상관없음"이면 만점
        if (userHasNoPreference || jobHasNoPreference) {
            if (userHasNoPreference) {
                matchedKeywords.koreanLevel?.push('상관없음');
            }
            return { matched: 1, total: 1, score: 5 };
        }

        const koreanKeywordsInPosting = jobKeywords.filter(k => 
            k.keyword.category === '한국어수준' && k.keyword.keyword !== '상관없음'
        );

        if (koreanKeywordsInPosting.length === 0) {
            return { matched: 0, total: 0, score: 0 }; // 한국어 무관인 경우 보너스 없음
        }

        // 한국어 수준: 초급(1), 중급(2), 고급(3)으로 가정
        const levelMap: { [key: string]: number } = {
            '초급': 1,
            '중급': 2,
            '고급': 3
        };

        const userKoreanLevel = jobKeywords.find(k =>
            k.keyword.category === '한국어수준' && 
            k.keyword.keyword !== '상관없음' && 
            userKeywordIds.includes(k.keyword.id)
        );

        if (!userKoreanLevel) {
            return { matched: 0, total: 1, score: 0 }; // 한국어 수준 미선택 시 보너스 없음 (감점도 없음)
        }

        const userLevel = levelMap[userKoreanLevel.keyword.keyword] || 0;

        // 특정 수준이 요구되는 경우
        // 가장 낮은 요구 수준 찾기
        const minRequiredLevel = Math.min(...koreanKeywordsInPosting.map(k => levelMap[k.keyword.keyword] || 0));
        
        // 유저가 요구 수준 이상이면 5점, 미달이면 0점
        if (userLevel >= minRequiredLevel) {
            matchedKeywords.koreanLevel?.push(userKoreanLevel.keyword.keyword);
            return { matched: 1, total: 1, score: 5 }; // 요구 수준 충족: 5점
        }

        // 요구 수준 미달시 0점
        return { matched: 0, total: 1, score: 0 };
    }

    /**
     * 4. 비자 유형 매칭 (5%)
     */
    private calculateVisaMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        // "상관없음" 키워드 확인
        const { userHasNoPreference, jobHasNoPreference, noPreferenceId } = 
            this.isNoPreferenceSelected(userKeywordIds, jobKeywords, '비자');

        // 유저나 공고 중 하나라도 "상관없음"이면 만점
        if (userHasNoPreference || jobHasNoPreference) {
            if (userHasNoPreference) {
                matchedKeywords.visa.push('상관없음');
            }
            return { matched: 1, total: 1, score: 5 };
        }

        const visaKeywordsInPosting = jobKeywords.filter(k => 
            k.keyword.category === '비자' && k.keyword.keyword !== '상관없음'
        );
        const userVisa = jobKeywords.find(k =>
            k.keyword.category === '비자' && 
            k.keyword.keyword !== '상관없음' && 
            userKeywordIds.includes(k.keyword.id)
        );

        if (visaKeywordsInPosting.length === 0) {
            return { matched: 1, total: 1, score: 5 }; // 비자 무관인 경우 만점
        }

        if (userVisa && visaKeywordsInPosting.some(k => k.keyword.id === userVisa.keyword.id)) {
            matchedKeywords.visa.push(userVisa.keyword.keyword);
            return { matched: 1, total: 1, score: 5 };
        }

        return { matched: 0, total: 1, score: 0 };
    }

    /**
     * 5. 성별 매칭 (4%)
     */
    private calculateGenderMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        // "상관없음" 키워드 확인
        const { userHasNoPreference, jobHasNoPreference, noPreferenceId } = 
            this.isNoPreferenceSelected(userKeywordIds, jobKeywords, '성별');

        // 유저나 공고 중 하나라도 "상관없음"이면 만점
        if (userHasNoPreference || jobHasNoPreference) {
            if (userHasNoPreference) {
                matchedKeywords.gender.push('상관없음');
            }
            return { matched: 1, total: 1, score: 4 };
        }

        const genderKeywordsInPosting = jobKeywords.filter(k => 
            k.keyword.category === '성별' && k.keyword.keyword !== '상관없음'
        );

        if (genderKeywordsInPosting.length === 0) {
            return { matched: 1, total: 1, score: 4 }; // 성별 무관인 경우 만점
        }

        const matchedGender = genderKeywordsInPosting.filter(k =>
            userKeywordIds.includes(k.keyword.id)
        );

        if (matchedGender.length > 0) {
            matchedGender.forEach(k => matchedKeywords.gender.push(k.keyword.keyword));
            return { matched: 1, total: 1, score: 4 };
        }

        return { matched: 0, total: 1, score: 0 };
    }

    /**
     * 성별 매칭 확인 (필수)
     */
    private checkGenderMatchRequired(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        // "상관없음" 키워드 확인
        const { userHasNoPreference, jobHasNoPreference, noPreferenceId } = 
            this.isNoPreferenceSelected(userKeywordIds, jobKeywords, '성별');

        // 유저나 공고 중 하나라도 "상관없음"이면 매칭으로 처리
        if (userHasNoPreference || jobHasNoPreference) {
            return { matched: 1, total: 1, score: 0 };
        }

        const genderKeywordsInPosting = jobKeywords.filter(k => 
            k.keyword.category === '성별' && k.keyword.keyword !== '상관없음'
        );

        if (genderKeywordsInPosting.length === 0) {
            // 공고에 성별이 명시되지 않은 경우는 매칭으로 간주 (성별 무관)
            return { matched: 1, total: 1, score: 0 };
        }

        // 유저의 성별 키워드 찾기 ("상관없음" 제외)
        const userGenderKeyword = jobKeywords.find(k =>
            k.keyword.category === '성별' && 
            k.keyword.keyword !== '상관없음' && 
            userKeywordIds.includes(k.keyword.id)
        );

        if (!userGenderKeyword) {
            // 유저가 성별을 선택하지 않은 경우
            return { matched: 0, total: 1, score: 0 };
        }

        // 유저의 성별이 공고의 성별 요구사항과 일치하는지 확인
        const isMatched = genderKeywordsInPosting.some(k =>
            k.keyword.id === userGenderKeyword.keyword.id
        );

        if (isMatched) {
            return { matched: 1, total: 1, score: 0 };
        }

        return { matched: 0, total: 1, score: 0 };
    }

    /**
     * 6. 나이대 매칭 (3%)
     */
    private calculateAgeMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        // "상관없음" 키워드 확인
        const { userHasNoPreference, jobHasNoPreference, noPreferenceId } = 
            this.isNoPreferenceSelected(userKeywordIds, jobKeywords, '나이대');

        // 유저나 공고 중 하나라도 "상관없음"이면 만점
        if (userHasNoPreference || jobHasNoPreference) {
            if (userHasNoPreference) {
                matchedKeywords.age.push('상관없음');
            }
            return { matched: 1, total: 1, score: 3 };
        }

        const ageKeywordsInPosting = jobKeywords.filter(k => 
            k.keyword.category === '나이대' && k.keyword.keyword !== '상관없음'
        );

        if (ageKeywordsInPosting.length === 0) {
            return { matched: 1, total: 1, score: 3 }; // 나이 무관인 경우 만점
        }

        const userAge = jobKeywords.find(k =>
            k.keyword.category === '나이대' && 
            k.keyword.keyword !== '상관없음' && 
            userKeywordIds.includes(k.keyword.id)
        );

        if (!userAge) {
            return { matched: 0, total: 1, score: 0 };
        }

        // 정확히 일치하는 경우
        if (ageKeywordsInPosting.some(k => k.keyword.id === userAge.keyword.id)) {
            matchedKeywords.age.push(userAge.keyword.keyword);
            return { matched: 1, total: 1, score: 3 };
        }

        // 나이대가 일치하지 않는 경우 부분 점수 (인접 나이대는 1.5점)
        const ageOrder = ['20-25세', '25-30세', '30-35세', '35세 이상'];
        const userAgeIndex = ageOrder.indexOf(userAge.keyword.keyword);
        const acceptableAges = ageKeywordsInPosting.map(k => k.keyword.keyword);

        // 인접 나이대인지 확인
        for (const acceptableAge of acceptableAges) {
            const acceptableIndex = ageOrder.indexOf(acceptableAge);
            if (Math.abs(userAgeIndex - acceptableIndex) === 1) {
                return { matched: 0, total: 1, score: 1.5 }; // 인접 나이대는 50% 점수
            }
        }

        return { matched: 0, total: 1, score: 0 };
    }

    /**
     * 7. 비자지원 여부 매칭 (2%)
     */
    private calculateVisaSupportMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        const visaSupportId = 49; // 비자지원 키워드 ID
        const hasVisaSupport = jobKeywords.some(k =>
            k.keyword.id === visaSupportId && userKeywordIds.includes(visaSupportId)
        );

        if (hasVisaSupport) {
            matchedKeywords.conditions.push('비자지원');
            return { matched: 1, total: 1, score: 2 };
        }

        return { matched: 0, total: 1, score: 0 };
    }

    /**
     * 8. 식사 제공 여부 매칭 (2%)
     */
    private calculateMealProvidedMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        const mealProvidedId = 46; // 식사제공 키워드 ID
        const hasMealProvided = jobKeywords.some(k =>
            k.keyword.id === mealProvidedId && userKeywordIds.includes(mealProvidedId)
        );

        if (hasMealProvided) {
            matchedKeywords.conditions.push('식사제공');
            return { matched: 1, total: 1, score: 2 };
        }

        return { matched: 0, total: 1, score: 0 };
    }

    /**
     * 9. 국적 매칭 (2%)
     */
    private calculateCountryMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        // "상관없음" 키워드 확인
        const { userHasNoPreference, jobHasNoPreference, noPreferenceId } = 
            this.isNoPreferenceSelected(userKeywordIds, jobKeywords, '국가');

        // 유저나 공고 중 하나라도 "상관없음"이면 만점
        if (userHasNoPreference || jobHasNoPreference) {
            if (userHasNoPreference) {
                matchedKeywords.countries.push('상관없음');
            }
            return { matched: 1, total: 1, score: 2 };
        }

        const countryKeywordsInPosting = jobKeywords.filter(k => 
            k.keyword.category === '국가' && k.keyword.keyword !== '상관없음'
        );

        if (countryKeywordsInPosting.length === 0) {
            return { matched: 1, total: 1, score: 2 }; // 국적 무관인 경우 만점
        }

        const matchedCountries = countryKeywordsInPosting.filter(k =>
            userKeywordIds.includes(k.keyword.id)
        );

        if (matchedCountries.length > 0) {
            matchedCountries.forEach(k => matchedKeywords.countries.push(k.keyword.keyword));
            return { matched: 1, total: 1, score: 2 };
        }

        return { matched: 0, total: 1, score: 0 };
    }

    /**
     * 10. 기타 근무조건 매칭 (1%)
     */
    private calculateOtherConditionsMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        // 비자지원, 식사제공을 제외한 나머지 근무조건
        const otherConditionIds = [44, 45, 47, 48]; // 고급여, 숙소제공, 주말근무, 통근버스
        const otherConditions = jobKeywords.filter(k =>
            k.keyword.category === '근무조건' &&
            otherConditionIds.includes(k.keyword.id)
        );

        if (otherConditions.length === 0) {
            return { matched: 0, total: 0, score: 2 }; // 기타 조건이 없으면 기본 2점 (가중치와 동일)
        }

        const matchedOthers = otherConditions.filter(k =>
            userKeywordIds.includes(k.keyword.id)
        );

        matchedOthers.forEach(k => matchedKeywords.conditions.push(k.keyword.keyword));

        const matchRate = matchedOthers.length / otherConditions.length;
        return {
            matched: matchedOthers.length,
            total: otherConditions.length,
            score: matchRate * 2 // 가중치 2%
        };
    }

    /**
     * 지역 매칭 확인 (필수)
     */
    private checkLocationMatch(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[],
        matchedKeywords: any
    ): { matched: number; total: number; score: number } {
        const locationKeywordsInPosting = jobKeywords.filter(k => k.keyword.category === '지역');

        if (locationKeywordsInPosting.length === 0) {
            // 공고에 지역이 명시되지 않은 경우는 매칭으로 간주
            return { matched: 1, total: 1, score: 0 };
        }

        // 유저의 지역 키워드 찾기
        const userLocationKeyword = jobKeywords.find(k =>
            k.keyword.category === '지역' && userKeywordIds.includes(k.keyword.id)
        );

        if (!userLocationKeyword) {
            // 유저가 지역을 선택하지 않은 경우
            return { matched: 0, total: 1, score: 0 };
        }

        // 유저의 지역이 공고의 지역 목록에 있는지 확인
        const isMatched = locationKeywordsInPosting.some(k =>
            k.keyword.id === userLocationKeyword.keyword.id
        );

        if (isMatched) {
            matchedKeywords.location.push(userLocationKeyword.keyword.keyword);
            return { matched: 1, total: 1, score: 0 };
        }

        return { matched: 0, total: 1, score: 0 };
    }

    /**
     * 필수 키워드 체크 (현재는 사용하지 않음)
     */
    private checkRequiredKeywords(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[]
    ): string[] {
        return [];
    }

    /**
     * 매칭된 키워드 초기화
     */
    private initializeMatchedKeywords() {
        return {
            countries: [] as string[],
            jobs: [] as string[],
            conditions: [] as string[],
            location: [] as string[],
            moveable: [] as string[],
            gender: [] as string[],
            age: [] as string[],
            visa: [] as string[],
            workDays: [] as string[],
            koreanLevel: [] as string[]
        };
    }

    /**
     * 점수에 따른 레벨 결정
     */
    private determineLevel(score: number): SuitabilityResult['level'] {
        const { scoreLevels } = this.rules;

        if (score >= scoreLevels.perfect) return 'perfect';
        if (score >= scoreLevels.excellent) return 'excellent';
        if (score >= scoreLevels.good) return 'good';
        if (score >= scoreLevels.fair) return 'fair';
        return 'low';
    }

    /**
     * 규칙 업데이트
     */
    updateRules(rules: SuitabilityRules): void {
        this.rules = rules;
    }
}