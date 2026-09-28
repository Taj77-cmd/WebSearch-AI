export interface AgentDetails {
  user_id: number;
  session_id: string;
  model: string;
  prompt: string;
  best_toggle: 0 | 1;
}

export interface AgentResponse {
  response: string;
  session_id: string;
  user_id: number;
  Links: SourceLink[] | null;
}

export interface SourceLink {
  title: string;
  url: string;
}

export interface RephraserInput {
  user_prompt: string;
}

export interface RephraserOutput {
  original_prompt: string;
  rephrased_prompt: string;
  word_count: number;
  version: string;
}

export interface HealthResponse {
  status: string;
}

export interface ApiError {
  status: number;
  detail: string;
}