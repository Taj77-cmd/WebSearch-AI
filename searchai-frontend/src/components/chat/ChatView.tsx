import React from 'react';
import type { Message } from '@/types/session';
import { MessageList } from './MessageList';
import { InputArea } from './InputArea';
import { PROMPT_SUGGESTIONS } from '@/lib/utils';
import { Terminal, ShieldCheck, Zap, Sparkles, Network, PlusCircle } from 'lucide-react';

interface ChatViewProps {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onSendMessage: (prompt: string) => void;
  onCancelStreaming: () => void;
  onOpenRephraser: (prompt: string) => void;
  activeModel: string;
  bestToggle: boolean;
  onToggleBest: () => void;
  hasActiveSession: boolean;
  onNewSession: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isStreaming,
  streamingContent,
  onSendMessage,
  onCancelStreaming,
  onOpenRephraser,
  activeModel,
  bestToggle,
  onToggleBest,
  hasActiveSession,
  onNewSession,
}) => {
  const hasMessages = messages.length > 0 || isStreaming;

  // No session selected — show a prompt to create one
  if (!hasActiveSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-terminal-bg">
        <div className="max-w-sm flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-terminal-accent-bg border border-terminal-accent-border flex items-center justify-center text-terminal-accent shadow-glow">
            <Terminal className="w-7 h-7" />
          </div>
          <div>
            <h2 className="font-mono text-xl font-bold text-terminal-text">No Active Session</h2>
            <p className="font-mono text-xs text-terminal-text-dim mt-1.5 leading-relaxed">
              Create a new session to start researching.
            </p>
          </div>
          <button
            onClick={onNewSession}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-terminal-accent-bg border border-terminal-accent-border text-terminal-accent font-mono text-sm hover:bg-terminal-accent hover:text-terminal-bg transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-terminal-bg relative">
      {/* Messages or Welcome Terminal */}
      {hasMessages ? (
        <MessageList
          messages={messages}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
          onCancelStreaming={onCancelStreaming}
          isTeamMode={bestToggle}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center overflow-y-auto scrollbar-thin">
          <div className="max-w-xl w-full flex flex-col items-center animate-fade-in space-y-6">
            {/* Terminal Logo Icon */}
            <div className="w-14 h-14 rounded-2xl bg-terminal-accent-bg border border-terminal-accent-border flex items-center justify-center text-terminal-accent shadow-glow">
              <Terminal className="w-7 h-7" />
            </div>

            {/* Title & Tagline */}
            <div>
              <h2 className="font-mono text-2xl font-bold text-terminal-text tracking-tight flex items-center justify-center gap-2">
                <span>SearchAI Terminal</span>
                <span className="text-xs px-2 py-0.5 rounded bg-terminal-accent-bg border border-terminal-accent-border text-terminal-accent">
                  v2.0
                </span>
              </h2>
              <p className="font-mono text-xs text-terminal-text-secondary mt-1.5 max-w-md mx-auto leading-relaxed">
                Developer-grade research interface powered by Gemini 2.0 &amp; Agno multi-agent teams with real-time WebSocket streaming.
              </p>
            </div>

            {/* Diagnostic system pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-terminal-surface border border-terminal-border text-terminal-text-dim">
                <Network className="w-3 h-3 text-terminal-accent" />
                WebSocket Streaming: Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-terminal-surface border border-terminal-border text-terminal-text-dim">
                <ShieldCheck className="w-3 h-3 text-terminal-success" />
                Citations &amp; Grounding
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-terminal-surface border border-terminal-border text-terminal-text-dim">
                <Zap className="w-3 h-3 text-terminal-warning" />
                Multi-Agent Synthesis
              </span>
            </div>

            {/* Suggestion prompt cards */}
            <div className="w-full text-left pt-2">
              <div className="text-[11px] font-mono text-terminal-text-dim uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terminal-accent" />
                Quick Research Queries
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROMPT_SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => onSendMessage(suggestion)}
                    className="p-3 text-left rounded-xl bg-terminal-surface hover:bg-terminal-accent-bg border border-terminal-border hover:border-terminal-accent-border font-mono text-xs text-terminal-text hover:text-terminal-accent transition-all duration-200 group"
                  >
                    <div className="text-[11px] text-terminal-text-dim mb-1 group-hover:text-terminal-accent/70">
                      Query #{index + 1}
                    </div>
                    <div className="line-clamp-2 leading-relaxed">
                      {suggestion}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input row */}
      <InputArea
        onSendMessage={onSendMessage}
        isStreaming={isStreaming}
        onCancelStreaming={onCancelStreaming}
        onOpenRephraser={onOpenRephraser}
        activeModel={activeModel}
        bestToggle={bestToggle}
        onToggleBest={onToggleBest}
        showSuggestions={false}
      />
    </div>
  );
};

