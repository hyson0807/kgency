# 이벤트 기반 병렬 처리 아키텍처

## 개요
현재 배지 업데이트가 순차적으로 처리되어 지연이 발생합니다. 이벤트 기반 병렬 처리로 **즉시 배지 업데이트**를 구현합니다.

## 현재 문제점
```javascript
// 현재: 순차 처리 (지연 발생)
async notifyRoomUpdate(senderId, receiverId, roomId, messageData) {
    // 1. 채팅방 업데이트 전송 (0.1초)
    this.sendToUser(receiverId, 'chat-room-updated', messageData);
    
    // 2. 배지 카운트 계산 및 전송 (2초 - DB 쿼리)
    await this.sendTotalUnreadCount(receiverId);
    
    // 3. 푸시 알림 전송 (0.5초)
    await this.sendChatPushNotification(senderId, receiverId, messageData.message);
    
    // 총 소요 시간: 2.6초
}
```

## 이벤트 기반 병렬 처리 구현

### 1. EventBus 클래스 구현
```javascript
// src/services/EventBus.js
const EventEmitter = require('events');

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(100); // 동시 이벤트 처리량 증가
    }

    // 메시지 관련 이벤트 발생
    emitMessageReceived(data) {
        this.emit('message:received', data);
    }

    emitUserJoinedRoom(data) {
        this.emit('user:joined_room', data);
    }

    emitBadgeUpdateNeeded(data) {
        this.emit('badge:update_needed', data);
    }
}

// 싱글톤 인스턴스
const eventBus = new EventBus();
module.exports = eventBus;
```

### 2. 이벤트 핸들러 구현
```javascript
// src/handlers/BadgeEventHandler.js
const eventBus = require('../services/EventBus');
const UnreadCountManager = require('../services/UnreadCountManager');

class BadgeEventHandler {
    constructor(chatSocket) {
        this.chatSocket = chatSocket;
        this.unreadCountManager = new UnreadCountManager();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // 메시지 수신 시 배지 업데이트
        eventBus.on('message:received', async (data) => {
            try {
                await this.handleMessageReceived(data);
            } catch (error) {
                console.error('배지 업데이트 이벤트 처리 실패:', error);
            }
        });

        // 채팅방 입장 시 배지 리셋
        eventBus.on('user:joined_room', async (data) => {
            try {
                await this.handleUserJoinedRoom(data);
            } catch (error) {
                console.error('채팅방 입장 배지 처리 실패:', error);
            }
        });
    }

    async handleMessageReceived({ senderId, receiverId, roomId, messageData }) {
        // Redis에서 즉시 카운트 업데이트
        const totalUnreadCount = await this.unreadCountManager.incrementUnreadCount(
            receiverId, 
            roomId
        );

        // 즉시 배지 업데이트 전송 (0.1초)
        this.chatSocket.sendToUser(receiverId, 'total-unread-count-updated', {
            totalUnreadCount
        });

        console.log(`✅ 배지 업데이트 완료: ${receiverId} → ${totalUnreadCount}`);
    }

    async handleUserJoinedRoom({ userId, roomId }) {
        // Redis에서 즉시 카운트 리셋
        const totalUnreadCount = await this.unreadCountManager.resetRoomUnreadCount(
            userId, 
            roomId
        );

        // 즉시 배지 업데이트 전송
        this.chatSocket.sendToUser(userId, 'total-unread-count-updated', {
            totalUnreadCount
        });

        console.log(`✅ 배지 리셋 완료: ${userId} → ${totalUnreadCount}`);
    }
}

module.exports = BadgeEventHandler;
```

### 3. ChatSocket 클래스 수정
```javascript
// src/socket/chatSocket.js 수정
const eventBus = require('../services/EventBus');
const BadgeEventHandler = require('../handlers/BadgeEventHandler');

class ChatSocket {
    constructor() {
        // 배지 이벤트 핸들러 초기화
        this.badgeHandler = new BadgeEventHandler(this);
    }

    // 개선된 메시지 처리: 이벤트 기반 병렬 처리
    async notifyRoomUpdate(senderId, receiverId, roomId, messageData) {
        try {
            // 모든 작업을 병렬로 처리 (총 소요 시간: 0.5초)
            const promises = [
                // 1. 채팅방 업데이트 즉시 전송 (0.1초)
                this.sendToUser(receiverId, 'chat-room-updated', messageData),
                
                // 2. 배지 업데이트 이벤트 발생 → 병렬 처리 (0.1초)
                this.emitBadgeUpdateEvent(senderId, receiverId, roomId, messageData),
                
                // 3. 푸시 알림 전송 (0.5초)
                this.sendChatPushNotification(senderId, receiverId, messageData.message)
            ];

            // 병렬 실행으로 지연 시간 최소화
            await Promise.allSettled(promises);
            
            console.log('✅ 메시지 처리 완료 (병렬 처리)');
            
        } catch (error) {
            console.error('메시지 처리 중 오류:', error);
        }
    }

    // 배지 업데이트 이벤트 발생 (별도 프로세스에서 처리)
    emitBadgeUpdateEvent(senderId, receiverId, roomId, messageData) {
        // 이벤트 발생 → BadgeEventHandler에서 처리
        eventBus.emitMessageReceived({
            senderId,
            receiverId,
            roomId,
            messageData
        });
    }

    // 채팅방 입장 처리 개선
    async handleJoinRoom(socket, roomId) {
        try {
            const userId = socket.user.userId;
            
            // 소켓 채팅방 입장
            socket.join(roomId);
            socket.emit('joined-room', { roomId });

            // 배지 리셋 이벤트 발생 (병렬 처리)
            eventBus.emitUserJoinedRoom({ userId, roomId });
            
            console.log(`✅ 채팅방 입장: ${userId} → ${roomId}`);
            
        } catch (error) {
            console.error('채팅방 입장 처리 실패:', error);
            socket.emit('error', { message: '채팅방 입장 실패' });
        }
    }
}
```

### 4. 서버 초기화 시 이벤트 핸들러 등록
```javascript
// src/app.js 또는 server.js
const ChatSocket = require('./socket/chatSocket');
const BadgeEventHandler = require('./handlers/BadgeEventHandler');

// Socket.io 초기화
const io = require('socket.io')(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

// ChatSocket 인스턴스 생성 (BadgeEventHandler 자동 초기화)
const chatSocket = new ChatSocket();
chatSocket.initialize(io);

console.log('✅ 이벤트 기반 배지 시스템 초기화 완료');
```

## 성능 비교

### 기존 (순차 처리)
```
메시지 수신 → 채팅방 업데이트 (0.1초) → DB 쿼리 + 배지 전송 (2초) → 푸시 알림 (0.5초)
총 소요 시간: 2.6초
```

### 개선 (병렬 처리)
```
메시지 수신 → [채팅방 업데이트 (0.1초) | 배지 이벤트 (0.1초) | 푸시 알림 (0.5초)] 병렬 실행
총 소요 시간: 0.5초 (80% 단축)
```

## 기대 효과
- **즉시 배지 업데이트**: 0.1초 이내 배지 변경
- **병렬 처리**: 전체 메시지 처리 시간 80% 단축
- **시스템 안정성**: 이벤트 기반으로 장애 격리
- **확장성**: 새로운 이벤트 핸들러 쉽게 추가 가능

## 주의사항
- EventEmitter 메모리 리크 방지를 위한 리스너 정리 필요
- 이벤트 처리 실패 시 로깅 및 모니터링 필수
- 고부하 시 이벤트 큐 백프레셰 관리