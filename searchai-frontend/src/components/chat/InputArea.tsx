import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { PROMPT_SUGGESTIONS } from '@/lib/utils';
import {
  Send,
  Square,
  Sparkles,
  CornerDownLeft,
  Users,
  Cpu,
} from 'lucide-react';

interface InputAreaProps {
  onSendMessage: (prompt: string) => void;
  isStreaming: boolean;
  onCancelStreaming: () => void;
  onOpenRephraser?: (currentPrompt: string) => void;
  activeModel: string;
  bestToggle: boolean;
  onToggleBest: () => void;
  showSuggestions?: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({
  onSendMessage,
  isStreaming,
  onCancelStreaming,
  onOpenRephraser,
  activeModel,
  bestToggle,
  onToggleBest,
  showSuggestions = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [prompt]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      onCancelStreaming();
      return;
    }
    if (!prompt.trim()) return;

    onSendMessage(prompt.trim());
    setPrompt('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectSuggestion = (text: string) => {
    setPrompt(text);
    textareaRef.current?.focus();
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4">
      {/* Suggestions chips if empty state */}
      {showSuggestions && (
        <div className="mb-3">
          <div className="text-[11px] font-mono text-terminal-text-dim uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-terminal-accent" />
            Suggested Research Queries
          </div>
          <div className="flex flex-wrap gap-2">
            {PROMPT_SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectSuggestion(suggestion)}
                className="px-3 py-1.5 rounded-lg bg-terminal-surface hover:bg-terminal-accent-bg border border-terminal-border hover:border-terminal-accent-border font-mono text-xs text-terminal-text-secondary hover:text-terminal-text transition-all duration-200 text-left"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative rounded-xl border border-terminal-border bg-terminal-surface shadow-lg focus-within:border-terminal-accent focus-within:ring-2 focus-within:ring-terminal-accent/20 transition-all duration-200">
        {/* Text Input Row */}
        <div className="flex items-start px-3 py-2.5 gap-2.5">
          <span className="font-mono text-sm text-terminal-accent select-none pt-1">
            &gt;_
          </span>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              bestToggle
                ? 'Ask multi-agent research team anything... (Press Enter to send)'
                : 'Ask SearchAI anything... (Press Enter to send, Shift+Enter for newline)'
            }
            rows={1}
            disabled={isStreaming}
            className="flex-1 max-h-[180px] bg-transparent font-mono text-sm text-terminal-text placeholder-terminal-text-dim resize-none focus:outline-none leading-relaxed py-1"
          />
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-terminal-border/50 bg-terminal-surface-elevated/30 rounded-b-xl">
          <div className="flex items-center gap-2">
            {/* Rephrase prompt button */}
            <button
              type="button"
              onClick={() => onOpenRephraser?.(prompt)}
              disabled={!prompt.trim() || isStreaming}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs text-terminal-accent hover:bg-terminal-accent-bg border border-terminal-accent-border/50 transition-colors disabled:opacity-40 disabled:pointer-events-none"
              title="Optimize prompt via AI Rephraser"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize Prompt</span>
            </button>

            {/* Team mode badge / toggle */}
            <button
              type="button"
              onClick={onToggleBest}
              disabled={isStreaming}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs border transition-colors ${
                bestToggle
                  ? 'bg-terminal-accent-bg border-terminal-accent-border text-terminal-accent'
                  : 'bg-transparent border-terminal-border text-terminal-text-dim hover:text-terminal-text'
              }`}
              title={bestToggle ? 'Team Mode Enabled (Multi-agent)' : 'Single Agent Mode'}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{bestToggle ? 'Team Mode: ON' : 'Team Mode: OFF'}</span>
            </button>

            {/* Active Model Indicator */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded font-mono text-[11px] text-terminal-text-dim bg-terminal-surface border border-terminal-border">
              <Cpu className="w-3 h-3 text-terminal-accent" />
              <span className="truncate max-w-[120px]">{activeModel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Keyboard shortcut hint */}
            <span className="hidden md:inline-flex items-center gap-1 font-mono text-[11px] text-terminal-text-dim">
              <span>↵ Send</span>
            </span>

            {/* Submit / Cancel Button */}
            {isStreaming ? (
              <Button
                variant="danger"
                size="sm"
                onClick={onCancelStreaming}
                className="h-8 px-3 text-xs"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSubmit()}
                disabled={!prompt.trim()}
                className="h-8 px-3 text-xs"
              >
                <span>Send</span>
                <Send className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
