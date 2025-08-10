import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// 1) Import ensures vanilla-extract emits CSS and bundles it.
import { vars, palettes, type ThemeName } from './theme.css';

type ThemeContextValue = {
    theme: ThemeName;
    setTheme: (t: ThemeName) => void;
    getPalette: (t?: ThemeName) => typeof palettes[ThemeName];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'app-theme';
const THEMES: ThemeName[] = ['default', 'tech', 'nature', 'medieval', 'aether'];

/** Apply data-theme attribute (for CSS selector-based themes). */
function applyHtmlDataTheme(name: ThemeName) {
    if (name === 'default') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', name);
    }
}

/** Inline-define CSS variables on :root — safety net if CSS file hasn’t landed yet. */
function applyRootInlineVars(name: ThemeName) {
    const p = palettes[name];
    const rs = document.documentElement.style;
    rs.setProperty('--bg', p.bg);
    rs.setProperty('--bg-hi', p.bgHi);
    rs.setProperty('--border', p.border);
    rs.setProperty('--el', p.el);
    rs.setProperty('--focus', p.focus);
    rs.setProperty('--text-head', p.textHead);
    rs.setProperty('--text', p.text);
    rs.setProperty('--el-contrast', p.elContrast);
    // shadow is not a color var used inside SVG; leave it optional
    rs.setProperty('--shadow', p.shadow);
}

/** Quick check: is a token defined in computed styles? */
function isTokenDefined(token: keyof typeof vars) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`);
    return Boolean(val && val.trim());
}

function getInitialTheme(): ThemeName {
    if (typeof window === 'undefined') return 'default';
    const saved = (localStorage.getItem(STORAGE_KEY) || '').toLowerCase();
    return (THEMES.includes(saved as ThemeName) ? (saved as ThemeName) : 'default');
}

export const ThemeProvider: React.FC<React.PropsWithChildren<{ initialTheme?: ThemeName }>> = ({
                                                                                                   initialTheme,
                                                                                                   children,
                                                                                               }) => {
    const [theme, setThemeState] = useState<ThemeName>(initialTheme ?? getInitialTheme());

    useEffect(() => {
        // 1) Apply attribute-based theme (vanilla-extract CSS path)
        applyHtmlDataTheme(theme);

        // 2) If variables aren’t defined yet (e.g., CSS not loaded), set inline as fallback.
        // Checking just one token is enough to know if the theme CSS is available.
        if (!isTokenDefined('text-head')) {
            applyRootInlineVars(theme);
        }

        try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
    }, [theme]);

    const setTheme = (t: ThemeName) => setThemeState(t);
    const getPalette = (t?: ThemeName) => palettes[t ?? theme];

    const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, getPalette }), [theme]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
}

/** Scope a different palette to a subtree (research branches, legends, etc.). */
export const ThemeSubtree: React.FC<React.PropsWithChildren<{ theme: ThemeName }>> = ({
                                                                                          theme,
                                                                                          children,
                                                                                      }) => {
    const p = palettes[theme];
    const style: React.CSSProperties = {
        ['--bg' as any]: p.bg,
        ['--bg-hi' as any]: p.bgHi,
        ['--border' as any]: p.border,
        ['--el' as any]: p.el,
        ['--focus' as any]: p.focus,
        ['--text-head' as any]: p.textHead,
        ['--text' as any]: p.text,
        ['--el-contrast' as any]: p.elContrast,
        ['--shadow' as any]: p.shadow,
    };
    return <div style={style}>{children}</div>;
};
