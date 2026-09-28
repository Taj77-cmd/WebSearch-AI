import { useCallback, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type AgentDetails, type AgentResponse } from '@/lib/api';
import { streamChatViaWebSocket, type WebSocketStreamHandle } from '@/lib/websocket';
import { extractSources, generateId } from '@/lib/utils';
import { useSessionStore } from '@/stores/useSessionStore';
import { addMessage as saveMessageToStorage } from '@/lib/storage';
import type { Message } from '@/types/session';

interface UseChatOptions {
  sessionId: string | null;
  userId: number;
  model: string;
  bestToggle: boolean;
  onMessageComplete?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export interface StreamingState {
  isStreaming: boolean;
  currentContent: string;
  messageId: string | null;
}

export function useChat({
  sessionId,
  userId,
  model,
  bestToggle,
  onMessageComplete,
  onError,
}: UseChatOptions) {
  const queryClient = useQueryClient();
  const { addMessage: addMessageToStore, clearOptimisticMessages } = useSessionStore();
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentContent: '',
    messageId: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const activeWsStreamRef = useRef<WebSocketStreamHandle | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fallback HTTP mutation in case WebSocket cannot be established
  const chatHttpMutation = useMutation({
    mutationFn: async (payload: AgentDetails): Promise<AgentResponse> => {
      abortControllerRef.current = new AbortController();
      return api.chatModel(payload);
    },
  });

  const rephraseMutation = useMutation({
    mutationFn: (prompt: string) =>
      api.rephrasePrompt({ user_prompt: prompt }),
  });

  const sendMessage = useCallback(
    async (prompt: string) => {
      if (!prompt.trim() || !sessionId) return;

      // 1. Create and persist user message immediately
      const userMessage: Message = {
        id: generateId(),
        session_id: sessionId,
        role: 'user',
        content: prompt.trim(),
        sources: null,
        created_at: new Date().toISOString(),
      };

      addMessageToStore(sessionId, userMessage);
      saveMessageToStorage(sessionId, userMessage);

      // Assistant message placeholder ID for live streaming
      const assistantMessageId = generateId();
      setStreamingState({
        isStreaming: true,
        currentContent: '',
        messageId: assistantMessageId,
      });
      setIsLoading(true);

      const payload: AgentDetails = {
        user_id: userId,
        session_id: sessionId,
        model,
        prompt: prompt.trim(),
        best_toggle: bestToggle ? 1 : 0,
      };

      let hasReceivedAnyToken = false;

      // Finalize assistant message helper
      const handleFinalResponse = (finalText: string, providedLinks?: { title: string; url: string }[] | null) => {
        const { cleanContent, sources } = extractSources(finalText);
        const resolvedSources = (providedLinks && providedLinks.length > 0) ? providedLinks : (sources.length > 0 ? sources : null);

        const assistantMessage: Message = {
          id: assistantMessageId,
          session_id: sessionId,
          role: 'assistant',
          content: cleanContent,
          sources: resolvedSources,
          created_at: new Date().toISOString(),
        };

        addMessageToStore(sessionId, assistantMessage);
        saveMessageToStorage(sessionId, assistantMessage);

        setStreamingState({
          isStreaming: false,
          currentContent: '',
          messageId: null,
        });
        setIsLoading(false);
        queryClient.invalidateQueries({ queryKey: ['messages', sessionId] });
        onMessageComplete?.(assistantMessage);
      };

      // 2. Try WebSocket Streaming First
      activeWsStreamRef.current = streamChatViaWebSocket({
        payload,
        onOpen: () => {
          setIsLoading(true);
        },
        onToken: (_token, accumulated) => {
          hasReceivedAnyToken = true;
          setStreamingState({
            isStreaming: true,
            currentContent: accumulated,
            messageId: assistantMessageId,
          });
        },
        onDone: (response) => {
          handleFinalResponse(response.response, response.Links);
        },
        onError: async (wsError) => {
          console.warn('WebSocket stream error or unavailable:', wsError);

          // If tokens already started flowing, don't re-run via HTTP to prevent duplicate responses
          if (hasReceivedAnyToken) {
            setStreamingState({
              isStreaming: false,
              currentContent: '',
              messageId: null,
            });
            setIsLoading(false);
            onError?.(wsError);
            return;
          }

          // Fallback to HTTP POST /chatModel
          try {
            const httpResponse = await chatHttpMutation.mutateAsync(payload);
            handleFinalResponse(httpResponse.response, httpResponse.Links);
          } catch (httpErr) {
            setStreamingState({
              isStreaming: false,
              currentContent: '',
              messageId: null,
            });
            setIsLoading(false);
            const resolvedErr = httpErr instanceof Error ? httpErr : new Error(String(httpErr));
            onError?.(resolvedErr);
          }
        },
        onClose: () => {
          setIsLoading(false);
        },
      });
    },
    [sessionId, userId, model, bestToggle, addMessageToStore, onMessageComplete, onError, queryClient, chatHttpMutation]
  );

  const rephrasePrompt = useCallback(
    async (prompt: string) => {
      return rephraseMutation.mutateAsync(prompt);
    },
    [rephraseMutation]
  );

  const cancelStreaming = useCallback(() => {
    if (activeWsStreamRef.current) {
      activeWsStreamRef.current.abort();
      activeWsStreamRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setStreamingState({
      isStreaming: false,
      currentContent: '',
      messageId: null,
    });
    setIsLoading(false);
    clearOptimisticMessages(sessionId || '');
  }, [sessionId, clearOptimisticMessages]);

  return {
    sendMessage,
    rephrasePrompt,
    cancelStreaming,
    isLoading: isLoading || chatHttpMutation.isPending,
    isRephrasing: rephraseMutation.isPending,
    error: chatHttpMutation.error,
    streamingState,
  };
}