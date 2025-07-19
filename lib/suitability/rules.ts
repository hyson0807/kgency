// lib/suitability/rules.ts
import {CombinationBonus, SuitabilityRules} from './types';

export const defaultSuitabilityRules: SuitabilityRules = {
    // 카테고리별 가중치 (총합 100%)
    categoryWeights: {
        '지역': 35,        // 지역 매칭 (새로 추가)
        '직종': 30,        // 희망직종
        '근무요일': 10,    // 근무 가능 요일
        '한국어수준': 5,   // 한국어 실력 (10 → 5로 감소)
        '비자': 5,         // 비자 유형 (10 → 5로 감소)
        '성별': 4,         // 성별 (5 → 2로 감소)
        '나이대': 3,       // 나이대 (5 → 2로 감소)
        '비자지원': 2,     // 비자지원 여부 (5 → 2로 감소)
        '식사제공': 2,     // 식사 제공 여부 (5 → 2로 감소)
        '국가': 2,         // 국적 (5 → 2로 감소)
        '기타조건': 1      // 나머지 근무조건들 (10 → 0으로 감소)
    },

    // 특정 키워드 보너스 (새 방식에서는 카테고리 가중치로 대체)
    keywordBonus: {},

    // 키워드 조합 보너스 (새 방식에서는 사용하지 않음)
    combinationBonuses: [],

    // 필수 키워드 (지역은 필수)
    requiredKeywords: {
        '비자': null,     // 비자는 더 이상 필수 아님
        '성별': 'required',     // 성별 무관인 경우도 있으므로 필수 아님
        '직종': null,
        '국가': null,
        '지역': 'required', // 지역은 필수 (특정 ID가 아닌 카테고리 자체가 필수)
        '근무조건': null,
        '나이대': null,
        '한국어수준': null,
        '근무요일': null
    },

    // 점수 구간별 레벨
    scoreLevels: {
        perfect: 90,    // 90점 이상: 완벽한 매칭
        excellent: 75,  // 75점 이상: 매우 적합
        good: 60,       // 60점 이상: 적합
        fair: 40        // 40점 이상: 보통
        // 40점 미만: low (낮음)
    }
};

// 규칙을 쉽게 수정할 수 있도록 helper 함수들
export const suitabilityRulesHelpers = {
    // 카테고리 가중치 정규화 (합이 100이 되도록)
    normalizeWeights(weights: Record<string, number>): Record<string, number> {
        const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
        const normalized: Record<string, number> = {};

        Object.entries(weights).forEach(([key, value]) => {
            normalized[key] = Math.round((value / total) * 100);
        });

        return normalized;
    },

    // 카테고리 가중치 업데이트
    updateCategoryWeight(
        rules: SuitabilityRules,
        category: string,
        weight: number
    ): SuitabilityRules {
        const newWeights = { ...rules.categoryWeights, [category]: weight };
        return {
            ...rules,
            categoryWeights: suitabilityRulesHelpers.normalizeWeights(newWeights)
        };
    }
};