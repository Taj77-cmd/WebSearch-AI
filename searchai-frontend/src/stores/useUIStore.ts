import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UIState } from '@/types/ui';

interface UIStore extends UIState {
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  setTheme: (theme: UIState['theme']) => void;
  setActiveSessionId: (id: string | null) => void;
  setInputHeight: (height: number) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      sidebarCollapsed: false,
      theme: 'system',
      activeSessionId: null,
      inputHeight: 60,
      commandPaletteOpen: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSidebarCollapse: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      setActiveSessionId: (id) => set({ activeSessionId: id }),
      setInputHeight: (height) => set({ inputHeight: Math.max(60, Math.min(200, height)) }),
      toggleCommandPalette: () => set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen })),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
    }),
    {
      name: 'searchai_ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);