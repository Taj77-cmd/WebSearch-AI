import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useTheme } from '@/hooks/useTheme';
import { GlitchText } from '@/components/ui/GlitchText';
import { AVAILABLE_MODELS } from '@/lib/utils';
import {
  Menu,
  Plus,
  Moon,
  Sun,
  Laptop,
  Terminal,
  Search,
  Users,
} from 'lucide-react';

interface HeaderProps {
  onNewSession: () => void;
  activeModel: string;
  onChangeModel: (model: string) => void;
  bestToggle: boolean;
  onToggleBest: () => void;
  matrixRainActive: boolean;
  onToggleMatrixRain: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewSession,
  activeModel,
  onChangeModel,
  bestToggle,
  onToggleBest,
  matrixRainActive,
  onToggleMatrixRain,
}) => {
  const { toggleSidebar, setCommandPaletteOpen } = useUIStore();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 px-4 bg-terminal-surface/90 backdrop-blur-md border-b border-terminal-border flex items-center justify-between shrink-0 z-10 select-none">
      {/* Left side: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg border border-terminal-border hover:border-terminal-accent text-terminal-text-secondary hover:text-terminal-text hover:bg-terminal-surface-elevated transition-colors"
          title="Toggle Sidebar (⌘B)"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-terminal-accent" />
          <GlitchText
            text="SearchAI"
            className="font-mono text-base font-bold text-terminal-text tracking-wider hover:text-terminal-accent transition-colors"
          />
          <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-terminal-accent-bg border border-terminal-accent-border text-terminal-accent">
            TERM-UI
          </span>
        </div>
      </div>

      {/* Center: Model Selector & Team Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Model dropdown */}
        <div className="relative">
          <select
            value={activeModel}
            onChange={(e) => onChangeModel(e.target.value)}
            className="px-2.5 py-1.5 bg-terminal-bg border border-terminal-border rounded-lg font-mono text-xs text-terminal-text focus:outline-none focus:border-terminal-accent cursor-pointer transition-colors appearance-none pr-7"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-terminal-text-dim text-[10px]">
            ▼
          </div>
        </div>

        {/* Team Mode Toggle Switch */}
        <button
          onClick={onToggleBest}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
            bestToggle
              ? 'bg-terminal-accent-bg border-terminal-accent-border text-terminal-accent shadow-sm'
              : 'bg-terminal-bg border-terminal-border text-terminal-text-dim hover:text-terminal-text'
          }`}
          title={bestToggle ? 'Team Mode is Active' : 'Enable Team Mode (Multi-agent research)'}
        >
          <Users className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {bestToggle ? 'Team Mode' : 'Single Agent'}
          </span>
        </button>
      </div>

      {/* Right side: Tools & New Chat */}
      <div className="flex items-center gap-2">
        {/* Command Palette trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-terminal-border bg-terminal-bg text-terminal-text-dim hover:text-terminal-text hover:border-terminal-accent-border font-mono text-xs transition-colors"
          title="Command Palette (⌘K)"
        >
          <Search className="w-3.5 h-3.5" />
          <span>⌘K</span>
        </button>

        {/* Matrix Rain Toggle */}
        <button
          onClick={onToggleMatrixRain}
          className={`p-1.5 rounded-lg border transition-colors ${
            matrixRainActive
              ? 'bg-terminal-accent-bg border-terminal-accent-border text-terminal-accent'
              : 'border-terminal-border text-terminal-text-dim hover:text-terminal-text'
          }`}
          title={matrixRainActive ? 'Disable Matrix Rain' : 'Enable Matrix Rain'}
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg border border-terminal-border hover:border-terminal-accent text-terminal-text-secondary hover:text-terminal-text hover:bg-terminal-surface-elevated transition-colors"
          title={`Theme: ${theme}`}
        >
          {theme === 'dark' ? (
            <Moon className="w-4 h-4 text-terminal-accent" />
          ) : theme === 'light' ? (
            <Sun className="w-4 h-4 text-terminal-warning" />
          ) : (
            <Laptop className="w-4 h-4 text-terminal-text-secondary" />
          )}
        </button>

        {/* New Session Button */}
        <button
          onClick={onNewSession}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-terminal-accent hover:bg-terminal-accent-secondary border border-terminal-accent text-terminal-text-inverse font-mono text-xs font-semibold shadow-sm transition-colors"
          title="New Research Session (⌘N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Session</span>
        </button>
      </div>
    </header>
  );
};
