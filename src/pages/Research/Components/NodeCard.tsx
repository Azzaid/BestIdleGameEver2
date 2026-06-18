import {themeMap} from "../../../theme/theme.css.ts";
import type {NodeCardProps} from "../../../models/research/researchView.ts";

function getTitleLines(title: string, nodeWidth: number, maxLines: number): string[] {
    const maxChars = Math.max(8, Math.floor((nodeWidth - 24) / 7.5));
    const words = title.split(" ");
    const lines: string[] = [];

    for (const word of words) {
        const currentLine = lines[lines.length - 1];
        if (!currentLine) {
            lines.push(word);
            continue;
        }

        if (`${currentLine} ${word}`.length <= maxChars) {
            lines[lines.length - 1] = `${currentLine} ${word}`;
        } else {
            lines.push(word);
        }
    }

    const trimLine = (line: string) => line.length > maxChars
        ? `${line.slice(0, maxChars - 3)}...`
        : line;

    if (lines.length <= maxLines) return lines.map(trimLine);

    const visibleLines = lines.slice(0, maxLines);
    const lastLine = visibleLines[visibleLines.length - 1];
    visibleLines[visibleLines.length - 1] = trimLine(
        lastLine.length > maxChars - 3
            ? lastLine
            : `${lastLine}...`,
    );

    return visibleLines;
}

export function NodeCard({
                             data,
                             nodeWidth,
                             nodeHeight,
                             requirements,
                             isResearched,
                             canResearch,
                         }: NodeCardProps) {
    const vectorTheme = themeMap[data.vector];
    const showDetails = isResearched || canResearch;
    const titleLines = getTitleLines(data.name, nodeWidth, showDetails ? 1 : 2);
    const titleY = showDetails
        ? -nodeHeight / 2 + 18
        : titleLines.length > 1 ? -7 : 5;

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
                x={0} y={titleY}
                textAnchor="middle"
                fontSize={14} fontWeight={700} fill={vectorTheme.color.text.heading}
                style={{pointerEvents: 'none'}}
            >
                {titleLines.map((line, index) => (
                    <tspan key={`${line}-${index}`} x={0} y={titleY + index * 17}>{line}</tspan>
                ))}
            </text>
            {showDetails ? (
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
                             fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif',
                             height: '100%',
                             display: 'flex',
                             flexDirection: 'column',
                             minHeight: 0,
                         }}>
                        <div
                            data-research-card-scroll="true"
                            style={{
                                overflowY: 'auto',
                                minHeight: 0,
                                paddingRight: 4,
                            }}
                        >
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
                                {requirements.requiredBuildings.length
                                || requirements.requiredStructures.length
                                || requirements.requiredFreeUpkeep.length
                                || requirements.requiredAetherAtmosphere.length
                                || requirements.requiredBiodiversity ? (
                                    <ul style={{margin: 2, paddingLeft: 16}}>
                                        {requirements.requiredBuildings.map(building => (
                                            <li key={building.id} style={{opacity: building.met ? 1 : 0.55}}>
                                                {building.met ? 'OK' : 'Missing'} {building.name}
                                            </li>
                                        ))}
                                        {requirements.requiredStructures.map(structure => (
                                            <li key={structure.id} style={{opacity: structure.met ? 1 : 0.55}}>
                                                {structure.met ? 'OK' : 'Missing'} {structure.name}
                                            </li>
                                        ))}
                                        {requirements.requiredFreeUpkeep.map(upkeep => (
                                            <li key={upkeep.name} style={{opacity: upkeep.met ? 1 : 0.55}}>
                                                {upkeep.name}: {upkeep.available}/{upkeep.required} free
                                            </li>
                                        ))}
                                        {requirements.requiredAetherAtmosphere.map(atmosphere => (
                                            <li key={atmosphere.name} style={{opacity: atmosphere.met ? 1 : 0.55}}>
                                                {atmosphere.name}: {atmosphere.available} / {atmosphere.required}
                                            </li>
                                        ))}
                                        {requirements.requiredBiodiversity ? (
                                            <li>
                                                Biodiversity: {requirements.requiredBiodiversity.required.toFixed(2)}
                                            </li>
                                        ) : null}
                                    </ul>
                                ) : (
                                    <div style={{marginTop: 2, opacity: 0.8}}>None</div>
                                )}
                            </div>
                            {data.notes ? <p style={{marginTop: 6, opacity: 0.9}}>{data.notes}</p> : null}
                        </div>
                    </div>
                </foreignObject>
            ) : null}
        </g>
    );
}
