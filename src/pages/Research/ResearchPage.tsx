import React, { useMemo, useState, useCallback } from 'react';
import { Canvas, type NodeProps, type EdgeProps, Edge } from 'reaflow';
import type { ResearchNodeData } from "../../models/research/ResearchNode.ts";
import {palettes} from '../../theme/theme.css.ts';

/** =========================
 *  Data model (normalized)
 *  ========================= */
export type Db = Record<string, ResearchNodeData>;
type FlatNode = { id: string; width: number; height: number; properties: { kind: 'normal' | 'stub'; data: ResearchNodeData | StubData } };
type FlatEdge = { id: string; from: string; to: string; properties?: { kind?: 'normal' | 'preview' | 'stub' } };

type StubData = {
  id: string;               // e.g. stub:missingId->targetId
  missingOf: string;        // the missing prerequisite id
  target: string;           // the child id
  progressText: string;     // "1/3" etc.
  vector?: ResearchNodeData['vector'];
};

/** =========================
 *  Theme & sizes
 *  ========================= */
const VECTOR_COLORS = {
  tech:    { bg: palettes.tech.bg, rim: '#4a6fa5', text: '#e6e9ef' },
  nature:  { bg: '#101512', rim: '#4caf50', text: '#e8f5e9' },
  medieval:{ bg: '#18110c', rim: '#4b2e20', text: '#f1e7d0' },
  aether:  { bg: '#0e131b', rim: '#58c7c7', text: '#e9f6ff' },
  default: { bg: '#151922', rim: '#8a93a6', text: '#e6e9ef' },
} as const;
type Theme = (typeof VECTOR_COLORS)['default'];
const themeFor = (v?: string): Theme => ((v && (VECTOR_COLORS as any)[v]) || VECTOR_COLORS.default) as Theme;

const NODE_W = 220;
const NODE_H = 120;

/** =========================
 *  Helpers
 *  ========================= */
const prereqsOf = (n: ResearchNodeData) => {
  const list: string[] = [];
  if (n.parentId) list.push(n.parentId);
  if (n.alsoRequires?.length) list.push(...n.alsoRequires);
  return list;
};

const isUnlocked = (n: ResearchNodeData, purchased: Set<string>) =>
  prereqsOf(n).every(id => purchased.has(id));

const anyMet = (n: ResearchNodeData, purchased: Set<string>) =>
  prereqsOf(n).some(id => purchased.has(id));

/** =========================
 *  Sample DB (replace with your data)
 *  ========================= */
const rootNode: ResearchNodeData = {
  id: 'root',
  parentId: null,
  name: 'Curiosity',
  vector: 'default',
  summary: 'First you need to ask. What if? Then stuff starts exploding.'
};

const SAMPLE_DB: Db = {
  'root': rootNode,
  'aether': { id: 'aether', parentId: 'root', name: 'Aether Core', vector: 'aether', summary: 'Unlock the flow of arcane energy.' },
  'tech':   { id: 'tech',   parentId: 'root', name: 'Tech Branch', vector: 'tech',   summary: 'Start of technology.' },

  'copper-tools':   { id: 'copper-tools',   parentId: 'tech', name: 'Copper Tools',   vector: 'tech', summary: 'Basic tools.', unlocks: ['Pickaxe','Axe','Hammer'], costs:[{type:'Copper',amount:20}] },
  'basic-circuits': { id: 'basic-circuits', parentId: 'tech', name: 'Basic Circuits', vector: 'tech', summary: 'Tiny brains.',  costs:[{type:'Copper',amount:15},{type:'Resin',amount:5}] },
  'automation-i':   { id: 'automation-i',   parentId: 'tech', name: 'Automation I',   vector: 'tech', summary: 'First tier automation.', alsoRequires: ['copper-tools','basic-circuits'] },

  'nature':      { id: 'nature', parentId: 'root', name: 'Nature Branch', vector: 'nature', summary: 'Growth & food.' },
  'seed-cult':   { id: 'seed-cult', parentId: 'nature', name: 'Seed Cultivation', vector: 'nature', summary: 'Unlock farms.', costs:[{type:'Seeds',amount:30}] },
    'selection':   { id: 'selection', parentId: 'seed-cult', name: 'Selection', vector: 'nature', summary: 'Unlock bio research', costs:[{type:'Seeds',amount:30}] },
  'herbal-lore': { id: 'herbal-lore', parentId: 'nature', name: 'Herbal Lore', vector: 'nature', summary: 'Simple elixirs.', unlocks:['Healing Draught'] },

  'medieval':        { id: 'medieval', parentId: 'root', name: 'Medieval', vector: 'medieval', summary: 'Steel, guilds, taxes.' },
  'guild-charter':   { id: 'guild-charter', parentId: 'medieval', name: 'Guild Charter', vector:'medieval', summary:'Trade & crafting bonuses.', costs:[{type:'Parchment',amount:3}] },
  'fortifications':  { id: 'fortifications', parentId: 'medieval', name: 'Fortifications', vector:'medieval', summary:'City walls & towers.', costs:[{type:'Stone',amount:50},{type:'Timber',amount:30}] },
    'livingWood':  { id: 'livingWood', parentId: 'fortifications', name: 'Living Wood', vector:'medieval', summary:'City walls & towers.', costs:[{type:'Stone',amount:50},{type:'Timber',amount:30}], alsoRequires: ['selection'] },
};

/** =========================
 *  Graph builders
 *  ========================= */

function computePreviewFrontierWithStubs(db: Db, purchased: Set<string>) {
  const nodes: FlatNode[] = [];
  const edges: FlatEdge[] = [];

  const byId = db;
  const allIds = Object.keys(byId);

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
  const visibleIds = new Set<string>(['root', ...purchased, ...unlockedIds, ...previewIds]);

  // create nodes
  for (const id of visibleIds) {
    const n = byId[id];
    if (!n) continue;
    nodes.push({
      id,
      width: NODE_W,
      height: NODE_H,
      properties: { kind: 'normal', data: n }
    });
  }

  // edges between visible real nodes
  function addEdge(from: string, to: string) {
    const target = byId[to];
    const kind: 'normal' | 'preview' = unlockedIds.has(to) || purchased.has(to) ? 'normal' : 'preview';
    edges.push({ id: `${from}->${to}`, from, to, kind});
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
      const stub: StubData = { id: stubId, missingOf: miss, target: id, progressText, vector: n.vector };
      nodes.push({
        id: stubId,
        width: 12,
        height: 12,
        properties: { kind: 'stub', data: stub as any }
      });
      edges.push({
        id: `${stubId}=>${id}`,
        from: stubId,
        to: id,
        kind: 'stub'
      });
    }
  }

  return { nodes, edges };
}

/** =========================
 *  Node renderers
 *  ========================= */

function NodeCard({ data }: { data: ResearchNodeData }) {
  const theme = themeFor(data.vector);
  return (
    <g>
      <rect
        x={-NODE_W / 2} y={-NODE_H / 2}
        rx={14} ry={14}
        width={NODE_W} height={NODE_H}
        fill={theme.bg} stroke={theme.rim} strokeWidth={2.5}
      />
      <circle cx={0} cy={-NODE_H / 2} r={5.5} fill={theme.rim} />
      <text
        x={0} y={-NODE_H / 2 + 18}
        textAnchor="middle"
        fontSize={14} fontWeight={700} fill={theme.text}
        style={{ pointerEvents: 'none' }}
      >
        {data.name}
      </text>
      <foreignObject
        x={-NODE_W / 2 + 8} y={-NODE_H / 2 + 32}
        width={NODE_W - 16} height={NODE_H - 40}
        requiredExtensions="http://www.w3.org/1999/xhtml"
        style={{ overflow: 'hidden' }}
      >
        <div xmlns="http://www.w3.org/1999/xhtml"
             style={{ color: theme.text, fontSize: 12, lineHeight: 1.25, fontFamily: 'system-ui, Segoe UI, Roboto, sans-serif' }}>
          {data.summary && <p style={{ margin: 0 }}>{data.summary}</p>}
          {data.unlocks?.length ? (
            <div style={{ marginTop: 6 }}>
              <div style={{ opacity: 0.8, fontWeight: 600, color: theme.rim }}>Unlocks</div>
              <ul style={{ margin: 2, paddingLeft: 16 }}>
                {data.unlocks.map((u, i) => <li key={i}>{u}</li>)}
              </ul>
            </div>
          ) : null}
          {data.costs?.length ? (
            <div style={{ marginTop: 6 }}>
              <div style={{ opacity: 0.8, fontWeight: 600, color: theme.rim }}>Cost</div>
              <ul style={{ margin: 2, paddingLeft: 16 }}>
                {data.costs.map((c, i) => <li key={i}>{c.amount}× {c.type}</li>)}
              </ul>
            </div>
          ) : null}
          {data.notes ? <p style={{ marginTop: 6, opacity: 0.9 }}>{data.notes}</p> : null}
        </div>
      </foreignObject>
    </g>
  );
}

function StubNode({ data }: { data: StubData }) {
  // color by target vector so it blends with the lane/theme
  const theme = themeFor(data.vector);
  return (
    <g>
      <circle r={6} fill={theme.rim} opacity={0.85} />
      <text x={8} y={4} fontSize={10} fill={theme.text} opacity={0.85}>{data.progressText}</text>
      <title>Missing prerequisite: {data.missingOf} (progress {data.progressText})</title>
    </g>
  );
}

/** =========================
 *  Main component (Reaflow + ELK layered)
 *  ========================= */
export default function ResearchPage({
  db = SAMPLE_DB,
  purchasedIds = ['root', 'aether'],
}: {
  db?: Db;
  purchasedIds?: string[];
}) {
    const [purchasedTechsIds, setPurchasedTechsIds] = useState<string[]>(['root', 'aether']);
  const purchased = useMemo(() => new Set(purchasedTechsIds), [purchasedTechsIds]);

  const { nodes, edges } = useMemo(
    () => computePreviewFrontierWithStubs(db, purchased),
    [db, purchased]
  );

  const layoutOptions = useMemo(() => ({
    'elk.algorithm': 'layered',
    'elk.direction': "DOWN",                            // top -> down
    'elk.spacing.nodeNode': 36,
    'elk.layered.spacing.nodeNodeBetweenLayers': 80,
    'elk.edgeRouting': 'ORTHOGONAL',                   // or 'POLYLINE'
    'elk.layered.cycleBreaking.strategy': 'GREEDY',
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
  }), []);

  const [zoom, setZoom] = useState(1);

  return (
      <Canvas
          nodes={nodes}
          edges={edges}
          layoutOptions={layoutOptions}
          panType="drag"
          maxZoom={10}
          minZoom={-0.9}
          zoom={zoom}
          onZoomChange={z => setZoom(z)}
          draggable={false}
          selectable={false}
          node={(props: NodeProps<FlatNode>) => {
              const payload = props.properties?.properties;
              if (!payload) return null;
              if (payload.kind === 'stub') {
                  const data = payload.data as StubData;
                  return (
                      <g transform={`translate(${props.x}, ${props.y})`}>
                          <StubNode data={data} />
                      </g>
                  );
              } else {
                  const data = payload.data as ResearchNodeData;
                  return (
                      <g transform={`translate(${props.x + NODE_W/2}, ${props.y + NODE_H/2})`} onClick={() => {setPurchasedTechsIds([...purchasedTechsIds, data.id])}}>
                          <NodeCard data={data} />
                      </g>
                  );
              }
          }}
          edge={(p: EdgeProps<FlatEdge>) => {
              const kind = p.properties?.properties?.kind;
              const dashed = kind === 'preview' || kind === 'stub';
              return <Edge {...p} style={dashed ? { strokeDasharray: '6 6', opacity: 0.9 } : undefined} />;
          }}
          fit
      />
  );
}