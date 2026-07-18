import {useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent} from "react";
import {CITY_HEX_BACKGROUND_SPRITES} from "../../data/cityHexBackgrounds.ts";
import {CITY_HEX_RADIUS, CITY_HEX_WIDTH} from "../../data/constants.ts";
import type {CityHexBackgroundSprite} from "../../models/city/hexBackgrounds.ts";
import * as s from "./HexBackgroundLabPage.css.ts";

type LayerId = "background" | "overlay" | "object";

type LayerState = {
  fileName: string;
  url: string;
};

type LayerConfig = {
  id: LayerId;
  label: string;
  accept: string;
};

type HexCoordinate = {
  column: number;
  row: number;
};

type LayerZoomState = Record<LayerId, number>;

const layers = [
  {id: "background", label: "Background", accept: "image/*"},
  {id: "overlay", label: "Overlay", accept: "image/*"},
  {id: "object", label: "Object", accept: "image/*"},
] as const satisfies readonly LayerConfig[];

const defaultBackgroundSprite = CITY_HEX_BACKGROUND_SPRITES[0];
const maxGridRadius = 4;
const defaultLayerZoom: LayerZoomState = {
  background: 100,
  overlay: 100,
  object: 100,
};

export default function HexBackgroundLabPage() {
  const [selectedBackgroundId, setSelectedBackgroundId] = useState(defaultBackgroundSprite?.id ?? "");
  const [customLayers, setCustomLayers] = useState<Partial<Record<LayerId, LayerState>>>({});
  const [draggedLayerId, setDraggedLayerId] = useState<LayerId | null>(null);
  const [gridRadius, setGridRadius] = useState(1);
  const [layerZoom, setLayerZoom] = useState<LayerZoomState>(defaultLayerZoom);
  const objectUrlsRef = useRef(new Set<string>());

  const selectedBackground = useMemo(
    () => CITY_HEX_BACKGROUND_SPRITES.find(sprite => sprite.id === selectedBackgroundId) ?? defaultBackgroundSprite,
    [selectedBackgroundId],
  );
  const backgroundUrl = customLayers.background?.url ?? selectedBackground?.src ?? "";
  const previewLayers = [
    {id: "background", label: "Background", url: backgroundUrl, fit: "cover", zoom: layerZoom.background, clipped: true},
    {id: "overlay", label: "Overlay", url: customLayers.overlay?.url ?? "", fit: "contain", zoom: layerZoom.overlay, clipped: true},
    {id: "object", label: "Object", url: customLayers.object?.url ?? "", fit: "contain", zoom: layerZoom.object, clipped: false},
  ] as const;

  useEffect(() => () => {
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  const setLayerFile = (layerId: LayerId, file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;

    setCustomLayers(current => {
      const previousUrl = current[layerId]?.url;
      if (previousUrl) URL.revokeObjectURL(previousUrl);

      if (previousUrl) objectUrlsRef.current.delete(previousUrl);

      const nextUrl = URL.createObjectURL(file);
      objectUrlsRef.current.add(nextUrl);

      return {
        ...current,
        [layerId]: {
          fileName: file.name,
          url: nextUrl,
        },
      };
    });
  };

  const clearLayer = (layerId: LayerId) => {
    setCustomLayers(current => {
      const previousUrl = current[layerId]?.url;
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      if (previousUrl) objectUrlsRef.current.delete(previousUrl);

      const next = {...current};
      delete next[layerId];
      return next;
    });
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>, layerId: LayerId) => {
    event.preventDefault();
    setDraggedLayerId(null);
    setLayerFile(layerId, event.dataTransfer.files[0] ?? null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, layerId: LayerId) => {
    setLayerFile(layerId, event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  return (
    <div className={s.page}>
      <aside className={s.panel}>
        <div className={s.header}>
          <h1 className={s.title}>Hex Lab</h1>
          <p className={s.subtitle}>Compose terrain, overlay, and object art in one city hex.</p>
        </div>

        <label className={s.field}>
          <span className={s.label}>Existing background</span>
          <select
            className={s.input}
            value={selectedBackground?.id ?? ""}
            onChange={event => {
              setSelectedBackgroundId(event.target.value);
              clearLayer("background");
            }}
          >
            {CITY_HEX_BACKGROUND_SPRITES.map(sprite => (
              <option key={sprite.id} value={sprite.id}>{formatSpriteLabel(sprite)}</option>
            ))}
          </select>
        </label>

        <label className={s.field}>
          <span className={s.label}>Hex radius</span>
          <div className={s.sliderRow}>
            <input
              className={s.slider}
              type="range"
              min={0}
              max={maxGridRadius}
              step={1}
              value={gridRadius}
              onChange={event => setGridRadius(Number(event.target.value))}
            />
            <span className={s.sliderValue}>{gridRadius}</span>
          </div>
        </label>

        <div className={s.dropGrid}>
          {layers.map(layer => (
            <label
              key={layer.id}
              className={`${s.dropZone} ${draggedLayerId === layer.id ? s.dropZoneActive : ""}`}
              onDragEnter={event => {
                event.preventDefault();
                setDraggedLayerId(layer.id);
              }}
              onDragOver={event => event.preventDefault()}
              onDragLeave={() => setDraggedLayerId(null)}
              onDrop={event => handleDrop(event, layer.id)}
            >
              <span className={s.dropLabel}>{layer.label}</span>
              <span className={s.dropMeta}>{customLayers[layer.id]?.fileName ?? getLayerFallbackLabel(layer.id, selectedBackground)}</span>
              <input
                className={s.fileInput}
                type="file"
                accept={layer.accept}
                onChange={event => handleFileChange(event, layer.id)}
              />
            </label>
          ))}
        </div>

        <div className={s.layerList}>
          {layers.map(layer => (
            <div key={layer.id} className={s.layerRow}>
              <div className={s.layerDetails}>
                <div className={s.layerHeader}>
                  <div>
                    <div className={s.layerName}>{layer.label}</div>
                    <div className={s.layerSource}>{customLayers[layer.id]?.fileName ?? getLayerFallbackLabel(layer.id, selectedBackground)}</div>
                  </div>
                  <button
                    className={s.clearButton}
                    type="button"
                    onClick={() => clearLayer(layer.id)}
                    disabled={!customLayers[layer.id]}
                  >
                    Clear
                  </button>
                </div>
                <label className={s.zoomField}>
                  <span className={s.zoomLabel}>Zoom</span>
                  <div className={s.sliderRow}>
                    <input
                      className={s.slider}
                      type="range"
                      min={50}
                      max={200}
                      step={5}
                      value={layerZoom[layer.id]}
                      onChange={event => {
                        const nextZoom = Number(event.target.value);
                        setLayerZoom(current => ({...current, [layer.id]: nextZoom}));
                      }}
                    />
                    <span className={s.sliderValue}>{layerZoom[layer.id]}%</span>
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className={s.previewPanel}>
        <div className={s.previewStage}>
          <LayeredHexPreview layers={previewLayers} gridRadius={gridRadius} />
        </div>
      </main>
    </div>
  );
}

function LayeredHexPreview({
  layers: previewLayers,
  gridRadius,
}: {
  layers: readonly {id: LayerId; label: string; url: string; fit: "cover" | "contain"; zoom: number; clipped: boolean}[];
  gridRadius: number;
}) {
  const radius = CITY_HEX_RADIUS;
  const width = CITY_HEX_WIDTH;
  const height = radius * 2;
  const hexes = useMemo(() => getHexGridCoordinates(gridRadius), [gridRadius]);
  const centers = hexes.map(hex => axialCoordinateToPixelPosition(hex, radius));
  const minX = Math.min(...centers.map(center => center.x - width / 2));
  const maxX = Math.max(...centers.map(center => center.x + width / 2));
  const minY = Math.min(...centers.map(center => center.y - height / 2));
  const maxY = Math.max(...centers.map(center => center.y + height / 2));
  const objectZoom = (previewLayers.find(layer => layer.id === "object")?.zoom ?? 100) / 100;
  const objectPadding = Math.max(0, (Math.max(width, height) * (objectZoom - 1)) / 2);
  const padding = 14 + objectPadding;
  const clippedLayers = previewLayers.filter(layer => layer.clipped);
  const objectLayer = previewLayers.find(layer => layer.id === "object");
  const viewBoxX = minX - padding;
  const viewBoxY = minY - padding;
  const viewBoxWidth = maxX - minX + padding * 2;
  const viewBoxHeight = maxY - minY + padding * 2;
  const clipBleedScale = (radius + 2) / radius;
  const points = [
    `0,${-radius}`,
    `${width / 2},${-radius / 2}`,
    `${width / 2},${radius / 2}`,
    `0,${radius}`,
    `${-width / 2},${radius / 2}`,
    `${-width / 2},${-radius / 2}`,
  ].join(" ");
  const clipPoints = [
    `0,${-radius * clipBleedScale}`,
    `${width / 2 * clipBleedScale},${-radius / 2 * clipBleedScale}`,
    `${width / 2 * clipBleedScale},${radius / 2 * clipBleedScale}`,
    `0,${radius * clipBleedScale}`,
    `${-width / 2 * clipBleedScale},${radius / 2 * clipBleedScale}`,
    `${-width / 2 * clipBleedScale},${-radius / 2 * clipBleedScale}`,
  ].join(" ");

  return (
    <svg className={s.previewSvg} viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`} role="img" aria-label="Combined city hex grid preview">
      <defs>
        {centers.map((center, index) => (
          <clipPath key={index} id={`hex-background-lab-clip-${index}`} clipPathUnits="userSpaceOnUse">
            <polygon points={clipPoints} transform={`translate(${center.x} ${center.y})`} />
          </clipPath>
        ))}
      </defs>

      {hexes.map((hex, index) => {
        const center = centers[index];
        if (!center) return null;
        const overlayRotationDegrees = getOverlayRotationDegrees(hex, gridRadius);

        return (
          <g key={`${hex.column}:${hex.row}`}>
            <polygon className={s.previewFallback} points={points} transform={`translate(${center.x} ${center.y})`} />
            {clippedLayers.map(layer => layer.url ? (
              <image
                key={layer.id}
                href={layer.url}
                x={center.x - (width * layer.zoom / 100) / 2}
                y={center.y - (height * layer.zoom / 100) / 2}
                width={width * layer.zoom / 100}
                height={height * layer.zoom / 100}
                preserveAspectRatio={layer.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}
                clipPath={`url(#hex-background-lab-clip-${index})`}
                transform={layer.id === "overlay" ? `rotate(${overlayRotationDegrees} ${center.x} ${center.y})` : undefined}
              >
                <title>{layer.label}</title>
              </image>
            ) : null)}
          </g>
        );
      })}
      {objectLayer?.url && hexes.map((hex, index) => {
        const center = centers[index];
        if (!center) return null;

        return (
          <image
            key={`object:${hex.column}:${hex.row}`}
            href={objectLayer.url}
            x={center.x - (width * objectLayer.zoom / 100) / 2}
            y={center.y - (height * objectLayer.zoom / 100) / 2}
            width={width * objectLayer.zoom / 100}
            height={height * objectLayer.zoom / 100}
            preserveAspectRatio="xMidYMid meet"
          >
            <title>{objectLayer.label}</title>
          </image>
        );
      })}
    </svg>
  );
}

function getHexGridCoordinates(gridRadius: number): HexCoordinate[] {
  const coordinates: HexCoordinate[] = [];

  for (let column = -gridRadius; column <= gridRadius; column++) {
    const minRow = Math.max(-gridRadius, -column - gridRadius);
    const maxRow = Math.min(gridRadius, -column + gridRadius);

    for (let row = minRow; row <= maxRow; row++) {
      coordinates.push({column, row});
    }
  }

  return coordinates;
}

function axialCoordinateToPixelPosition(hex: HexCoordinate, radius: number) {
  return {
    x: Math.sqrt(3) * radius * (hex.column + hex.row / 2),
    y: radius * 1.5 * hex.row,
  };
}

function getOverlayRotationDegrees(hex: HexCoordinate, gridRadius: number) {
  if (gridRadius <= 0) return 0;

  const hash = Math.abs((hex.column * 73856093) ^ (hex.row * 19349663));
  return (hash % 6) * 60;
}

function getLayerFallbackLabel(layerId: LayerId, background: CityHexBackgroundSprite | undefined) {
  if (layerId === "background") return background ? formatSpriteLabel(background) : "No background";

  return "No image";
}

function formatSpriteLabel(sprite: CityHexBackgroundSprite) {
  return `${formatLabel(sprite.type)} / ${formatLabel(sprite.biome)} / ${formatLabel(sprite.vector)} / ${sprite.id.split(".").at(-1) ?? sprite.id}`;
}

function formatLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}
