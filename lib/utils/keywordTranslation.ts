export interface TranslatableKeyword {
  id: number;
  keyword: string;
  category: string;
}
// translateDB 함수를 매개변수로 받는 순수 함수로 변경
export const translateKeyword = (
  keyword: TranslatableKeyword, 
  translateDB: (tableName: string, columnName: string, rowId: string, defaultText: string) => string
): TranslatableKeyword => {
  const translatedText = translateDB('keyword', 'keyword', keyword.id.toString(), keyword.keyword);
  
  // "상관없음"을 "기타"로 표시 (번역된 텍스트에서도 적용)
  const displayText = keyword.keyword === '상관없음' && translatedText === '상관없음' ? '기타' : translatedText;
  
  return {
    ...keyword,
    keyword: displayText
  };
};
export const translateKeywords = (
  keywords: TranslatableKeyword[], 
  translateDB: (tableName: string, columnName: string, rowId: string, defaultText: string) => string
): TranslatableKeyword[] => {
  return keywords.map(keyword => translateKeyword(keyword, translateDB));
};