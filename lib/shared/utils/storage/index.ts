// lib/storeUtils.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// 현재 로그인한 사용자 정보를 기반으로 고유한 스토리지 키를 생성
export const createUserSpecificKey = (baseKey: string): string => {
  // 런타임에서 현재 사용자 정보를 가져올 수 없으므로, 
  // 각 스토어에서 동적으로 키를 설정할 수 있도록 기본 구조만 제공
  return `${baseKey}-user-specific`;
};

// 사용자별 스토리지 키를 업데이트하는 함수
export const updateStoreKey = async (userId: string, userType: 'user' | 'company', baseKey: string): Promise<string> => {
  const newKey = `${baseKey}-${userType}-${userId}`;
  return newKey;
};

// 로그아웃 시 사용자별 모든 스토리지 키를 정리하는 함수
export const clearUserSpecificStorage = async (userId: string, userType: 'user' | 'company') => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    
    // 현재 사용자와 관련된 키들만 필터링
    const userSpecificKeys = allKeys.filter(key => 
      key.includes(`-${userType}-${userId}`) ||
      key.includes(`${userId}-`) ||
      (key.includes('-storage') && key.includes(userType))
    );
    
    if (userSpecificKeys.length > 0) {
      console.log(`사용자별 스토리지 정리: ${userSpecificKeys.length}개 키 삭제`, userSpecificKeys);
      await AsyncStorage.multiRemove(userSpecificKeys);
    }
  } catch (error) {
    console.error('사용자별 스토리지 정리 실패:', error);
  }
};

// 모든 사용자 관련 캐시 정리 (완전 로그아웃용)
export const clearAllUserCaches = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    
    // 사용자 관련 키들 필터링
    const cacheKeys = allKeys.filter(key =>
      key.includes('-storage') ||
      key.includes('-cache') ||
      key.includes('user-') ||
      key.includes('company-') ||
      key.includes('form-') ||
      key.includes('posting-') ||
      key.includes('application-') ||
      key.includes('keywords-')
    );
    
    if (cacheKeys.length > 0) {
      console.log(`전체 캐시 정리: ${cacheKeys.length}개 키 삭제`, cacheKeys);
      await AsyncStorage.multiRemove(cacheKeys);
    }
  } catch (error) {
    console.error('전체 캐시 정리 실패:', error);
  }
};