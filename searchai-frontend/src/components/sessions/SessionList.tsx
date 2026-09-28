import React, { useState, useMemo } from 'react';
import type { Session } from '@/types/session';
import { SessionItem } from './SessionItem';
import { Search } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const query = searchQuery.toLowerCase();
    return sessions.filter((s) => s.title.toLowerCase().includes(query));
  }, [sessions, searchQuery]);

  // Group by Today, Yesterday, and Older
  const grouped = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const groups: {
      today: Session[];
      yesterday: Session[];
      older: Session[];
    } = {
      today: [],
      yesterday: [],
      older: [],
    };

    filteredSessions.forEach((session) => {
      const sessionDate = new Date(session.updated_at || session.created_at);
      if (sessionDate >= today) {
        groups.today.push(session);
      } else if (sessionDate >= yesterday) {
        groups.yesterday.push(session);
      } else {
        groups.older.push(session);
      }
    });

    return groups;
  }, [filteredSessions]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search Bar */}
      <div className="px-3 py-2 border-b border-terminal-border/50">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 text-terminal-text-dim absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className="w-full pl-8 pr-3 py-1.5 bg-terminal-bg border border-terminal-border rounded-md font-mono text-xs text-terminal-text placeholder-terminal-text-dim focus:outline-none focus:border-terminal-accent transition-colors"
          />
        </div>
      </div>

      {/* Session Items List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4 scrollbar-thin">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-6 px-3 font-mono text-xs text-terminal-text-dim">
            {searchQuery ? 'No matching sessions' : 'No research sessions yet'}
          </div>
        ) : (
          <>
            {grouped.today.length > 0 && (
              <div>
                <div className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-terminal-text-dim font-semibold">
                  Today
                </div>
                <div className="space-y-0.5">
                  {grouped.today.map((s) => (
                    <SessionItem
                      key={s.id}
                      session={s}
                      isActive={s.id === activeSessionId}
                      onSelect={onSelectSession}
                      onRename={onRenameSession}
                      onDelete={onDeleteSession}
                    />
                  ))}
                </div>
              </div>
            )}

            {grouped.yesterday.length > 0 && (
              <div>
                <div className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-terminal-text-dim font-semibold">
                  Yesterday
                </div>
                <div className="space-y-0.5">
                  {grouped.yesterday.map((s) => (
                    <SessionItem
                      key={s.id}
                      session={s}
                      isActive={s.id === activeSessionId}
                      onSelect={onSelectSession}
                      onRename={onRenameSession}
                      onDelete={onDeleteSession}
                    />
                  ))}
                </div>
              </div>
            )}

            {grouped.older.length > 0 && (
              <div>
                <div className="px-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-terminal-text-dim font-semibold">
                  Previous Sessions
                </div>
                <div className="space-y-0.5">
                  {grouped.older.map((s) => (
                    <SessionItem
                      key={s.id}
                      session={s}
                      isActive={s.id === activeSessionId}
                      onSelect={onSelectSession}
                      onRename={onRenameSession}
                      onDelete={onDeleteSession}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
