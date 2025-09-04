# 채팅 시스템 구현 보고서

## 📋 프로젝트 개요

K-Gency 앱에 구직자와 회사 간의 실시간 채팅 기능을 구현했습니다. 채팅은 구직자가 지원서를 제출한 후 자동으로 활성화되어 회사가 구직자의 정보와 한국어 실력을 확인할 수 있도록 설계되었습니다.

## 🏗️ 시스템 아키텍처

### 데이터베이스 설계

#### chat_rooms 테이블
```sql
- id (UUID, PK): 채팅방 고유 식별자
- application_id (UUID, FK): 지원서 ID (applications.id 참조)
- user_id (UUID, FK): 구직자 ID (profiles.id 참조)
- company_id (UUID, FK): 회사 ID (profiles.id 참조)
- job_posting_id (UUID, FK): 공고 ID (job_postings.id 참조)
- last_message (TEXT): 마지막 메시지 내용
- last_message_at (TIMESTAMPTZ): 마지막 메시지 시간
- user_unread_count (INTEGER): 구직자 읽지 않은 메시지 수
- company_unread_count (INTEGER): 회사 읽지 않은 메시지 수
- is_active (BOOLEAN): 채팅방 활성화 상태
- created_at (TIMESTAMPTZ): 생성 시간
- updated_at (TIMESTAMPTZ): 수정 시간
```

#### chat_messages 테이블
```sql
- id (UUID, PK): 메시지 고유 식별자
- room_id (UUID, FK): 채팅방 ID (chat_rooms.id 참조)
- sender_id (UUID, FK): 발신자 ID (profiles.id 참조)
- message (TEXT): 메시지 내용
- is_read (BOOLEAN): 읽음 상태
- created_at (TIMESTAMPTZ): 생성 시간
```

### 보안 설정

#### Row Level Security (RLS) 정책
- **chat_rooms**: 사용자는 자신이 참여한 채팅방만 접근 가능
- **chat_messages**: 사용자는 자신이 참여한 채팅방의 메시지만 접근 가능

#### 데이터베이스 트리거
- **메시지 삽입 시**: 자동으로 채팅방의 `last_message`, `last_message_at`, 읽지 않은 메시지 수 업데이트

## 🔧 서버 API 구현

### 엔드포인트 목록

#### 채팅방 관리
- `POST /api/chat/create-room`: 채팅방 생성
- `GET /api/chat/user/rooms`: 구직자용 채팅방 목록
- `GET /api/chat/company/rooms`: 회사용 채팅방 목록
- `GET /api/chat/room/:roomId`: 특정 채팅방 정보

#### 메시지 관리
- `GET /api/chat/room/:roomId/messages`: 메시지 목록 조회
- ~~`POST /api/chat/room/:roomId/message`: 메시지 전송~~ (Socket.io를 통한 실시간 전송으로 대체)
- `PATCH /api/chat/room/:roomId/read`: 메시지 읽음 처리

### 구현된 기능

#### 1. 권한 검증 시스템
```javascript
// 헬퍼 함수로 중복 코드 제거
const validateChatRoomAccess = async (roomId, userId) => {
    const { data, error } = await supabase
        .from('chat_rooms')
        .select('user_id, company_id')
        .eq('id', roomId)
        .single();
    
    if (error) return { error: '채팅방을 찾을 수 없습니다.', status: 404 };
    if (data.user_id !== userId && data.company_id !== userId) {
        return { error: '접근 권한이 없습니다.', status: 403 };
    }
    
    return { data };
};
```

#### 2. JWT 인증
- 모든 채팅 API는 JWT 토큰 인증 필요
- `authMiddleware`를 통한 사용자 신원 확인

#### 3. 에러 처리
- 400: 잘못된 요청 (필수 파라미터 누락)
- 401: 인증 실패
- 403: 권한 없음
- 404: 리소스 없음
- 500: 서버 오류

## 📱 클라이언트 구현

### 구현된 화면

#### 1. 채팅방 목록 (구직자용)
- 파일: `app/(user)/chats.tsx`
- 기능:
  - 참여 중인 채팅방 목록 표시
  - 회사명, 공고 제목, 마지막 메시지, 시간 표시
  - 읽지 않은 메시지 카운트 배지
  - 빈 상태 UI: "공고에 지원하고 회사와 채팅하세요"

#### 2. 채팅방 목록 (회사용)
- 파일: `app/(company)/chats.tsx`
- 기능:
  - 회사 소속 채팅방 목록 표시
  - 구직자명, 공고 제목, 마지막 메시지, 시간 표시
  - 읽지 않은 메시지 카운트 배지
  - 빈 상태 UI: "구직자의 지원을 기다리고 있습니다"

#### 3. 탭 네비게이션 통합
- 구직자: 홈 - 지원관리 - **채팅** - 면접일정 - 설정
- 회사: 홈 - 공고관리 - **채팅** - 면접관리 - 설정

### TypeScript 인터페이스

#### ChatRoom 인터페이스
```typescript
interface ChatRoom {
  id: string;
  application_id: string;
  company_id: string; // 구직자용
  user_id: string; // 회사용
  job_posting_id: string;
  last_message?: string;
  last_message_at?: string;
  user_unread_count: number; // 구직자용
  company_unread_count: number; // 회사용
  company: { name: string }; // 구직자용
  user: { name: string }; // 회사용
  job_postings: { title: string } | null;
}
```

## 🔄 채팅방 생성 플로우

### 1. 지원서 제출 시 자동 생성
- 파일: `app/(pages)/(user)/(application-registration)/resume.tsx`
- 지원서 제출 성공 후 `POST /api/chat/create-room` 호출
- 필수 파라미터:
  - `application_id`: 생성된 지원서 ID
  - `user_id`: 구직자 ID
  - `company_id`: 회사 ID
  - `job_posting_id`: 공고 ID

### 2. 중복 생성 방지
- `application_id`를 기준으로 기존 채팅방 존재 여부 확인
- 이미 존재하면 기존 채팅방 정보 반환

## ✅ 완성된 기능

1. **채팅방 생성**: 지원서 제출 후 자동 생성
2. **채팅방 목록**: 구직자/회사별 채팅방 목록 조회
3. **권한 관리**: JWT 인증 및 채팅방 접근 권한 검증
4. **데이터 동기화**: 메시지 수, 마지막 메시지 자동 업데이트
5. **UI/UX**: 직관적인 채팅방 목록 인터페이스
6. **에러 처리**: 포괄적인 오류 상황 대응

## 🔧 최적화 완료 항목

1. **코드 중복 제거**: `validateChatRoomAccess` 헬퍼 함수 도입
2. **API 효율성**: 권한 확인과 데이터 조회 통합
3. **TypeScript 타입 안전성**: null 가능성 명시
4. **JWT 토큰 필드 통일**: `userId` 필드 일관성 확보

## 🚨 발견된 이슈 및 해결

### 1. 서버 인증 토큰 필드 불일치
- **문제**: `req.user.id` vs `req.user.userId` 혼용
- **해결**: 모든 컨트롤러에서 `req.user.userId` 사용 통일

### 2. 존재하지 않는 API 호출
- **문제**: `/api/auth/user` 엔드포인트 호출 시 404 오류
- **해결**: `useAuth()` 훅의 `user.userId` 직접 사용으로 변경

### 3. 중복 권한 검증 로직
- **문제**: 모든 메서드에서 동일한 권한 확인 코드 반복
- **해결**: `validateChatRoomAccess` 헬퍼 함수로 통합

### 4. TypeScript 타입 불일치
- **문제**: `job_postings`가 null일 수 있는데 타입에 반영 안됨
- **해결**: `job_postings: {...} | null` 타입 수정

## 📊 테스트 현황

### 테스트된 시나리오
1. ✅ 지원서 제출 후 채팅방 자동 생성
2. ✅ 구직자용 채팅방 목록 조회
3. ✅ 회사용 채팅방 목록 조회
4. ✅ 중복 채팅방 생성 방지
5. ✅ JWT 인증 검증

### 미테스트 시나리오
- 개별 채팅방 페이지 (미구현)
- 실시간 메시징
- 메시지 읽음 상태 동기화

---

# 📋 다음 단계 계획

## 🎯 우선순위 1: 개별 채팅방 페이지 구현

### 필요한 작업

#### 1. 라우트 파일 생성
- 파일: `app/(pages)/chat/[roomId].tsx`
- 동적 라우트를 통한 채팅방 ID별 페이지

#### 2. 채팅 인터페이스 구현
```typescript
interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
```

#### 3. 주요 기능
- 메시지 목록 표시 (시간순)
- 메시지 전송 입력창
- 메시지 읽음 처리
- 상대방 정보 표시 (헤더)
- 실시간 메시지 수신 (선택사항)

#### 4. UI 컴포넌트
- 메시지 버블 (발신/수신 구분)
- 시간 표시
- 읽음 상태 표시
- 메시지 입력창
- 전송 버튼

### 예상 개발 시간: 2-3시간

## 🎯 우선순위 2: 실시간 메시징 (선택사항)

### 구현 방식 검토

#### Option A: Polling (간단함)
```typescript
// 5초마다 새 메시지 확인
useEffect(() => {
  const interval = setInterval(() => {
    fetchNewMessages();
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

#### Option B: Supabase Realtime (권장)
```typescript
// Supabase 실시간 구독
useEffect(() => {
  const subscription = supabase
    .channel(`chat_room_${roomId}`)
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'chat_messages' },
      handleNewMessage
    )
    .subscribe();
  
  return () => subscription.unsubscribe();
}, [roomId]);
```

### 예상 개발 시간: 1-2시간

## 🎯 우선순위 3: UX 개선사항

### 1. 메시지 알림
- 새 메시지 도착 시 푸시 알림
- 읽지 않은 메시지 배지 업데이트

### 2. 메시지 기능 확장
- 메시지 타임스탬프 개선
- 메시지 상태 표시 (전송중/전송완료/읽음)
- 긴 메시지 처리

### 3. 성능 최적화
- 메시지 페이지네이션
- 이미지/파일 전송 (선택사항)
- 메시지 캐싱

### 예상 개발 시간: 2-4시간

## 📝 구현 가이드라인

### 1. 파일 구조
```
app/(pages)/chat/
├── [roomId].tsx          # 개별 채팅방 페이지
└── _layout.tsx           # 채팅 레이아웃 (선택사항)

components/chat/
├── MessageBubble.tsx     # 메시지 버블 컴포넌트
├── MessageInput.tsx      # 메시지 입력 컴포넌트
├── ChatHeader.tsx        # 채팅방 헤더
└── MessageList.tsx       # 메시지 목록
```

### 2. 상태 관리
```typescript
// 채팅방 상태 관리
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [loading, setLoading] = useState(true);
const [sending, setSending] = useState(false);
const [newMessage, setNewMessage] = useState('');
```

### 3. API 호출 패턴
```typescript
// 메시지 목록 조회
const fetchMessages = async () => {
  const response = await api('GET', `/api/chat/room/${roomId}/messages`);
  if (response.success) {
    setMessages(response.data);
  }
};

// 메시지 전송 (Socket.io 사용)
const sendMessage = async (message: string) => {
  setSending(true);
  const success = await socketManager.sendMessage(message.trim());
  if (success) {
    setNewMessage('');
    // 메시지는 실시간 이벤트로 수신됨
  }
  setSending(false);
};
```

## 🔍 테스트 계획

### 단위 테스트
1. 메시지 전송 기능
2. 메시지 읽음 처리
3. 실시간 메시지 수신
4. 권한 검증

### 통합 테스트
1. 전체 채팅 플로우 (지원 → 채팅방 생성 → 메시지 교환)
2. 구직자/회사 간 양방향 채팅
3. 여러 채팅방 동시 관리

### 사용자 테스트
1. 실제 지원 프로세스 테스트
2. 다양한 디바이스에서 채팅 기능 테스트
3. 네트워크 상태에 따른 동작 테스트

## 🚀 배포 고려사항

### 성능
- 메시지 페이지네이션으로 초기 로딩 속도 개선
- 이미지 최적화 및 lazy loading

### 보안
- XSS 방지를 위한 메시지 내용 sanitization
- 스팸 메시지 방지 기능

### 모니터링
- 채팅 사용률 추적
- 메시지 전송 실패율 모니터링
- 실시간 연결 상태 모니터링

---

## 📞 지원 및 문의

채팅 시스템 구현 관련 문의사항이 있으시면 개발팀으로 연락해 주세요.

**작성일**: 2025-09-01  
**작성자**: Claude (AI Assistant)  
**문서 버전**: 1.0