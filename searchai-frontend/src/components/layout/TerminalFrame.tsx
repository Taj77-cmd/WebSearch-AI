import React from 'react';
import { Terminal } from 'lucide-react';

interface TerminalFrameProps {
  title?: string;
  children: React.ReactNode;
}

export const TerminalFrame: React.FC<TerminalFrameProps> = ({
  title = 'searchai@research-node:~ (websocket)',
  children,
}) => {
  return (
    <div className="flex flex-col h-full w-full bg-terminal-bg overflow-hidden border border-terminal-border rounded-xl shadow-2xl">
      {/* Top Window Bar */}
      <div className="h-9 px-4 bg-terminal-surface border-b border-terminal-border flex items-center justify-between select-none">
        {/* Window controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer hover:opacity-80 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer hover:opacity-80 transition-opacity" />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer hover:opacity-80 transition-opacity" />
        </div>

        {/* Window title */}
        <div className="flex items-center gap-1.5 font-mono text-xs text-terminal-text-dim truncate max-w-md">
          <Terminal className="w-3.5 h-3.5 text-terminal-accent" />
          <span>{title}</span>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-terminal-text-dim">
          <span className="w-2 h-2 rounded-full bg-terminal-accent animate-pulse" />
          <span className="hidden sm:inline">TTY1</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">{children}</div>
    </div>
  );
};
