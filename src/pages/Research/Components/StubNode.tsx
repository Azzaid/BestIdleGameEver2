import type {ResearchNodeData} from "../../../models/research/ResearchNode.ts";
import {themeMap} from "../../../theme/theme.css.ts";

export type StubData = {
    id: string;               // e.g. stub:missingId->targetId
    missingOf: string;        // the missing prerequisite id
    target: string;           // the child id
    progressText: string;     // "1/3" etc.
    vector: ResearchNodeData['vector'];
};

export function StubNode({data}: { data: StubData }) {
    const vectorTheme = themeMap[data.vector];

    return (
        <g>
            <circle r={6} fill={vectorTheme.color.brand.primaryHover} opacity={0.85}/>
            <text x={8} y={4} fontSize={10} fill={vectorTheme.color.text.primary} opacity={0.85}>{data.progressText}</text>
            <title>Missing prerequisite: {data.missingOf} (progress {data.progressText})</title>
        </g>
    );
}