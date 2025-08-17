import type {ResearchNodeData} from "../../../models/research/ResearchNode.ts";
import {themeMap} from "../../../theme/theme.css.ts";

export function NodeCard({data, nodeWidth, nodeHeight}: { data: ResearchNodeData, nodeWidth: number, nodeHeight: number }) {
    const vectorTheme = themeMap[data.vector];

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
                    {data.costs?.length ? (
                        <div style={{marginTop: 6}}>
                            <div style={{opacity: 0.8, fontWeight: 600, color: vectorTheme.color.text.primary}}>Cost</div>
                            <ul style={{margin: 2, paddingLeft: 16}}>
                                {data.costs.map((c, i) => <li key={i}>{c.amount}× {c.type}</li>)}
                            </ul>
                        </div>
                    ) : null}
                    {data.notes ? <p style={{marginTop: 6, opacity: 0.9}}>{data.notes}</p> : null}
                </div>
            </foreignObject>
        </g>
    );
}