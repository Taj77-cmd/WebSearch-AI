import { create } from 'zustand';
import type { Session, Message } from '@/types/session';

interface SessionStore {
  sessions: Session[];
  messages: Record<string, Message[]>;
  optimisticMessages: Record<string, Message[]>;

  setSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  updateSession: (id: string, data: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  deleteAllSessions: () => void;

  setMessages: (sessionId: string, messages: Message[]) => void;
  addMessage: (sessionId: string, message: Message) => void;
  updateMessage: (sessionId: string, messageId: string, data: Partial<Message>) => void;
  clearSession: (sessionId: string) => void;

  addOptimisticMessage: (sessionId: string, message: Message) => void;
  removeOptimisticMessage: (sessionId: string, messageId: string) => void;
  clearOptimisticMessages: (sessionId: string) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessions: [],
  messages: {},
  optimisticMessages: {},

  setSessions: (sessions) => set({ sessions }),

  addSession: (session) =>
    set((state) => ({
      sessions: [session, ...state.sessions],
    })),

  updateSession: (id, data) =>
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, ...data, updated_at: new Date().toISOString() } : s
      ),
    })),

  deleteSession: (id) =>
    set((state) => {
      const { [id]: _, ...messages } = state.messages;
      const { [id]: __, ...optimisticMessages } = state.optimisticMessages;
      return {
        sessions: state.sessions.filter((s) => s.id !== id),
        messages,
        optimisticMessages,
      };
    }),

  deleteAllSessions: () =>
    set(() => ({
      sessions: [],
      messages: {},
      optimisticMessages: {},
    })),

  setMessages: (sessionId, messages) =>
    set((state) => ({
      messages: { ...state.messages, [sessionId]: messages },
    })),

  addMessage: (sessionId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: [...(state.messages[sessionId] || []), message],
      },
    })),

  updateMessage: (sessionId, messageId, data) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [sessionId]: (state.messages[sessionId] || []).map((m) =>
          m.id === messageId ? { ...m, ...data } : m
        ),
      },
    })),

  clearSession: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...messages } = state.messages;
      const { [sessionId]: __, ...optimisticMessages } = state.optimisticMessages;
      return { messages, optimisticMessages };
    }),

  addOptimisticMessage: (sessionId, message) =>
    set((state) => ({
      optimisticMessages: {
        ...state.optimisticMessages,
        [sessionId]: [...(state.optimisticMessages[sessionId] || []), message],
      },
    })),

  removeOptimisticMessage: (sessionId, messageId) =>
    set((state) => ({
      optimisticMessages: {
        ...state.optimisticMessages,
        [sessionId]: (state.optimisticMessages[sessionId] || []).filter(
          (m) => m.id !== messageId
        ),
      },
    })),

  clearOptimisticMessages: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...optimisticMessages } = state.optimisticMessages;
      return { optimisticMessages };
    }),
}));