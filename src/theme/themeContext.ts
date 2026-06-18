import {createContext} from "react";
import type {ThemeContextValue} from "../models/Theme.ts";

export const ThemeContext = createContext<ThemeContextValue | null>(null);
