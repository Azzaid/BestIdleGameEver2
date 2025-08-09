import React, { useMemo, useState, useCallback } from 'react';
import { Canvas, type NodeProps } from 'reaflow';
import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import { vars } from '../../theme/theme.css.ts'

/** =========================
 *  Data model (normalized)
 *  ========================= */
export type Db = Record<string, ResearchNodeData>;
type FlatNode = { id: string; width: number; height: number; properties: ResearchNodeData };
type FlatEdge = { id: string; from: string; to: string };

/** =========================
 *  Theme & sizes
 *  ========================= */
const VECTOR_COLORS = {
  tech:    { bg: vars.color.background, rim: '#4a6fa5', text: '#e6e9ef' },
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
 *  Sample DB (replace with your data)
 *  Demonstrates multi-parent: 'automation-i' requires both 'copper-tools' and 'basic-circuits'
 *  ========================= */
const rootNode: ResearchNodeData = {
    id: 'root',
    parentId: null,
    name: 'Curiosity',
    vector: 'default',
    summary: 'First you need  to ask. What if? Then stuff start exploding',
};

const SAMPLE_DB: Db = {
    'root':          rootNode,

    'aether':          { id: 'aether',          parentId: 'root',          name: 'Aether Core',  vector: 'aether',  summary: 'Unlock the flow of arcane energy.' },
    'tech':          { id: 'tech',          parentId: 'root',        name: 'Tech Branch',  vector: 'tech',    summary: 'Start of technology.' },

    'copper-tools':  { id: 'copper-tools',  parentId: 'tech',        name: 'Copper Tools', vector: 'tech',    summary: 'Basic tools.', unlocks: ['Pickaxe','Axe','Hammer'], costs:[{type:'Copper',amount:20}] },
    'basic-circuits':{ id: 'basic-circuits',parentId: 'tech',        name: 'Basic Circuits',vector:'tech',    summary:'Tiny brains.', costs:[{type:'Copper',amount:15},{type:'Resin',amount:5}] },
    'automation-i':  { id: 'automation-i',  parentId: 'tech',        name: 'Automation I', vector: 'tech',    summary:'First tier automation.', alsoRequires: ['copper-tools','basic-circuits'] },

    'nature':        { id: 'nature',        parentId: 'root',        name: 'Nature Branch',vector: 'nature',  summary: 'Growth & food.' },

    'seed-cult':     { id: 'seed-cult',     parentId: 'nature',      name: 'Seed Cultivation', vector: 'nature', summary: 'Unlock farms.' , costs:[{type:'Seeds',amount:30}] },
    'herbal-lore':   { id: 'herbal-lore',   parentId: 'nature',      name: 'Herbal Lore', vector: 'nature', summary: 'Simple elixirs.', unlocks:['Healing Draught'] },

    'medieval':           { id: 'medieval',           parentId: 'root',        name: 'Medieval',     vector: 'medieval',summary: 'Steel, guilds, taxes.' },

    'guild-charter': { id: 'guild-charter',  parentId: 'medieval',         name: 'Guild Charter', vector:'medieval', summary:'Trade & crafting bonuses.', costs:[{type:'Parchment',amount:3}] },
    'fortifications':{ id: 'fortifications', parentId: 'medieval',         name: 'Fortifications', vector:'medieval', summary:'City walls & towers.', costs:[{type:'Stone',amount:50},{type:'Timber',amount:30}] },
};



function childrenOf(db: Db): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const n of Object.values(db)) {
    const p = n.parentId ?? '__ROOT__';
    (map[p] ||= []).push(n.id);
  }
  return map;
}

function visibleSubgraph(db: Db, expanded: Set<string>) {
  const nodes: FlatNode[] = [];
  const edges: FlatEdge[] = [];

  const kids = childrenOf(db);

  const visibleSet = new Set<string>();

  function dfs(id: string) {
    visibleSet.add(id);
    const isExpanded = expanded.has(id);
    if (!isExpanded) return;
    for (const cid of (kids[id] || [])) {
      edges.push({ id: `${id}->${cid}`, from: id, to: cid });
      dfs(cid);
    }
  }
  dfs('root');

  // Build nodes array
  for (const vid of visibleSet) {
    const n = db[vid];
    nodes.push({ id: vid, width: NODE_W, height: NODE_H, properties: n });
  }

  // Add extra prereq edges if both ends are visible
  for (const vid of visibleSet) {
    const target = db[vid];
    for (const src of target.alsoRequires || []) {
      if (visibleSet.has(src)) {
        edges.push({ id: `${src}=>${target.id}`, from: src, to: target.id });
      }
    }
  }

  return { nodes, edges };
}

/** =========================
 *  Node card (uniform, schema-driven)
 *  ========================= */
function NodeCard({ data }: { data: ResearchNodeData }) {
    const theme = themeFor(data.vector);
    return (
        <g>
            <rect
                x={-NODE_W / 2} y={-NODE_H / 2}   // <— add these to center the rect
                rx={14} ry={14}
                width={NODE_W} height={NODE_H}
                fill={theme.bg} stroke={theme.rim} strokeWidth={2.5}
            />

            {/* top-center pin */}
            <circle cx={0} cy={-NODE_H / 2} r={5.5} fill={theme.rim} />

            {/* centered title */}
            <text
                x={0} y={-NODE_H / 2 + 18}        // <— position relative to centered origin
                textAnchor="middle"
                fontSize={14} fontWeight={700} fill={theme.text}
                style={{ pointerEvents: 'none' }}
            >
                {data.name}
            </text>

            {/* body */}
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

/** =========================
 *  Main component (Reaflow + ELK layered)
 *  ========================= */
export default function ResearchPage({
  db = SAMPLE_DB,
  initialExpandedDepth = 1,   // expand nodes up to this depth from root
}: {
  db?: Db;
  initialExpandedDepth?: number;
}) {
  // track which nodes are expanded (visible descendants)
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    // expand nodes up to initial depth
    const set = new Set<string>();
    const root = rootNode;
    const kids = childrenOf(db);
    (function dfs(id: string, d: number) {
      if (d < initialExpandedDepth) set.add(id);
      for (const cid of (kids[id] || [])) dfs(cid, d + 1);
    })(root, 0);
    return set;
  });

  const [zoom, setZoom] = useState(1);

  const { nodes, edges } = useMemo(() => visibleSubgraph(db, expanded), [db, expanded]);

  const layoutOptions = useMemo(() => ({
    'elk.algorithm': 'layered',
    'elk.direction': "DOWN",                            // top -> down
    'elk.spacing.nodeNode': 36,
    'elk.layered.spacing.nodeNodeBetweenLayers': 80,
    'elk.edgeRouting': 'ORTHOGONAL',                   // or 'POLYLINE'
    'elk.layered.cycleBreaking.strategy': 'GREEDY',
    'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
  }), []);

  const onNodeClick = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  return (
      <Canvas
          nodes={nodes}
          edges={edges}
          layoutOptions={layoutOptions}
          panType="drag"
          maxZoom={10}
          minZoom={-0.9}
          zoom={zoom}
          onZoomChange={z => {
              setZoom(z);
          }}
          draggable={false}
          selectable={false}
          node={(props: NodeProps<FlatNode>) => {
              const data = props.properties?.properties as ResearchNodeData;
              const hasKids = Object.values(db).some(n => n.parentId === data.id);
              const isExpanded = expanded.has(data.id);
              const collapsedHint = hasKids && !isExpanded;

              return (
                  <g transform={`translate(${props.x + NODE_W/2}, ${props.y + NODE_H/2})`} onClick={() => onNodeClick(data.id)}>
                      <NodeCard data={data} />
                      {collapsedHint && (
                          <text x={NODE_W/2 - 10} y={-NODE_H/2 + 18} textAnchor="end" fontSize={12}
                                fill={themeFor(data.vector).rim} style={{ pointerEvents: 'none' }}>…</text>
                      )}
                  </g>
              );
          }}
          // edge={(p: EdgeProps) => <Edge {...p} type="orthogonal" />}
      />
  );
}

/** Legend */
function Legend() {
  const items = [
    ['tech', VECTOR_COLORS.tech.rim],
    ['nature', VECTOR_COLORS.nature.rim],
    ['medieval', VECTOR_COLORS.medieval.rim],
    ['aether', VECTOR_COLORS.aether.rim],
  ] as const;
  return (
    <div
      style={{
        position: 'absolute',
        right: 10,
        bottom: 10,
        padding: '8px 10px',
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        fontSize: 12,
        color: '#cfd8e3',
        backdropFilter: 'blur(4px)',
      }}
    >
      {items.map(([name, color]) => (
        <div key={name as string} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '2px 0' }}>
          <span style={{ width: 12, height: 12, background: color as string, borderRadius: 6, display: 'inline-block' }} />
          <span style={{ textTransform: 'capitalize' }}>{name as string}</span>
        </div>
      ))}
    </div>
  );
}
