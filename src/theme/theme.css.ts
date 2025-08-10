// theme.css.ts
import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';

export type ThemeName = 'default' | 'tech' | 'nature' | 'medieval' | 'aether';

export const vars = createGlobalThemeContract({
    bg: 'bg',
    bgHi: 'bg-hi',
    border: 'border',
    el: 'el',
    focus: 'focus',
    textHead: 'text-head',
    text: 'text',
    elContrast: 'el-contrast',
    shadow: 'shadow',
});

export const palettes: Record<ThemeName, Record<keyof typeof vars, string>> = {
    default: {
        bg: 'hsl(42 20% 97%)',
        bgHi: 'hsl(42 22% 99%)',
        border: 'hsl(42 15% 80%)',
        el: 'hsl(32 22% 49%)',
        focus: 'hsl(32 35% 58%)',
        textHead: 'hsl(220 25% 20%)',
        text: 'hsl(220 15% 30%)',
        elContrast: 'white',
        shadow: '0 4px 24px hsl(220 20% 20% / 0.08)',
    },
    tech: {
        bg: 'hsl(220 20% 96%)',
        bgHi: 'hsl(220 22% 99%)',
        border: 'hsl(220 12% 78%)',
        el: 'hsl(200 80% 45%)',
        focus: 'hsl(190 90% 55%)',
        textHead: 'hsl(225 40% 18%)',
        text: 'hsl(225 20% 28%)',
        elContrast: 'white',
        shadow: '0 4px 24px hsl(220 20% 20% / 0.10)',
    },
    nature: {
        bg: 'hsl(100 20% 96%)',
        bgHi: 'hsl(100 22% 99%)',
        border: 'hsl(100 12% 78%)',
        el: 'hsl(140 28% 35%)',
        focus: 'hsl(140 45% 42%)',
        textHead: 'hsl(160 35% 16%)',
        text: 'hsl(160 18% 26%)',
        elContrast: 'white',
        shadow: '0 4px 24px hsl(160 20% 20% / 0.08)',
    },
    medieval: {
        bg: 'hsl(42 35% 95%)',
        bgHi: 'hsl(42 40% 98%)',
        border: 'hsl(35 25% 70%)',
        el: 'hsl(354 42% 36%)',
        focus: 'hsl(30 70% 45%)',
        textHead: 'hsl(24 40% 18%)',
        text: 'hsl(24 25% 28%)',
        elContrast: 'white',
        shadow: '0 4px 24px hsl(24 30% 20% / 0.10)',
    },
    aether: {
        bg: 'hsl(270 28% 96%)',
        bgHi: 'hsl(270 30% 99%)',
        border: 'hsl(270 18% 80%)',
        el: 'hsl(280 65% 55%)',
        focus: 'hsl(200 85% 58%)',
        textHead: 'hsl(270 40% 18%)',
        text: 'hsl(270 22% 28%)',
        elContrast: 'white',
        shadow: '0 4px 24px hsl(270 30% 20% / 0.08)',
    },
};

// Global default + attribute-scoped themes
createGlobalTheme(':root', vars, palettes.default);
createGlobalTheme('[data-theme="tech"]', vars, palettes.tech);
createGlobalTheme('[data-theme="nature"]', vars, palettes.nature);
createGlobalTheme('[data-theme="medieval"]', vars, palettes.medieval);
createGlobalTheme('[data-theme="aether"]', vars, palettes.aether);
