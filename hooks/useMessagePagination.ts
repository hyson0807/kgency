import { useState, useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { api } from '@/lib/api';
import { CHAT_CONFIG } from '@/lib/config';
import type { 
  ChatMessage, 
  MessagePaginationState, 
  MessagePaginationParams,
  MessagePaginationResponse 
} from '@/types/chat';

/**
 * 메시지 페이지네이션을 관리하는 커스텀 훅
 * 초기 로딩, 이전 메시지 로딩, 실시간 메시지 추가를 처리
 */
export const useMessagePagination = (roomId: string | null) => {
  const [state, setState] = useState<MessagePaginationState>({
    messages: [],
    hasMoreOlder: true,
    hasMoreNewer: false,
    loadingOlder: false,
    loadingNewer: false,
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const currentPage = useRef(0);

  // 초기 메시지 로딩 (최신 메시지들)
  const loadInitialMessages = useCallback(async () => {
    if (!roomId) return;

    setInitialLoading(true);
    try {
      const params: MessagePaginationParams = {
        limit: CHAT_CONFIG.INITIAL_MESSAGE_LOAD,
        page: 0
      };

      const response = await fetchMessages(params);
      
      if (response.success) {
        const data: MessagePaginationResponse = response.data;
        
        setState({
          messages: data.messages || [],
          hasMoreOlder: data.hasMore,
          hasMoreNewer: false,
          loadingOlder: false,
          loadingNewer: false,
          oldestMessageId: data.messages?.[data.messages.length - 1]?.id,
          newestMessageId: data.messages?.[0]?.id,
        });
        
        currentPage.current = 0;
      } else {
        console.error('Error loading initial messages:', response.error);
        Alert.alert('오류', '메시지를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('Error loading initial messages:', error);
      Alert.alert('오류', '메시지를 불러오는데 실패했습니다.');
    } finally {
      setInitialLoading(false);
    }
  }, [roomId]);

  // 이전 메시지 로딩 (더 오래된 메시지들)
  const loadOlderMessages = useCallback(async () => {
    if (!roomId || state.loadingOlder || !state.hasMoreOlder) {
      return;
    }

    setState(prev => ({ ...prev, loadingOlder: true }));

    try {
      const params: MessagePaginationParams = {
        limit: CHAT_CONFIG.MESSAGE_LOAD_MORE,
        page: currentPage.current + 1,
        // 시간 기반 페이지네이션을 위한 커서 사용
        before: state.messages.length > 0 
          ? state.messages[state.messages.length - 1].created_at 
          : undefined
      };

      const response = await fetchMessages(params);
      
      if (response.success) {
        const data: MessagePaginationResponse = response.data;
        
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, ...(data.messages || [])], // 기존 메시지 뒤에 추가 (더 오래된 메시지)
          hasMoreOlder: data.hasMore,
          loadingOlder: false,
          oldestMessageId: data.messages?.[data.messages.length - 1]?.id || prev.oldestMessageId,
        }));
        
        currentPage.current += 1;
      } else {
        setState(prev => ({ ...prev, loadingOlder: false }));
        console.error('Error loading older messages:', response.error);
      }
    } catch (error) {
      setState(prev => ({ ...prev, loadingOlder: false }));
      console.error('Error loading older messages:', error);
    }
  }, [roomId, state.loadingOlder, state.hasMoreOlder, state.messages]);

  // 실시간으로 새 메시지 추가
  const addNewMessage = useCallback((message: ChatMessage) => {
    setState(prev => ({
      ...prev,
      messages: [message, ...prev.messages], // 최신 메시지를 맨 앞에 추가
      newestMessageId: message.id,
    }));
  }, []);

  // 메시지 API 호출 (공통 함수)
  const fetchMessages = useCallback(async (params: MessagePaginationParams) => {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params.before) queryParams.append('before', params.before);
    if (params.after) queryParams.append('after', params.after);

    const url = `/api/chat/room/${roomId}/messages${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api('GET', url);
    
    if (response.success && response.data) {
      // 서버의 새로운 응답 구조에 맞게 변환
      const { messages, pagination } = response.data;
      
      return {
        success: true,
        data: {
          messages: messages || [],
          hasMore: pagination?.hasMore || false,
          nextCursor: pagination?.nextCursor,
          total: pagination?.totalMessages
        }
      };
    }
    
    return response;
  }, [roomId]);

  // 메시지 읽음 처리
  const markMessagesAsRead = useCallback(async () => {
    if (!roomId) return;

    try {
      await api('PATCH', `/api/chat/room/${roomId}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [roomId]);

  // 상태 초기화
  const reset = useCallback(() => {
    setState({
      messages: [],
      hasMoreOlder: true,
      hasMoreNewer: false,
      loadingOlder: false,
      loadingNewer: false,
    });
    setInitialLoading(true);
    currentPage.current = 0;
  }, []);

  return {
    // 상태
    messages: state.messages,
    hasMoreOlder: state.hasMoreOlder,
    loadingOlder: state.loadingOlder,
    initialLoading,

    // 액션
    loadInitialMessages,
    loadOlderMessages,
    addNewMessage,
    markMessagesAsRead,
    reset,

    // 유틸리티
    isEmpty: state.messages.length === 0,
    messageCount: state.messages.length,
  };
};