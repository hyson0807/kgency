// lib/suitability/types.ts

// 적합도 계산 결과
export interface SuitabilityResult {
    score: number; // 0-100
    level: 'perfect' | 'excellent' | 'good' | 'fair' | 'low';
    details: {
        categoryScores: Record<string, {
            matched: number;
            total: number;
            score: number;
            weight?: number;
        }>;
        bonusPoints: number;
        matchedKeywords: {
            countries: string[];
            jobs: string[];
            conditions: string[];
            location: string[];
            moveable: string[];
            gender: string[];
            age: string[];
            visa: string[];
            workDays?: string[];
            koreanLevel: string[];
        };
        missingRequired: string[];
        appliedBonuses: string[]; // 적용된 보너스 설명
    };
}

// 키워드 조합 보너스 규칙
export interface CombinationBonus {
    id: string;
    name: string;
    keywords: number[]; // keyword IDs
    requiredAll: boolean; // true면 모든 키워드 필요, false면 하나만 있어도 됨
    bonus: number;
}

// 적합도 계산 규칙
export interface SuitabilityRules {
    // 카테고리별 가중치 (총합 100)
    categoryWeights: {
        [category: string]: number;
    };

    // 특정 키워드 보너스
    keywordBonus: {
        [keywordId: string]: number;
    };

    // 키워드 조합 보너스
    combinationBonuses: CombinationBonus[];

    // 필수 키워드 (카테고리별)
    requiredKeywords: {
        [category: string]: number[] | null | 'required'; // 'required' 추가
    };

    // 점수 구간별 레벨
    scoreLevels: {
        perfect: number;   // 90 이상
        excellent: number; // 75 이상
        good: number;      // 60 이상
        fair: number;      // 40 이상
    };
}