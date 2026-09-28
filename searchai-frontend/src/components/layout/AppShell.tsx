import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ChatView } from '@/components/chat/ChatView';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { MatrixRain } from '@/components/ui/MatrixRain';
import { Scanlines } from '@/components/ui/Scanlines';
import { PromptRephraser } from '@/components/prompt/PromptRephraser';
import { NewSessionModal } from '@/components/sessions/NewSessionModal';
import type { Session, Message } from '@/types/session';

interface AppShellProps {
  sessions: Session[];
  activeSession: Session | null;
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  onSendMessage: (prompt: string) => void;
  onCancelStreaming: () => void;
  onSelectSession: (id: string) => void;
  onCreateSessionConfig: (config: { title: string; model: string; best_toggle: boolean }) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  onDeleteAllSessions: () => void;
  activeModel: string;
  onChangeModel: (model: string) => void;
  bestToggle: boolean;
  onToggleBest: () => void;
  userId: number;
}

export const AppShell: React.FC<AppShellProps> = ({
  sessions,
  activeSession,
  messages,
  isStreaming,
  streamingContent,
  onSendMessage,
  onCancelStreaming,
  onSelectSession,
  onCreateSessionConfig,
  onRenameSession,
  onDeleteSession,
  onDeleteAllSessions,
  activeModel,
  onChangeModel,
  bestToggle,
  onToggleBest,
  userId,
}) => {
  const [matrixRainActive, setMatrixRainActive] = useState(false);
  const [isRephraserOpen, setIsRephraserOpen] = useState(false);
  const [rephrasePromptText, setRephrasePromptText] = useState('');
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  const handleOpenRephraser = (promptText: string) => {
    setRephrasePromptText(promptText);
    setIsRephraserOpen(true);
  };

  return (
    <div className="relative h-screen w-screen flex flex-col bg-terminal-bg text-terminal-text overflow-hidden font-sans select-none">
      {/* Visual terminal effects */}
      <Scanlines opacity={0.02} />
      {matrixRainActive && <MatrixRain opacity={0.05} />}

      {/* Top Header */}
      <Header
        onNewSession={() => setIsNewSessionModalOpen(true)}
        activeModel={activeModel}
        onChangeModel={onChangeModel}
        bestToggle={bestToggle}
        onToggleBest={onToggleBest}
        matrixRainActive={matrixRainActive}
        onToggleMatrixRain={() => setMatrixRainActive((prev) => !prev)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSession?.id || null}
          onSelectSession={onSelectSession}
          onNewSession={() => setIsNewSessionModalOpen(true)}
          onRenameSession={onRenameSession}
          onDeleteSession={onDeleteSession}
          onDeleteAllSessions={onDeleteAllSessions}
          userId={userId}
        />

        {/* Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <ChatView
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            onSendMessage={onSendMessage}
            onCancelStreaming={onCancelStreaming}
            onOpenRephraser={handleOpenRephraser}
            activeModel={activeModel}
            bestToggle={bestToggle}
            onToggleBest={onToggleBest}
            hasActiveSession={!!activeSession}
            onNewSession={() => setIsNewSessionModalOpen(true)}
          />
        </main>
      </div>

      {/* Status Footer */}
      <Footer
        activeSessionId={activeSession?.id || null}
        activeModel={activeModel}
        isStreaming={isStreaming}
      />

      {/* Modals & Overlays */}
      <CommandPalette
        onNewSession={() => setIsNewSessionModalOpen(true)}
        toggleMatrixRain={() => setMatrixRainActive((prev) => !prev)}
        matrixRainActive={matrixRainActive}
      />

      <PromptRephraser
        isOpen={isRephraserOpen}
        initialPrompt={rephrasePromptText}
        onClose={() => setIsRephraserOpen(false)}
        onApplyPrompt={(rephrased) => {
          onSendMessage(rephrased);
        }}
      />

      <NewSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onCreate={onCreateSessionConfig}
      />
    </div>
  );
};
