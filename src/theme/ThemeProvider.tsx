import React, { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import { themeByName } from './theme.css.ts';
import type { ThemeName } from './theme.css.ts';

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (name: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function computeThemeFromGameState(
  researchPath?: string,
  buildCompositionEmphasis?: string
): ThemeName {
  // Basic heuristic stub. Replace with real logic integrating game state.
  const key = `${researchPath || ''} ${buildCompositionEmphasis || ''}`.toLowerCase();
  if (key.includes('nature') || key.includes('bio') || key.includes('forest')) return 'nature';
  if (key.includes('tech') || key.includes('science') || key.includes('machine')) return 'tech';
  if (key.includes('aether') || key.includes('void') || key.includes('mana')) return 'aether';
  if (key.includes('medieval') || key.includes('steel') || key.includes('knight')) return 'medieval';
  // Fallback
  return 'tech';
}

export const ThemeProvider: React.FC<PropsWithChildren<{ initialTheme?: ThemeName }>> = ({ initialTheme = 'tech', children }) => {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);
  const themeClass = useMemo(() => themeByName[theme], [theme]);

  // Wrap children with a div applying the theme class
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={themeClass} style={{ height: '100vh', width: '100%' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
