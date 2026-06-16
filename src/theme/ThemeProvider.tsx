import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// Ensures vanilla-extract emits CSS and bundles it.
import { themeMap } from './theme.css.ts';
import {THEME_NAME_LIST, type ThemeContextValue, type ThemeName} from "../models/Theme.ts";

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'app-theme';

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
    return THEME_NAME_LIST.includes(saved) ? saved : 'default';
}

export const ThemeProvider: React.FC<
    React.PropsWithChildren<{ initialTheme?: ThemeName }>
> = ({ initialTheme, children }) => {
    const [theme, setThemeState] = useState<ThemeName>(initialTheme ?? getInitialTheme());

    useEffect(() => {
        applyHtmlDataTheme(theme);
        try {
            localStorage.setItem(STORAGE_KEY, theme);
        } catch {
            // localStorage can be unavailable in private or restricted browser contexts.
        }
    }, [theme]);

    const setTheme = (t: ThemeName) => {
        if (!THEME_NAME_LIST.includes(t)) return;
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
