import { createGlobalTheme, createThemeContract } from '@vanilla-extract/css';

/**
 * Theme-independent tokens (do NOT change across themes).
 * Exposed as CSS variables via :root so you can use them in any *.css.ts.
 */
export const tokens = createThemeContract({
    radius: {
        md: null,
        lg: null,
        pill: null,
    },
    space: {
        xs: null,
        sm: null,
        md: null,
        lg: null,
        xl: null,
    },
    shadow: {
        card: null,
        inset: null,
    },
    font: {
        sm: null,
        md: null,
        lg: null,
        xl: null,
    },
} as const);

// Concrete values that stay the same for every theme
const tokenValues = {
    radius: {
        md: '6px',
        lg: '8px',
        pill: '999px',
    },
    space: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
    },
    shadow: {
        card: '0 3px 0 rgba(0,0,0,.18)',
        inset: 'inset 0 0 0 1px rgba(0,0,0,.08)',
    },
    font: {
        sm: '11px',
        md: '13px',
        lg: '15px',
        xl: '17px',
    },
} as const;

// Register once globally
createGlobalTheme(':root', tokens, tokenValues);
