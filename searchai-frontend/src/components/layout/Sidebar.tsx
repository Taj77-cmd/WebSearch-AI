import React from 'react';
import type { Session } from '@/types/session';
import { SessionList } from '@/components/sessions/SessionList';
import { useUIStore } from '@/stores/useUIStore';
import { cn } from '@/lib/utils';
import {
  FolderClock,
  Plus,
  ChevronLeft,
  User,
  HardDrive,
  Trash2,
} from 'lucide-react';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onDeleteAllSessions: () => void;
  userId: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onRenameSession,
  onDeleteSession,
  onDeleteAllSessions,
  userId,
}) => {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const totalMessages = sessions.reduce((sum, s) => sum + (s.message_count || 0), 0);

  return (
    <>
      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed md:static inset-y-0 left-0 z-40 w-72 bg-terminal-surface border-r border-terminal-border flex flex-col transition-transform duration-200 ease-in-out shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="h-14 px-3 border-b border-terminal-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-mono text-xs text-terminal-text font-semibold">
            <FolderClock className="w-4 h-4 text-terminal-accent" />
            <span>SESSION LOGS</span>
            <span className="px-1.5 py-0.2 rounded-full bg-terminal-accent-bg border border-terminal-accent-border text-[10px] text-terminal-accent">
              {sessions.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onNewSession}
              className="p-1.5 rounded-lg border border-terminal-border hover:border-terminal-accent text-terminal-accent hover:bg-terminal-accent-bg transition-colors"
              title="Create new session"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg border border-terminal-border hover:border-terminal-accent text-terminal-text-dim hover:text-terminal-text transition-colors md:hidden"
              title="Close sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sessions scrollable list */}
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(id) => {
            onSelectSession(id);
            // On mobile screen, close sidebar upon selection
            if (window.innerWidth < 768) {
              toggleSidebar();
            }
          }}
          onRenameSession={onRenameSession}
          onDeleteSession={onDeleteSession}
        />

        {/* Sidebar Footer Metadata */}
        <div className="p-3 border-t border-terminal-border/60 bg-terminal-bg/50 font-mono text-[11px] text-terminal-text-dim flex flex-col gap-2 shrink-0 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-terminal-info" />
              <span>UID: {userId}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-terminal-accent" />
              <span>{totalMessages} msgs</span>
            </div>
          </div>

          {/* Delete All Sessions Button */}
          {sessions.length > 0 && (
            <button
              onClick={onDeleteAllSessions}
              className="w-full px-3 py-1.5 rounded-lg border border-terminal-error bg-terminal-error/10 text-terminal-error font-mono text-[10px] hover:bg-terminal-error/20 hover:border-terminal-error transition-colors flex items-center justify-center gap-2"
              title="Delete all sessions"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete All Sessions ({sessions.length})
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
