import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'light' | 'dark' | 'system';

function systemIsDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveDark(pref: ThemePreference): boolean {
  if (pref === 'dark') return true;
  if (pref === 'light') return false;
  return systemIsDark();
}

export function applyThemeClass(pref: ThemePreference) {
  document.documentElement.classList.toggle('dark', resolveDark(pref));
}

interface ThemeState {
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => {
        set({ preference });
        applyThemeClass(preference);
      },
    }),
    {
      name: 'nova-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeClass(state.preference);
      },
    },
  ),
);
