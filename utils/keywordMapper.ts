interface Keyword {
    id: number
    keyword: string
    category: string
}
/**
 * 키워드 매핑 유틸리티 함수들
 */
export class KeywordMapper {
    constructor(private keywords: Keyword[]) {}
    /**
     * 나이를 나이대 키워드 ID로 변환
     */
    getAgeKeywordId(ageValue: string): number | null {
        const ageNum = parseInt(ageValue);
        if (isNaN(ageNum)) return null;
        const ageKeyword = this.keywords.find(k => {
            if (k.category !== '나이대') return false;
            if (ageNum >= 20 && ageNum < 25 && k.keyword === '20-24세') return true;
            if (ageNum >= 25 && ageNum < 30 && k.keyword === '25-29세') return true;
            if (ageNum >= 30 && ageNum < 35 && k.keyword === '30-34세') return true;
            if (ageNum >= 35 && k.keyword === '35세 이상') return true;
            return false;
        });
        return ageKeyword?.id || null;
    }
    /**
     * 카테고리와 값으로 키워드 ID 찾기
     */
    getKeywordIdByValue(category: string, value: string): number | null {
        const keyword = this.keywords.find(k =>
            k.category === category && k.keyword === value
        );
        return keyword?.id || null;
    }
    /**
     * 성별을 키워드 ID로 변환
     */
    getGenderKeywordId(genderValue: string): number | null {
        return this.getKeywordIdByValue('성별', genderValue);
    }
    /**
     * 비자를 키워드 ID로 변환
     */
    getVisaKeywordId(visaValue: string): number | null {
        return this.getKeywordIdByValue('비자', visaValue);
    }
    /**
     * 한국어수준을 키워드 ID로 변환
     */
    getKoreanLevelKeywordId(koreanLevelValue: string): number | null {
        return this.getKeywordIdByValue('한국어수준', koreanLevelValue);
    }
    /**
     * 희망근무요일들을 키워드 ID 배열로 변환
     */
    getPreferredDayKeywordIds(preferredDays: string[]): number[] {
        return preferredDays.map(day => {
            return this.getKeywordIdByValue('근무요일', day);
        }).filter((id): id is number => id !== null && id !== undefined);
    }
    /**
     * 여러 카테고리의 값들을 키워드 ID 배열로 변환
     */
    mapValuesToKeywordIds(mappings: Array<{ category: string; values: string[] }>): number[] {
        const keywordIds: number[] = [];
        
        mappings.forEach(({ category, values }) => {
            values.forEach(value => {
                const keywordId = this.getKeywordIdByValue(category, value);
                if (keywordId) {
                    keywordIds.push(keywordId);
                }
            });
        });
        return keywordIds;
    }
}