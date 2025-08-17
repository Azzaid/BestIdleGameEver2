import React, {type FC, type ReactElement, useMemo, useState} from 'react';
import {Canvas, Edge, type EdgeProps, type NodeProps, CanvasDirection} from 'reaflow';
import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import {anyMet, isUnlocked, prereqsOf} from "./util.ts";
import {NodeCard} from "./Components/NodeCard.tsx";
import {type StubData, StubNode} from "./Components/StubNode.tsx";
import type {ResearchDB} from "../../models/research/researchDB.ts";
import {researchThree} from "../../data/research";

/** =========================
 *  Data model (normalized)
 *  ========================= */
type FlatNode = {
    id: string;
    width: number;
    height: number;
    properties: { kind: 'normal' | 'stub'; data: ResearchNodeData | StubData }
};
type FlatEdge = { id: string; from: string; to: string; kind?: 'normal' | 'preview' | 'stub'};

const NODE_W = 220;
const NODE_H = 120;

/** =========================
 *  Graph builders
 *  ========================= */

function computePreviewFrontierWithStubs(db: ResearchDB, purchased: Set<string>) {
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
            properties: {kind: 'normal', data: n}
        });
    }

    // edges between visible real nodes
    function addEdge(from: string, to: string) {
        const kind: 'normal' | 'preview' = unlockedIds.has(to) || purchased.has(to) ? 'normal' : 'preview';
        edges.push({id: `${from}->${to}`, from, to, kind});
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
                properties: {kind: 'stub', data: stub as any}
            });
            edges.push({
                id: `${stubId}=>${id}`,
                from: stubId,
                to: id,
                kind: 'stub'
            });
        }
    }

    return {nodes, edges};
}

/** =========================
 *  Main component (Reaflow + ELK layered)
 *  ========================= */
export default function ResearchPage() {
    const [purchasedTechsIds, setPurchasedTechsIds] = useState<string[]>(['root', 'aether']);
    const purchased = useMemo(() => new Set(purchasedTechsIds), [purchasedTechsIds]);

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
            node={(props: NodeProps<FlatNode>): React.ReactElement<NodeProps<FlatNode>, React.FC<Partial<NodeProps<FlatNode>>>> | null => {
                const payload = props.properties?.properties;
                if (!payload) return null;
                if (payload.kind === 'stub') {
                    const data = payload.data as StubData;
                    return (
                        <g transform={`translate(${props.x}, ${props.y})`}>
                            <StubNode data={data}/>
                        </g>
                    );
                } else {
                    const data = payload.data as ResearchNodeData;
                    return (
                        <g transform={`translate(${props.x + NODE_W / 2}, ${props.y + NODE_H / 2})`} onClick={() => {
                            setPurchasedTechsIds([...purchasedTechsIds, data.id])
                        }}>
                            <NodeCard data={data} nodeHeight={NODE_H} nodeWidth={NODE_W}/>
                        </g>
                    );
                }
            }}
            edge={(p: EdgeProps<FlatEdge>) => {
                const kind = p.properties?.properties?.kind;
                const dashed = kind === 'preview' || kind === 'stub';
                return <Edge {...p} style={dashed ? {strokeDasharray: '6 6', opacity: 0.9} : undefined}/>;
            }}
            fit
        />
    );
}