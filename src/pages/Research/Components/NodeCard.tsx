import type {ResearchNodeData} from "../../../models/research/ResearchNode.ts";
import {themeMap} from "../../../theme/theme.css.ts";

export type RequirementStatus = {
    requiredBuildings: {id: string; name: string; met: boolean}[];
    requiredFreeUpkeep: {name: string; required: number; available: number; met: boolean}[];
};

export function NodeCard({
                             data,
                             nodeWidth,
                             nodeHeight,
                             requirements,
                             isResearched,
                             canResearch,
                             onResearch,
                         }: {
    data: ResearchNodeData,
    nodeWidth: number,
    nodeHeight: number,
    requirements: RequirementStatus,
    isResearched: boolean,
    canResearch: boolean,
    onResearch: () => void,
}) {
    const vectorTheme = themeMap[data.vector];
    const buttonEnabled = canResearch && !isResearched;

    return (
        <g>
            <rect
                x={-nodeWidth / 2} y={-nodeHeight / 2}
                rx={14} ry={14}
                width={nodeWidth} height={nodeHeight}
                fill={vectorTheme.color.background.surface} stroke={vectorTheme.color.border.default} strokeWidth={2.5}
            />
            <circle cx={0} cy={-nodeHeight / 2} r={5.5} fill={vectorTheme.color.brand.primaryHover}/>
            <text
                x={0} y={-nodeHeight / 2 + 18}
                textAnchor="middle"
                fontSize={14} fontWeight={700} fill={vectorTheme.color.text.heading}
                style={{pointerEvents: 'none'}}
            >
                {data.name}
            </text>
            <foreignObject
                x={-nodeWidth / 2 + 8} y={-nodeHeight / 2 + 32}
                width={nodeWidth - 16} height={nodeHeight - 40}
                requiredExtensions="http://www.w3.org/1999/xhtml"
                style={{overflow: 'hidden'}}
            >
                <div style={{
                         color: vectorTheme.color.text.primary,
                         fontSize: 12,
                         lineHeight: 1.25,
                         fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif'
                     }}>
                    {data.summary && <p style={{margin: 0}}>{data.summary}</p>}
                    {data.unlocks?.length ? (
                        <div style={{marginTop: 6}}>
                            <div style={{opacity: 0.8, fontWeight: 600, color: vectorTheme.color.text.primary}}>Unlocks</div>
                            <ul style={{margin: 2, paddingLeft: 16}}>
                                {data.unlocks.map((u, i) => <li key={i}>{u}</li>)}
                            </ul>
                        </div>
                    ) : null}
                    <div style={{marginTop: 6}}>
                        <div style={{opacity: 0.8, fontWeight: 600, color: vectorTheme.color.text.primary}}>Requires</div>
                        {requirements.requiredBuildings.length || requirements.requiredFreeUpkeep.length ? (
                            <ul style={{margin: 2, paddingLeft: 16}}>
                                {requirements.requiredBuildings.map(building => (
                                    <li key={building.id} style={{opacity: building.met ? 1 : 0.55}}>
                                        {building.met ? 'OK' : 'Missing'} {building.name}
                                    </li>
                                ))}
                                {requirements.requiredFreeUpkeep.map(upkeep => (
                                    <li key={upkeep.name} style={{opacity: upkeep.met ? 1 : 0.55}}>
                                        {upkeep.name}: {upkeep.available}/{upkeep.required} free
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div style={{marginTop: 2, opacity: 0.8}}>None</div>
                        )}
                    </div>
                    {data.notes ? <p style={{marginTop: 6, opacity: 0.9}}>{data.notes}</p> : null}
                    <button
                        type="button"
                        disabled={!buttonEnabled}
                        onClick={(event) => {
                            event.stopPropagation();
                            onResearch();
                        }}
                        style={{
                            marginTop: 6,
                            width: '100%',
                            border: `1px solid ${vectorTheme.color.border.default}`,
                            borderRadius: 6,
                            padding: '4px 6px',
                            background: buttonEnabled
                                ? vectorTheme.color.brand.primary
                                : vectorTheme.color.background.surfaceHover,
                            color: buttonEnabled
                                ? vectorTheme.color.text.inverse
                                : vectorTheme.color.text.muted,
                            cursor: buttonEnabled ? 'pointer' : 'not-allowed',
                            fontWeight: 700,
                        }}
                    >
                        {isResearched ? 'Researched' : 'Research'}
                    </button>
                </div>
            </foreignObject>
        </g>
    );
}
