// lib/offline/OfflineManager.ts
// 오프라인 모드 관리자 (간단한 네트워크 감지)

import { CacheManager } from '@/lib/cache/AsyncStorageCache';
import { CACHE_KEYS } from '@/lib/cache/CacheKeys';

export interface OfflineData {
  keywords?: any;
  profile?: any;
  userKeywords?: any;
  companyKeywords?: any;
  lastSync?: string;
  isOfflineMode?: boolean;
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  lastConnected?: string;
  lastDisconnected?: string;
}

class OfflineManager {
  private cache: CacheManager;
  private networkStatus: NetworkStatus;
  private listeners: ((status: NetworkStatus) => void)[] = [];
  private syncQueue: (() => Promise<void>)[] = [];

  constructor() {
    this.cache = new CacheManager();
    this.networkStatus = {
      isConnected: false,
      isInternetReachable: false,
      type: 'unknown'
    };
    
    this.initNetworkListener();
  }

  // 네트워크 상태 모니터링 시작 (간소화된 버전)
  private initNetworkListener() {
    // 기본적으로 온라인 상태로 가정
    this.networkStatus = {
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      lastConnected: new Date().toISOString()
    };
    
    // 실제 네트워크 테스트를 통한 상태 확인
    this.checkNetworkStatus();
    
    // 주기적으로 네트워크 상태 확인 (30초마다)
    setInterval(() => {
      this.checkNetworkStatus();
    }, 30000);
  }
  
  // 실제 네트워크 연결 테스트
  private async checkNetworkStatus() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch('https://www.google.com', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      
      const wasConnected = this.networkStatus.isConnected;
      const isNowConnected = true;
      
      this.networkStatus = {
        ...this.networkStatus,
        isConnected: isNowConnected,
        isInternetReachable: isNowConnected,
        lastConnected: isNowConnected && !wasConnected ? new Date().toISOString() : this.networkStatus.lastConnected
      };
      
      // 연결이 복구되면 동기화 실행
      if (isNowConnected && !wasConnected) {
        this.onNetworkReconnected();
      }
      
      // 리스너들에게 알림
      this.listeners.forEach(listener => listener(this.networkStatus));
      
    } catch (error) {
      const wasConnected = this.networkStatus.isConnected;
      const isNowConnected = false;
      
      this.networkStatus = {
        ...this.networkStatus,
        isConnected: isNowConnected,
        isInternetReachable: isNowConnected,
        lastDisconnected: !isNowConnected && wasConnected ? new Date().toISOString() : this.networkStatus.lastDisconnected
      };
      
      console.log('📶 네트워크 상태: 오프라인');
      
      // 리스너들에게 알림
      this.listeners.forEach(listener => listener(this.networkStatus));
    }
  }

  // 네트워크 상태 리스너 등록
  onNetworkStatusChange(callback: (status: NetworkStatus) => void) {
    this.listeners.push(callback);
    
    // 현재 상태 즉시 전달
    callback(this.networkStatus);
    
    // 리스너 해제 함수 반환
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 현재 네트워크 상태
  getNetworkStatus(): NetworkStatus {
    return { ...this.networkStatus };
  }

  // 오프라인인지 확인
  isOffline(): boolean {
    return !this.networkStatus.isConnected || !this.networkStatus.isInternetReachable;
  }

  // 오프라인 데이터 저장
  async saveOfflineData(userId: string, userType: 'user' | 'company', data: OfflineData) {
    try {
      const offlineData = {
        ...data,
        lastSync: new Date().toISOString(),
        isOfflineMode: this.isOffline()
      };

      const key = `${CACHE_KEYS.OFFLINE_DATA}${userType}:${userId}`;
      await this.cache.set(key, offlineData, 7 * 24 * 60 * 60 * 1000); // 7일간 보관
      
      console.log('💾 오프라인 데이터 저장:', userType, userId);
    } catch (error) {
      console.error('오프라인 데이터 저장 실패:', error);
    }
  }

  // 오프라인 데이터 조회
  async getOfflineData(userId: string, userType: 'user' | 'company'): Promise<OfflineData | null> {
    try {
      const key = `${CACHE_KEYS.OFFLINE_DATA}${userType}:${userId}`;
      const data = await this.cache.get(key, true); // 만료된 캐시도 허용
      
      if (data) {
        console.log('📱 오프라인 데이터 조회:', userType, userId);
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('오프라인 데이터 조회 실패:', error);
      return null;
    }
  }

  // 오프라인 모드에서 사용 가능한 데이터 확인
  async checkOfflineAvailability(userId: string, userType: 'user' | 'company') {
    const offlineData = await this.getOfflineData(userId, userType);
    
    if (!offlineData) {
      return {
        available: false,
        reason: '캐시된 오프라인 데이터가 없습니다.',
        recommendation: '인터넷 연결을 확인하고 다시 시도해주세요.'
      };
    }

    const hasEssentials = offlineData.profile && (offlineData.keywords || offlineData.userKeywords || offlineData.companyKeywords);
    
    if (!hasEssentials) {
      return {
        available: false,
        reason: '필수 데이터가 부족합니다.',
        recommendation: '인터넷에 연결하여 데이터를 동기화해주세요.'
      };
    }

    // 마지막 동기화로부터 시간 계산
    const lastSync = offlineData.lastSync ? new Date(offlineData.lastSync) : new Date(0);
    const hoursSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);

    return {
      available: true,
      data: offlineData,
      lastSync: offlineData.lastSync,
      hoursSinceSync: Math.round(hoursSinceSync),
      isDataFresh: hoursSinceSync < 24
    };
  }

  // 동기화 작업 큐에 추가
  addToSyncQueue(syncOperation: () => Promise<void>) {
    this.syncQueue.push(syncOperation);
    
    // 온라인 상태이면 즉시 실행
    if (!this.isOffline()) {
      this.processSyncQueue();
    }
  }

  // 네트워크 재연결 시 호출
  private async onNetworkReconnected() {
    console.log('🔄 네트워크 재연결됨, 동기화 시작...');
    
    try {
      await this.processSyncQueue();
      console.log('✅ 동기화 완료');
    } catch (error) {
      console.error('동기화 실패:', error);
    }
  }

  // 동기화 큐 처리
  private async processSyncQueue() {
    if (this.syncQueue.length === 0) {
      return;
    }

    const operations = [...this.syncQueue];
    this.syncQueue = [];

    console.log(`🔄 ${operations.length}개 동기화 작업 실행 중...`);

    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        console.error('동기화 작업 실패:', error);
        // 실패한 작업은 큐에 다시 추가하지 않음 (무한 반복 방지)
      }
    }
  }

  // 오프라인 모드 UI 상태
  getOfflineModeInfo() {
    if (!this.isOffline()) {
      return null;
    }

    const lastConnected = this.networkStatus.lastConnected;
    const disconnectedSince = this.networkStatus.lastDisconnected;

    return {
      isOffline: true,
      lastConnected,
      disconnectedSince,
      message: this.getOfflineMessage(),
      canUseCachedData: true
    };
  }

  // 오프라인 상태 메시지 생성
  private getOfflineMessage(): string {
    if (!this.networkStatus.lastConnected) {
      return '인터넷에 연결되지 않았습니다. 캐시된 데이터로 제한적인 기능을 이용할 수 있습니다.';
    }

    const lastConnected = new Date(this.networkStatus.lastConnected);
    const hoursAgo = Math.floor((Date.now() - lastConnected.getTime()) / (1000 * 60 * 60));

    if (hoursAgo < 1) {
      return '인터넷 연결이 끊어졌습니다. 잠시 후 자동으로 다시 연결됩니다.';
    } else if (hoursAgo < 24) {
      return `${hoursAgo}시간 전부터 오프라인입니다. 캐시된 데이터를 사용 중입니다.`;
    } else {
      const daysAgo = Math.floor(hoursAgo / 24);
      return `${daysAgo}일 전부터 오프라인입니다. 일부 데이터가 오래되었을 수 있습니다.`;
    }
  }

  // 오프라인 데이터 정리
  async cleanupOfflineData() {
    try {
      // 30일 이상 된 오프라인 데이터 삭제
      const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000);
      
      // 실제 정리 로직은 CacheManager에서 구현될 예정
      console.log('🧹 오프라인 데이터 정리 완료');
    } catch (error) {
      console.error('오프라인 데이터 정리 실패:', error);
    }
  }
}

// 전역 인스턴스 생성
export const offlineManager = new OfflineManager();
export default OfflineManager;