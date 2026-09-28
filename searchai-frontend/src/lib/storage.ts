import type { Session, Message } from '@/types/session';
import { generateId } from '@/lib/utils';

const SESSIONS_KEY = 'searchai_sessions';
const USER_ID_KEY = 'searchai_user_id';
const THEME_KEY = 'searchai_theme';
const MESSAGES_PREFIX = 'searchai_msgs_';

export function getUserId(): number {
  try {
    const stored = localStorage.getItem(USER_ID_KEY);
    if (stored) return parseInt(stored, 10);
  } catch {
    // Ignore
  }
  // Default user ID
  const defaultId = 1;
  localStorage.setItem(USER_ID_KEY, String(defaultId));
  return defaultId;
}

export function setUserId(userId: number): void {
  localStorage.setItem(USER_ID_KEY, String(userId));
}

export function getSessions(): Session[] {
  try {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore
  }
  return [];
}

export function saveSessions(sessions: Session[]): void {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function createSession(overrides?: Partial<Session>): Session {
  const userId = getUserId();
  const now = new Date().toISOString();
  const newSession: Session = {
    id: generateId(),
    user_id: userId,
    title: 'New Chat',
    created_at: now,
    updated_at: now,
    message_count: 0,
    model: 'gemini-2.0-flash-001',
    best_toggle: false,
    ...overrides,
  };
  const sessions = getSessions();
  sessions.unshift(newSession);
  saveSessions(sessions);
  return newSession;
}

export function updateSession(id: string, data: Partial<Session>): Session | null {
  const sessions = getSessions();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  sessions[index] = { ...sessions[index], ...data, updated_at: new Date().toISOString() };
  saveSessions(sessions);
  return sessions[index];
}

export function deleteSession(id: string): void {
  const sessions = getSessions();
  const filtered = sessions.filter((s) => s.id !== id);
  saveSessions(filtered);
  // Also delete messages
  localStorage.removeItem(`${MESSAGES_PREFIX}${id}`);
}

export function deleteAllSessions(): void {
  const sessions = getSessions();
  // Delete all session messages
  sessions.forEach((session) => {
    localStorage.removeItem(`${MESSAGES_PREFIX}${session.id}`);
  });
  // Clear all sessions
  saveSessions([]);
}

export function getMessages(sessionId: string): Message[] {
  try {
    const stored = localStorage.getItem(`${MESSAGES_PREFIX}${sessionId}`);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore
  }
  return [];
}

export function saveMessages(sessionId: string, messages: Message[]): void {
  // Keep only last 100 messages per session
  const toSave = messages.slice(-100);
  localStorage.setItem(`${MESSAGES_PREFIX}${sessionId}`, JSON.stringify(toSave));
}

export function addMessage(sessionId: string, message: Message): void {
  const messages = getMessages(sessionId);
  messages.push(message);
  saveMessages(sessionId, messages);

  // Update session message count
  updateSession(sessionId, { message_count: messages.length });
}

export function updateMessage(sessionId: string, messageId: string, data: Partial<Message>): void {
  const messages = getMessages(sessionId);
  const index = messages.findIndex((m) => m.id === messageId);
  if (index !== -1) {
    messages[index] = { ...messages[index], ...data };
    saveMessages(sessionId, messages);
  }
}

export function clearMessages(sessionId: string): void {
  localStorage.removeItem(`${MESSAGES_PREFIX}${sessionId}`);
  updateSession(sessionId, { message_count: 0 });
}

export function getTheme(): 'dark' | 'light' | 'system' {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
  } catch {
    // Ignore
  }
  return 'system';
}

export function saveTheme(theme: 'dark' | 'light' | 'system'): void {
  localStorage.setItem(THEME_KEY, theme);
}