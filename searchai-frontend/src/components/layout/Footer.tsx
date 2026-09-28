import React, { useState } from 'react';
import { Network, Cpu, Copy, Check, Terminal } from 'lucide-react';
import { truncate } from '@/lib/utils';

interface FooterProps {
  activeSessionId: string | null;
  activeModel: string;
  isStreaming: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  activeSessionId,
  activeModel,
  isStreaming,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopySessionId = () => {
    if (!activeSessionId) return;
    navigator.clipboard.writeText(activeSessionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="h-8 px-3 bg-terminal-surface border-t border-terminal-border flex items-center justify-between font-mono text-[11px] text-terminal-text-dim shrink-0 select-none z-10">
      {/* Left: WebSocket & Connection Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-terminal-success">
          <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-terminal-accent animate-ping' : 'bg-terminal-success'}`} />
          <span className="font-semibold">
            {isStreaming ? 'STREAMING VIA WS' : 'WS CONNECTED'}
          </span>
        </div>

        {activeSessionId && (
          <div
            onClick={handleCopySessionId}
            className="hidden sm:flex items-center gap-1 hover:text-terminal-text cursor-pointer transition-colors"
            title="Click to copy full UUID"
          >
            <Terminal className="w-3 h-3 text-terminal-accent" />
            <span>SID: {truncate(activeSessionId, 12)}</span>
            {copied ? (
              <Check className="w-2.5 h-2.5 text-terminal-success" />
            ) : (
              <Copy className="w-2.5 h-2.5" />
            )}
          </div>
        )}
      </div>

      {/* Right: Active Model & Shortcut hints */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-terminal-text-dim">
          <span className="px-1 py-0.5 rounded bg-terminal-surface-elevated border border-terminal-border/80">
            ⌘K
          </span>
          <span>Commands</span>
          <span className="px-1 py-0.5 rounded bg-terminal-surface-elevated border border-terminal-border/80">
            ⌘N
          </span>
          <span>New Chat</span>
        </div>

        <div className="flex items-center gap-1 text-terminal-text-secondary">
          <Cpu className="w-3 h-3 text-terminal-accent" />
          <span className="truncate max-w-[130px]">{activeModel}</span>
        </div>
      </div>
    </footer>
  );
};
