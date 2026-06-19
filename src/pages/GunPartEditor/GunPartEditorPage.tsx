import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { TOWER_PARTS } from '../../data/towers/index.ts';
import { TOWER_PART_SLOT_ORDER } from '../../data/towers/parts/index.ts';
import { gunpartIdRows } from '../../data/identificators/index.ts';
import type { TowerPartVisualMetadata } from '../../models/battle/towerPartVisualMetadata.ts';
import type { TowerPartSlot } from '../../models/battle/towerParts.ts';
import type { TowerVisualPoint, TowerVisualSize } from '../../models/battle/towerVisual.ts';
import { INITIAL_TOWER_AIM_RADIANS } from '../../models/battle/tower.ts';
import * as s from './GunPartEditorPage.css.ts';

type SocketKind = 'input' | 'output';

interface SocketDraft {
  kind: SocketKind;
  name: string;
  point: TowerVisualPoint;
}

interface EditorAsset {
  metadata?: TowerPartVisualMetadata;
  src?: string;
}

const metadataModules = import.meta.glob('../../assets/battle/towerParts/**/*.json', {
  eager: true,
}) as Record<string, { default: TowerPartVisualMetadata }>;

const imageModules = import.meta.glob('../../assets/battle/towerParts/**/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const SLOT_SOCKET_TEMPLATES: Record<TowerPartSlot, string[]> = {
  platform: [],
  barrel: ['attachmentMount', 'muzzle'],
  ammo: ['feed'],
  aimSystem: ['sensor'],
  barrelAttachment: ['muzzle'],
  loadingSystem: ['feed'],
  launchSystem: ['platform', 'ammo', 'barrel', 'aimSystem', 'loadingSystem'],
};

const DEFAULT_SOURCE_SIZE: TowerVisualSize = { width: 1024, height: 1024 };
const DEFAULT_TARGET_SIZE: TowerVisualSize = { width: 96, height: 64 };
const SOCKET_MAP_NODE_SIZE = 76;
const INITIAL_TOWER_AIM_DEGREES = INITIAL_TOWER_AIM_RADIANS * 180 / Math.PI;

type SocketMapNode = {
  slot: TowerPartSlot;
  title: string;
  x: number;
  y: number;
  root: TowerVisualPoint;
  outputs: Record<string, TowerVisualPoint>;
};

type SocketMapConnection = {
  fromSlot: TowerPartSlot;
  fromSocket: string;
  toSlot: TowerPartSlot;
};

const SOCKET_MAP_NODES: SocketMapNode[] = [
  {
    slot: 'launchSystem',
    title: 'Launch',
    x: 190,
    y: 108,
    root: { x: 38, y: 38 },
    outputs: {
      platform: { x: 6, y: 56 },
      ammo: { x: 72, y: 20 },
      barrel: { x: 72, y: 38 },
      aimSystem: { x: 72, y: 56 },
      loadingSystem: { x: 6, y: 20 },
    },
  },
  {
    slot: 'platform',
    title: 'Platform / Turret',
    x: 28,
    y: 108,
    root: { x: 72, y: 56 },
    outputs: {},
  },
  {
    slot: 'loadingSystem',
    title: 'Loading',
    x: 28,
    y: 12,
    root: { x: 72, y: 56 },
    outputs: {},
  },
  {
    slot: 'barrel',
    title: 'Barrel',
    x: 352,
    y: 60,
    root: { x: 6, y: 38 },
    outputs: {
      muzzle: { x: 72, y: 26 },
      barrelAttachment: { x: 72, y: 50 },
    },
  },
  {
    slot: 'aimSystem',
    title: 'Aim System',
    x: 352,
    y: 204,
    root: { x: 6, y: 38 },
    outputs: {},
  },
  {
    slot: 'ammo',
    title: 'Ammunition',
    x: 352,
    y: 156,
    root: { x: 6, y: 38 },
    outputs: {
      feed: { x: 72, y: 38 },
    },
  },
  {
    slot: 'barrelAttachment',
    title: 'Barrel Attachment',
    x: 352,
    y: 12,
    root: { x: 6, y: 38 },
    outputs: {},
  },
];

const SOCKET_MAP_CONNECTIONS: SocketMapConnection[] = [
  { fromSlot: 'launchSystem', fromSocket: 'platform', toSlot: 'platform' },
  { fromSlot: 'launchSystem', fromSocket: 'loadingSystem', toSlot: 'loadingSystem' },
  { fromSlot: 'launchSystem', fromSocket: 'barrel', toSlot: 'barrel' },
  { fromSlot: 'launchSystem', fromSocket: 'ammo', toSlot: 'ammo' },
  { fromSlot: 'launchSystem', fromSocket: 'aimSystem', toSlot: 'aimSystem' },
  { fromSlot: 'barrel', fromSocket: 'barrelAttachment', toSlot: 'barrelAttachment' },
];

function getFileStem(path: string) {
  return path.split('/').at(-1)?.replace(/\.(json|png)$/i, '') ?? path;
}

function buildAssetMap() {
  const assets: Record<string, EditorAsset> = {};

  for (const [path, module] of Object.entries(metadataModules)) {
    const metadata = module.default;
    const id = getFileStem(path);
    assets[id] = {
      ...assets[id],
      metadata,
    };
  }

  for (const [path, src] of Object.entries(imageModules)) {
    const id = getFileStem(path);
    assets[id] = {
      ...assets[id],
      src,
    };
  }

  return assets;
}

const EDITOR_ASSETS = buildAssetMap();

function getCenter(size: TowerVisualSize): TowerVisualPoint {
  return {
    x: Math.round(size.width / 2),
    y: Math.round(size.height / 2),
  };
}

function roundPoint(point: TowerVisualPoint): TowerVisualPoint {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

function clampPoint(point: TowerVisualPoint, size: TowerVisualSize): TowerVisualPoint {
  return {
    x: Math.max(0, Math.min(size.width, point.x)),
    y: Math.max(0, Math.min(size.height, point.y)),
  };
}

function rotatePoint(point: TowerVisualPoint, center: TowerVisualPoint, degrees: number): TowerVisualPoint {
  const radians = degrees * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = point.x - center.x;
  const dy = point.y - center.y;

  return {
    x: center.x + dx * cos - dy * sin,
    y: center.y + dx * sin + dy * cos,
  };
}

function getRotatedBounds(size: TowerVisualSize, rotationDegrees: number): TowerVisualSize {
  const radians = rotationDegrees * Math.PI / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));

  return {
    width: size.width * cos + size.height * sin,
    height: size.width * sin + size.height * cos,
  };
}

function sourcePointToTargetPoint(
  point: TowerVisualPoint,
  sourceSpriteSize: TowerVisualSize,
  targetSpriteSize: TowerVisualSize
): TowerVisualPoint {
  return {
    x: (point.x - sourceSpriteSize.width / 2) * (targetSpriteSize.width / sourceSpriteSize.width),
    y: (point.y - sourceSpriteSize.height / 2) * (targetSpriteSize.height / sourceSpriteSize.height),
  };
}

function targetPointToSourcePoint(
  point: TowerVisualPoint,
  sourceSpriteSize: TowerVisualSize,
  targetSpriteSize: TowerVisualSize
): TowerVisualPoint {
  return {
    x: point.x * (sourceSpriteSize.width / targetSpriteSize.width) + sourceSpriteSize.width / 2,
    y: point.y * (sourceSpriteSize.height / targetSpriteSize.height) + sourceSpriteSize.height / 2,
  };
}

function createSocketsForSlot(
  slot: TowerPartSlot,
  sourceSize: TowerVisualSize,
  metadata?: TowerPartVisualMetadata,
  previousSockets?: readonly SocketDraft[]
): SocketDraft[] {
  const center = getCenter(sourceSize);
  const previousByKey = new Map(previousSockets?.map((socket) => [`${socket.kind}:${socket.name}`, socket.point]));
  const inputPoint = previousByKey.get('input:input')
    ?? metadata?.inputSocket
    ?? center;

  return [
    { kind: 'input', name: 'input', point: roundPoint(inputPoint) },
    ...SLOT_SOCKET_TEMPLATES[slot].map<SocketDraft>((socketName) => ({
      kind: 'output',
      name: socketName,
      point: roundPoint(
        previousByKey.get(`output:${socketName}`)
        ?? metadata?.outputSockets[socketName]
        ?? center
      ),
    })),
  ];
}

function getSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number): TowerVisualPoint {
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const transformed = point.matrixTransform(svg.getScreenCTM()?.inverse());
  return {
    x: transformed.x,
    y: transformed.y,
  };
}

function getJson(
  sourceSpriteSize: TowerVisualSize,
  targetSpriteSize: TowerVisualSize,
  rotationDegrees: number,
  sockets: readonly SocketDraft[]
) {
  const inputSocket = sockets.find((socket) => socket.kind === 'input')?.point ?? getCenter(sourceSpriteSize);
  const outputSockets = Object.fromEntries(
    sockets
      .filter((socket) => socket.kind === 'output')
      .map((socket) => [socket.name, roundPoint(socket.point)])
  );

  return JSON.stringify({
    sourceSpriteSize,
    targetSpriteSize,
    rotationDegrees,
    inputSocket: roundPoint(inputSocket),
    outputSockets,
  }, null, 2);
}

function getSocketMapNode(slot: TowerPartSlot) {
  const node = SOCKET_MAP_NODES.find((item) => item.slot === slot);
  if (!node) throw new Error(`Missing socket map node for ${slot}`);
  return node;
}

function getSocketMapPoint(node: SocketMapNode, point: TowerVisualPoint): TowerVisualPoint {
  return {
    x: node.x + point.x,
    y: node.y + point.y,
  };
}

function SocketMapCanvas({ activeSlot }: { activeSlot: TowerPartSlot }) {
  return (
    <section className={s.socketMapPanel}>
      <div className={s.socketMapHeader}>
        <h2 className={s.title}>Socket Map</h2>
        <div className={s.socketLegend}>
          <span className={s.socketLegendItem}><span className={s.legendDotRed} /> Tower pivot</span>
          <span className={s.socketLegendItem}><span className={s.legendDotYellow} /> Root</span>
          <span className={s.socketLegendItem}><span className={s.legendDotGreen} /> Attachment</span>
        </div>
      </div>
      <svg className={s.socketMapSvg} viewBox="0 0 460 292" role="img" aria-label="Tower part socket map">
        <g>
          {SOCKET_MAP_CONNECTIONS.map((connection) => {
            const fromNode = getSocketMapNode(connection.fromSlot);
            const toNode = getSocketMapNode(connection.toSlot);
            const fromSocket = fromNode.outputs[connection.fromSocket];
            const from = getSocketMapPoint(fromNode, fromSocket);
            const to = getSocketMapPoint(toNode, toNode.root);

            return (
              <line
                key={`${connection.fromSlot}-${connection.fromSocket}-${connection.toSlot}`}
                className={s.socketConnection}
                vectorEffect="non-scaling-stroke"
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
              />
            );
          })}
        </g>
        <g>
          {SOCKET_MAP_NODES.map((node) => {
            const towerPivot = getSocketMapPoint(node, { x: SOCKET_MAP_NODE_SIZE / 2, y: SOCKET_MAP_NODE_SIZE / 2 });
            const root = getSocketMapPoint(node, node.root);
            const selected = node.slot === activeSlot;

            return (
              <g key={node.slot}>
                <text className={s.socketMapNodeTitle} textAnchor="middle" x={node.x + SOCKET_MAP_NODE_SIZE / 2} y={node.y - 8}>
                  {node.title}
                </text>
                <rect
                  className={selected ? s.socketMapNodeActive : s.socketMapNode}
                  x={node.x}
                  y={node.y}
                  width={SOCKET_MAP_NODE_SIZE}
                  height={SOCKET_MAP_NODE_SIZE}
                  vectorEffect="non-scaling-stroke"
                  rx="4"
                />
                {node.slot === 'launchSystem' && <SocketMapDot color="red" label="pivot" point={towerPivot} />}
                <SocketMapDot color="yellow" label="root" point={root} />
                {Object.entries(node.outputs).map(([socketName, point]) => (
                  <SocketMapDot
                    key={socketName}
                    color="green"
                    label={socketName}
                    point={getSocketMapPoint(node, point)}
                  />
                ))}
              </g>
            );
          })}
        </g>
      </svg>
    </section>
  );
}

function SocketMapDot({
  color,
  label,
  point,
}: {
  color: 'red' | 'yellow' | 'green';
  label: string;
  point: TowerVisualPoint;
}) {
  const className = color === 'red'
    ? s.socketMapDotRed
    : color === 'yellow'
      ? s.socketMapDotYellow
      : s.socketMapDotGreen;

  return (
    <g>
      <text className={s.socketMapDotLabel} textAnchor="middle" x={point.x} y={point.y - 7}>{label}</text>
      <circle className={className} cx={point.x} cy={point.y} r="4" vectorEffect="non-scaling-stroke" />
    </g>
  );
}

export default function GunPartEditorPage() {
  const sortedParts = useMemo(
    () => gunpartIdRows
      .map(row => TOWER_PARTS.find(part => part.id === row.id))
      .filter((part): part is NonNullable<typeof part> => Boolean(part))
      .sort((a, b) => `${a.slot ?? ''}-${a.name}`.localeCompare(`${b.slot ?? ''}-${b.name}`)),
    []
  );
  const initialPart = sortedParts.find((part) => EDITOR_ASSETS[part.id]?.src) ?? sortedParts[0];

  const [selectedPartId, setSelectedPartId] = useState(initialPart.id);
  const selectedPart = TOWER_PARTS.find((part) => part.id === selectedPartId) ?? initialPart;
  const selectedAsset = EDITOR_ASSETS[selectedPart.id];
  const [slot, setSlot] = useState<TowerPartSlot>(selectedPart.slot ?? 'barrel');
  const [sourceSpriteSize, setSourceSpriteSize] = useState<TowerVisualSize>(
    selectedAsset?.metadata?.sourceSpriteSize ?? DEFAULT_SOURCE_SIZE
  );
  const [targetSpriteSize, setTargetSpriteSize] = useState<TowerVisualSize>(
    selectedAsset?.metadata?.targetSpriteSize ?? DEFAULT_TARGET_SIZE
  );
  const [sockets, setSockets] = useState<SocketDraft[]>(
    createSocketsForSlot(slot, sourceSpriteSize, selectedAsset?.metadata)
  );
  const [zoom, setZoom] = useState(1);
  const [rotationDegrees, setRotationDegrees] = useState(selectedAsset?.metadata?.rotationDegrees ?? 0);
  const [activeSocketKey, setActiveSocketKey] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const nextPart = TOWER_PARTS.find((part) => part.id === selectedPartId) ?? initialPart;
    const nextAsset = EDITOR_ASSETS[nextPart.id];
    const nextSourceSize = nextAsset?.metadata?.sourceSpriteSize ?? DEFAULT_SOURCE_SIZE;
    const nextSlot = nextPart.slot ?? 'barrel';

    setSlot(nextSlot);
    setSourceSpriteSize(nextSourceSize);
    setTargetSpriteSize(nextAsset?.metadata?.targetSpriteSize ?? DEFAULT_TARGET_SIZE);
    setSockets(createSocketsForSlot(nextSlot, nextSourceSize, nextAsset?.metadata));
    setRotationDegrees(nextAsset?.metadata?.rotationDegrees ?? 0);
    setZoom(1);
  }, [initialPart, selectedPartId]);

  useEffect(() => {
    if (!selectedAsset?.src || selectedAsset.metadata?.sourceSpriteSize) return;

    const image = new Image();
    image.onload = () => {
      const naturalSize = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
      setSourceSpriteSize(naturalSize);
      setSockets((currentSockets) => createSocketsForSlot(slot, naturalSize, selectedAsset.metadata, currentSockets));
    };
    image.src = selectedAsset.src;
  }, [selectedAsset?.metadata, selectedAsset?.src, slot]);

  const generatedJson = useMemo(
    () => getJson(sourceSpriteSize, targetSpriteSize, rotationDegrees, sockets),
    [rotationDegrees, sourceSpriteSize, sockets, targetSpriteSize]
  );

  function updateSlot(nextSlot: TowerPartSlot) {
    setSlot(nextSlot);
    setSockets((currentSockets) => createSocketsForSlot(nextSlot, sourceSpriteSize, selectedAsset?.metadata, currentSockets));
  }

  function updateSocketPoint(socketKey: string, point: TowerVisualPoint) {
    setSockets((currentSockets) => currentSockets.map((socket) => (
      `${socket.kind}:${socket.name}` === socketKey
        ? { ...socket, point: roundPoint(clampPoint(point, sourceSpriteSize)) }
        : socket
    )));
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!activeSocketKey || !svgRef.current) return;

    const rawPoint = getSvgPoint(svgRef.current, event.clientX, event.clientY);
    const unrotatedTargetPoint = rotatePoint(rawPoint, { x: 0, y: 0 }, -displayRotationDegrees);
    updateSocketPoint(activeSocketKey, targetPointToSourcePoint(unrotatedTargetPoint, sourceSpriteSize, targetSpriteSize));
  }

  const displayRotationDegrees = rotationDegrees + INITIAL_TOWER_AIM_DEGREES;
  const rotatedBounds = getRotatedBounds(targetSpriteSize, displayRotationDegrees);
  const previewPadding = Math.max(48 / zoom, 16);
  const viewBox = {
    x: -rotatedBounds.width / 2 - previewPadding,
    y: -rotatedBounds.height / 2 - previewPadding,
    width: rotatedBounds.width + previewPadding * 2,
    height: rotatedBounds.height + previewPadding * 2,
  };
  const displayWidth = Math.max(1, viewBox.width * zoom);
  const displayHeight = Math.max(1, viewBox.height * zoom);
  const markerRadius = Math.max(8 / zoom, 5);
  const markerLength = Math.max(16 / zoom, 10);
  const markerStroke = Math.max(2 / zoom, 1.5);
  const labelFontSize = Math.max(12 / zoom, 8);
  const labelOffsetX = Math.max(12 / zoom, 8);
  const labelOffsetY = Math.max(10 / zoom, 7);

  return (
    <div className={s.page}>
      <section className={s.tablePanel}>
        <div className={s.tableHeader}>
          <h1 className={s.title}>Gun Parts</h1>
          <p className={s.subtitle}>Select a tower part to edit its asset sockets.</p>
        </div>
        <div className={s.tableWrap}>
          <table className={s.partsTable}>
            <thead>
              <tr>
                <th className={s.tableHeadCell}>Part</th>
                <th className={s.tableHeadCell}>Type</th>
                <th className={s.tableHeadCell}>Asset</th>
              </tr>
            </thead>
            <tbody>
              {sortedParts.map((part) => {
                const hasAsset = Boolean(EDITOR_ASSETS[part.id]?.src);
                const rowClassName = part.id === selectedPart.id ? s.selectedPartRow : s.partRow;

                return (
                  <tr
                    className={rowClassName}
                    key={part.id}
                    onClick={() => setSelectedPartId(part.id)}
                  >
                    <td className={s.tableCell}>
                      <span className={s.partName}>{part.name}</span>
                      <span className={s.muted}>{part.id}</span>
                    </td>
                    <td className={s.tableCell}>{part.slot ?? 'Unknown'}</td>
                    <td className={s.tableCell}>
                      <span className={hasAsset ? s.assetBadge : s.noAssetBadge}>{hasAsset ? 'Ready' : 'No PNG'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className={s.editorGrid}>
        <div className={s.controlsPanel}>
          <label className={s.field}>
            <span className={s.label}>Asset ID</span>
            <input className={s.input} value={selectedPart.id} readOnly />
          </label>
          <label className={s.field}>
            <span className={s.label}>Part Type</span>
            <select className={s.input} value={slot} onChange={(event) => updateSlot(event.target.value as TowerPartSlot)}>
              {TOWER_PART_SLOT_ORDER.map((partSlot) => (
                <option key={partSlot.key} value={partSlot.key}>{partSlot.label}</option>
              ))}
            </select>
          </label>
          <div className={s.field}>
            <span className={s.label}>Zoom</span>
            <div className={s.buttonGroup}>
              <button className={s.button} type="button" onClick={() => setZoom((value) => Math.max(0.25, value - 0.25))}>-</button>
              <button className={s.button} type="button" onClick={() => setZoom(1)}>1:1</button>
              <button className={s.button} type="button" onClick={() => setZoom((value) => Math.min(8, value + 0.25))}>+</button>
            </div>
          </div>
          <div className={s.field}>
            <span className={s.label}>Rotate</span>
            <div className={s.buttonGroup}>
              <button className={s.button} type="button" onClick={() => setRotationDegrees((value) => (value + 270) % 360)}>-90</button>
              <button className={s.button} type="button" onClick={() => setRotationDegrees((value) => (value + 90) % 360)}>+90</button>
            </div>
          </div>
          <label className={s.field}>
            <span className={s.label}>Target Size</span>
            <span className={s.targetSizeFields}>
              <input
                className={s.input}
                min={1}
                type="number"
                value={targetSpriteSize.width}
                onChange={(event) => setTargetSpriteSize((size) => ({ ...size, width: Math.max(1, Number(event.target.value) || 1) }))}
              />
              <input
                className={s.input}
                min={1}
                type="number"
                value={targetSpriteSize.height}
                onChange={(event) => setTargetSpriteSize((size) => ({ ...size, height: Math.max(1, Number(event.target.value) || 1) }))}
              />
            </span>
          </label>
          <label className={s.field}>
            <span className={s.label}>Source Size</span>
            <span className={s.targetSizeFields}>
              <input className={s.input} readOnly value={sourceSpriteSize.width} />
              <input className={s.input} readOnly value={sourceSpriteSize.height} />
            </span>
          </label>
        </div>

        <div className={s.stagePanel}>
          <div className={s.stage}>
            {selectedAsset?.src ? (
              <svg
                ref={svgRef}
                className={s.svg}
                style={{ width: displayWidth, height: displayHeight }}
                viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
                onPointerMove={handlePointerMove}
                onPointerUp={() => setActiveSocketKey(null)}
                onPointerLeave={() => setActiveSocketKey(null)}
              >
                <g transform={`rotate(${displayRotationDegrees})`}>
                  <image
                    href={selectedAsset.src}
                    x={-targetSpriteSize.width / 2}
                    y={-targetSpriteSize.height / 2}
                    width={targetSpriteSize.width}
                    height={targetSpriteSize.height}
                    preserveAspectRatio="none"
                  />
                  {sockets.map((socket) => {
                    const socketKey = `${socket.kind}:${socket.name}`;
                    const color = socket.kind === 'input' ? '#f97316' : '#14b8a6';
                    const previewPoint = sourcePointToTargetPoint(socket.point, sourceSpriteSize, targetSpriteSize);

                    return (
                      <g
                        className={s.socketPoint}
                        key={socketKey}
                        onPointerDown={(event) => {
                          event.currentTarget.setPointerCapture(event.pointerId);
                          setActiveSocketKey(socketKey);
                        }}
                      >
                        <line
                          x1={previewPoint.x - markerLength}
                          x2={previewPoint.x + markerLength}
                          y1={previewPoint.y}
                          y2={previewPoint.y}
                          stroke={color}
                          strokeWidth={markerStroke}
                          vectorEffect="non-scaling-stroke"
                        />
                        <line
                          x1={previewPoint.x}
                          x2={previewPoint.x}
                          y1={previewPoint.y - markerLength}
                          y2={previewPoint.y + markerLength}
                          stroke={color}
                          strokeWidth={markerStroke}
                          vectorEffect="non-scaling-stroke"
                        />
                        <circle
                          cx={previewPoint.x}
                          cy={previewPoint.y}
                          fill={color}
                          r={markerRadius}
                          stroke="#ffffff"
                          strokeWidth={markerStroke}
                          vectorEffect="non-scaling-stroke"
                        />
                        <text
                          className={s.socketLabel}
                          fontSize={labelFontSize}
                          x={previewPoint.x + labelOffsetX}
                          y={previewPoint.y - labelOffsetY}
                        >
                          {socket.name}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            ) : (
              <div className={s.emptyStage}>
                This part does not have a PNG under src/assets/battle/towerParts yet. Add the sprite asset, then it will appear here for socket editing.
              </div>
            )}
          </div>
          <div className={s.socketsPanel}>
            {sockets.map((socket) => (
              <div className={s.socketCard} key={`${socket.kind}:${socket.name}`}>
                <span className={s.socketName}>{socket.kind === 'input' ? 'Input' : socket.name}</span>
                <span className={s.muted}>x {Math.round(socket.point.x)} / y {Math.round(socket.point.y)}</span>
              </div>
            ))}
          </div>
          <SocketMapCanvas activeSlot={slot} />
        </div>

        <div className={s.jsonPanel}>
          <div className={s.jsonHeader}>
            <h2 className={s.title}>Generated JSON</h2>
          </div>
          <pre className={s.jsonOutput}>{generatedJson}</pre>
        </div>
      </section>
    </div>
  );
}
