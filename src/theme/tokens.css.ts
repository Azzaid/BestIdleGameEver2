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
        md: '14px',
        lg: '18px',
        pill: '999px',
    },
    space: {
        xs: '6px',
        sm: '10px',
        md: '14px',
        lg: '20px',
        xl: '28px',
    },
    shadow: {
        card: '0 6px 20px rgba(0,0,0,.15)',
        inset: 'inset 0 0 0 1px rgba(0,0,0,.06)',
    },
    font: {
        sm: '12px',
        md: '14px',
        lg: '16px',
        xl: '18px',
    },
} as const;

// Register once globally
createGlobalTheme(':root', tokens, tokenValues);