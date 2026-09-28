import type { AgentDetails, AgentResponse, SourceLink } from '@/types/api';

export interface WebSocketStreamOptions {
  payload: AgentDetails;
  onOpen?: () => void;
  onToken?: (token: string, accumulated: string) => void;
  onDone?: (response: AgentResponse) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export interface WebSocketStreamHandle {
  abort: () => void;
}

export function getWebSocketUrl(endpoint: string = '/ws/chat'): string {
  // If explicitly set via env variable
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${endpoint}`;
}

export function streamChatViaWebSocket(options: WebSocketStreamOptions): WebSocketStreamHandle {
  const { payload, onOpen, onToken, onDone, onError, onClose } = options;

  let ws: WebSocket | null = null;
  let isAborted = false;
  let accumulated = '';

  try {
    const url = getWebSocketUrl('/ws/chat');
    ws = new WebSocket(url);

    ws.onopen = () => {
      if (isAborted) {
        ws?.close();
        return;
      }
      onOpen?.();
      // Send the request payload
      ws?.send(JSON.stringify(payload));
    };

    ws.onmessage = (event: MessageEvent) => {
      if (isAborted) return;

      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'token':
            if (typeof data.content === 'string') {
              accumulated += data.content;
              onToken?.(data.content, accumulated);
            }
            break;

          case 'done': {
            const finalResponse: AgentResponse = {
              response: data.response || accumulated,
              session_id: data.session_id || payload.session_id,
              user_id: data.user_id || payload.user_id,
              Links: (data.links as SourceLink[]) || null,
            };
            onDone?.(finalResponse);
            ws?.close();
            break;
          }

          case 'error':
            onError?.(new Error(data.error || 'Unknown WebSocket error'));
            ws?.close();
            break;

          default:
            // Could be raw token string
            if (data.content) {
              accumulated += data.content;
              onToken?.(data.content, accumulated);
            }
            break;
        }
      } catch {
        // In case message is plain text token instead of JSON
        if (typeof event.data === 'string') {
          accumulated += event.data;
          onToken?.(event.data, accumulated);
        }
      }
    };

    ws.onerror = (err) => {
      if (!isAborted) {
        onError?.(new Error('WebSocket connection error'));
      }
    };

    ws.onclose = () => {
      onClose?.();
    };
  } catch (err) {
    onError?.(err instanceof Error ? err : new Error(String(err)));
  }

  return {
    abort: () => {
      isAborted = true;
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    },
  };
}
