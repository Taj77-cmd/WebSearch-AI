import React, { useState } from 'react';
import type { Message } from '@/types/session';
import { MessageContent } from './MessageContent';
import { SourceLinks } from './SourceLinks';
import { formatTime, cn } from '@/lib/utils';
import { User, Bot, Copy, Check } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isTeamMode?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isTeamMode = false }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col p-4 rounded-xl border transition-all duration-200 animate-fade-in',
        isUser
          ? 'bg-terminal-surface/60 border-terminal-border ml-6 sm:ml-12'
          : 'bg-terminal-surface-elevated/40 border-terminal-border/80 mr-6 sm:mr-12 hover:border-terminal-accent-border/50'
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-terminal-border/40 font-mono text-xs text-terminal-text-dim">
        <div className="flex items-center gap-2">
          {isUser ? (
            <div className="w-5 h-5 rounded-full bg-terminal-info/10 text-terminal-info flex items-center justify-center">
              <User className="w-3 h-3" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-terminal-accent-bg text-terminal-accent flex items-center justify-center">
              <Bot className="w-3 h-3" />
            </div>
          )}

          <span className="font-semibold text-terminal-text">
            {isUser ? (
              <span className="text-terminal-info">user@searchai:~$</span>
            ) : isTeamMode ? (
              <span className="text-terminal-accent">team@searchai:~$</span>
            ) : (
              <span className="text-terminal-accent">agent@searchai:~$</span>
            )}
          </span>

          <span className="text-[11px] text-terminal-text-dim">
            {formatTime(message.created_at)}
          </span>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1 text-[11px] text-terminal-text-dim hover:text-terminal-text transition-all p-1 rounded hover:bg-terminal-surface"
          title="Copy message content"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-terminal-success" />
              <span className="text-terminal-success">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Message Content */}
      <div className="text-terminal-text">
        <MessageContent content={message.content} />
      </div>

      {/* Extracted Sources */}
      {message.sources && message.sources.length > 0 && (
        <SourceLinks sources={message.sources} />
      )}
    </div>
  );
};
