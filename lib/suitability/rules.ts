// lib/suitability/rules.ts
import {CombinationBonus, SuitabilityRules} from './types';

export const defaultSuitabilityRules: SuitabilityRules = {
    // 카테고리별 가중치 (총합 100%)
    categoryWeights: {
        '직종': 30,      // 가장 중요
        '비자': 20,      // 법적 요건
        '지역': 15,      // 근무 위치
        '근무조건': 5,  // 근무 환경
        '국가': 10,      // 국적 관련
        '나이대': 10,     // 연령 조건
        '성별': 3,       // 성별 조건
        '지역이동': 2    // 이동 가능 여부
    },

    // 특정 키워드 보너스
    keywordBonus: {
        // 근무조건 보너스
        '44': 8,   // 고급여
        '45': 6,   // 숙소제공
        '46': 4,   // 식사제공
        '47': 2,   // 주말근무
        '48': 3,   // 통근버스
        '49': 7,   // 비자지원

        // 지역 보너스 (수도권 및 대도시)
        '50': 10,  // 서울특별시
        '58': 10,   // 경기도
        '53': 10,   // 인천광역시
        '51': 10,   // 부산광역시

        // 나이대 보너스 (젊은 층 선호)
        '71': 3,   // 20-25세
        '72': 3,   // 25-30세
        '73': 3,   // 30-35세
        '74': 3,   // 35세 이상

        // 이동가능 보너스
        '67': 5,   // 지역이동 가능
    },

    // 키워드 조합 보너스
    combinationBonuses: [
        {
            id: 'vietnam_service',
            name: '베트남 서비스업',
            keywords: [32, 41], // 베트남, 서비스업
            requiredAll: true,
            bonus: 5
        },
        {
            id: 'philippines_factory',
            name: '필리핀 공장근무',
            keywords: [34, 42], // 필리핀, 공장/건설
            requiredAll: true,
            bonus: 5
        },
        {
            id: 'premium_job',
            name: '프리미엄 일자리',
            keywords: [44, 45, 46], // 고급여, 숙소제공, 식사제공
            requiredAll: true,
            bonus: 5
        },
        {
            id: 'seoul_gyeonggi',
            name: '수도권 지역',
            keywords: [50, 58, 53], // 서울, 경기, 인천
            requiredAll: false, // 하나만 있어도 적용
            bonus: 5
        },
        {
            id: 'young_moveable',
            name: '젊고 이동가능',
            keywords: [71, 72, 67], // 20-25세, 25-30세, 지역이동 가능
            requiredAll: false,
            bonus: 10
        },
        {
            id: 'full_support',
            name: '완벽 지원',
            keywords: [45, 46, 48, 49], // 숙소, 식사, 통근버스, 비자지원
            requiredAll: false, // 2개 이상 있으면 적용하도록 Calculator에서 처리
            bonus: 12
        },
        {
            id: 'southeast_asia',
            name: '동남아시아 국가',
            keywords: [32, 34, 35, 36, 38], // 베트남, 필리핀, 태국, 인도네시아, 캄보디아
            requiredAll: false,
            bonus: 5
        }
    ],

    // 필수 키워드 (카테고리별)
    requiredKeywords: {
        '비자': [75, 76, 77, 78, 79, 80, 81, 82], // 모든 비자 종류 (F-2, F-4, F-5, F-6, E-9, H-2, D-2, D-4)
        '성별': [69, 70], // 남성, 여성
        '직종': null,     // 필수 아님
        '국가': null,     // 필수 아님
        '지역': null,     // 필수 아님
        '근무조건': null, // 필수 아님
        '나이대': null,   // 필수 아님
        '지역이동': null  // 필수 아님
    },

    // 점수 구간별 레벨
    scoreLevels: {
        perfect: 90,    // 90점 이상: 완벽한 매칭 (즉시 면접 가능)
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

    // 새로운 조합 보너스 추가
    addCombinationBonus(
        rules: SuitabilityRules,
        bonus: CombinationBonus
    ): SuitabilityRules {
        return {
            ...rules,
            combinationBonuses: [...rules.combinationBonuses, bonus]
        };
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