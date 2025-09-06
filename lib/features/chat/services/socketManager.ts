import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { SERVER_CONFIG, SOCKET_CONFIG, APP_CONFIG } from '@/lib/core/config';
import type { 
  SocketMessage, 
  SocketConnectionStatus,
  MessageReceivedCallback,
  ChatRoomUpdatedCallback,
  TotalUnreadCountUpdatedCallback,
  UserJoinedCallback,
  UserLeftCallback
} from '@/types/chat';

// Singleton 소켓 매니저 클래스
class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private isConnected = false;
  private isAuthenticated = false;
  private currentRoomId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = SOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS;

  // 이벤트 콜백들
  private messageReceivedCallbacks = new Set<MessageReceivedCallback>();
  private chatRoomUpdatedCallbacks = new Set<ChatRoomUpdatedCallback>();
  private totalUnreadCountUpdatedCallbacks = new Set<TotalUnreadCountUpdatedCallback>();
  private userJoinedCallbacks = new Set<UserJoinedCallback>();
  private userLeftCallbacks = new Set<UserLeftCallback>();

  private constructor() {
    this.initializeSocket();
    this.setupAppStateHandler();
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  // Socket 연결 초기화
  private async initializeSocket() {
    try {
      console.log('SocketManager: 웹소켓 연결 초기화', { SERVER_URL: SERVER_CONFIG.SERVER_URL });
      
      // 기존 연결 정리
      if (this.socket) {
        console.log('SocketManager: 기존 소켓 연결 정리');
        this.socket.disconnect();
      }

      // 새로운 Socket 연결 생성
      this.socket = io(SERVER_CONFIG.SERVER_URL, {
        transports: [...SOCKET_CONFIG.TRANSPORTS],
        timeout: SOCKET_CONFIG.TIMEOUT,
        reconnection: true,
        reconnectionDelay: SOCKET_CONFIG.RECONNECTION_DELAY,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      console.log('SocketManager: Socket 객체 생성됨:', !!this.socket);
      this.setupSocketEventHandlers();

    } catch (error) {
      console.error('SocketManager: Socket 초기화 오류:', error);
    }
  }

  // Socket 이벤트 핸들러 설정
  private setupSocketEventHandlers() {
    if (!this.socket) return;

    // 연결 이벤트
    this.socket.on('connect', async () => {
      console.log('SocketManager: Socket.io 연결됨:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      await this.authenticateSocket();
    });

    this.socket.on('disconnect', () => {
      console.log('SocketManager: Socket.io 연결 해제');
      this.isConnected = false;
      this.isAuthenticated = false;
      this.currentRoomId = null;
    });

    this.socket.on('connect_error', (err) => {
      console.error('SocketManager: Socket.io 연결 오류:', err);
      this.reconnectAttempts++;
    });

    // 인증 이벤트
    this.socket.on('authenticated', (data) => {
      console.log('SocketManager: Socket 인증 성공:', data.user);
      this.isAuthenticated = true;
    });

    this.socket.on('auth-error', (data) => {
      console.error('SocketManager: Socket 인증 실패:', data.message);
      this.isAuthenticated = false;
    });

    // 강제 연결 해제 이벤트 (다중 로그인 방지)
    this.socket.on('force-disconnect', (data) => {
      console.log('SocketManager: 강제 연결 해제:', data.reason);
      // 강제 연결 해제 시에는 재연결 시도하지 않음
      this.socket?.disconnect();
    });

    // 채팅 이벤트들
    this.socket.on('joined-room', (data) => {
      console.log('SocketManager: 채팅방 입장 성공:', data.roomId);
      this.currentRoomId = data.roomId;
    });

    this.socket.on('new-message', (message: SocketMessage) => {
      if (__DEV__) {
        console.log('SocketManager: 새 메시지 수신');
      }
      this.messageReceivedCallbacks.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('SocketManager: 메시지 콜백 오류:', error);
        }
      });
    });

    this.socket.on('chat-room-updated', (data) => {
      if (__DEV__) {
        console.log('SocketManager: 채팅방 업데이트');
      }
      this.chatRoomUpdatedCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('SocketManager: 채팅방 업데이트 콜백 오류:', error);
        }
      });
    });

    this.socket.on('total-unread-count-updated', (data) => {
      if (__DEV__) {
        console.log('SocketManager: 총 안읽은 메시지 카운트 업데이트:', data.totalUnreadCount);
      }
      this.totalUnreadCountUpdatedCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('SocketManager: 총 안읽은 메시지 카운트 콜백 오류:', error);
        }
      });
    });

    this.socket.on('user-joined', (data) => {
      this.userJoinedCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('SocketManager: 사용자 입장 콜백 오류:', error);
        }
      });
    });

    this.socket.on('user-left', (data) => {
      this.userLeftCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('SocketManager: 사용자 퇴장 콜백 오류:', error);
        }
      });
    });

    this.socket.on('error', (data) => {
      console.error('SocketManager: Socket 에러:', data.message);
    });
  }

  // JWT 토큰으로 소켓 인증
  private async authenticateSocket() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        if (__DEV__) {
          console.log('SocketManager: 인증 토큰이 없음 (미로그인 상태)');
        }
        return;
      }

      console.log('SocketManager: Socket 인증 시도...', { 
        tokenLength: token.length,
        socketExists: !!this.socket,
        socketConnected: this.socket?.connected
      });
      this.socket?.emit('authenticate', token);
    } catch (error) {
      console.error('SocketManager: Socket 인증 오류:', error);
    }
  }

  // 앱 상태 변경 처리
  private setupAppStateHandler() {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && !this.isConnected && this.socket) {
        console.log('SocketManager: 앱 포그라운드 - 소켓 재연결 시도');
        this.initializeSocket();
      } else if (nextAppState === 'background' && this.socket) {
        console.log('SocketManager: 앱 백그라운드');
      }
    };

    AppState.addEventListener('change', handleAppStateChange);
  }

  // 공개 메서드들
  public getConnectionStatus(): SocketConnectionStatus {
    return {
      isConnected: this.isConnected,
      isAuthenticated: this.isAuthenticated,
      currentRoomId: this.currentRoomId,
    };
  }

  public async joinRoom(roomId: string): Promise<boolean> {
    if (__DEV__) {
      console.log('SocketManager: joinRoom 호출:', {
        roomId,
        isConnected: this.isConnected,
        isAuthenticated: this.isAuthenticated,
        currentRoomId: this.currentRoomId,
        socketExists: !!this.socket
      });
    }

    if (!this.socket || !this.isConnected) {
      console.error('SocketManager: 소켓이 연결되지 않았습니다.');
      return false;
    }

    if (!this.isAuthenticated) {
      console.error('SocketManager: 소켓이 인증되지 않았습니다.');
      return false;
    }

    if (this.currentRoomId === roomId) {
      if (__DEV__) {
        console.log('SocketManager: 이미 해당 채팅방에 있습니다.');
      }
      return true;
    }

    if (this.currentRoomId) {
      console.log('SocketManager: 이전 채팅방에서 나가기:', this.currentRoomId);
      this.leaveRoom();
    }

    console.log('SocketManager: 채팅방 입장 시도:', roomId);
    this.socket.emit('join-room', { roomId });
    
    // 채팅방 입장 성공을 기다림 (설정된 타임아웃)
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.error('SocketManager: 채팅방 입장 타임아웃');
        resolve(false);
      }, SOCKET_CONFIG.ROOM_JOIN_TIMEOUT);

      // joined-room 이벤트를 위한 일회성 리스너 생성
      const onJoinedRoom = (data: any) => {
        if (data.roomId === roomId) {
          clearTimeout(timeout);
          console.log('SocketManager: 채팅방 입장 완료:', roomId);
          this.socket?.off('joined-room', onJoinedRoom);
          resolve(true);
        }
      };

      this.socket?.on('joined-room', onJoinedRoom);
    });
  }

  public leaveRoom(roomId?: string) {
    if (!this.socket || !this.currentRoomId) {
      return;
    }

    const targetRoomId = roomId || this.currentRoomId;
    console.log('SocketManager: 채팅방 퇴장:', targetRoomId);
    
    this.socket.emit('leave-room', targetRoomId);
    this.currentRoomId = null;
  }

  public async sendMessage(message: string, messageType?: string): Promise<boolean> {
    console.log('SocketManager: sendMessage 호출:', {
      message: message?.trim(),
      messageType: messageType,
      isConnected: this.isConnected,
      isAuthenticated: this.isAuthenticated,
      currentRoomId: this.currentRoomId,
      socketExists: !!this.socket
    });

    if (!this.socket || !this.isConnected) {
      console.error('SocketManager: 소켓이 연결되지 않았습니다.');
      return false;
    }

    if (!this.isAuthenticated) {
      console.error('SocketManager: 소켓이 인증되지 않았습니다.');
      return false;
    }

    if (!this.currentRoomId) {
      console.error('SocketManager: 채팅방에 입장하지 않았습니다.');
      return false;
    }

    if (!message.trim()) {
      console.error('SocketManager: 메시지를 입력해주세요.');
      return false;
    }

    console.log('SocketManager: 메시지 전송:', {
      roomId: this.currentRoomId,
      message: message.trim(),
      messageType: messageType
    });
    
    const messageData: any = {
      roomId: this.currentRoomId,
      message: message.trim(),
    };

    // messageType이 있으면 포함
    if (messageType) {
      messageData.messageType = messageType;
    }
    
    this.socket.emit('send-message', messageData);

    return true;
  }

  // 이벤트 구독 메서드들
  public onMessageReceived(callback: MessageReceivedCallback) {
    this.messageReceivedCallbacks.add(callback);
    return () => this.messageReceivedCallbacks.delete(callback);
  }

  public onChatRoomUpdated(callback: ChatRoomUpdatedCallback) {
    this.chatRoomUpdatedCallbacks.add(callback);
    return () => this.chatRoomUpdatedCallbacks.delete(callback);
  }

  public onTotalUnreadCountUpdated(callback: TotalUnreadCountUpdatedCallback) {
    this.totalUnreadCountUpdatedCallbacks.add(callback);
    return () => this.totalUnreadCountUpdatedCallbacks.delete(callback);
  }

  public onUserJoined(callback: UserJoinedCallback) {
    this.userJoinedCallbacks.add(callback);
    return () => this.userJoinedCallbacks.delete(callback);
  }

  public onUserLeft(callback: UserLeftCallback) {
    this.userLeftCallbacks.add(callback);
    return () => this.userLeftCallbacks.delete(callback);
  }

  // 재초기화 메서드 추가
  public async reinitialize() {
    console.log('SocketManager: 재초기화 시작');
    this.destroy();
    // 상태 초기화
    this.isConnected = false;
    this.isAuthenticated = false;
    this.currentRoomId = null;
    this.reconnectAttempts = 0;
    // 소켓 재연결
    await this.initializeSocket();
  }

  // 정리
  public destroy() {
    console.log('SocketManager: 소켓 연결 정리');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.isAuthenticated = false;
    this.currentRoomId = null;
    this.messageReceivedCallbacks.clear();
    this.chatRoomUpdatedCallbacks.clear();
    this.totalUnreadCountUpdatedCallbacks.clear();
    this.userJoinedCallbacks.clear();
    this.userLeftCallbacks.clear();
  }
}

// 전역 인스턴스 내보내기
export const socketManager = SocketManager.getInstance();