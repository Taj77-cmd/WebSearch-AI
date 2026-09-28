import React, { useState } from 'react';
import { AVAILABLE_MODELS, DEFAULT_MODEL } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { X, Plus, Terminal, Users } from 'lucide-react';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (config: { title: string; model: string; best_toggle: boolean }) => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [bestToggle, setBestToggle] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate({
      title: title.trim() || 'New Research Session',
      model,
      best_toggle: bestToggle,
    });
    setTitle('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-modal bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-terminal-surface-elevated border border-terminal-border rounded-xl shadow-2xl p-6 animate-slide-in-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-terminal-border mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-terminal-accent" />
            <h3 className="font-mono text-sm font-semibold text-terminal-text">
              Initialize New Session
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-terminal-text-dim hover:text-terminal-text p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-terminal-text-secondary mb-1.5 font-medium">
              Session Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus Research"
              className="w-full px-3 py-2 bg-terminal-surface border border-terminal-border rounded-lg text-terminal-text placeholder-terminal-text-dim focus:outline-none focus:border-terminal-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-terminal-text-secondary mb-1.5 font-medium">
              Language Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 bg-terminal-surface border border-terminal-border rounded-lg text-terminal-text focus:outline-none focus:border-terminal-accent transition-colors"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider})
                </option>
              ))}
            </select>
          </div>

          {/* Best Mode Toggle */}
          <div className="pt-2">
            <label className="flex items-center justify-between p-3 rounded-lg border border-terminal-border bg-terminal-surface cursor-pointer hover:border-terminal-accent-border transition-colors">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-terminal-accent" />
                <div>
                  <div className="text-terminal-text font-medium">Multi-Agent Team Mode</div>
                  <div className="text-[10px] text-terminal-text-dim">
                    Enables collaborative research across DuckDuckGo, HackerNews, ArXiv, and SerpAPI
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={bestToggle}
                onChange={(e) => setBestToggle(e.target.checked)}
                className="h-4 w-4 rounded border-terminal-border accent-terminal-accent cursor-pointer"
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-terminal-border mt-4">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              <Plus className="w-3.5 h-3.5" />
              <span>Create Session</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
