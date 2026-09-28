import React from 'react';
import type { SourceLink } from '@/types/session';
import { ExternalLink, Globe, Bookmark } from 'lucide-react';

interface SourceLinksProps {
  sources: SourceLink[] | null | undefined;
}

export const SourceLinks: React.FC<SourceLinksProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const getDomain = (url: string): string => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="mt-4 pt-3 border-t border-terminal-border/60">
      <div className="flex items-center gap-1.5 font-mono text-xs text-terminal-text-dim mb-2.5">
        <Bookmark className="w-3.5 h-3.5 text-terminal-accent" />
        <span className="font-semibold uppercase tracking-wider text-[11px] text-terminal-accent">
          Sources & Citations ({sources.length})
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((source, index) => {
          const domain = getDomain(source.url);
          return (
            <a
              key={`${source.url}-${index}`}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-2.5 bg-terminal-surface hover:bg-terminal-accent-bg border border-terminal-border hover:border-terminal-accent-border rounded-lg transition-all duration-200"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <div className="w-5 h-5 rounded bg-terminal-surface-elevated flex items-center justify-center text-terminal-text-dim shrink-0 group-hover:text-terminal-accent transition-colors">
                  <Globe className="w-3 h-3" />
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-xs text-terminal-text group-hover:text-terminal-accent font-medium truncate">
                    {source.title || domain}
                  </div>
                  <div className="font-mono text-[10px] text-terminal-text-dim truncate">
                    {domain}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-terminal-text-dim group-hover:text-terminal-accent shrink-0 transition-colors" />
            </a>
          );
        })}
      </div>
    </div>
  );
};
