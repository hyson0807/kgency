import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl: ttlMs
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
      console.warn('캐시 저장 실패:', key, error);
    }
  }

  async get<T>(key: string, allowExpired: boolean = false): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      if (!item) return null;

      const cacheItem: CacheItem<T> = JSON.parse(item);
      const isExpired = Date.now() - cacheItem.timestamp > cacheItem.ttl;

      if (isExpired && !allowExpired) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      console.warn('캐시 조회 실패:', key, error);
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('캐시 삭제 실패:', key, error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('캐시 전체 삭제 실패:', error);
    }
  }

  async getSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache:'));
      return cacheKeys.length;
    } catch (error) {
      console.warn('캐시 크기 조회 실패:', error);
      return 0;
    }
  }
}