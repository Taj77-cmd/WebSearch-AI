import React from 'react';
import { Cursor } from '@/components/ui/Cursor';
import { Bot, Square } from 'lucide-react';
import { MessageContent } from './MessageContent';

interface StreamingResponseProps {
  content: string;
  onCancel?: () => void;
  isTeamMode?: boolean;
}

export const StreamingResponse: React.FC<StreamingResponseProps> = ({
  content,
  onCancel,
  isTeamMode = false,
}) => {
  return (
    <div className="relative flex flex-col p-4 rounded-xl border border-terminal-accent-border/60 bg-terminal-surface-elevated/50 mr-6 sm:mr-12 animate-fade-in shadow-glow">
      {/* Streaming header */}
      <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-terminal-border/40 font-mono text-xs text-terminal-text-dim">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-terminal-accent-bg text-terminal-accent flex items-center justify-center animate-pulse">
            <Bot className="w-3 h-3" />
          </div>

          <span className="font-semibold text-terminal-accent">
            {isTeamMode ? 'team@searchai:~$' : 'agent@searchai:~$'}
          </span>

          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-terminal-accent-bg border border-terminal-accent-border text-[10px] text-terminal-accent font-medium uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-terminal-accent animate-ping" />
            Streaming (WebSocket)
          </span>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded border border-terminal-error/40 text-terminal-error hover:bg-terminal-error/10 transition-colors"
            title="Stop streaming response"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Stop</span>
          </button>
        )}
      </div>

      {/* Streaming content with cursor */}
      <div className="text-terminal-text font-mono text-sm leading-relaxed">
        {content ? (
          <div>
            <MessageContent content={content} />
            <Cursor variant="block" />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-terminal-text-dim py-2">
            <span>Synthesizing research response</span>
            <Cursor variant="line" />
          </div>
        )}
      </div>
    </div>
  );
};
