import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Canvas, CanvasPosition, Edge, type CanvasDirection, type CanvasRef, type EdgeProps, type ElkRoot, type NodeProps} from "reaflow";
import {
  PROGRESSION_GRAPH,
  PROGRESSION_VALIDATION_ERRORS,
} from "./data/catalog.ts";
import type {
  ProgressionEdge,
  ProgressionGraphNode,
  ProgressionNodeKind,
} from "./data/types.ts";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import {BUILDINGS_ATLAS} from "../../data/buildings/index.ts";
import {researchTree} from "../../data/research/index.ts";
import {TOWER_PARTS_BY_ID} from "../../data/gunParts/index.ts";
import {WALL_SEGMENT_BUILDINGS} from "../../data/wallSegments/index.ts";
import {WALL_TOWER_BUILDINGS} from "../../data/wallSuperstructures/index.ts";
import {getHomogeneousValueDefinition} from "../../data/homogeneousValues/index.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import * as s from "./ProgressionPage.css.ts";

const NODE_DIMENSIONS: Record<ProgressionNodeKind, {width: number; height: number}> = {
  research: {width: 190, height: 104},
  building: {width: 118, height: 118},
  towerPart: {width: 118, height: 118},
  structure: {width: 206, height: 82},
};
const MIN_ZOOM_FALLBACK = -0.9;
const MAX_ZOOM_FACTOR = 10;
const WHEEL_ZOOM_SENSITIVITY = 0.00056;
const MIN_CANVAS_SIZE = 8000;
const CANVAS_VIEWPORT_PADDING = 2;
const GRAPH_PADDING = 96;
const NODE_KIND_LABELS: Record<ProgressionNodeKind, string> = {
  research: "Technology",
  building: "Building",
  towerPart: "Tower Part",
  structure: "Superstructure",
};

const VECTOR_COLORS: Record<DevelopmentVectorKey, string> = {
  neutral: "#8f8778",
  tech: "#3f7fd9",
  nature: "#419a5a",
  medieval: "#b98135",
  aether: "#7c6ff0",
};

const KIND_ICONS: Record<ProgressionNodeKind, string> = {
  research: "T",
  building: "B",
  towerPart: "P",
  structure: "S",
};

type ProgressionCanvasNode = {
  id: string;
  width: number;
  height: number;
  data: ProgressionGraphNode;
};

type ProgressionCanvasEdge = {
  id: string;
  from: string;
  to: string;
  data: ProgressionEdge;
};

function getFitMinZoom(layout: ElkRoot | null, viewport: { width: number; height: number }): number {
  if (!layout?.width || !layout.height || !viewport.width || !viewport.height) return MIN_ZOOM_FALLBACK;

  const fitScale = Math.min(viewport.width / layout.width, viewport.height / layout.height, 1);
  return fitScale - 1;
}

function clampZoom(zoom: number, minZoomFactor: number): number {
  return Math.min(MAX_ZOOM_FACTOR + 1, Math.max(minZoomFactor + 1, zoom));
}

function getGraphElement(svgElement: SVGSVGElement): SVGGElement | null {
  return Array.from(svgElement.children).find((element): element is SVGGElement => (
    element instanceof SVGGElement
  )) ?? null;
}

function getLocalSvgPoint(
  svgElement: SVGSVGElement,
  graphMatrix: DOMMatrix,
  clientX: number,
  clientY: number,
): DOMPoint | null {
  try {
    const point = svgElement.createSVGPoint();
    point.x = clientX;
    point.y = clientY;

    return point.matrixTransform(graphMatrix.inverse());
  } catch {
    return null;
  }
}

export default function ProgressionPage() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<CanvasRef>(null);
  const zoomAnchorSequenceRef = useRef(0);
  const [search, setSearch] = useState("");
  const [layout, setLayout] = useState<ElkRoot | null>(null);
  const [viewport, setViewport] = useState({width: 0, height: 0});
  const [zoom, setZoom] = useState(1);
  const [enabledKinds, setEnabledKinds] = useState<Record<ProgressionNodeKind, boolean>>({
    research: true,
    building: true,
    towerPart: true,
    structure: true,
  });
  const [selectedNodeId, setSelectedNodeId] = useState(PROGRESSION_GRAPH.nodes[0]?.id ?? "");

  const filteredNodeKeys = useMemo(() => {
    const query = search.trim().toLowerCase();

    return new Set(PROGRESSION_GRAPH.nodes
      .filter(node => enabledKinds[node.kind])
      .filter(node => {
        if (!query) return true;
        return node.id.toLowerCase().includes(query) || node.name.toLowerCase().includes(query);
      })
      .map(getGraphNodeKey));
  }, [enabledKinds, search]);

  const nodes: ProgressionCanvasNode[] = useMemo(() => (
    PROGRESSION_GRAPH.nodes
      .filter(node => filteredNodeKeys.has(getGraphNodeKey(node)))
      .map(node => ({
        id: getGraphNodeKey(node),
        ...NODE_DIMENSIONS[node.kind],
        data: node,
      }))
  ), [filteredNodeKeys]);

  const edges: ProgressionCanvasEdge[] = useMemo(() => (
    PROGRESSION_GRAPH.edges
      .filter(edge => filteredNodeKeys.has(getGraphNodeKey(edge.from)))
      .filter(edge => filteredNodeKeys.has(getGraphNodeKey(edge.to)))
      .map(edge => ({
        id: edge.id,
        from: getGraphNodeKey(edge.from),
        to: getGraphNodeKey(edge.to),
        data: edge,
      }))
  ), [filteredNodeKeys]);

  const selectedNode = PROGRESSION_GRAPH.nodes.find(node => node.id === selectedNodeId)
    ?? PROGRESSION_GRAPH.nodes[0];
  const selectedKey = selectedNode ? getGraphNodeKey(selectedNode) : "";
  const incoming = PROGRESSION_GRAPH.edges.filter(edge => getGraphNodeKey(edge.to) === selectedKey);
  const outgoing = PROGRESSION_GRAPH.edges.filter(edge => getGraphNodeKey(edge.from) === selectedKey);

  const layoutOptions = useMemo(() => ({
    "elk.algorithm": "layered",
    "elk.direction": "RIGHT" as CanvasDirection,
    "elk.spacing.nodeNode": "42",
    "elk.layered.spacing.nodeNodeBetweenLayers": "96",
    "elk.edgeRouting": "ORTHOGONAL",
  }), []);

  const minZoom = getFitMinZoom(layout, viewport);
  const canvasWidth = Math.max(
    MIN_CANVAS_SIZE,
    Math.ceil((layout?.width ?? 0) * (MAX_ZOOM_FACTOR + 1) + viewport.width * CANVAS_VIEWPORT_PADDING),
  );
  const canvasHeight = Math.max(
    MIN_CANVAS_SIZE,
    Math.ceil((layout?.height ?? 0) * (MAX_ZOOM_FACTOR + 1) + viewport.height * CANVAS_VIEWPORT_PADDING),
  );

  const zoomAtPoint = useCallback((event: globalThis.WheelEvent) => {
    if (!layout) return;

    const viewportElement = viewportRef.current;
    const canvas = canvasRef.current;
    const scrollElement = canvas?.containerRef?.current;
    const svgElement = canvas?.svgRef?.current;
    const graphElement = svgElement ? getGraphElement(svgElement) : null;
    const graphMatrix = graphElement?.getScreenCTM();
    if (!viewportElement || !canvas || !scrollElement || !svgElement || !graphElement || !graphMatrix) return;

    const deltaUnit = event.deltaMode === 1
      ? 16
      : event.deltaMode === 2
        ? viewport.height
        : 1;
    const wheelDelta = event.deltaY * deltaUnit;
    const currentZoom = canvas.zoom ?? zoom;
    const nextZoom = clampZoom(
      currentZoom * Math.exp(-wheelDelta * WHEEL_ZOOM_SENSITIVITY),
      minZoom,
    );

    if (nextZoom === currentZoom) return;

    const graphPoint = getLocalSvgPoint(svgElement, graphMatrix, event.clientX, event.clientY);
    if (!graphPoint) return;

    const anchorSequence = zoomAnchorSequenceRef.current + 1;
    zoomAnchorSequenceRef.current = anchorSequence;

    setZoom(nextZoom);
    canvas.setZoom?.(nextZoom - 1);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (zoomAnchorSequenceRef.current !== anchorSequence) return;

        const latestCanvas = canvasRef.current;
        const latestScrollElement = latestCanvas?.containerRef?.current;
        const latestSvgElement = latestCanvas?.svgRef?.current;
        const latestGraphElement = latestSvgElement ? getGraphElement(latestSvgElement) : null;
        const latestMatrix = latestGraphElement?.getScreenCTM();
        if (!latestCanvas || !latestScrollElement || !latestMatrix) return;

        const movedPoint = graphPoint.matrixTransform(latestMatrix);
        const nextScrollLeft = latestScrollElement.scrollLeft + movedPoint.x - event.clientX;
        const nextScrollTop = latestScrollElement.scrollTop + movedPoint.y - event.clientY;
        const maxScrollLeft = Math.max(0, canvasWidth - latestScrollElement.clientWidth);
        const maxScrollTop = Math.max(0, canvasHeight - latestScrollElement.clientHeight);
        const nextScroll: [number, number] = [
          Math.min(maxScrollLeft, Math.max(0, nextScrollLeft)),
          Math.min(maxScrollTop, Math.max(0, nextScrollTop)),
        ];

        latestCanvas.setScrollXY?.(nextScroll, false);
      });
    });
  }, [canvasHeight, canvasWidth, layout, minZoom, viewport.height, zoom]);

  const handleZoomChange = useCallback((nextZoom: number) => {
    setZoom(clampZoom(nextZoom, minZoom));
  }, [minZoom]);

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
    const nextZoom = clampZoom(canvasRef.current?.zoom ?? zoom, minZoom);
    setZoom(nextZoom);
    canvasRef.current?.setZoom?.(nextZoom - 1);
  }, [minZoom, zoom]);

  useEffect(() => {
    const viewportElement = viewportRef.current;
    if (!viewportElement) return;

    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      zoomAtPoint(event);
    };

    viewportElement.addEventListener("wheel", handleNativeWheel, {passive: false, capture: true});

    return () => viewportElement.removeEventListener("wheel", handleNativeWheel, {capture: true});
  }, [zoomAtPoint]);

  return (
    <section className={s.page}>
      <aside className={s.panel}>
        <h1 className={s.heading}>Progression Graph</h1>
        <label className={s.field}>
          <span className={s.label}>Search</span>
          <input
            className={s.input}
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Node name or id"
          />
        </label>
        <div className={s.field}>
          <span className={s.label}>Node Types</span>
          <div className={s.checkList}>
            {(Object.keys(NODE_KIND_LABELS) as ProgressionNodeKind[]).map(kind => (
              <label className={s.checkItem} key={kind}>
                <input
                  type="checkbox"
                  checked={enabledKinds[kind]}
                  onChange={event => {
                    setEnabledKinds(current => ({
                      ...current,
                      [kind]: event.target.checked,
                    }));
                  }}
                />
                {NODE_KIND_LABELS[kind]}
              </label>
            ))}
          </div>
        </div>
        {PROGRESSION_VALIDATION_ERRORS.length ? (
          <div className={s.warning}>
            <strong>Validation</strong>
            <ul className={s.list}>
              {PROGRESSION_VALIDATION_ERRORS.map(error => <li key={error}>{error}</li>)}
            </ul>
          </div>
        ) : (
          <p className={s.muted}>No progression validation errors.</p>
        )}
      </aside>
      <div ref={viewportRef} className={s.canvas}>
        <Canvas
          ref={canvasRef}
          nodes={nodes}
          edges={edges}
          panType="drag"
          fit
          animated={false}
          layoutOptions={{
            ...layoutOptions,
            "elk.padding": `[top=${GRAPH_PADDING},left=${GRAPH_PADDING},bottom=${GRAPH_PADDING},right=${GRAPH_PADDING}]`,
          }}
          maxZoom={MAX_ZOOM_FACTOR}
          maxWidth={canvasWidth}
          maxHeight={canvasHeight}
          minZoom={minZoom}
          zoom={zoom}
          zoomable={false}
          defaultPosition={CanvasPosition.CENTER}
          onLayoutChange={setLayout}
          onZoomChange={handleZoomChange}
          node={(props: NodeProps<ProgressionCanvasNode["data"]>) => {
            const node = props.properties?.data;
            if (!node) return <g />;

            const isSelected = node.id === selectedNode?.id && node.kind === selectedNode.kind;
            const color = getNodeColor(node);
            const requirements = getRequirementLines(node);
            const {width, height} = NODE_DIMENSIONS[node.kind];

            return (
              <g
                transform={`translate(${props.x}, ${props.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                style={{cursor: "pointer"}}
              >
                <NodeShape kind={node.kind} width={width} height={height} color={color} isSelected={isSelected} />
                <circle cx={18} cy={18} r={11} fill={color} />
                <text x={18} y={22} fontSize={10} fontWeight={800} fill="white" textAnchor="middle">
                  {KIND_ICONS[node.kind]}
                </text>
                <text x={34} y={19} fontSize={11} fontWeight={700} fill="#4b5563">
                  {NODE_KIND_LABELS[node.kind]}
                </text>
                <text
                  x={width / 2}
                  y={node.kind === "structure" ? 48 : 51}
                  fontSize={13}
                  fontWeight={800}
                  fill="#111827"
                  textAnchor="middle"
                >
                  {truncateLabel(node.name, node.kind === "structure" ? 23 : 16)}
                </text>
                {requirements.slice(0, 2).map((requirement, index) => (
                  <text
                    key={requirement}
                    x={width / 2}
                    y={(node.kind === "structure" ? 67 : 72) + index * 15}
                    fontSize={10}
                    fontWeight={700}
                    fill="#374151"
                    textAnchor="middle"
                  >
                    {truncateLabel(requirement, node.kind === "structure" ? 29 : 18)}
                  </text>
                ))}
              </g>
            );
          }}
          edge={(props: EdgeProps) => {
            const edge = props.properties?.data as ProgressionEdge | undefined;
            const strokeWidth = edge?.kind === "structure" ? 3 : 2;
            return <Edge {...props} style={{strokeWidth}} />;
          }}
        />
      </div>
      <aside className={s.detailsPanel}>
        <h2 className={s.heading}>{selectedNode?.name ?? "No node"}</h2>
        {selectedNode ? (
          <>
            <p className={s.muted}>{NODE_KIND_LABELS[selectedNode.kind]} - {selectedNode.id}</p>
            <RequirementList node={selectedNode} />
            <DetailList title="Requires" edges={incoming} emptyText="No graph requirements." />
            <DetailList title="Unlocks / Enables" edges={outgoing} emptyText="No outgoing unlocks." useTarget />
          </>
        ) : null}
      </aside>
    </section>
  );
}

function DetailList({
  title,
  edges,
  emptyText,
  useTarget = false,
}: {
  title: string;
  edges: ProgressionEdge[];
  emptyText: string;
  useTarget?: boolean;
}) {
  return (
    <div className={s.field}>
      <span className={s.label}>{title}</span>
      {edges.length ? (
        <ul className={s.list}>
          {edges.map(edge => {
            const ref = useTarget ? edge.to : edge.from;
            const node = PROGRESSION_GRAPH.nodes.find(candidate => (
              candidate.kind === ref.kind && candidate.id === ref.id
            ));

            return (
              <li key={edge.id}>
                {node?.name ?? ref.id} <span className={s.muted}>({edge.kind})</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={s.muted}>{emptyText}</p>
      )}
    </div>
  );
}

function NodeShape({
  kind,
  width,
  height,
  color,
  isSelected,
}: {
  kind: ProgressionNodeKind;
  width: number;
  height: number;
  color: string;
  isSelected: boolean;
}) {
  const stroke = isSelected ? "#111827" : color;
  const strokeWidth = isSelected ? 3 : 2;

  if (kind === "research") {
    return (
      <rect
        width={width}
        height={height}
        rx={28}
        ry={28}
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (kind === "towerPart") {
    return (
      <circle
        cx={width / 2}
        cy={height / 2}
        r={Math.min(width, height) / 2 - 5}
        fill="white"
        stroke={stroke}
        strokeWidth={strokeWidth}
      />
    );
  }

  return (
    <rect
      width={width}
      height={height}
      rx={kind === "building" ? 0 : 6}
      ry={kind === "building" ? 0 : 6}
      fill="white"
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}

function RequirementList({node}: {node: ProgressionGraphNode}) {
  const requirements = getRequirementLines(node);

  if (!requirements.length) return null;

  return (
    <div className={s.field}>
      <span className={s.label}>Unlock Requirements</span>
      <ul className={s.list}>
        {requirements.map(requirement => <li key={requirement}>{requirement}</li>)}
      </ul>
    </div>
  );
}

function getGraphNodeKey(node: {kind: ProgressionNodeKind; id: string}) {
  return `${node.kind}:${node.id}`;
}

function getNodeColor(node: ProgressionGraphNode) {
  return node.vector ? VECTOR_COLORS[node.vector] : "#6b7280";
}

function getRequirementLines(node: ProgressionGraphNode): string[] {
  return (findContentRequirements(node) ?? []).map(formatRequirement);
}

function findContentRequirements(node: ProgressionGraphNode): readonly Requirement[] | undefined {
  if (node.kind === "towerPart") return TOWER_PARTS_BY_ID[node.id]?.requirements;
  if (node.kind === "building") {
    const building = Object.values(DEVELOPMENT_VECTORS)
      .map(vector => BUILDINGS_ATLAS[vector][node.id])
      .find(Boolean);

    return building?.requirements
      ?? WALL_SEGMENT_BUILDINGS[node.id]?.requirements
      ?? WALL_TOWER_BUILDINGS[node.id]?.requirements;
  }

  if (node.kind === "research") return researchTree[node.id]?.requirements;
  if (node.kind === "structure") return WALL_TOWER_BUILDINGS[node.id]?.requirements;

  return undefined;
}

function formatRequirement(requirement: Requirement): string {
  if (requirement.type === "buildingKeywordExists") {
    return `Building keyword exists: ${requirement.keyword}`;
  }

  if (requirement.type === "buildingExists") {
    return `Building exists: ${requirement.buildingId}`;
  }

  if (requirement.type === "technologyUnlocked") {
    return `Technology unlocked: ${requirement.technologyId}`;
  }

  if (requirement.type === "globalFlagExists") {
    return `Flag exists: ${requirement.flagId}`;
  }

  if (requirement.type === "globalFlagMissing") {
    return `Flag missing: ${requirement.flagId}`;
  }

  if (requirement.type === "homogeneousValueAtLeast") {
    const definition = getHomogeneousValueDefinition(requirement.valueId);
    return `${definition.label} at least ${requirement.amount}`;
  }

  const definition = getHomogeneousValueDefinition(requirement.valueId);
  return `${definition.label} less than ${requirement.amount}`;
}

function truncateLabel(label: string, maxLength: number) {
  if (label.length <= maxLength) return label;
  return `${label.slice(0, Math.max(0, maxLength - 3))}...`;
}
