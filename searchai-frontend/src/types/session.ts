export interface Session {
  id: string;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  model: string;
  best_toggle: boolean;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: SourceLink[] | null;
  created_at: string;
  is_streaming?: boolean;
}

export interface SourceLink {
  title: string;
  url: string;
}

export interface CreateSessionInput {
  user_id: number;
  model?: string;
  best_toggle?: boolean;
  title?: string;
}