/* 
 * theme.css.ts — semantic color tokens + multiple themes (vanilla-extract)
 *
 * Themes included: default, neutral, tech, nature, medieval, aether
 * Contract: role-based tokens under `vars` (background, text, brand, state, border, shadow, overlay)
 */
import { createGlobalTheme, createThemeContract } from '@vanilla-extract/css'
import {type Theme, THEME_NAMES, type ThemeName} from "../models/Theme.ts";

/* --------------------------------------------------------------------------------
 * Token contract (roles, not raw colors)
 * -------------------------------------------------------------------------------- */
export const vars = createThemeContract({
    color: {
        background: {
            /** Main app background (the page canvas). */
            app: null,
            /** Secondary/surface background (cards, panels, modals). */
            surface: null,
            /** Hovered/raised surface background (e.g., card hover). */
            surfaceHover: null,
            /** Navbar/topbar background (often darker or contrastive). */
            navbar: null,
        },
        border: {
            /** Standard border/divider for cards, inputs, separators. */
            default: null,
            /** Stronger border for emphasis (e.g., inputs on focus, panels). */
            strong: null,
            /** High-visibility focus outline color (accessibility). */
            focus: null,
            /** Subtle outline for selected states (optional). */
            selected: null,
        },
        brand: {
            /** Main theme color (links, primary buttons, key highlights). */
            primary: null,
            /** Hover state of primary (slightly lighter/brighter). */
            primaryHover: null,
            /** Active/pressed state of primary (slightly darker). */
            primaryActive: null,
            /** Supporting accent (secondary buttons, tags, subtle highlights). */
            secondary: null,
            /** Hover state of secondary. */
            secondaryHover: null,
        },
        text: {
            /** Main body text color. */
            primary: null,
            /** Heading titles, higher emphasis than body text. */
            heading: null,
            /** Muted/secondary text (descriptions, placeholders). */
            muted: null,
            /** Text to use on dark/colored backgrounds (e.g., on primary). */
            inverse: null,
            /** Link color (by default equals brand.primary). */
            link: null,
            /** Link hover color. */
            linkHover: null,
        },
        state: {
            /** Background hint for selected rows/cards (usually translucent). */
            selectedBg: null,
            /** Border highlight for selected elements. */
            selectedBorder: null,
            /** Success feedback (toasts, badges, validation). */
            success: null,
            /** Warning feedback. */
            warning: null,
            /** Error/destructive feedback. */
            error: null,
            /** Informational feedback. */
            info: null,
        },
        overlay: {
            /** Scrim over content behind modals/drawers. */
            scrim: null,
        },
        shadow: {
            /** Card/drop shadow for raised surfaces. */
            card: null,
            /** Popover/tooltip shadow (slightly stronger). */
            popover: null,
        },
    },
})

/* --------------------------------------------------------------------------------
 * Theme definitions
 * --------------------------------------------------------------------------------
 * Original short keys mapped to new semantic ones:
 * bg → background.app
 * bgHi → background.surface
 * border → border.default
 * el → brand.primary
 * focus → border.focus
 * textHead → text.heading
 * text → text.primary
 * elContrast → text.inverse
 * shadow → shadow.card
 */

const themes: Record<ThemeName, Theme> = {
    [THEME_NAMES.default]: {
        color: {
            background: {
                app: 'hsl(42 20% 97%)',
                surface: 'hsl(42 22% 99%)',
                surfaceHover: 'hsl(42 22% 98%)',
                navbar: 'hsl(42 20% 94%)',
            },
            border: {
                default: 'hsl(42 15% 80%)',
                strong: 'hsl(42 18% 68%)',
                focus: 'hsl(32 35% 58%)',
                selected: 'hsl(32 22% 49%)',
            },
            brand: {
                primary: 'hsl(32 22% 49%)',
                primaryHover: 'hsl(32 22% 54%)',
                primaryActive: 'hsl(32 22% 43%)',
                secondary: 'hsl(18 30% 45%)',
                secondaryHover: 'hsl(18 30% 50%)',
            },
            text: {
                primary: 'hsl(220 15% 30%)',
                heading: 'hsl(220 25% 20%)',
                muted: 'hsl(220 10% 48%)',
                inverse: 'hsl(0 0% 100%)',
                link: 'hsl(32 22% 49%)',
                linkHover: 'hsl(32 22% 54%)',
            },
            state: {
                selectedBg: 'hsl(32 22% 49% / 0.12)',
                selectedBorder: 'hsl(32 22% 49%)',
                success: 'hsl(140 60% 35%)',
                warning: 'hsl(40 90% 50%)',
                error: 'hsl(0 75% 50%)',
                info: 'hsl(210 80% 45%)',
            },
            overlay: {
                scrim: 'hsl(42 20% 10% / 0.50)',
            },
            shadow: {
                card: '0 4px 24px hsl(220 20% 20% / 0.08)',
                popover: '0 8px 30px hsl(220 20% 20% / 0.14)',
            },
        },
    },

    [THEME_NAMES.neutral]: {
        color: {
            background: {
                app: 'hsl(42 20% 97%)',
                surface: 'hsl(42 22% 99%)',
                surfaceHover: 'hsl(42 22% 98%)',
                navbar: 'hsl(42 20% 94%)',
            },
            border: {
                default: 'hsl(42 15% 80%)',
                strong: 'hsl(42 18% 68%)',
                focus: 'hsl(32 35% 58%)',
                selected: 'hsl(32 22% 49%)',
            },
            brand: {
                primary: 'hsl(32 22% 49%)',
                primaryHover: 'hsl(32 22% 54%)',
                primaryActive: 'hsl(32 22% 43%)',
                secondary: 'hsl(18 30% 45%)',
                secondaryHover: 'hsl(18 30% 50%)',
            },
            text: {
                primary: 'hsl(220 15% 30%)',
                heading: 'hsl(220 25% 20%)',
                muted: 'hsl(220 10% 48%)',
                inverse: 'hsl(0 0% 100%)',
                link: 'hsl(32 22% 49%)',
                linkHover: 'hsl(32 22% 54%)',
            },
            state: {
                selectedBg: 'hsl(32 22% 49% / 0.12)',
                selectedBorder: 'hsl(32 22% 49%)',
                success: 'hsl(140 60% 35%)',
                warning: 'hsl(40 90% 50%)',
                error: 'hsl(0 75% 50%)',
                info: 'hsl(210 80% 45%)',
            },
            overlay: {
                scrim: 'hsl(42 20% 10% / 0.50)',
            },
            shadow: {
                card: '0 4px 24px hsl(220 20% 20% / 0.08)',
                popover: '0 8px 30px hsl(220 20% 20% / 0.14)',
            },
        },
    },

    [THEME_NAMES.tech]: {
        color: {
            background: {
                app: 'hsl(220 20% 96%)',
                surface: 'hsl(220 22% 99%)',
                surfaceHover: 'hsl(220 22% 98%)',
                navbar: 'hsl(220 20% 94%)',
            },
            border: {
                default: 'hsl(220 12% 78%)',
                strong: 'hsl(220 15% 62%)',
                focus: 'hsl(190 90% 55%)',
                selected: 'hsl(200 80% 45%)',
            },
            brand: {
                primary: 'hsl(200 80% 45%)',
                primaryHover: 'hsl(200 80% 52%)',
                primaryActive: 'hsl(200 80% 38%)',
                secondary: 'hsl(220 15% 60%)',
                secondaryHover: 'hsl(220 15% 55%)',
            },
            text: {
                primary: 'hsl(225 20% 28%)',
                heading: 'hsl(225 40% 18%)',
                muted: 'hsl(225 10% 50%)',
                inverse: 'hsl(0 0% 100%)',
                link: 'hsl(200 80% 45%)',
                linkHover: 'hsl(200 80% 52%)',
            },
            state: {
                selectedBg: 'hsl(200 80% 45% / 0.12)',
                selectedBorder: 'hsl(200 80% 45%)',
                success: 'hsl(140 60% 35%)',
                warning: 'hsl(40 90% 50%)',
                error: 'hsl(0 75% 50%)',
                info: 'hsl(210 80% 45%)',
            },
            overlay: {
                scrim: 'hsl(220 20% 10% / 0.50)',
            },
            shadow: {
                card: '0 4px 24px hsl(220 20% 20% / 0.10)',
                popover: '0 8px 30px hsl(220 20% 20% / 0.18)',
            },
        },
    },

    [THEME_NAMES.nature]: {
        color: {
            background: {
                app: 'hsl(100 20% 96%)',
                surface: 'hsl(100 22% 99%)',
                surfaceHover: 'hsl(100 22% 98%)',
                navbar: 'hsl(100 20% 94%)',
            },
            border: {
                default: 'hsl(100 12% 78%)',
                strong: 'hsl(100 14% 62%)',
                focus: 'hsl(140 45% 42%)',
                selected: 'hsl(140 28% 35%)',
            },
            brand: {
                primary: 'hsl(140 28% 35%)',
                primaryHover: 'hsl(140 28% 41%)',
                primaryActive: 'hsl(140 28% 29%)',
                secondary: 'hsl(100 35% 50%)',
                secondaryHover: 'hsl(100 35% 45%)',
            },
            text: {
                primary: 'hsl(160 18% 26%)',
                heading: 'hsl(160 35% 16%)',
                muted: 'hsl(160 10% 46%)',
                inverse: 'hsl(0 0% 100%)',
                link: 'hsl(140 28% 35%)',
                linkHover: 'hsl(140 28% 41%)',
            },
            state: {
                selectedBg: 'hsl(140 28% 35% / 0.12)',
                selectedBorder: 'hsl(140 28% 35%)',
                success: 'hsl(140 60% 35%)',
                warning: 'hsl(40 90% 50%)',
                error: 'hsl(0 75% 50%)',
                info: 'hsl(160 60% 40%)',
            },
            overlay: {
                scrim: 'hsl(100 20% 10% / 0.50)',
            },
            shadow: {
                card: '0 4px 24px hsl(160 20% 20% / 0.08)',
                popover: '0 8px 30px hsl(160 20% 20% / 0.14)',
            },
        },
    },

    [THEME_NAMES.medieval]: {
        color: {
            background: {
                app: 'hsl(42 35% 95%)',
                surface: 'hsl(42 40% 98%)',
                surfaceHover: 'hsl(42 40% 97%)',
                navbar: 'hsl(42 35% 93%)',
            },
            border: {
                default: 'hsl(35 25% 70%)',
                strong: 'hsl(35 28% 60%)',
                focus: 'hsl(30 70% 45%)',
                selected: 'hsl(354 42% 36%)',
            },
            brand: {
                primary: 'hsl(354 42% 36%)',
                primaryHover: 'hsl(354 42% 42%)',
                primaryActive: 'hsl(354 42% 30%)',
                secondary: 'hsl(18 30% 45%)',
                secondaryHover: 'hsl(18 30% 50%)',
            },
            text: {
                primary: 'hsl(24 25% 28%)',
                heading: 'hsl(24 40% 18%)',
                muted: 'hsl(24 15% 46%)',
                inverse: 'hsl(0 0% 100%)',
                link: 'hsl(354 42% 36%)',
                linkHover: 'hsl(354 42% 42%)',
            },
            state: {
                selectedBg: 'hsl(354 42% 36% / 0.12)',
                selectedBorder: 'hsl(354 42% 36%)',
                success: 'hsl(140 60% 35%)',
                warning: 'hsl(40 90% 50%)',
                error: 'hsl(0 75% 50%)',
                info: 'hsl(210 80% 45%)',
            },
            overlay: {
                scrim: 'hsl(42 35% 10% / 0.50)',
            },
            shadow: {
                card: '0 4px 24px hsl(24 30% 20% / 0.10)',
                popover: '0 8px 30px hsl(24 30% 20% / 0.14)',
            },
        },
    },

    [THEME_NAMES.aether]: {
        color: {
            background: {
                app: 'hsl(270 28% 96%)',
                surface: 'hsl(270 30% 99%)',
                surfaceHover: 'hsl(270 30% 98%)',
                navbar: 'hsl(270 28% 94%)',
            },
            border: {
                default: 'hsl(270 18% 80%)',
                strong: 'hsl(270 20% 70%)',
                focus: 'hsl(200 85% 58%)',
                selected: 'hsl(280 65% 55%)',
            },
            brand: {
                primary: 'hsl(280 65% 55%)',
                primaryHover: 'hsl(280 65% 61%)',
                primaryActive: 'hsl(280 65% 49%)',
                secondary: 'hsl(300 35% 55%)',
                secondaryHover: 'hsl(300 35% 60%)',
            },
            text: {
                primary: 'hsl(270 22% 28%)',
                heading: 'hsl(270 40% 18%)',
                muted: 'hsl(270 12% 50%)',
                inverse: 'hsl(0 0% 100%)',
                link: 'hsl(280 65% 55%)',
                linkHover: 'hsl(280 65% 61%)',
            },
            state: {
                selectedBg: 'hsl(280 65% 55% / 0.12)',
                selectedBorder: 'hsl(280 65% 55%)',
                success: 'hsl(140 60% 35%)',
                warning: 'hsl(40 90% 50%)',
                error: 'hsl(0 75% 50%)',
                info: 'hsl(250 70% 52%)',
            },
            overlay: {
                scrim: 'hsl(270 28% 10% / 0.50)',
            },
            shadow: {
                card: '0 4px 24px hsl(270 30% 20% / 0.08)',
                popover: '0 8px 30px hsl(270 30% 20% / 0.14)',
            },
        },
    },
}

/* Register default and attribute-scoped themes */
createGlobalTheme(':root', vars, themes.default)
createGlobalTheme(`[data-theme="${THEME_NAMES.default}"]`, vars, themes.default)
createGlobalTheme(`[data-theme="${THEME_NAMES.neutral}"]`, vars, themes.neutral)
createGlobalTheme(`[data-theme="${THEME_NAMES.tech}"]`, vars, themes.tech)
createGlobalTheme(`[data-theme="${THEME_NAMES.nature}"]`, vars, themes.nature)
createGlobalTheme(`[data-theme="${THEME_NAMES.medieval}"]`, vars, themes.medieval)
createGlobalTheme(`[data-theme="${THEME_NAMES.aether}"]`, vars, themes.aether)

/* Export map for programmatic access */
export const themeMap: Record<ThemeName, Theme> = themes
