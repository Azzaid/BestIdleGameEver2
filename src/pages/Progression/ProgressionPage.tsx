import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Canvas, CanvasPosition, Edge, type CanvasDirection, type EdgeProps, type ElkRoot, type NodeProps} from "reaflow";
import {
  PROGRESSION_GRAPH,
  PROGRESSION_VALIDATION_ERRORS,
} from "../../data/content/catalog.ts";
import type {ProgressionEdge, ProgressionGraphNode, ProgressionNodeKind} from "../../data/content/types.ts";
import * as s from "./ProgressionPage.css.ts";

const NODE_WIDTH = 180;
const NODE_HEIGHT = 72;
const MIN_ZOOM_FALLBACK = -0.9;
const MAX_ZOOM_FACTOR = 10;
const WHEEL_ZOOM_SENSITIVITY = 0.00045;
const MIN_CANVAS_SIZE = 8000;
const CANVAS_VIEWPORT_PADDING = 2;
const GRAPH_PADDING = 96;
const NODE_KIND_LABELS: Record<ProgressionNodeKind, string> = {
  research: "Research",
  building: "Building",
  towerPart: "Tower Part",
  structure: "Structure",
};

const NODE_KIND_COLORS: Record<ProgressionNodeKind, string> = {
  research: "#4f78c4",
  building: "#4f9f6b",
  towerPart: "#a56dc2",
  structure: "#b7833c",
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

export default function ProgressionPage() {
  const viewportRef = useRef<HTMLDivElement>(null);
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
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
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
    Math.ceil((layout?.width ?? 0) * Math.max(zoom, 1) + viewport.width * CANVAS_VIEWPORT_PADDING),
  );
  const canvasHeight = Math.max(
    MIN_CANVAS_SIZE,
    Math.ceil((layout?.height ?? 0) * Math.max(zoom, 1) + viewport.height * CANVAS_VIEWPORT_PADDING),
  );

  const zoomByWheel = useCallback((deltaY: number, deltaMode: number) => {
    const deltaUnit = deltaMode === 1
      ? 16
      : deltaMode === 2
        ? viewport.height
        : 1;
    const zoomDelta = deltaY * deltaUnit * WHEEL_ZOOM_SENSITIVITY;

    setZoom(currentZoom => clampZoom(currentZoom - zoomDelta, minZoom));
  }, [minZoom, viewport.height]);

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
    setZoom(currentZoom => clampZoom(currentZoom, minZoom));
  }, [minZoom]);

  useEffect(() => {
    const viewportElement = viewportRef.current;
    if (!viewportElement) return;

    const handleNativeWheel = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      zoomByWheel(event.deltaY, event.deltaMode);
    };

    viewportElement.addEventListener("wheel", handleNativeWheel, {passive: false});

    return () => viewportElement.removeEventListener("wheel", handleNativeWheel);
  }, [zoomByWheel]);

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
            const color = NODE_KIND_COLORS[node.kind];

            return (
              <g
                transform={`translate(${props.x}, ${props.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                style={{cursor: "pointer"}}
              >
                <rect
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={6}
                  ry={6}
                  fill="white"
                  stroke={isSelected ? "#111827" : color}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <rect width={6} height={NODE_HEIGHT} rx={3} ry={3} fill={color} />
                <text x={16} y={24} fontSize={12} fill="#4b5563">
                  {NODE_KIND_LABELS[node.kind]}
                </text>
                <text x={16} y={47} fontSize={14} fontWeight={700} fill="#111827">
                  {node.name}
                </text>
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
            <p className={s.muted}>{NODE_KIND_LABELS[selectedNode.kind]} · {selectedNode.id}</p>
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

function getGraphNodeKey(node: {kind: ProgressionNodeKind; id: string}) {
  return `${node.kind}:${node.id}`;
}
