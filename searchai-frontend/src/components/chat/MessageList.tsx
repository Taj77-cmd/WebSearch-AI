import React, { useEffect, useRef } from 'react';
import type { Message } from '@/types/session';
import { MessageBubble } from './MessageBubble';
import { StreamingResponse } from './StreamingResponse';

interface MessageListProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onCancelStreaming: () => void;
  isTeamMode?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isStreaming,
  streamingContent,
  onCancelStreaming,
  isTeamMode = false,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll on new messages or streaming updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamingContent]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scrollbar-thin">
      <div className="max-w-4xl mx-auto space-y-5">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isTeamMode={isTeamMode}
          />
        ))}

        {/* Live streaming bubble */}
        {isStreaming && (
          <StreamingResponse
            content={streamingContent}
            onCancel={onCancelStreaming}
            isTeamMode={isTeamMode}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
