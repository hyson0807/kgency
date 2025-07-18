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
     * 적합도 계산 메인 함수
     */
    calculate(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[]
    ): SuitabilityResult {
        // 1. 카테고리별 매칭 계산
        const categoryScores = this.calculateCategoryScores(userKeywordIds, jobKeywords);

        // 2. 기본 점수 계산 (카테고리 가중치 적용)
        let baseScore = this.calculateBaseScore(categoryScores);

        // 3. 개별 키워드 보너스 계산
        const keywordBonus = this.calculateKeywordBonus(userKeywordIds, jobKeywords);

        // 4. 조합 보너스 계산
        const { bonus: combinationBonus, applied: appliedBonuses } =
            this.calculateCombinationBonus(userKeywordIds, jobKeywords);

        // 5. 필수 키워드 체크
        const missingRequired = this.checkRequiredKeywords(userKeywordIds, jobKeywords);

        // 6. 필수 키워드 누락 시 패널티
        if (missingRequired.length > 0) {
            baseScore = baseScore * 0.5; // 50% 감점
        }

        // 7. 최종 점수 계산 (0-100 범위로 정규화)
        const totalScore = Math.min(100, Math.max(0,
            baseScore + keywordBonus + combinationBonus
        ));

        // 8. 매칭된 키워드 정리
        const matchedKeywords = this.organizeMatchedKeywords(userKeywordIds, jobKeywords);

        // 9. 레벨 결정
        const level = this.determineLevel(totalScore);

        return {
            score: Math.round(totalScore),
            level,
            details: {
                categoryScores,
                bonusPoints: keywordBonus + combinationBonus,
                matchedKeywords,
                missingRequired,
                appliedBonuses
            }
        };
    }

    /**
     * 카테고리별 매칭 점수 계산
     */
    private calculateCategoryScores(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[]
    ): Record<string, { matched: number; total: number; score: number }> {
        const scores: Record<string, { matched: number; total: number; score: number }> = {};

        // 카테고리별로 그룹화
        const jobKeywordsByCategory = this.groupByCategory(jobKeywords);

        Object.entries(jobKeywordsByCategory).forEach(([category, keywords]) => {
            const keywordIds = keywords.map(k => k.keyword.id);
            const matched = keywordIds.filter(id => userKeywordIds.includes(id)).length;
            const total = keywords.length;

            scores[category] = {
                matched,
                total,
                score: total > 0 ? (matched / total) * 100 : 0
            };
        });

        return scores;
    }

    /**
     * 기본 점수 계산 (카테고리 가중치 적용)
     */
    private calculateBaseScore(
        categoryScores: Record<string, { matched: number; total: number; score: number }>
    ): number {
        let weightedScore = 0;

        Object.entries(categoryScores).forEach(([category, { score }]) => {
            const weight = this.rules.categoryWeights[category] || 0;
            weightedScore += (score * weight) / 100;
        });

        return weightedScore;
    }

    /**
     * 개별 키워드 보너스 계산
     */
    private calculateKeywordBonus(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[]
    ): number {
        let bonus = 0;
        const jobKeywordIds = jobKeywords.map(k => k.keyword.id);

        userKeywordIds.forEach(userKeywordId => {
            if (jobKeywordIds.includes(userKeywordId)) {
                const keywordBonus = this.rules.keywordBonus[userKeywordId.toString()] || 0;
                bonus += keywordBonus;
            }
        });

        return bonus;
    }

    /**
     * 조합 보너스 계산
     */
    private calculateCombinationBonus(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[]
    ): { bonus: number; applied: string[] } {
        let totalBonus = 0;
        const applied: string[] = [];
        const jobKeywordIds = jobKeywords.map(k => k.keyword.id);

        this.rules.combinationBonuses.forEach(combo => {
            const matchedInUser = combo.keywords.filter(id => userKeywordIds.includes(id));
            const matchedInJob = combo.keywords.filter(id => jobKeywordIds.includes(id));

            const isMatched = combo.requiredAll
                ? matchedInUser.length === combo.keywords.length &&
                matchedInJob.length === combo.keywords.length
                : matchedInUser.length > 0 && matchedInJob.length > 0;

            if (isMatched) {
                totalBonus += combo.bonus;
                applied.push(combo.name);
            }
        });

        return { bonus: totalBonus, applied };
    }

    /**
     * 필수 키워드 체크
     */
    private checkRequiredKeywords(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[]
    ): string[] {
        const missing: string[] = [];

        Object.entries(this.rules.requiredKeywords).forEach(([category, requiredIds]) => {
            if (!requiredIds || requiredIds.length === 0) return;

            const jobKeywordIds = jobKeywords
                .filter(k => k.keyword.category === category)
                .map(k => k.keyword.id);

            const hasRequired = requiredIds.some(reqId =>
                userKeywordIds.includes(reqId) && jobKeywordIds.includes(reqId)
            );

            if (!hasRequired) {
                missing.push(category);
            }
        });

        return missing;
    }

    /**
     * 매칭된 키워드 정리
     */
    private organizeMatchedKeywords(
        userKeywordIds: number[],
        jobKeywords: JobKeyword[]
    ): SuitabilityResult['details']['matchedKeywords'] {
        const matched = {
            countries: [] as string[],
            jobs: [] as string[],
            conditions: [] as string[],
            location: [] as string[],
            moveable: [] as string[],
            gender: [] as string[],
            age: [] as string[],
            visa: [] as string[]
        };

        jobKeywords.forEach(({ keyword }) => {
            if (userKeywordIds.includes(keyword.id)) {
                switch (keyword.category) {
                    case '국가':
                        matched.countries.push(keyword.keyword);
                        break;
                    case '직종':
                        matched.jobs.push(keyword.keyword);
                        break;
                    case '근무조건':
                        matched.conditions.push(keyword.keyword);
                        break;
                    case '지역':
                        matched.location.push(keyword.keyword);
                        break;
                    case '지역이동':
                        matched.moveable.push(keyword.keyword);
                        break;
                    case '성별':
                        matched.gender.push(keyword.keyword);
                        break;
                    case '나이대':
                        matched.age.push(keyword.keyword);
                        break;
                    case '비자':
                        matched.visa.push(keyword.keyword);
                        break;
                }
            }
        });

        return matched;
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
     * 카테고리별로 키워드 그룹화
     */
    private groupByCategory(keywords: JobKeyword[]): Record<string, JobKeyword[]> {
        const grouped: Record<string, JobKeyword[]> = {};

        keywords.forEach(keyword => {
            const category = keyword.keyword.category;
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(keyword);
        });

        return grouped;
    }

    /**
     * 규칙 업데이트
     */
    updateRules(rules: SuitabilityRules): void {
        this.rules = rules;
    }
}