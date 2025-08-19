// types/matching.ts
export interface KeywordInfo {
    id: number;
    keyword: string;
}
export interface MatchedKeywords {
    countries: KeywordInfo[];
    jobs: KeywordInfo[];
    conditions: KeywordInfo[];
    location: KeywordInfo[];
    moveable: KeywordInfo[];
    gender: KeywordInfo[];
    age: KeywordInfo[];
    visa: KeywordInfo[];
    koreanLevel: KeywordInfo[];
}