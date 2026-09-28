import React from 'react';
import { History, ArrowUpRight, Trash2 } from 'lucide-react';

interface PromptHistoryProps {
  history: string[];
  onSelectPrompt: (prompt: string) => void;
  onClearHistory: () => void;
}

export const PromptHistory: React.FC<PromptHistoryProps> = ({
  history,
  onSelectPrompt,
  onClearHistory,
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-4 text-center font-mono text-xs text-terminal-text-dim">
        No recent prompt history.
      </div>
    );
  }

  return (
    <div className="p-3 font-mono text-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-terminal-border text-terminal-text-dim uppercase text-[11px] font-semibold">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-terminal-accent" />
          <span>Recent Prompts</span>
        </div>
        <button
          onClick={onClearHistory}
          className="text-terminal-text-dim hover:text-terminal-error p-1 transition-colors"
          title="Clear history"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin">
        {history.map((promptText, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(promptText)}
            className="w-full text-left p-2 rounded hover:bg-terminal-surface text-terminal-text flex items-center justify-between group transition-colors"
          >
            <span className="truncate pr-2">{promptText}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-terminal-text-dim group-hover:text-terminal-accent shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
