import {type WheelEvent, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Canvas, CanvasPosition, Edge, type CanvasDirection, type CanvasRef, type EdgeProps, type ElkRoot, type NodeProps} from 'reaflow';
import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import {NodeCard} from "./Components/NodeCard.tsx";
import {StubNode} from "./Components/StubNode.tsx";
import {researchTree} from "../../data/research";
import * as s from "./ResearchPage.css.ts";
import {useTypedSelector} from "../../store/hooks.ts";
import {selectPurchasedTechsIds} from "../../store/research/selectors.ts";
import {selectCityHexes, selectCompleteCityStructureIds} from "../../store/city/selectors.ts";
import {selectAetherAtmosphereLevels} from "../../store/homogeneousValues/selectors.ts";
import {selectCityResolution, selectCitySignatureStatus} from "../../store/upkeep/selectors.ts";
import {BUILDINGS_ATLAS, STRUCTURES_BY_ID} from "../../data/buildings";
import {DEVELOPMENT_VECTORS} from "../../models/DevlopmentVector.ts";
import {UPKEEP_SPRITES, type UpkeepAmount, type UpkeepTypesValue} from "../../models/Upkeep.ts";
import type {FlatEdgeData, FlatNode, RequirementStatus, StubData} from "../../models/research/researchView.ts";
import {buildResearchPreviewGraph, canPurchaseResearch} from "../../models/research/researchGraph.ts";
import {
    AETHER_ATMOSPHERE_LABELS,
    type AetherAtmosphere,
    type AetherAtmosphereLevel,
    type AetherAtmosphereLevels,
} from "../../models/city/AetherAtmosphere.ts";

const NODE_W = 220;
const NODE_H = 280;
const LOCKED_NODE_W = 160;
const LOCKED_NODE_H = 64;
const CANVAS_PADDING = 480;
const MIN_ZOOM_FALLBACK = -0.9;
const MAX_ZOOM_FACTOR = 10;
const WHEEL_ZOOM_SENSITIVITY = 0.0015;

function getFitMinZoom(layout: ElkRoot | null, viewport: { width: number; height: number }): number {
    if (!layout?.width || !layout.height || !viewport.width || !viewport.height) return MIN_ZOOM_FALLBACK;

    const fitScale = Math.min(viewport.width / layout.width, viewport.height / layout.height, 1);
    return fitScale - 1;
}

function clampZoom(zoom: number, minZoomFactor: number): number {
    return Math.min(MAX_ZOOM_FACTOR + 1, Math.max(minZoomFactor + 1, zoom));
}

function getCanvasExtent(
    layout: ElkRoot | null,
    viewport: {width: number; height: number},
): {width: number; height: number} {
    const layoutWidth = layout?.width ?? 0;
    const layoutHeight = layout?.height ?? 0;

    return {
        width: Math.max(viewport.width, layoutWidth * (MAX_ZOOM_FACTOR + 1) + viewport.width + CANVAS_PADDING * 2),
        height: Math.max(viewport.height, layoutHeight * (MAX_ZOOM_FACTOR + 1) + viewport.height + CANVAS_PADDING * 2),
    };
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

function describeFreeUpkeepRequirement(
    required: UpkeepAmount | undefined,
    available: UpkeepAmount,
): RequirementStatus["requiredFreeUpkeep"] {
    if (!required) return [];

    return (Object.keys(required) as UpkeepTypesValue[]).map(resource => {
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
    completeStructureIds: Set<string>,
    effectiveUpkeep: UpkeepAmount,
    aetherAtmosphereLevels: AetherAtmosphereLevels,
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
            met: completeStructureIds.has(structureId),
        })),
        requiredFreeUpkeep: describeFreeUpkeepRequirement(data.requiredFreeUpkeep, effectiveUpkeep),
        requiredAetherAtmosphere: describeAetherAtmosphereRequirement(data.requiredAetherAtmosphere, aetherAtmosphereLevels),
        requiredBiodiversity: typeof data.requiredBiodiversity === "number"
            ? {required: data.requiredBiodiversity}
            : null,
    };
}

function describeAetherAtmosphereRequirement(
    required: ResearchNodeData["requiredAetherAtmosphere"],
    available: AetherAtmosphereLevels,
): RequirementStatus["requiredAetherAtmosphere"] {
    if (!required) return [];

    return (Object.entries(required) as [AetherAtmosphere, AetherAtmosphereLevel][]).map(([atmosphere, requiredLevel]) => {
        const availableLevel = available[atmosphere];
        const label = AETHER_ATMOSPHERE_LABELS[atmosphere];

        return {
            name: label.name,
            required: label.levels[requiredLevel],
            available: label.levels[availableLevel],
            met: availableLevel >= requiredLevel,
        };
    });
}

export default function ResearchPage() {
    const purchasedTechsIds = useTypedSelector(selectPurchasedTechsIds);
    const cityHexes = useTypedSelector(selectCityHexes);
    const completeStructureIds = useTypedSelector(selectCompleteCityStructureIds);
    const resolvedCityData = useTypedSelector(selectCityResolution);
    const {effectiveUpkeep} = resolvedCityData;
    const aetherAtmosphereLevels = useTypedSelector(selectAetherAtmosphereLevels);
    const signatureStatus = useTypedSelector(selectCitySignatureStatus);
    const viewportRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<CanvasRef>(null);
    const [layout, setLayout] = useState<ElkRoot | null>(null);
    const [viewport, setViewport] = useState({width: 0, height: 0});
    const purchased = useMemo(() => new Set(purchasedTechsIds), [purchasedTechsIds]);
    const builtBuildingIds = useMemo(() => {
        return new Set(cityHexes.flatMap(hex => [
            !hex.partOfStructureId || (hex.structureCoreCellKey ?? hex.cellKey) === hex.cellKey ? hex.buildingKey : null,
            hex.wallKey,
            hex.wallTopKey,
        ].filter((buildingId): buildingId is string => Boolean(buildingId))));
    }, [cityHexes]);

    const {nodes, edges} = useMemo(
        () => buildResearchPreviewGraph(
            researchTree,
            purchased,
            {width: NODE_W, height: NODE_H},
            {
                getNodeSize: node => {
                    const showDetails = purchased.has(node.id) || canPurchaseResearch(node, {
                        purchased,
                        builtBuildingIds,
                        completeStructureIds,
                        effectiveUpkeep,
                        aetherAtmosphereLevels,
                        isBesieged: signatureStatus.isBesieged,
                        resolvedCityData,
                    });

                    return showDetails
                        ? {width: NODE_W, height: NODE_H}
                        : {width: LOCKED_NODE_W, height: LOCKED_NODE_H};
                },
            },
        ),
        [aetherAtmosphereLevels, builtBuildingIds, completeStructureIds, effectiveUpkeep, purchased, resolvedCityData, signatureStatus.isBesieged],
    );

    const layoutOptions = useMemo(() => ({
        'elk.algorithm': 'layered',
        'elk.direction': "DOWN" as CanvasDirection,
        'elk.spacing.nodeNode': '36',
        'elk.layered.spacing.nodeNodeBetweenLayers': '80',
        'elk.edgeRouting': 'ORTHOGONAL',
        'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
        'elk.layered.crossingMinimization.forceNodeModelOrder': 'true',
        'elk.layered.cycleBreaking.strategy': 'GREEDY',
        'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    }), []);

    const [zoom, setZoom] = useState(1);
    const minZoom = getFitMinZoom(layout, viewport);
    const canvasExtent = getCanvasExtent(layout, viewport);

    const applyZoom = useCallback((nextZoom: number) => {
        const clampedZoom = clampZoom(nextZoom, minZoom);
        setZoom(clampedZoom);
        canvasRef.current?.setZoom?.(clampedZoom - 1);
    }, [minZoom]);

    const handleZoomChange = useCallback((nextZoom: number) => {
        setZoom(clampZoom(nextZoom, minZoom));
    }, [minZoom]);

    const handleWheelZoom = useCallback((event: WheelEvent<HTMLDivElement>) => {
        const target = event.target;
        if (target instanceof Element && target.closest('[data-research-card-scroll="true"]')) return;

        event.preventDefault();
        event.stopPropagation();

        const deltaUnit = event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
                ? viewport.height
                : 1;
        const zoomDelta = event.deltaY * deltaUnit * WHEEL_ZOOM_SENSITIVITY;

        applyZoom((canvasRef.current?.zoom ?? zoom) - zoomDelta);
    }, [applyZoom, viewport.height, zoom]);

    const fitCanvas = useCallback(() => {
        canvasRef.current?.fitCanvas?.(true);
    }, []);

    const centerCanvas = useCallback(() => {
        canvasRef.current?.positionCanvas?.(CanvasPosition.CENTER, true);
    }, []);

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
        applyZoom(zoom);
    }, [applyZoom, minZoom, zoom]);

    return (
        <div ref={viewportRef} className={s.researchTree} onWheelCapture={handleWheelZoom}>
            <div className={s.researchTreeControls}>
                <button type="button" className={s.researchTreeControl} onClick={fitCanvas}>Fit</button>
                <button type="button" className={s.researchTreeControl} onClick={centerCanvas}>Center</button>
            </div>
            <Canvas
                ref={canvasRef}
                nodes={nodes}
                edges={edges}
                layoutOptions={layoutOptions}
                panType="drag"
                maxWidth={canvasExtent.width}
                maxHeight={canvasExtent.height}
                maxZoom={MAX_ZOOM_FACTOR}
                minZoom={minZoom}
                zoom={zoom}
                zoomable={false}
                defaultPosition={CanvasPosition.CENTER}
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
                    }

                    const data = payload.data as ResearchNodeData;
                    const requirements = getRequirementStatus(
                        data,
                        builtBuildingIds,
                        completeStructureIds,
                        effectiveUpkeep,
                        aetherAtmosphereLevels,
                    );
                    const isResearched = purchased.has(data.id);
                    const canResearch = canPurchaseResearch(data, {
                        purchased,
                        builtBuildingIds,
                        completeStructureIds,
                        effectiveUpkeep,
                        aetherAtmosphereLevels,
                        isBesieged: signatureStatus.isBesieged,
                        resolvedCityData,
                    });

                    const nodeWidth = isResearched || canResearch ? NODE_W : LOCKED_NODE_W;
                    const nodeHeight = isResearched || canResearch ? NODE_H : LOCKED_NODE_H;

                    return (
                        <g transform={`translate(${props.x + nodeWidth / 2}, ${props.y + nodeHeight / 2})`}>
                            <NodeCard
                                data={data}
                                nodeHeight={nodeHeight}
                                nodeWidth={nodeWidth}
                                requirements={requirements}
                                isResearched={isResearched}
                                canResearch={canResearch}
                            />
                        </g>
                    );
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
