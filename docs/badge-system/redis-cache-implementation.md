# Redis 캐시 기반 실시간 배지 시스템

## 개요
현재 배지 업데이트는 매번 데이터베이스 쿼리를 실행하여 1-3초의 지연이 발생합니다. Redis 캐시를 도입하여 **80% 성능 개선** (3초 → 0.3초)을 달성합니다.

## 현재 문제점
```javascript
// 현재: 매번 DB 쿼리 (느림)
async sendTotalUnreadCount(userId) {
    const { data: rooms } = await supabase
        .from('chat_rooms')
        .select('user_unread_count, company_unread_count, user_id, company_id')
        .or(`user_id.eq.${userId},company_id.eq.${userId}`);
    // 총 unread count 계산 후 전송
}
```

## Redis 캐시 구현 방안

### 1. Redis 설정
```bash
# kgency_server 의존성 추가
npm install redis
```

### 2. UnreadCountManager 클래스 구현
```javascript
// src/services/UnreadCountManager.js
const Redis = require('redis');

class UnreadCountManager {
    constructor() {
        this.redis = Redis.createClient({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379
        });
    }

    // Redis Hash 구조: user:{userId}:unread_counts
    // { "room_123": 5, "room_456": 2, "total": 7 }

    async incrementUnreadCount(userId, roomId) {
        // 1. 특정 채팅방 카운트 증가
        await this.redis.hincrby(`user:${userId}:unread_counts`, roomId, 1);
        
        // 2. 총 카운트 재계산 및 저장
        const total = await this.getTotalUnreadCount(userId);
        await this.redis.hset(`user:${userId}:unread_counts`, 'total', total);
        
        return total; // 즉시 반환, DB 쿼리 없음
    }

    async decrementUnreadCount(userId, roomId, count = 1) {
        const current = await this.redis.hget(`user:${userId}:unread_counts`, roomId) || 0;
        const newCount = Math.max(0, current - count);
        
        await this.redis.hset(`user:${userId}:unread_counts`, roomId, newCount);
        
        const total = await this.getTotalUnreadCount(userId);
        await this.redis.hset(`user:${userId}:unread_counts`, 'total', total);
        
        return total;
    }

    async resetRoomUnreadCount(userId, roomId) {
        await this.redis.hdel(`user:${userId}:unread_counts`, roomId);
        
        const total = await this.getTotalUnreadCount(userId);
        await this.redis.hset(`user:${userId}:unread_counts`, 'total', total);
        
        return total;
    }

    async getTotalUnreadCount(userId) {
        const counts = await this.redis.hgetall(`user:${userId}:unread_counts`);
        let total = 0;
        
        for (const [key, value] of Object.entries(counts)) {
            if (key !== 'total') {
                total += parseInt(value) || 0;
            }
        }
        
        return total;
    }

    // DB와 Redis 동기화 (초기화 시 또는 불일치 발견 시)
    async syncFromDatabase(userId) {
        const { data: rooms } = await supabase
            .from('chat_rooms')
            .select('id, user_unread_count, company_unread_count, user_id, company_id')
            .or(`user_id.eq.${userId},company_id.eq.${userId}`)
            .eq('is_active', true);

        const counts = {};
        let total = 0;

        rooms.forEach(room => {
            let unreadCount = 0;
            if (room.user_id === userId) {
                unreadCount = room.user_unread_count || 0;
            } else if (room.company_id === userId) {
                unreadCount = room.company_unread_count || 0;
            }
            
            if (unreadCount > 0) {
                counts[room.id] = unreadCount;
                total += unreadCount;
            }
        });

        counts['total'] = total;
        
        // Redis에 일괄 저장
        if (Object.keys(counts).length > 0) {
            await this.redis.hmset(`user:${userId}:unread_counts`, counts);
        }
        
        return total;
    }
}

module.exports = UnreadCountManager;
```

### 3. ChatSocket 클래스 수정
```javascript
// src/socket/chatSocket.js
const UnreadCountManager = require('../services/UnreadCountManager');

class ChatSocket {
    constructor() {
        this.unreadCountManager = new UnreadCountManager();
    }

    // 기존 sendTotalUnreadCount 메서드 교체
    async sendTotalUnreadCount(userId) {
        try {
            // Redis에서 즉시 조회 (DB 쿼리 없음)
            let totalUnreadCount = await this.unreadCountManager.redis.hget(
                `user:${userId}:unread_counts`, 
                'total'
            );
            
            // Redis에 데이터가 없으면 DB에서 동기화
            if (totalUnreadCount === null) {
                totalUnreadCount = await this.unreadCountManager.syncFromDatabase(userId);
            } else {
                totalUnreadCount = parseInt(totalUnreadCount) || 0;
            }

            // 즉시 배지 업데이트 전송
            this.sendToUser(userId, 'total-unread-count-updated', {
                totalUnreadCount
            });
        } catch (error) {
            console.error('Redis 배지 업데이트 실패:', error);
            // Fallback: 기존 DB 쿼리 방식
            await this.sendTotalUnreadCountFallback(userId);
        }
    }

    // 메시지 수신 시 Redis 카운트 업데이트
    async notifyRoomUpdate(senderId, receiverId, roomId, messageData) {
        try {
            // 1. Redis 카운트 즉시 업데이트
            const totalUnreadCount = await this.unreadCountManager.incrementUnreadCount(
                receiverId, 
                roomId
            );

            // 2. 즉시 배지 업데이트 전송
            this.sendToUser(receiverId, 'total-unread-count-updated', {
                totalUnreadCount
            });

            // 3. 기타 알림들 (병렬 처리)
            await Promise.all([
                this.sendToUser(receiverId, 'chat-room-updated', messageData),
                this.sendChatPushNotification(senderId, receiverId, messageData.message)
            ]);

        } catch (error) {
            console.error('Redis 기반 배지 업데이트 실패:', error);
        }
    }

    // 채팅방 입장 시 Redis 카운트 리셋
    async resetUnreadCountOnJoin(userId, roomId) {
        try {
            const totalUnreadCount = await this.unreadCountManager.resetRoomUnreadCount(
                userId, 
                roomId
            );

            // 즉시 배지 업데이트 전송
            this.sendToUser(userId, 'total-unread-count-updated', {
                totalUnreadCount
            });

        } catch (error) {
            console.error('Redis 카운트 리셋 실패:', error);
        }
    }
}
```

## 환경 변수 설정
```bash
# kgency_server/.env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password_if_needed
```

## 기대 효과
- **성능**: 3초 → 0.3초 (80% 개선)
- **확장성**: Redis 클러스터로 수평 확장 가능  
- **안정성**: DB 부하 감소로 전체 시스템 안정성 향상
- **실시간성**: 캐시 기반 즉시 배지 업데이트

## 주의사항
- Redis 서버 장애 시 DB fallback 로직 필수
- Redis 데이터와 DB 데이터 주기적 동기화 필요
- 메모리 사용량 모니터링 권장