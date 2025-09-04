/**
 * 채팅 관련 타입 정의
 */

// 기본 메시지 타입
export interface SocketMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  message_type?: string; // 메시지 타입 (resume, video_introduction, regular 등)
  created_at: string;
  is_read: boolean;
}

// 채팅방 UI에서 사용하는 메시지 타입
export interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  message_type?: string; // 메시지 타입 (resume, video_introduction, regular 등)
  created_at: string;
  is_read: boolean;
}

// 사용자용 채팅방 타입
export interface UserChatRoom {
  id: string;
  application_id: string;
  company_id: string;
  job_posting_id: string;
  last_message?: string;
  last_message_at?: string;
  user_unread_count: number;
  company: {
    name: string;
  };
  job_postings: {
    title: string;
  } | null;
}

// 회사용 채팅방 타입
export interface CompanyChatRoom {
  id: string;
  application_id: string;
  user_id: string;
  job_posting_id: string;
  last_message?: string;
  last_message_at?: string;
  company_unread_count: number;
  user: {
    name: string;
  };
  job_postings: {
    title: string;
  } | null;
}

// 통합 채팅방 타입 (공통 속성)
export interface BaseChatRoom {
  id: string;
  application_id: string;
  job_posting_id: string;
  last_message?: string;
  last_message_at?: string;
  job_postings: {
    title: string;
  } | null;
}

// 채팅방 정보 타입 (채팅방 상세 페이지용)
export interface ChatRoomInfo {
  id: string;
  user_id: string;
  company_id: string;
  job_posting_id: string;
  user: { name: string };
  company: { name: string };
  job_postings: { title: string };
}

// Socket 이벤트 콜백 타입들
export type MessageReceivedCallback = (message: SocketMessage) => void;

export type ChatRoomUpdatedCallback = (data: { 
  roomId: string; 
  last_message: string; 
  last_message_at: string; 
  unread_count: number 
}) => void;

export type TotalUnreadCountUpdatedCallback = (data: { 
  totalUnreadCount: number 
}) => void;

export type UserJoinedCallback = (data: { 
  userId: string; 
  userType: string 
}) => void;

export type UserLeftCallback = (data: { 
  userId: string; 
  userType: string 
}) => void;

// 소켓 연결 상태 타입
export interface SocketConnectionStatus {
  isConnected: boolean;
  isAuthenticated: boolean;
  currentRoomId: string | null;
}

// 메시지 페이지네이션 관련 타입들
export interface MessagePaginationParams {
  page?: number;
  limit?: number;
  before?: string; // 특정 메시지 이전의 메시지들 가져오기 (timestamp)
  after?: string;  // 특정 메시지 이후의 메시지들 가져오기 (timestamp)
}

export interface MessagePaginationResponse {
  messages: ChatMessage[];
  hasMore: boolean;         // 더 가져올 메시지가 있는지
  nextCursor?: string;      // 다음 페이지를 위한 커서
  total?: number;           // 총 메시지 수 (선택사항)
}

export interface MessagePaginationState {
  messages: ChatMessage[];
  hasMoreOlder: boolean;    // 더 오래된 메시지가 있는지
  hasMoreNewer: boolean;    // 더 새로운 메시지가 있는지 (실시간 메시지 외)
  loadingOlder: boolean;    // 이전 메시지 로딩 중
  loadingNewer: boolean;    // 새로운 메시지 로딩 중
  oldestMessageId?: string; // 가장 오래된 메시지 ID
  newestMessageId?: string; // 가장 새로운 메시지 ID
}