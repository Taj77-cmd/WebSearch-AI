import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowRight, Check, Copy, X, RefreshCw } from 'lucide-react';

interface PromptRephraserProps {
  isOpen: boolean;
  initialPrompt: string;
  onClose: () => void;
  onApplyPrompt: (rephrased: string) => void;
}

export const PromptRephraser: React.FC<PromptRephraserProps> = ({
  isOpen,
  initialPrompt,
  onClose,
  onApplyPrompt,
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [rephrased, setRephrased] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && initialPrompt) {
      setPrompt(initialPrompt);
      handleRephrase(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleRephrase = async (textToRephrase: string) => {
    if (!textToRephrase.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await api.rephrasePrompt({ user_prompt: textToRephrase.trim() });
      setRephrased(result.rephrased_prompt);
      setWordCount(result.word_count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rephrase prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rephrased);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const originalWords = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-modal bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-terminal-surface-elevated border border-terminal-border rounded-xl shadow-2xl p-6 animate-slide-in-bottom font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-terminal-border mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-terminal-accent" />
            <h3 className="text-sm font-semibold text-terminal-text">
              AI Prompt Optimization Engine
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-terminal-text-dim hover:text-terminal-text p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Comparison */}
        <div className="space-y-4">
          {/* Original Prompt */}
          <div>
            <div className="flex items-center justify-between mb-1 text-terminal-text-dim">
              <span className="uppercase text-[11px] font-semibold">Original Prompt</span>
              <span>{originalWords} words</span>
            </div>
            <div className="p-3 rounded-lg bg-terminal-surface border border-terminal-border text-terminal-text leading-relaxed">
              {prompt}
            </div>
          </div>

          {/* Loading or Rephrased output */}
          <div>
            <div className="flex items-center justify-between mb-1 text-terminal-text-dim">
              <span className="uppercase text-[11px] font-semibold text-terminal-accent">
                Optimized Search Prompt
              </span>
              {rephrased && <span>{wordCount} words</span>}
            </div>

            {isLoading ? (
              <div className="p-6 rounded-lg bg-terminal-surface border border-terminal-accent-border/50 flex flex-col items-center justify-center gap-2 text-terminal-accent">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span className="text-xs">Generating concise, high-signal query...</span>
              </div>
            ) : error ? (
              <div className="p-3 rounded-lg bg-terminal-error/10 border border-terminal-error/30 text-terminal-error">
                {error}
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-terminal-accent-bg border border-terminal-accent-border text-terminal-text leading-relaxed">
                {rephrased || 'No rephrased output yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-5 border-t border-terminal-border mt-5">
          <button
            type="button"
            onClick={() => handleRephrase(prompt)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-terminal-border text-terminal-text-secondary hover:text-terminal-text hover:bg-terminal-surface transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            {rephrased && (
              <Button
                variant="ghost"
                size="sm"
                type="button"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-terminal-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              type="button"
              disabled={isLoading || !rephrased}
              onClick={() => {
                onApplyPrompt(rephrased);
                onClose();
              }}
            >
              <span>Use This Prompt</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
