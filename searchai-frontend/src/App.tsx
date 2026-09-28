import React, { useEffect, useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useSessions, useMessages } from '@/hooks/useSessions';
import { useChat } from '@/hooks/useChat';
import { useUIStore } from '@/stores/useUIStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { getUserId } from '@/lib/storage';
import { DEFAULT_MODEL } from '@/lib/utils';
import { toast } from 'sonner';

export const App: React.FC = () => {
  const {
    sessions,
    createSession,
    updateSession,
    deleteSession,
    deleteAllSessions,
  } = useSessions();

  const {
    activeSessionId,
    setActiveSessionId,
    toggleSidebar,
    setCommandPaletteOpen,
  } = useUIStore();

  const userId = useMemo(() => getUserId(), []);

  const [activeModel, setActiveModel] = useState<string>(DEFAULT_MODEL);
  const [bestToggle, setBestToggle] = useState<boolean>(false);

  // When the active session no longer exists (e.g. was deleted), move to the
  // next available session — or clear selection if none remain.
  // We do NOT auto-create sessions on startup; let the user create them.
  useEffect(() => {
    if (activeSessionId && !sessions.some((s) => s.id === activeSessionId)) {
      // Active session was deleted; fall back to the first remaining one (or null)
      setActiveSessionId(sessions.length > 0 ? sessions[0].id : null);
    }
  }, [sessions, activeSessionId, setActiveSessionId]);

  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  // Sync session's model and mode when active session changes
  useEffect(() => {
    if (activeSession) {
      if (activeSession.model) setActiveModel(activeSession.model);
      if (activeSession.best_toggle !== undefined) setBestToggle(activeSession.best_toggle);
    }
  }, [activeSession]);

  // Messages for active session
  const { messages } = useMessages(activeSessionId);

  // Chat hook with WebSocket streaming
  const {
    sendMessage,
    cancelStreaming,
    streamingState,
  } = useChat({
    sessionId: activeSessionId,
    userId,
    model: activeModel,
    bestToggle,
    onError: (err) => {
      toast.error('Search request failed', {
        description: err.message,
      });
    },
  });

  // Global keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      meta: true,
      ctrl: true,
      action: () => setCommandPaletteOpen(true),
      description: 'Open command palette',
    },
    {
      key: 'n',
      meta: true,
      ctrl: true,
      action: () => {
        const newSess = createSession({
          title: 'New Research Session',
          model: activeModel,
          best_toggle: bestToggle,
        });
        setActiveSessionId(newSess.id);
        toast.success('New session created');
      },
      description: 'Create new session',
    },
    {
      key: 'b',
      meta: true,
      ctrl: true,
      action: () => toggleSidebar(),
      description: 'Toggle sidebar',
    },
    {
      key: 'Backspace',
      meta: true,
      ctrl: true,
      shift: true,
      action: () => {
        if (sessions.length > 0) {
          handleDeleteAllSessions();
        }
      },
      description: 'Delete all sessions',
    },
  ]);

  const handleCreateSessionConfig = (config: {
    title: string;
    model: string;
    best_toggle: boolean;
  }) => {
    const newSession = createSession({
      title: config.title,
      model: config.model,
      best_toggle: config.best_toggle,
    });
    setActiveModel(config.model);
    setBestToggle(config.best_toggle);
    setActiveSessionId(newSession.id);
    toast.success('Session initialized');
  };

  const handleDeleteSession = (id: string) => {
    deleteSession(id);
    toast.info('Session deleted');
    if (activeSessionId === id) {
      // Use the latest sessions from the store by reading from the hook's return value
      // The deleteSession call above updates the store, so we need to get the updated sessions
      // Since we're in an event handler, the sessions variable here is from the current render
      // which is correct - we want sessions BEFORE deletion to find the next one
      const remaining = sessions.filter((s) => s.id !== id);
      // Move to the next session if one exists, otherwise clear active selection
      setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleDeleteAllSessions = () => {
    deleteAllSessions();
    setActiveSessionId(null);
    toast.success('All sessions deleted');
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    updateSession(id, { title: newTitle });
    toast.success('Session renamed');
  };

  const handleChangeModel = (model: string) => {
    setActiveModel(model);
    if (activeSessionId) {
      updateSession(activeSessionId, { model });
    }
  };

  const handleToggleBest = () => {
    const nextVal = !bestToggle;
    setBestToggle(nextVal);
    if (activeSessionId) {
      updateSession(activeSessionId, { best_toggle: nextVal });
    }
    toast.info(nextVal ? 'Multi-Agent Team Mode activated' : 'Single Agent Mode activated');
  };

  return (
    <AppShell
      sessions={sessions}
      activeSession={activeSession}
      messages={messages}
      isStreaming={streamingState.isStreaming}
      streamingContent={streamingState.currentContent}
      onSendMessage={sendMessage}
      onCancelStreaming={cancelStreaming}
      onSelectSession={setActiveSessionId}
      onCreateSessionConfig={handleCreateSessionConfig}
      onRenameSession={handleRenameSession}
      onDeleteSession={handleDeleteSession}
      onDeleteAllSessions={handleDeleteAllSessions}
      activeModel={activeModel}
      onChangeModel={handleChangeModel}
      bestToggle={bestToggle}
      onToggleBest={handleToggleBest}
      userId={userId}
    />
  );
};
