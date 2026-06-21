import {themeMap} from "../../../theme/theme.css.ts";
import type {StubData} from "../../../models/research/researchView.ts";

export function StubNode({data}: { data: StubData }) {
    const vectorTheme = themeMap[data.themeName];

    return (
        <g>
            <circle r={6} fill={vectorTheme.color.brand.primaryHover} opacity={0.85}/>
            <text x={8} y={4} fontSize={10} fill={vectorTheme.color.text.primary} opacity={0.85}>{data.progressText}</text>
            <title>Missing prerequisite: {data.missingOf} (progress {data.progressText})</title>
        </g>
    );
}
