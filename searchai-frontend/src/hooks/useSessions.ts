import { useCallback, useEffect, useState } from 'react';
import { useSessionStore } from '@/stores/useSessionStore';
import { getSessions, createSession, updateSession, deleteSession, deleteAllSessions, getMessages, saveMessages, addMessage, clearMessages } from '@/lib/storage';
import type { Session, Message } from '@/types/session';
import { generateId, formatDate } from '@/lib/utils';

export function useSessions() {
  const { sessions, setSessions, addSession, updateSession: updateSessionStore, deleteSession: deleteSessionStore, deleteAllSessions: deleteAllSessionsStore } =
    useSessionStore();

  const loadSessions = useCallback(() => {
    const stored = getSessions();
    // SAFEGUARD: Never auto-create sessions on load. Only load existing sessions from localStorage.
    // If you want default sessions, create them explicitly via user action.
    setSessions(stored);
    return stored;
  }, [setSessions]);

  const createNewSession = useCallback((overrides?: Partial<Session>) => {
    const newSession = createSession(overrides);
    addSession(newSession);
    return newSession;
  }, [addSession]);

  const updateSessionById = useCallback((id: string, data: Partial<Session>) => {
    const updated = updateSession(id, data);
    if (updated) {
      updateSessionStore(id, data);
    }
    return updated;
  }, [updateSessionStore]);

  const deleteSessionById = useCallback((id: string) => {
    deleteSession(id);
    deleteSessionStore(id);
  }, [deleteSessionStore]);

  const deleteAllSessionsById = useCallback(() => {
    deleteAllSessions();
    deleteAllSessionsStore();
  }, [deleteAllSessionsStore]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    loadSessions,
    createSession: createNewSession,
    updateSession: updateSessionById,
    deleteSession: deleteSessionById,
    deleteAllSessions: deleteAllSessionsById,
  };
}

export function useMessages(sessionId: string | null) {
  const { messages, setMessages, addMessage: addMessageStore, updateMessage, clearSession } = useSessionStore();
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!sessionId) return [];
    setIsLoading(true);
    try {
      const stored = getMessages(sessionId);
      setMessages(sessionId, stored);
      return stored;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, setMessages]);

  const sendMessage = useCallback(
    async (content: string, role: 'user' | 'assistant', sources?: Message['sources']): Promise<Message> => {
      if (!sessionId) throw new Error('No active session');

      const newMessage: Message = {
        id: generateId(),
        session_id: sessionId,
        role,
        content,
        sources: sources || null,
        created_at: new Date().toISOString(),
      };

      addMessage(sessionId, newMessage);
      addMessageStore(sessionId, newMessage);
      return newMessage;
    },
    [sessionId, addMessageStore]
  );

  const updateMessageById = useCallback(
    (messageId: string, data: Partial<Message>) => {
      if (!sessionId) return;
      updateMessage(sessionId, messageId, data);
    },
    [sessionId, updateMessage]
  );

  const clearAllMessages = useCallback(() => {
    if (!sessionId) return;
    clearMessages(sessionId);
    clearSession(sessionId);
  }, [sessionId, clearSession]);

  useEffect(() => {
    if (sessionId) {
      loadMessages();
    }
  }, [sessionId, loadMessages]);

  const sessionMessages = sessionId ? messages[sessionId] || [] : [];

  return {
    messages: sessionMessages,
    isLoading,
    loadMessages,
    sendMessage,
    updateMessage: updateMessageById,
    clearMessages: clearAllMessages,
  };
}