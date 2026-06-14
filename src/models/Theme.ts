import {
    type DevelopmentVectorKey,
} from "./DevlopmentVector.ts";

type HSLColor = `hsl(${number} ${number}% ${number}%)`;
type HSLAColor = `hsl(${number} ${number}% ${number}% / ${number})`;

export type ThemeName = DevelopmentVectorKey;

// Object with both property access *and* array access
export const THEME_NAMES = {
    tech: "tech",
    nature: "nature",
    medieval: "medieval",
    aether: "aether",
    default: "default",
} as const satisfies Record<ThemeName, ThemeName>;

export const THEME_NAME_LIST = Object.values(THEME_NAMES);

export type Theme = {
    color: {
        background: {
            /** Main app background (the page canvas). */
            app: HSLColor | HSLAColor,
            /** Secondary/surface background (cards, panels, modals). */
            surface: HSLColor | HSLAColor,
            /** Hovered/raised surface background (e.g., card hover). */
            surfaceHover: HSLColor | HSLAColor,
            /** Navbar/topbar background (often darker or contrastive). */
            navbar: HSLColor | HSLAColor,
        },
        border: {
            /** Standard border/divider for cards, inputs, separators. */
            default: HSLColor | HSLAColor,
            /** Stronger border for emphasis (e.g., inputs on focus, panels). */
            strong: HSLColor | HSLAColor,
            /** High-visibility focus outline color (accessibility). */
            focus: HSLColor | HSLAColor,
            /** Subtle outline for selected states (optional). */
            selected: HSLColor | HSLAColor,
        },
        brand: {
            /** Main theme color (links, primary buttons, key highlights). */
            primary: HSLColor | HSLAColor,
            /** Hover state of primary (slightly lighter/brighter). */
            primaryHover: HSLColor | HSLAColor,
            /** Active/pressed state of primary (slightly darker). */
            primaryActive: HSLColor | HSLAColor,
            /** Supporting accent (secondary buttons, tags, subtle highlights). */
            secondary: HSLColor | HSLAColor,
            /** Hover state of secondary. */
            secondaryHover: HSLColor | HSLAColor,
        },
        text: {
            /** Main body text color. */
            primary: HSLColor | HSLAColor,
            /** Heading titles, higher emphasis than body text. */
            heading: HSLColor | HSLAColor,
            /** Muted/secondary text (descriptions, placeholders). */
            muted: HSLColor | HSLAColor,
            /** Text to use on dark/colored backgrounds (e.g., on primary). */
            inverse: HSLColor | HSLAColor,
            /** Link color (by default equals brand.primary). */
            link: HSLColor | HSLAColor,
            /** Link hover color. */
            linkHover: HSLColor | HSLAColor,
        },
        state: {
            /** Background hint for selected rows/cards (usually translucent). */
            selectedBg: HSLColor | HSLAColor,
            /** Border highlight for selected elements. */
            selectedBorder: HSLColor | HSLAColor,
            /** Success feedback (toasts, badges, validation). */
            success: HSLColor | HSLAColor,
            /** Warning feedback. */
            warning: HSLColor | HSLAColor,
            /** Error/destructive feedback. */
            error: HSLColor | HSLAColor,
            /** Informational feedback. */
            info: HSLColor | HSLAColor,
        },
        overlay: {
            /** Scrim over content behind modals/drawers. */
            scrim: HSLColor | HSLAColor,
        },
        shadow: {
            /** Card/drop shadow for raised surfaces. */
            card: string,
            /** Popover/tooltip shadow (slightly stronger). */
            popover: string,
        },
    },
}

export type ThemeContextValue = {
    theme: ThemeName;
    setTheme: (t: ThemeName) => void;
    getThemeValues: (t?: ThemeName) => Theme;
};
