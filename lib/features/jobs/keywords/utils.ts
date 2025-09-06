// lib/utils/keywords/utils.ts
/**
 * 요일 키워드를 월화수목금토일 순서로 정렬하는 함수
 */
export const sortWorkDayKeywords = <T extends { keyword: string }>(workDayKeywords: T[]): T[] => {
    const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
    
    return workDayKeywords.sort((a, b) => {
        const indexA = dayOrder.indexOf(a.keyword);
        const indexB = dayOrder.indexOf(b.keyword);
        
        // 정의된 요일이 아닌 경우 맨 뒤로
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
    });
};

/**
 * 매칭된 키워드들을 카테고리별로 정렬하는 함수
 * 근무요일의 경우 월화수목금토일 순서로 정렬
 */
export const sortMatchedKeywords = <T extends { keyword: string; category: string }>(keywords: T[]): T[] => {
    return keywords.sort((a, b) => {
        // 카테고리가 다르면 기존 순서 유지
        if (a.category !== b.category) return 0;
        
        // 근무요일 카테고리인 경우 요일 순서로 정렬
        if (a.category === '근무요일') {
            const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
            const indexA = dayOrder.indexOf(a.keyword);
            const indexB = dayOrder.indexOf(b.keyword);
            
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            
            return indexA - indexB;
        }
        
        // 다른 카테고리는 기존 순서 유지
        return 0;
    });
};