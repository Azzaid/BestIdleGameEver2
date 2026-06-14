import {type WheelEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, CanvasPosition, Edge, type CanvasDirection, type EdgeProps, type ElkRoot, type NodeProps} from 'reaflow';
import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import {anyMet, isUnlocked, prereqsOf} from "./util.ts";
import {NodeCard} from "./Components/NodeCard.tsx";
import {StubNode} from "./Components/StubNode.tsx";
import type {ResearchDB} from "../../models/research/researchDB.ts";
import {researchThree} from "../../data/research";
import * as s from "./ResearchPage.css.ts";
import {useTypedDispatch, useTypedSelector} from "../../store/hooks.ts";
import {selectPurchasedTechsIds} from "../../store/research/selectors.ts";
import {purchaseTech} from "../../store/research/slice.ts";
import {selectCityHexes} from "../../store/city/selectors.ts";
import {selectCityResolution, selectCityTraceStatus} from "../../store/upkeep/selectors.ts";
import {BUILDINGS_ATLAS} from "../../data/buildings";
import {STRUCTURES_BY_ID} from "../../data/structures/index.ts";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_SPRITES, type UpkeepAmount, type UpkeepTypesValue} from "../../models/Upkeep.ts";
import type { FlatEdge, FlatEdgeData, FlatNode, RequirementStatus, StubData } from "../../models/research/researchView.ts";

const NODE_W = 220;
const NODE_H = 190;
const MIN_ZOOM_FALLBACK = -0.9;
const MAX_ZOOM_FACTOR = 10;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;
const ROOT_CHILD_ORDER = ['aether', 'tech', 'nature', 'medieval'];

function getFitMinZoom(layout: ElkRoot | null, viewport: { width: number; height: number }): number {
    if (!layout?.width || !layout.height || !viewport.width || !viewport.height) return MIN_ZOOM_FALLBACK;

    const fitScale = Math.min(viewport.width / layout.width, viewport.height / layout.height, 1);
    return fitScale - 1;
}

function clampZoom(zoom: number, minZoomFactor: number): number {
    return Math.min(MAX_ZOOM_FACTOR + 1, Math.max(minZoomFactor + 1, zoom));
}

function getBuildingName(buildingId: string): string {
    for (const vector of Object.values(DEVELOPMENT_VECTORS)) {
        const building = BUILDINGS_ATLAS[vector][buildingId];
        if (building) return building.name;
    }

    return buildingId;
}

function getStructureName(structureId: string): string {
    return STRUCTURES_BY_ID[structureId]?.name ?? structureId;
}

function hasStructureRequirements(structureId: string, builtBuildingIds: Set<string>): boolean {
    const structure = STRUCTURES_BY_ID[structureId];
    if (!structure) return false;

    return builtBuildingIds.has(structure.coreBuildingId)
        && structure.requiredAdjacentBuildingIds.every(buildingId => builtBuildingIds.has(buildingId));
}

function hasEnoughFreeUpkeep(required: UpkeepAmount | undefined, available: UpkeepAmount): boolean {
    if (!required) return true;

    return (Object.getOwnPropertySymbols(required) as UpkeepTypesValue[]).every(resource => {
        return (available[resource] ?? 0) >= (required[resource] ?? 0);
    });
}

function describeFreeUpkeepRequirement(
    required: UpkeepAmount | undefined,
    available: UpkeepAmount,
): RequirementStatus["requiredFreeUpkeep"] {
    if (!required) return [];

    return (Object.getOwnPropertySymbols(required) as UpkeepTypesValue[]).map(resource => {
        const requiredAmount = required[resource] ?? 0;
        const availableAmount = available[resource] ?? 0;

        return {
            name: UPKEEP_SPRITES[resource],
            required: requiredAmount,
            available: availableAmount,
            met: availableAmount >= requiredAmount,
        };
    });
}

function getRequirementStatus(
    data: ResearchNodeData,
    builtBuildingIds: Set<string>,
    effectiveUpkeep: UpkeepAmount,
): RequirementStatus {
    return {
        requiredBuildings: (data.requiredBuildings ?? []).map(buildingId => ({
            id: buildingId,
            name: getBuildingName(buildingId),
            met: builtBuildingIds.has(buildingId),
        })),
        requiredStructures: (data.requiredStructures ?? []).map(structureId => ({
            id: structureId,
            name: getStructureName(structureId),
            met: hasStructureRequirements(structureId, builtBuildingIds),
        })),
        requiredFreeUpkeep: describeFreeUpkeepRequirement(data.requiredFreeUpkeep, effectiveUpkeep),
    };
}

function getResearchNodeOrder(db: ResearchDB): string[] {
    const allIds = Object.keys(db);
    const originalOrder = new Map(allIds.map((id, index) => [id, index]));
    const rootChildOrder = new Map(ROOT_CHILD_ORDER.map((id, index) => [id, index]));

    return [...allIds].sort((a, b) => {
        const aRootChildOrder = rootChildOrder.get(a);
        const bRootChildOrder = rootChildOrder.get(b);

        if (aRootChildOrder !== undefined && bRootChildOrder !== undefined) {
            return aRootChildOrder - bRootChildOrder;
        }

        if (aRootChildOrder !== undefined) return -1;
        if (bRootChildOrder !== undefined) return 1;

        return (originalOrder.get(a) ?? 0) - (originalOrder.get(b) ?? 0);
    });
}

/** =========================
 *  Graph builders
 *  ========================= */

function computePreviewFrontierWithStubs(db: ResearchDB, purchased: Set<string>) {
    const nodes: FlatNode[] = [];
    const edges: FlatEdge[] = [];

    const byId = db;
    const allIds = getResearchNodeOrder(byId);

    // classify
    const unlockedIds = new Set<string>();
    const previewIds = new Set<string>();

    for (const id of allIds) {
        const n = byId[id];
        if (id === 'root') continue; // treat root separately
        if (isUnlocked(n, purchased)) unlockedIds.add(id);
        else if (anyMet(n, purchased)) previewIds.add(id);
    }

    // visible set = purchased ∪ unlocked ∪ preview ∪ root
    const visibleIds = new Set<string>(['root']);

    allIds.forEach(id => {
        if (purchased.has(id) || unlockedIds.has(id) || previewIds.has(id)) {
            visibleIds.add(id);
        }
    });

    // create nodes
    for (const id of visibleIds) {
        const n = byId[id];
        if (!n) continue;
        nodes.push({
            id,
            width: NODE_W,
            height: NODE_H,
            data: {kind: 'normal', data: n}
        });
    }

    // edges between visible real nodes
    function addEdge(from: string, to: string) {
        const kind: 'normal' | 'preview' = unlockedIds.has(to) || purchased.has(to) ? 'normal' : 'preview';
        edges.push({id: `${from}->${to}`, from, to, data: {kind}});
    }

    for (const id of visibleIds) {
        const n = byId[id];
        if (!n) continue;
        for (const p of prereqsOf(n)) {
            if (visibleIds.has(p)) addEdge(p, id);
        }
    }

    // add stubs for missing parents of visible preview nodes
    for (const id of visibleIds) {
        if (!previewIds.has(id)) continue; // only for preview nodes
        const n = byId[id]!;
        const reqs = prereqsOf(n);
        const met = reqs.filter(r => purchased.has(r));
        const missing = reqs.filter(r => !purchased.has(r));
        for (const miss of missing) {
            const stubId = `stub:${miss}->${id}`;
            const progressText = `${met.length}/${reqs.length}`;
            const stub: StubData = {id: stubId, missingOf: miss, target: id, progressText, vector: n.vector};
            nodes.push({
                id: stubId,
                width: 12,
                height: 12,
                data: {kind: 'stub', data: stub}
            });
            edges.push({
                id: `${stubId}=>${id}`,
                from: stubId,
                to: id,
                data: {kind: 'stub'}
            });
        }
    }

    return {nodes, edges};
}

/** =========================
 *  Main component (Reaflow + ELK layered)
 *  ========================= */
export default function ResearchPage() {
    const dispatch = useTypedDispatch();
    const purchasedTechsIds = useTypedSelector(selectPurchasedTechsIds);
    const cityHexes = useTypedSelector(selectCityHexes);
    const {effectiveUpkeep} = useTypedSelector(selectCityResolution);
    const traceStatus = useTypedSelector(selectCityTraceStatus);
    const viewportRef = useRef<HTMLDivElement>(null);
    const [layout, setLayout] = useState<ElkRoot | null>(null);
    const [viewport, setViewport] = useState({width: 0, height: 0});
    const purchased = useMemo(() => new Set(purchasedTechsIds), [purchasedTechsIds]);
    const builtBuildingIds = useMemo(() => {
        return new Set(cityHexes.flatMap(hex => [
            hex.buildingKey,
            hex.wallKey,
            hex.wallTopKey,
        ].filter((buildingId): buildingId is string => Boolean(buildingId))));
    }, [cityHexes]);

    const {nodes, edges} = useMemo(
        () => computePreviewFrontierWithStubs(researchThree, purchased),
        [purchased]
    );

    const layoutOptions = useMemo(() => ({
        'elk.algorithm': 'layered',
        'elk.direction': "DOWN" as CanvasDirection,                            // top -> down
        'elk.spacing.nodeNode': '36',
        'elk.layered.spacing.nodeNodeBetweenLayers': '80',
        'elk.edgeRouting': 'ORTHOGONAL',                   // or 'POLYLINE'
        'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
        'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
        'elk.layered.cycleBreaking.strategy': 'GREEDY',
        'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    }), []);

    const [zoom, setZoom] = useState(1);
    const minZoom = getFitMinZoom(layout, viewport);
    const handleZoomChange = useCallback((nextZoom: number) => {
        setZoom(clampZoom(nextZoom, minZoom));
    }, [minZoom]);

    const handleWheelZoom = useCallback((event: WheelEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const deltaUnit = event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
                ? viewport.height
                : 1;
        const zoomDelta = event.deltaY * deltaUnit * WHEEL_ZOOM_SENSITIVITY;

        setZoom(currentZoom => clampZoom(currentZoom - zoomDelta, minZoom));
    }, [minZoom, viewport.height]);

    useEffect(() => {
        const viewportElement = viewportRef.current;
        if (!viewportElement) return;

        const updateViewport = () => {
            setViewport({
                width: viewportElement.clientWidth,
                height: viewportElement.clientHeight,
            });
        };

        updateViewport();
        const resizeObserver = new ResizeObserver(updateViewport);
        resizeObserver.observe(viewportElement);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
        setZoom(currentZoom => clampZoom(currentZoom, minZoom));
    }, [minZoom]);

    return (
        <div ref={viewportRef} className={s.researchTree} onWheelCapture={handleWheelZoom}>
            <Canvas
                nodes={nodes}
                edges={edges}
                layoutOptions={layoutOptions}
                panType="drag"
                maxZoom={MAX_ZOOM_FACTOR}
                minZoom={minZoom}
                zoom={zoom}
                zoomable={false}
                defaultPosition={CanvasPosition.TOP}
                onLayoutChange={setLayout}
                onZoomChange={handleZoomChange}
                node={(props: NodeProps<FlatNode["data"]>) => {
                    const payload = props.properties?.data;
                    if (!payload) return <g />;
                    if (payload.kind === 'stub') {
                        const data = payload.data as StubData;
                        return (
                            <g transform={`translate(${props.x}, ${props.y})`}>
                                <StubNode data={data}/>
                            </g>
                        );
                    } else {
                        const data = payload.data as ResearchNodeData;
                        const requirements = getRequirementStatus(data, builtBuildingIds, effectiveUpkeep);
                        const isResearched = purchased.has(data.id);
                        const canResearch = !isResearched
                            && isUnlocked(data, purchased)
                            && requirements.requiredBuildings.every(requirement => requirement.met)
                            && requirements.requiredStructures.every(requirement => requirement.met)
                            && hasEnoughFreeUpkeep(data.requiredFreeUpkeep, effectiveUpkeep)
                            && !traceStatus.isBesieged;

                        return (
                            <g transform={`translate(${props.x + NODE_W / 2}, ${props.y + NODE_H / 2})`}>
                                <NodeCard
                                    data={data}
                                    nodeHeight={NODE_H}
                                    nodeWidth={NODE_W}
                                    requirements={requirements}
                                    isResearched={isResearched}
                                    canResearch={canResearch}
                                    onResearch={() => {
                                        if (traceStatus.isBesieged) return;
                                        dispatch(purchaseTech(data.id));
                                    }}
                                />
                            </g>
                        );
                    }
                }}
                edge={(p: EdgeProps) => {
                    const kind = (p.properties?.data as FlatEdgeData | undefined)?.kind;
                    const dashed = kind === 'preview' || kind === 'stub';
                    return <Edge {...p} style={dashed ? {strokeDasharray: '6 6', opacity: 0.9} : undefined}/>;
                }}
            />
        </div>
    );
}
