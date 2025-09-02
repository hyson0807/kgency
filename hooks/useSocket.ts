import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

// 서버 URL 설정
const SERVER_URL = __DEV__
  ? process.env.EXPO_PUBLIC_DEV_SERVER_URL || 'http://192.168.0.15:5004'
  : process.env.EXPO_PUBLIC_PROD_SERVER_URL || 'https://kgencyserver-production-45af.up.railway.app';

export interface SocketMessage {
  id: string;
  room_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface UseSocketProps {
  roomId?: string;
  onMessageReceived?: (message: SocketMessage) => void;
  onUserJoined?: (data: { userId: string; userType: string }) => void;
  onUserLeft?: (data: { userId: string; userType: string }) => void;
}

export interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  isInRoom: boolean;
  sendMessage: (message: string) => Promise<boolean>;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: (roomId?: string) => void;
  error: string | null;
}

export const useSocket = ({
  roomId,
  onMessageReceived,
  onUserJoined,
  onUserLeft,
}: UseSocketProps = {}): UseSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInRoom, setIsInRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const currentRoomId = useRef<string | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Socket 연결 초기화
  const initializeSocket = async () => {
    try {
      setError(null);
      
      // 기존 연결 정리
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // 새로운 Socket 연결 생성
      const socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: maxReconnectAttempts,
      });

      socketRef.current = socket;

      // 연결 이벤트 핸들러
      socket.on('connect', async () => {
        console.log('Socket.io 연결됨:', socket.id);
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;

        // 자동 JWT 인증
        await authenticateSocket(socket);
      });

      socket.on('disconnect', () => {
        console.log('Socket.io 연결 해제');
        setIsConnected(false);
        setIsAuthenticated(false);
        setIsInRoom(false);
      });

      socket.on('connect_error', (err) => {
        console.error('Socket.io 연결 오류:', err);
        reconnectAttempts.current++;
        
        if (reconnectAttempts.current >= maxReconnectAttempts) {
          setError('서버 연결에 실패했습니다. 네트워크를 확인해주세요.');
        }
      });

      // 인증 이벤트
      socket.on('authenticated', (data) => {
        console.log('Socket 인증 성공:', data.user);
        setIsAuthenticated(true);
        setError(null);

        // 자동 채팅방 입장
        if (roomId && !currentRoomId.current) {
          joinRoomInternal(socket, roomId);
        }
      });

      socket.on('auth-error', (data) => {
        console.error('Socket 인증 실패:', data.message);
        setError(data.message);
        setIsAuthenticated(false);
      });

      // 채팅방 이벤트
      socket.on('joined-room', (data) => {
        console.log('채팅방 입장 성공:', data.roomId);
        currentRoomId.current = data.roomId;
        setIsInRoom(true);
        setError(null);
      });

      socket.on('new-message', (message: SocketMessage) => {
        console.log('새 메시지 수신:', message);
        onMessageReceived?.(message);
      });

      socket.on('user-joined', (data) => {
        console.log('사용자 입장:', data);
        onUserJoined?.(data);
      });

      socket.on('user-left', (data) => {
        console.log('사용자 퇴장:', data);
        onUserLeft?.(data);
      });

      socket.on('error', (data) => {
        console.error('Socket 에러:', data.message);
        setError(data.message);
      });

    } catch (error) {
      console.error('Socket 초기화 오류:', error);
      setError('소켓 초기화에 실패했습니다.');
    }
  };

  // JWT 토큰으로 소켓 인증
  const authenticateSocket = async (socket: Socket) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        setError('인증 토큰이 없습니다. 다시 로그인해주세요.');
        return;
      }

      console.log('Socket 인증 시도...');
      socket.emit('authenticate', token);
    } catch (error) {
      console.error('Socket 인증 오류:', error);
      setError('인증에 실패했습니다.');
    }
  };

  // 채팅방 입장 (내부 함수)
  const joinRoomInternal = (socket: Socket, roomId: string) => {
    if (!isAuthenticated) {
      console.log('Socket 인증 대기 중...');
      return;
    }

    console.log('채팅방 입장 시도:', roomId);
    socket.emit('join-room', { roomId });
  };

  // 채팅방 입장 (공개 API)
  const joinRoom = async (roomId: string): Promise<boolean> => {
    try {
      if (!socketRef.current || !isConnected) {
        setError('서버에 연결되지 않았습니다.');
        return false;
      }

      if (!isAuthenticated) {
        setError('인증이 필요합니다.');
        return false;
      }

      // 이미 같은 방에 있으면 무시
      if (currentRoomId.current === roomId) {
        return true;
      }

      // 기존 방에서 나가기
      if (currentRoomId.current) {
        leaveRoom();
      }

      joinRoomInternal(socketRef.current, roomId);
      return true;
    } catch (error) {
      console.error('채팅방 입장 오류:', error);
      setError('채팅방 입장에 실패했습니다.');
      return false;
    }
  };

  // 채팅방 퇴장
  const leaveRoom = (roomId?: string) => {
    if (!socketRef.current || !currentRoomId.current) {
      return;
    }

    const targetRoomId = roomId || currentRoomId.current;
    console.log('채팅방 퇴장:', targetRoomId);
    
    socketRef.current.emit('leave-room', targetRoomId);
    currentRoomId.current = null;
    setIsInRoom(false);
  };

  // 메시지 전송
  const sendMessage = async (message: string): Promise<boolean> => {
    try {
      if (!socketRef.current || !isConnected) {
        setError('서버에 연결되지 않았습니다.');
        return false;
      }

      if (!isAuthenticated) {
        setError('인증이 필요합니다.');
        return false;
      }

      if (!currentRoomId.current) {
        setError('채팅방에 입장해주세요.');
        return false;
      }

      if (!message.trim()) {
        setError('메시지를 입력해주세요.');
        return false;
      }

      console.log('메시지 전송:', message);
      socketRef.current.emit('send-message', {
        roomId: currentRoomId.current,
        message: message.trim(),
      });

      return true;
    } catch (error) {
      console.error('메시지 전송 오류:', error);
      setError('메시지 전송에 실패했습니다.');
      return false;
    }
  };

  // 앱 상태 변경 처리
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active' && !isConnected && socketRef.current) {
        // 앱이 포그라운드로 돌아올 때 재연결 시도
        console.log('앱 포그라운드 - 소켓 재연결 시도');
        initializeSocket();
      } else if (nextAppState === 'background' && socketRef.current) {
        // 앱이 백그라운드로 갈 때 소켓 연결 유지 (필요시 연결 해제)
        console.log('앱 백그라운드');
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isConnected]);

  // 소켓 초기화
  useEffect(() => {
    initializeSocket();

    return () => {
      if (socketRef.current) {
        console.log('Socket 정리');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // 룸ID 변경시 자동 입장
  useEffect(() => {
    if (roomId && isAuthenticated && isConnected && roomId !== currentRoomId.current) {
      joinRoom(roomId);
    }
  }, [roomId, isAuthenticated, isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    isAuthenticated,
    isInRoom,
    sendMessage,
    joinRoom,
    leaveRoom,
    error,
  };
};