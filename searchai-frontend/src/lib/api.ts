import type { AgentDetails, AgentResponse, RephraserInput, RephraserOutput, HealthResponse, ApiError } from '@/types/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

class ApiClient {
  private baseURL: string;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const id = `${endpoint}-${Date.now()}`;
    this.abortControllers.set(id, controller);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorDetail = 'Request failed';
        try {
          const error = await response.json();
          errorDetail = error.detail || errorDetail;
        } catch {
          // Ignore JSON parse error
        }
        throw new ApiClientError(response.status, errorDetail);
      }

      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        return response.json();
      }
      return response.text() as unknown as T;
    } finally {
      this.abortControllers.delete(id);
    }
  }

  async chatModel(details: AgentDetails): Promise<AgentResponse> {
    return this.request<AgentResponse>('/chatModel', {
      method: 'POST',
      body: JSON.stringify(details),
    });
  }

  async rephrasePrompt(input: RephraserInput): Promise<RephraserOutput> {
    return this.request<RephraserOutput>('/prompt-rephraser-v3', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  abortAll() {
    this.abortControllers.forEach((c) => c.abort());
    this.abortControllers.clear();
  }
}

export class ApiClientError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const api = new ApiClient(API_BASE);