import React, { RefObject } from 'react';
import { FlatList } from 'react-native';
import { CHAT_CONFIG } from '@/lib/core/config';
import type { ChatMessage } from '@/types/chat';

interface ChatMessagesProps {
  messages: ChatMessage[];
  hasMoreOlder: boolean;
  loadingOlder: boolean;
  flatListRef: RefObject<FlatList | null>;
  renderMessage: ({ item }: { item: ChatMessage }) => React.JSX.Element;
  renderEmptyMessages: () => React.JSX.Element;
  renderLoadMoreHeader: () => React.JSX.Element | null;
  onLoadOlderMessages: () => void;
}

export function ChatMessages({
  messages,
  hasMoreOlder,
  loadingOlder,
  flatListRef,
  renderMessage,
  renderEmptyMessages,
  renderLoadMoreHeader,
  onLoadOlderMessages
}: ChatMessagesProps) {
  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderMessage}
      ListEmptyComponent={renderEmptyMessages}
      ListFooterComponent={renderLoadMoreHeader} // inverted=true 시 Footer가 상단에 표시됨
      contentContainerStyle={messages.length === 0 ? { flex: 1, padding: 16 } : { padding: 16 }}
      showsVerticalScrollIndicator={false}
      inverted // 리스트를 뒤집어서 최신 메시지가 아래쪽에 표시
      // 역방향 무한 스크롤 설정 (inverted=true 시 onEndReached는 맨 위 스크롤을 감지)
      onEndReached={() => {
        // inverted=true에서 onEndReached는 맨 위로 스크롤했을 때 호출됨
        if (hasMoreOlder && !loadingOlder) {
          onLoadOlderMessages();
        }
      }}
      onEndReachedThreshold={CHAT_CONFIG.LOAD_MORE_THRESHOLD} // 10% 지점에서 트리거
    />
  );
}