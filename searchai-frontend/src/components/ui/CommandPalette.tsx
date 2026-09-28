import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Moon,
  Sun,
  Laptop,
  Sidebar as SidebarIcon,
  Sparkles,
  Trash2,
  Terminal,
  ArrowRight,
  X,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Actions' | 'Navigation' | 'Sessions' | 'Preferences';
  shortcut?: string;
  icon: React.ReactNode;
  perform: () => void;
}

interface CommandPaletteProps {
  onNewSession?: () => void;
  toggleMatrixRain?: () => void;
  matrixRainActive?: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  onNewSession,
  toggleMatrixRain,
  matrixRainActive = false,
}) => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    theme,
    setTheme,
    toggleSidebar,
    activeSessionId,
    setActiveSessionId,
  } = useUIStore();

  const { sessions, clearSession, deleteAllSessions: deleteAllSessionsStore } = useSessionStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      {
        id: 'new-session',
        title: 'New Research Session',
        category: 'Actions',
        shortcut: '⌘N',
        icon: <Plus className="w-4 h-4 text-terminal-accent" />,
        perform: () => {
          onNewSession?.();
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'toggle-sidebar',
        title: 'Toggle Sidebar',
        category: 'Navigation',
        shortcut: '⌘B',
        icon: <SidebarIcon className="w-4 h-4 text-terminal-info" />,
        perform: () => {
          toggleSidebar();
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'toggle-matrix',
        title: matrixRainActive ? 'Disable Matrix Rain Effect' : 'Enable Matrix Rain Effect',
        category: 'Preferences',
        icon: <Terminal className="w-4 h-4 text-terminal-accent" />,
        perform: () => {
          toggleMatrixRain?.();
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'theme-dark',
        title: 'Switch to Dark Theme',
        category: 'Preferences',
        icon: <Moon className="w-4 h-4 text-terminal-text-secondary" />,
        perform: () => {
          setTheme('dark');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'theme-light',
        title: 'Switch to Light Theme',
        category: 'Preferences',
        icon: <Sun className="w-4 h-4 text-terminal-warning" />,
        perform: () => {
          setTheme('light');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'theme-system',
        title: 'Use System Theme',
        category: 'Preferences',
        icon: <Laptop className="w-4 h-4 text-terminal-text-secondary" />,
        perform: () => {
          setTheme('system');
          setCommandPaletteOpen(false);
        },
      },
      {
        id: 'delete-all-sessions',
        title: 'Delete All Sessions',
        category: 'Actions',
        icon: <Trash2 className="w-4 h-4 text-terminal-error" />,
        perform: () => {
          deleteAllSessionsStore();
          setCommandPaletteOpen(false);
        },
      },
    ];

    if (activeSessionId) {
      list.push({
        id: 'clear-chat',
        title: 'Clear Current Chat Messages',
        category: 'Actions',
        icon: <Trash2 className="w-4 h-4 text-terminal-error" />,
        perform: () => {
          clearSession(activeSessionId);
          setCommandPaletteOpen(false);
        },
      });
    }

    // Add recent sessions to command palette
    sessions.slice(0, 5).forEach((session) => {
      list.push({
        id: `session-${session.id}`,
        title: `Switch to: ${session.title}`,
        category: 'Sessions',
        icon: <ArrowRight className="w-4 h-4 text-terminal-accent-secondary" />,
        perform: () => {
          setActiveSessionId(session.id);
          setCommandPaletteOpen(false);
        },
      });
    });

    return list;
  }, [
    onNewSession,
    toggleSidebar,
    setCommandPaletteOpen,
    matrixRainActive,
    toggleMatrixRain,
    setTheme,
    activeSessionId,
    clearSession,
    deleteAllSessionsStore,
    sessions,
    setActiveSessionId,
  ]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.title.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredCommands.length - 1 : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].perform();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setCommandPaletteOpen(false);
    }
  };

  if (!commandPaletteOpen) return null;

  return (
    <div
      className="fixed inset-0 z-command-palette bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 p-4 animate-fade-in"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-terminal-surface-elevated border border-terminal-border rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slide-in-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-terminal-border bg-terminal-surface">
          <Search className="w-5 h-5 text-terminal-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search sessions..."
            className="flex-1 bg-transparent font-mono text-sm text-terminal-text placeholder-terminal-text-dim focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-terminal-text-dim hover:text-terminal-text p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-6 text-center font-mono text-xs text-terminal-text-dim">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((command, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={command.id}
                  onClick={() => command.perform()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150',
                    isSelected
                      ? 'bg-terminal-accent-bg border border-terminal-accent-border text-terminal-accent'
                      : 'text-terminal-text hover:bg-terminal-surface border border-transparent'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0">{command.icon}</span>
                    <span className="font-mono text-xs font-medium truncate">
                      {command.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-terminal-text-dim uppercase tracking-wider">
                      {command.category}
                    </span>
                    {command.shortcut && (
                      <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-terminal-surface border border-terminal-border rounded text-terminal-text-secondary">
                        {command.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-terminal-border bg-terminal-surface flex items-center justify-between text-[11px] font-mono text-terminal-text-dim">
          <div className="flex items-center gap-2">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>SearchAI CLI</span>
        </div>
      </div>
    </div>
  );
};
