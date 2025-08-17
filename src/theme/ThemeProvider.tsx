import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Ensures vanilla-extract emits CSS and bundles it.
import { themeMap, themeNames, type ThemeName } from './theme.css.ts';

type ThemeContextValue = {
    theme: ThemeName;
    setTheme: (t: ThemeName) => void;
    /** Returns the raw values object for a theme (useful for JS-driven SVG, charts, etc.). */
    getThemeValues: (t?: ThemeName) => (typeof themeMap)[ThemeName];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'app-theme';
const THEMES: ThemeName[] = themeNames;

/** Apply data-theme attribute for CSS selector–based themes. */
function applyHtmlDataTheme(name: ThemeName) {
    if (name === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', name);
    }
}

/** Read initial theme from localStorage, fallback to 'default'. */
function getInitialTheme(): ThemeName {
    if (typeof window === 'undefined') return 'default';
    const saved = (localStorage.getItem(STORAGE_KEY) || '').toLowerCase() as ThemeName;
    return THEMES.includes(saved) ? saved : 'default';
}

export const ThemeProvider: React.FC<
    React.PropsWithChildren<{ initialTheme?: ThemeName }>
> = ({ initialTheme, children }) => {
    const [theme, setThemeState] = useState<ThemeName>(initialTheme ?? getInitialTheme());

    useEffect(() => {
        applyHtmlDataTheme(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {}
    }, [theme]);

    const setTheme = (t: ThemeName) => {
        if (!THEMES.includes(t)) return;
        setThemeState(t);
    };

    const getThemeValues = (t?: ThemeName) => themeMap[t ?? theme];

    const value = useMemo<ThemeContextValue>(
        () => ({ theme, setTheme, getThemeValues }),
        [theme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
}

/**
 * Scope a different theme to a subtree (research branches, legends, previews).
 * This uses the same data-attribute approach as the root, so all semantic tokens
 * from `vars` resolve correctly inside the subtree.
 */
export const ThemeSubtree: React.FC<
    React.PropsWithChildren<{ theme: ThemeName }>
> = ({ theme, children }) => {
    return (
        <div data-theme={theme}>
            {children}
        </div>
    );
};