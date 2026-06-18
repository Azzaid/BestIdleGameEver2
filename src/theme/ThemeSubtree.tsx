import React from "react";
import type {ThemeName} from "../models/Theme.ts";

export const ThemeSubtree: React.FC<
    React.PropsWithChildren<{ theme: ThemeName }>
> = ({ theme, children }) => {
    return (
        <div data-theme={theme}>
            {children}
        </div>
    );
};
