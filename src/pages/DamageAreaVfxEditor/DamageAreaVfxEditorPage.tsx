import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  BATTLE_DAMAGE_AREA_VFX_ASSETS,
  BATTLE_DAMAGE_AREA_VFX_DEFINITION_DATA,
  BATTLE_DAMAGE_AREA_VFX_DEFINITIONS,
} from "../../data/battleDamageAreaVfx.ts";
import type { DamageAreaVfxDefinitionData, DamageAreaVfxDisplayType } from "../../models/battle/damageAreaVfx.ts";
import * as s from "./DamageAreaVfxEditorPage.css.ts";

const localDataServerUrl = "http://127.0.0.1:4317";
const circularTileBaseSpriteSize = 96;

type UploadState = {
  fileStem: string;
  file: File | null;
};

export default function DamageAreaVfxEditorPage() {
  const [upload, setUpload] = useState<UploadState>({
    fileStem: "",
    file: null,
  });
  const [selectedAssetId, setSelectedAssetId] = useState(BATTLE_DAMAGE_AREA_VFX_ASSETS[0]?.id ?? "");
  const [selectedDefinitionId, setSelectedDefinitionId] = useState(BATTLE_DAMAGE_AREA_VFX_DEFINITION_DATA[0]?.id ?? "");
  const [requiredDamageKeywords, setRequiredDamageKeywords] = useState(
    BATTLE_DAMAGE_AREA_VFX_DEFINITION_DATA[0]?.requiredDamageKeywords.join(", ") ?? "",
  );
  const [previewAlpha, setPreviewAlpha] = useState(0.42);
  const [previewSize, setPreviewSize] = useState(220);
  const [previewDisplayType, setPreviewDisplayType] = useState<DamageAreaVfxDisplayType>("tile");
  const [previewInitialRotationDegrees, setPreviewInitialRotationDegrees] = useState(0);
  const [previewAngleDegrees, setPreviewAngleDegrees] = useState(90);
  const [previewLengthToRepeat, setPreviewLengthToRepeat] = useState(96);
  const [previewSpriteZoom, setPreviewSpriteZoom] = useState(1);
  const [tickPulseDurationSeconds, setTickPulseDurationSeconds] = useState(0.35);
  const [tickPulseStartScale, setTickPulseStartScale] = useState(0.72);
  const [tickPulseSpeed, setTickPulseSpeed] = useState(4);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingMapping, setIsSavingMapping] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draftPreviewSrc, setDraftPreviewSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!upload.file) {
      setDraftPreviewSrc(null);
      return;
    }

    const objectUrl = URL.createObjectURL(upload.file);
    setDraftPreviewSrc(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [upload.file]);

  const selectedAsset = useMemo(() => (
    BATTLE_DAMAGE_AREA_VFX_ASSETS.find(asset => asset.id === selectedAssetId) ?? BATTLE_DAMAGE_AREA_VFX_ASSETS[0]
  ), [selectedAssetId]);
  const selectedDefinition = useMemo(() => (
    BATTLE_DAMAGE_AREA_VFX_DEFINITION_DATA.find(definition => definition.id === selectedDefinitionId)
      ?? BATTLE_DAMAGE_AREA_VFX_DEFINITION_DATA[0]
  ), [selectedDefinitionId]);
  const previewSrc = draftPreviewSrc ?? selectedAsset?.src;
  const circularPreviewPieces = useMemo(() => {
    const radius = previewSize / 2;
    const count = Math.max(3, Math.ceil(Math.PI * 2 * radius / Math.max(8, previewLengthToRepeat)));
    const initialRotation = degreesToRadians(previewInitialRotationDegrees);
    const angle = degreesToRadians(previewAngleDegrees);

    return Array.from({length: count}, (_, index) => {
      const theta = initialRotation + index * Math.PI * 2 / count;

      return {
        x: Math.cos(theta) * radius,
        y: Math.sin(theta) * radius,
        rotation: theta + angle,
      };
    });
  }, [previewAngleDegrees, previewInitialRotationDegrees, previewLengthToRepeat, previewSize]);

  useEffect(() => {
    if (!selectedDefinition) return;

    const asset = BATTLE_DAMAGE_AREA_VFX_ASSETS.find(option => option.fileStem === selectedDefinition.assetFileStem);
    setSelectedAssetId(asset?.id ?? BATTLE_DAMAGE_AREA_VFX_ASSETS[0]?.id ?? "");
    setRequiredDamageKeywords(selectedDefinition.requiredDamageKeywords.join(", "));
    setPreviewAlpha(selectedDefinition.alpha);
    setPreviewDisplayType(selectedDefinition.display.type);
    setPreviewInitialRotationDegrees(radiansToDegrees(selectedDefinition.display.initialRotationRadians ?? 0));
    setPreviewAngleDegrees(radiansToDegrees(selectedDefinition.display.angleRadians ?? 0));
    setPreviewLengthToRepeat(selectedDefinition.display.lengthToRepeat ?? 96);
    setPreviewSpriteZoom(selectedDefinition.display.spriteZoom ?? 1);
    setTickPulseDurationSeconds(selectedDefinition.tickPulse?.durationSeconds ?? 0.35);
    setTickPulseStartScale(selectedDefinition.tickPulse?.startScale ?? 0.72);
    setTickPulseSpeed(selectedDefinition.tickPulse?.pulseSpeed ?? 4);
  }, [selectedDefinition]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUpload(current => ({
      ...current,
      file,
      fileStem: current.fileStem || normalizeFileStem(file?.name ?? ""),
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!upload.file) {
      setError("Choose a PNG file first.");
      return;
    }

    if (upload.file.type !== "image/png") {
      setError("Only PNG files are supported.");
      return;
    }

    const fileStem = normalizeFileStem(upload.fileStem);
    if (!fileStem) {
      setError("File stem must contain letters, numbers, underscores, or hyphens.");
      return;
    }

    const formData = new FormData();
    formData.set("fileStem", fileStem);
    formData.set("image", upload.file);

    setIsSaving(true);
    try {
      const response = await fetch(`${localDataServerUrl}/battle-effect-sprites`, {
        method: "POST",
        body: formData,
      });
      const responseBody = await response.json().catch(() => undefined) as {error?: string; file?: string} | undefined;

      if (!response.ok) {
        throw new Error(responseBody?.error ?? `Upload failed with status ${response.status}.`);
      }

      setStatus(`Saved ${responseBody?.file ?? fileStem}. Refresh the page if it does not appear in the asset list.`);
      setUpload({ fileStem: "", file: null });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Upload failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMapping = async () => {
    setError(null);
    setStatus(null);

    if (!selectedDefinition || !selectedAsset) {
      setError("Choose a mapping and sprite first.");
      return;
    }

    const keywords = parseKeywords(requiredDamageKeywords);
    if (keywords.length === 0) {
      setError("Add at least one required damage keyword.");
      return;
    }

    const definition: DamageAreaVfxDefinitionData = {
      ...selectedDefinition,
      requiredDamageKeywords: keywords,
      textureAlias: selectedDefinition.textureAlias || `battle.damageArea.${selectedDefinition.id}`,
      assetFileStem: selectedAsset.fileStem,
      alpha: previewAlpha,
      display: {
        type: previewDisplayType,
        initialRotationRadians: degreesToRadians(previewInitialRotationDegrees),
        angleRadians: degreesToRadians(previewAngleDegrees),
        lengthToRepeat: previewLengthToRepeat,
        spriteZoom: previewSpriteZoom,
      },
      tickPulse: {
        durationSeconds: tickPulseDurationSeconds,
        startScale: tickPulseStartScale,
        pulseSpeed: tickPulseSpeed,
      },
    };

    setIsSavingMapping(true);
    try {
      const response = await fetch(`${localDataServerUrl}/battle-damage-area-vfx`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({definition}),
      });
      const responseBody = await response.json().catch(() => undefined) as {error?: string; file?: string; action?: string} | undefined;

      if (!response.ok) {
        throw new Error(responseBody?.error ?? `Save failed with status ${response.status}.`);
      }

      setStatus(`${responseBody?.action ?? "saved"} ${definition.label}. Refresh the page for Vite to reload the mapping.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Save failed.");
    } finally {
      setIsSavingMapping(false);
    }
  };

  return (
    <div className={s.page}>
      <aside className={s.panel}>
        <div className={s.header}>
          <h1 className={s.title}>Damage Area VFX</h1>
          <p className={s.subtitle}>Preview and upload battle-area effect textures.</p>
        </div>

        <form className={s.form} onSubmit={handleSubmit}>
          <label className={s.field}>
            <span className={s.label}>File stem</span>
            <input
              className={s.input}
              value={upload.fileStem}
              onChange={event => setUpload(current => ({...current, fileStem: event.target.value}))}
              placeholder="toxic-cloud"
            />
          </label>

          <label className={s.field}>
            <span className={s.label}>PNG file</span>
            <input className={s.input} type="file" accept="image/png" onChange={handleFileChange} />
          </label>

          <button className={s.button} type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Upload"}
          </button>
          {status && <p className={s.status}>{status}</p>}
          {error && <p className={s.error}>{error}</p>}
        </form>

        <div className={s.header}>
          <h2 className={s.title}>Preview Controls</h2>
        </div>
        <label className={s.field}>
          <span className={s.label}>Mapping</span>
          <select
            className={s.input}
            value={selectedDefinition?.id ?? ""}
            onChange={event => setSelectedDefinitionId(event.target.value)}
          >
            {BATTLE_DAMAGE_AREA_VFX_DEFINITION_DATA.map(definition => (
              <option key={definition.id} value={definition.id}>{definition.label}</option>
            ))}
          </select>
        </label>
        <label className={s.field}>
          <span className={s.label}>Registered asset</span>
          <select
            className={s.input}
            value={selectedAsset?.id ?? ""}
            onChange={event => setSelectedAssetId(event.target.value)}
          >
            {BATTLE_DAMAGE_AREA_VFX_ASSETS.map(asset => (
              <option key={asset.id} value={asset.id}>{asset.label}</option>
            ))}
          </select>
        </label>
        <label className={s.field}>
          <span className={s.label}>Damage keywords</span>
          <input
            className={s.input}
            value={requiredDamageKeywords}
            onChange={event => setRequiredDamageKeywords(event.target.value)}
            placeholder="damage.poison"
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Alpha</span>
          <input
            className={s.input}
            type="number"
            min="0.05"
            max="1"
            step="0.01"
            value={previewAlpha}
            onChange={event => setPreviewAlpha(clamp(Number(event.target.value), 0.05, 1))}
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Display type</span>
          <select
            className={s.input}
            value={previewDisplayType}
            onChange={event => setPreviewDisplayType(event.target.value as DamageAreaVfxDisplayType)}
          >
            <option value="tile">Tile</option>
            <option value="circularTile">Circular tile</option>
            <option value="centered">Centered</option>
          </select>
        </label>
        <label className={s.field}>
          <span className={s.label}>Circle size</span>
          <input
            className={s.input}
            type="number"
            min="120"
            max="420"
            step="10"
            value={previewSize}
            onChange={event => setPreviewSize(clamp(Number(event.target.value), 120, 420))}
          />
        </label>
        <div className={s.fieldGrid}>
          <label className={s.field}>
            <span className={s.label}>Initial rotation</span>
            <input
              className={s.input}
              type="number"
              step="1"
              value={previewInitialRotationDegrees}
              onChange={event => setPreviewInitialRotationDegrees(Number(event.target.value) || 0)}
            />
          </label>
          <label className={s.field}>
            <span className={s.label}>Angle</span>
            <input
              className={s.input}
              type="number"
              step="1"
              value={previewAngleDegrees}
              onChange={event => setPreviewAngleDegrees(Number(event.target.value) || 0)}
            />
          </label>
        </div>
        <label className={s.field}>
          <span className={s.label}>Length to repeat</span>
          <input
            className={s.input}
            type="number"
            min="8"
            max="240"
            step="4"
            value={previewLengthToRepeat}
            onChange={event => setPreviewLengthToRepeat(clamp(Number(event.target.value), 8, 240))}
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Sprite zoom</span>
          <input
            className={s.input}
            type="number"
            min="0.1"
            max="4"
            step="0.05"
            value={previewSpriteZoom}
            onChange={event => setPreviewSpriteZoom(clamp(Number(event.target.value), 0.1, 4))}
          />
        </label>
        <div className={s.header}>
          <h2 className={s.title}>Tick Pulse</h2>
        </div>
        <label className={s.field}>
          <span className={s.label}>Fade seconds</span>
          <input
            className={s.input}
            type="number"
            min="0.05"
            max="2"
            step="0.05"
            value={tickPulseDurationSeconds}
            onChange={event => setTickPulseDurationSeconds(clamp(Number(event.target.value), 0.05, 2))}
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Pulse speed</span>
          <input
            className={s.input}
            type="number"
            min="0.1"
            max="20"
            step="0.1"
            value={tickPulseSpeed}
            onChange={event => setTickPulseSpeed(clamp(Number(event.target.value), 0.1, 20))}
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Start scale</span>
          <input
            className={s.input}
            type="number"
            min="0.05"
            max="2"
            step="0.05"
            value={tickPulseStartScale}
            onChange={event => setTickPulseStartScale(clamp(Number(event.target.value), 0.05, 2))}
          />
        </label>
        <button className={s.button} type="button" disabled={isSavingMapping} onClick={handleSaveMapping}>
          {isSavingMapping ? "Saving mapping..." : "Save Mapping"}
        </button>
      </aside>

      <main className={s.panel}>
        <div className={s.header}>
          <h2 className={s.title}>Tile Preview</h2>
          <p className={s.subtitle}>The battle renderer clips the texture to each active damage area.</p>
        </div>
        <div className={s.previewStage}>
          {previewSrc ? (
            <PreviewShape
              src={previewSrc}
              alpha={previewAlpha}
              size={previewSize}
              displayType={previewDisplayType}
              pieces={circularPreviewPieces}
              spriteZoom={previewSpriteZoom}
            />
          ) : (
            <div className={s.empty}>No battle effect sprites found.</div>
          )}
        </div>

        <div className={s.grid}>
          <section className={s.innerPanel}>
            <h2 className={s.title}>Runtime mappings</h2>
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.headCell}>VFX</th>
                    <th className={s.headCell}>Damage keywords</th>
                    <th className={s.headCell}>Texture alias</th>
                    <th className={s.headCell}>Display</th>
                    <th className={s.headCell}>Rotation</th>
                    <th className={s.headCell}>Angle</th>
                    <th className={s.headCell}>Repeat</th>
                    <th className={s.headCell}>Zoom</th>
                    <th className={s.headCell}>Alpha</th>
                  </tr>
                </thead>
                <tbody>
                  {BATTLE_DAMAGE_AREA_VFX_DEFINITIONS.map(definition => (
                    <tr key={definition.id}>
                      <td className={s.cell}>{definition.label}</td>
                      <td className={`${s.cell} ${s.mono}`}>{definition.requiredDamageKeywords.join(", ")}</td>
                      <td className={`${s.cell} ${s.mono}`}>{definition.textureAlias}</td>
                      <td className={s.cell}>{formatDisplayType(definition.display.type)}</td>
                      <td className={s.cell}>{radiansToDegrees(definition.display.initialRotationRadians ?? 0)} deg</td>
                      <td className={s.cell}>{radiansToDegrees(definition.display.angleRadians ?? 0)} deg</td>
                      <td className={s.cell}>{definition.display.lengthToRepeat ?? "-"}</td>
                      <td className={s.cell}>{definition.display.spriteZoom ?? 1}</td>
                      <td className={s.cell}>{definition.alpha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={s.innerPanel}>
            <h2 className={s.title}>Loaded sprites</h2>
            <div className={s.assetGrid}>
              {BATTLE_DAMAGE_AREA_VFX_ASSETS.map(asset => (
                <button
                  key={asset.id}
                  className={asset.id === selectedAsset?.id ? s.assetButtonSelected : s.assetButton}
                  type="button"
                  onClick={() => setSelectedAssetId(asset.id)}
                >
                  <img className={s.thumbnail} src={asset.src} alt="" />
                  <span className={s.assetLabel}>{asset.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function PreviewShape({
  src,
  alpha,
  size,
  displayType,
  pieces,
  spriteZoom,
}: {
  src: string;
  alpha: number;
  size: number;
  displayType: DamageAreaVfxDisplayType;
  pieces: {x: number; y: number; rotation: number}[];
  spriteZoom: number;
}) {
  if (displayType === "centered") {
    return (
      <div className={s.previewCircleFrame} style={{width: size, height: size}}>
        <img
          className={s.previewCentered}
          src={src}
          alt=""
          style={{opacity: alpha}}
        />
      </div>
    );
  }

  if (displayType === "circularTile") {
    const spriteSize = circularTileBaseSpriteSize * spriteZoom;

    return (
      <div className={s.previewCircularTile} style={{width: size, height: size, opacity: alpha}}>
        {pieces.map((piece, index) => (
          <img
            key={index}
            className={s.previewCircularTilePiece}
            src={src}
            alt=""
            style={{
              width: spriteSize,
              height: spriteSize,
              transform: `translate(calc(-50% + ${piece.x}px), calc(-50% + ${piece.y}px)) rotate(${piece.rotation}rad)`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={s.previewCircle}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${src})`,
        opacity: alpha,
      }}
    />
  );
}

function normalizeFileStem(value: string): string {
  return value
    .replace(/\.[^.]+$/u, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9_-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
}

function parseKeywords(value: string): string[] {
  return Array.from(new Set(
    value
      .split(",")
      .map(keyword => keyword.trim())
      .filter(Boolean)
  ));
}

function clamp(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min;

  return Math.max(min, Math.min(value, max));
}

function degreesToRadians(value: number) {
  return value * Math.PI / 180;
}

function radiansToDegrees(value: number) {
  return Math.round(value * 180 / Math.PI);
}

function formatDisplayType(value: DamageAreaVfxDisplayType) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, letter => letter.toUpperCase());
}
