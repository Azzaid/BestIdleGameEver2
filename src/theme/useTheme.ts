import {useContext} from "react";
import type {ThemeContextValue} from "../models/Theme.ts";
import {ThemeContext} from "./themeContext.ts";

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
    return ctx;
}
