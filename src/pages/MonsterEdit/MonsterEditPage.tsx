import {useEffect, useMemo, useState, type ChangeEvent, type DragEvent} from "react";
import {useParams} from "react-router-dom";
import wastelandEnemyDefinitions from "../../data/enemies/wasteland.json";
import {
  ENEMY_VISUAL_ASSETS,
  ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY,
  type EnemyVisualAsset,
} from "../../data/enemies/visuals.ts";
import type {EnemyKind} from "../../models/battle/enemy.ts";
import type {EnemyVisualMetadata} from "../../models/battle/enemyVisualMetadata.ts";
import {SpriteHexPreview} from "../../components/SpriteHexPreview.tsx";
import * as s from "../EntityCreate/EntityCreatePage.css.ts";

type MonsterRegion = "wasteland";
type MonsterMovementKind = "wallboundWobble" | "straight" | "randomLines" | "blink";

type MonsterMovementDefinition = {
  kind: MonsterMovementKind;
  speedHexRadiusPerSecond: number;
  wobbleAmplitudeHexRadius?: number;
  sameTrajectoryTimeSeconds?: number;
};

type MonsterDefinition = {
  id: string;
  displayName: string;
  minimumCityVisibilityThreshold?: number;
  strengthCost: number;
  selectionWeight?: number;
  kind: EnemyKind;
  pressure: number;
  maxHitPoints: number;
  armor: number;
  hitRadius: number;
  shotDistance?: number;
  keywords: string[];
  sprite: {
    textureKey: string;
  };
  swarmSize?: number;
  swarmSizeMax?: number;
  movement: MonsterMovementDefinition;
};

type SaveStatus = {
  kind: "idle" | "saving" | "success" | "error";
  message: string;
};

type MonsterForm = {
  region: MonsterRegion;
  itemName: string;
  displayName: string;
  minimumCityVisibilityThreshold: string;
  strengthCost: string;
  selectionWeight: string;
  kind: EnemyKind;
  pressure: string;
  maxHitPoints: string;
  armor: string;
  hitRadius: string;
  shotDistance: string;
  keywords: string;
  textureKey: string;
  sourceSpriteWidth: string;
  sourceSpriteHeight: string;
  spriteZoom: string;
  rotationDegrees: string;
  swarmSize: string;
  swarmSizeMax: string;
  movementKind: MonsterMovementKind;
  speedHexRadiusPerSecond: string;
  wobbleAmplitudeHexRadius: string;
  sameTrajectoryTimeSeconds: string;
};

type SpriteDraft = {
  file: File;
  previewUrl: string;
};

const localDataServerUrl = "http://127.0.0.1:4317";
const rawDefinitionsByRegion: Record<MonsterRegion, readonly MonsterDefinition[]> = {
  wasteland: wastelandEnemyDefinitions as readonly MonsterDefinition[],
};
const regionOptions = Object.keys(rawDefinitionsByRegion) as MonsterRegion[];
const movementKindOptions = [
  {value: "wallboundWobble", label: "Wallbound wobble"},
  {value: "straight", label: "Straight"},
  {value: "randomLines", label: "Random lines"},
  {value: "blink", label: "Blink"},
] as const satisfies readonly {value: MonsterMovementKind; label: string}[];

export default function MonsterEditPage() {
  const {monsterId = "new"} = useParams<{monsterId: string}>();
  const loadedMonster = useMemo(() => monsterId === "new" ? null : findStoredMonster(monsterId), [monsterId]);
  const [form, setForm] = useState<MonsterForm>(() => createInitialForm(monsterId, loadedMonster));
  const [spriteDraft, setSpriteDraft] = useState<SpriteDraft | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({kind: "idle", message: ""});
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  const generatedId = `enemies.${form.region}.${normalizeIdPart(form.itemName)}`;
  const generatedTextureKey = getMonsterTextureKey(generatedId);
  const effectiveTextureKey = spriteDraft ? generatedTextureKey : form.textureKey.trim();
  const selectedVisualAsset = effectiveTextureKey ? ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY[effectiveTextureKey] : undefined;
  const visualMetadata = useMemo(() => createEnemyVisualMetadata(form, selectedVisualAsset?.metadata), [form, selectedVisualAsset?.metadata]);
  const visualAssetOptions = useMemo(
    () => ENEMY_VISUAL_ASSETS.filter(asset => asset.region === form.region),
    [form.region],
  );
  const monsterPreview = useMemo(
    () => createPreview(form, generatedId, loadedMonster, effectiveTextureKey),
    [effectiveTextureKey, form, generatedId, loadedMonster],
  );
  const jsonPreview = useMemo(() => JSON.stringify(monsterPreview, null, 2), [monsterPreview]);

  useEffect(() => {
    setSpriteDraft(currentDraft => {
      if (currentDraft) URL.revokeObjectURL(currentDraft.previewUrl);
      return null;
    });
    setForm(createInitialForm(monsterId, loadedMonster));
    setSaveStatus({kind: "idle", message: ""});
  }, [loadedMonster, monsterId]);

  useEffect(() => () => {
    if (spriteDraft) URL.revokeObjectURL(spriteDraft.previewUrl);
  }, [spriteDraft]);

  useEffect(() => {
    if (!selectedVisualAsset?.src || form.sourceSpriteWidth.trim() || form.sourceSpriteHeight.trim()) return;

    let cancelled = false;
    readImageSize(selectedVisualAsset.src).then(sourceSpriteSize => {
      if (cancelled) return;
      setForm(current => ({
        ...current,
        ...createMetadataFormFields({
          ...selectedVisualAsset.metadata,
          sourceSpriteSize,
          targetSpriteSize: selectedVisualAsset.metadata?.targetSpriteSize ?? fitSpriteSize(sourceSpriteSize, 48, 48),
        }),
      }));
    }).catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [form.sourceSpriteHeight, form.sourceSpriteWidth, selectedVisualAsset]);

  function updateForm<Key extends keyof MonsterForm>(key: Key, value: MonsterForm[Key]) {
    setForm(current => ({...current, [key]: value}));
    setSaveStatus({kind: "idle", message: ""});
  }

  async function saveMonster() {
    setSaveStatus({kind: "saving", message: "Saving monster..."});

    try {
      const spriteResult = spriteDraft
        ? await saveMonsterSprite({
          region: form.region,
          textureKey: generatedTextureKey,
          previousTextureKey: form.textureKey.trim() || undefined,
          spriteDraft,
          metadata: visualMetadata,
        })
        : undefined;
      const metadataResult = effectiveTextureKey
        ? await saveMonsterSpriteMetadata({
          region: form.region,
          textureKey: effectiveTextureKey,
          metadata: visualMetadata,
        })
        : undefined;
      const previewToSave = createPreview(form, generatedId, loadedMonster, effectiveTextureKey);
      const response = await fetch(`${localDataServerUrl}/entities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({entity: previewToSave}),
      });
      const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

      if (!response.ok) {
        throw new Error(responseBody?.error ?? "Monster could not be saved");
      }

      setSaveStatus({
        kind: "success",
        message: [
          `${responseBody?.action ?? "saved"} in ${responseBody?.file ?? "data file"}`,
          spriteResult?.action ? `sprite ${spriteResult.action}` : "",
          metadataResult?.file ? `metadata saved in ${metadataResult.file}` : "",
        ].filter(Boolean).join("; "),
      });
      if (spriteDraft) URL.revokeObjectURL(spriteDraft.previewUrl);
      setSpriteDraft(null);
      setForm(current => ({...current, textureKey: effectiveTextureKey}));
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message: error instanceof Error
          ? error.message
          : "Could not reach local data server at http://127.0.0.1:4317.",
      });
    }
  }

  function selectVisualAsset(textureKey: string) {
    if (spriteDraft) URL.revokeObjectURL(spriteDraft.previewUrl);
    setSpriteDraft(null);
    setForm(current => ({
      ...current,
      textureKey,
      ...createMetadataFormFields(ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY[textureKey]?.metadata),
    }));
    setSaveStatus({kind: "idle", message: ""});
  }

  function removeSprite() {
    if (spriteDraft) {
      URL.revokeObjectURL(spriteDraft.previewUrl);
      setSpriteDraft(null);
      return;
    }

    updateForm("textureKey", "");
  }

  async function setSpriteFile(file: File) {
    if (file.type !== "image/png") {
      setSaveStatus({kind: "error", message: "Sprites must be PNG files."});
      return;
    }

    if (spriteDraft) URL.revokeObjectURL(spriteDraft.previewUrl);
    const previewUrl = URL.createObjectURL(file);

    setSpriteDraft({
      file,
      previewUrl,
    });
    setSaveStatus({kind: "idle", message: ""});

    try {
      const sourceSpriteSize = await readImageSize(previewUrl);
      setForm(current => ({
        ...current,
        ...createMetadataFormFields({
          sourceSpriteSize,
          targetSpriteSize: fitSpriteSize(sourceSpriteSize, 48, 48),
          rotationDegrees: -90,
        }),
      }));
    } catch {
      setSaveStatus({kind: "error", message: "Sprite preview could not be measured."});
    }
  }

  return (
    <section className={s.page}>
      <div className={s.formPanel}>
        <header className={s.header}>
          <h1 className={s.title}>{loadedMonster ? `Edit ${monsterId}` : "Create monster"}</h1>
          {monsterId !== "new" && !loadedMonster && (
            <p className={s.subtitle}>No stored monster found for {monsterId}; using the id as a draft.</p>
          )}
        </header>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Identity</h2>
          </div>
          <div className={s.grid}>
            <label className={s.field}>
              <span className={s.label}>Region</span>
              <SearchableSelect
                value={form.region}
                options={regionOptions.map(region => ({value: region, label: region}))}
                placeholder="Search regions"
                onChange={value => updateForm("region", value as MonsterRegion)}
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>Kind</span>
              <SearchableSelect
                value={form.kind}
                options={[
                  {value: "melee", label: "melee"},
                  {value: "ranged", label: "ranged"},
                ]}
                placeholder="Search kinds"
                onChange={value => updateForm("kind", value as EnemyKind)}
              />
            </label>
            <label className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>Item name id part</span>
              <input className={s.input} value={form.itemName} onChange={event => updateForm("itemName", event.target.value)} />
            </label>
            <div className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>Generated id</span>
              <div className={s.idPreview}>{generatedId}</div>
            </div>
            <label className={s.field}>
              <span className={s.label}>Display name</span>
              <input className={s.input} value={form.displayName} onChange={event => updateForm("displayName", event.target.value)} />
            </label>
            <label className={s.field}>
              <span className={s.label}>Sprite texture key</span>
              <input className={s.input} value={effectiveTextureKey} onChange={event => updateForm("textureKey", event.target.value)} />
            </label>
            <label className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>Keywords</span>
              <input className={s.input} value={form.keywords} onChange={event => updateForm("keywords", event.target.value)} placeholder="small, swarm" />
            </label>
          </div>
        </section>

        <MonsterVisualAssetField
          options={visualAssetOptions}
          selectedAsset={selectedVisualAsset}
          value={effectiveTextureKey}
          draft={spriteDraft}
          onChange={selectVisualAsset}
          onDropFile={setSpriteFile}
          onRemove={removeSprite}
          metadata={visualMetadata}
        />

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Visual Tuning</h2>
          </div>
          <div className={s.grid}>
            <label className={s.field}>
              <span className={s.label}>Rotation</span>
              <div className={s.buttonGroup}>
                <button className={s.button} type="button" onClick={() => updateForm("rotationDegrees", String((parseNumberOrFallback(form.rotationDegrees, 0) + 270) % 360))}>-90</button>
                <button className={s.button} type="button" onClick={() => updateForm("rotationDegrees", "0")}>0</button>
                <button className={s.button} type="button" onClick={() => updateForm("rotationDegrees", String((parseNumberOrFallback(form.rotationDegrees, 0) + 90) % 360))}>+90</button>
              </div>
            </label>
            <NumberField label="Rotation degrees" value={form.rotationDegrees} onChange={value => updateForm("rotationDegrees", value)} />
            <NumberField label="Sprite zoom" value={form.spriteZoom} step="0.001" onChange={value => updateForm("spriteZoom", value)} />
            <label className={s.field}>
              <span className={s.label}>Source size</span>
              <span className={s.pairedFields}>
                <input className={s.input} readOnly value={form.sourceSpriteWidth} />
                <input className={s.input} readOnly value={form.sourceSpriteHeight} />
              </span>
            </label>
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Spawn</h2>
          </div>
          <div className={s.grid}>
            <NumberField label="Minimum city visibility threshold" value={form.minimumCityVisibilityThreshold} onChange={value => updateForm("minimumCityVisibilityThreshold", value)} />
            <NumberField label="Strength cost" value={form.strengthCost} onChange={value => updateForm("strengthCost", value)} />
            <NumberField label="Selection weight" value={form.selectionWeight} onChange={value => updateForm("selectionWeight", value)} />
            <NumberField label="Swarm size min" value={form.swarmSize} onChange={value => updateForm("swarmSize", value)} />
            <NumberField label="Swarm size max" value={form.swarmSizeMax} onChange={value => updateForm("swarmSizeMax", value)} />
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Battle Stats</h2>
          </div>
          <div className={s.grid}>
            <NumberField label="Pressure" value={form.pressure} onChange={value => updateForm("pressure", value)} />
            <NumberField label="Hit points" value={form.maxHitPoints} onChange={value => updateForm("maxHitPoints", value)} />
            <NumberField label="Armor" value={form.armor} onChange={value => updateForm("armor", value)} />
            <NumberField label="Hit radius (hexR)" value={form.hitRadius} onChange={value => updateForm("hitRadius", value)} />
            {form.kind === "ranged" && (
              <NumberField label="Shot distance (hexR)" value={form.shotDistance} onChange={value => updateForm("shotDistance", value)} />
            )}
          </div>
        </section>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Movement</h2>
          </div>
          <div className={s.grid}>
            <label className={s.field}>
              <span className={s.label}>Movement type</span>
              <SearchableSelect
                value={form.movementKind}
                options={movementKindOptions}
                placeholder="Search movement"
                onChange={value => updateForm("movementKind", value as MonsterMovementKind)}
              />
            </label>
            <NumberField label="Speed (hexR/s)" value={form.speedHexRadiusPerSecond} onChange={value => updateForm("speedHexRadiusPerSecond", value)} />
            <NumberField label="Wobble amplitude (hexR)" value={form.wobbleAmplitudeHexRadius} onChange={value => updateForm("wobbleAmplitudeHexRadius", value)} />
            {form.movementKind === "randomLines" && (
              <NumberField label="Same trajectory time seconds" value={form.sameTrajectoryTimeSeconds} onChange={value => updateForm("sameTrajectoryTimeSeconds", value)} />
            )}
          </div>
        </section>

        <section className={s.previewPanel}>
          <button className={s.previewToggle} type="button" onClick={() => setIsPreviewOpen(open => !open)}>
            {isPreviewOpen ? "Hide JSON preview" : "Show JSON preview"}
          </button>
          {isPreviewOpen && <pre className={s.preview}>{jsonPreview}</pre>}
        </section>

        <div className={s.saveRow}>
          <button className={s.primaryButton} type="button" disabled={saveStatus.kind === "saving"} onClick={saveMonster}>
            {saveStatus.kind === "saving" ? "Saving..." : "Save"}
          </button>
          {saveStatus.message && (
            <span className={saveStatus.kind === "error" ? s.errorText : s.statusText}>{saveStatus.message}</span>
          )}
        </div>
      </div>
    </section>
  );
}

function NumberField({
  label,
  value,
  step,
  onChange,
}: {
  label: string;
  value: string;
  step?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={s.field}>
      <span className={s.label}>{label}</span>
      <input className={s.input} type="number" step={step} value={value} onChange={event => onChange(event.target.value)} />
    </label>
  );
}

function SearchableSelect(props: {
  value: string;
  options: readonly {value: string; label: string}[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = props.options.find(option => option.value === props.value);
  const visibleOptions = props.options
    .filter(option => `${option.label} ${option.value}`.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 16);

  return (
    <div className={s.multiSelect}>
      {selected && (
        <div className={s.chipList}>
          <span className={s.chip}>{selected.label}</span>
        </div>
      )}
      <input
        className={s.multiSearch}
        value={query}
        onChange={event => setQuery(event.target.value)}
        placeholder={selected ? selected.label : props.placeholder}
      />
      {visibleOptions.length > 0 && (
        <div className={s.optionList}>
          {visibleOptions.map(option => (
            <button
              key={option.value}
              className={s.option}
              type="button"
              onClick={() => {
                props.onChange(option.value);
                setQuery("");
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function MonsterVisualAssetField(props: {
  options: readonly EnemyVisualAsset[];
  selectedAsset: EnemyVisualAsset | undefined;
  value: string;
  draft: SpriteDraft | null;
  onChange: (value: string) => void;
  onDropFile: (file: File) => void;
  onRemove: () => void;
  metadata: EnemyVisualMetadata;
}) {
  const [query, setQuery] = useState("");
  const previewSrc = props.draft?.previewUrl ?? props.selectedAsset?.src;
  const previewLabel = props.draft?.file.name ?? props.selectedAsset?.label ?? props.value;
  const visibleOptions = props.options
    .filter(option => `${option.label} ${option.textureKey}`.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 16);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) props.onDropFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <section className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Visual Asset</h2>
      </div>
      <div className={s.visualAssetGrid}>
        <div className={s.field}>
          <span className={s.label}>Image</span>
          {previewSrc ? (
            <div
              className={s.spriteCard}
              onDragOver={event => event.preventDefault()}
              onDrop={event => {
                event.preventDefault();
                handleFiles(event.dataTransfer.files);
              }}
            >
              <img className={s.spriteThumb} src={previewSrc} alt={previewLabel} />
              <button className={s.spriteRemoveButton} type="button" onClick={props.onRemove} title="Remove sprite">x</button>
              <span className={s.spriteCaption}>{props.draft ? "Pending replacement" : props.value}</span>
              <label className={s.spriteReplaceButton}>
                Replace
                <input className={s.fileInput} type="file" accept="image/png" onChange={onFileChange} />
              </label>
            </div>
          ) : (
            <label
              className={s.spriteDropZone}
              onDragOver={event => event.preventDefault()}
              onDrop={onDrop}
            >
              <input className={s.fileInput} type="file" accept="image/png" onChange={onFileChange} />
              <span className={s.spriteDropTitle}>Drop PNG sprite</span>
              <span className={s.hint}>or click to choose a file</span>
            </label>
          )}
          <div className={s.multiSelect}>
            <input
              className={s.multiSearch}
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search enemy sprites"
            />
            {visibleOptions.length > 0 && (
              <div className={s.optionList}>
                {visibleOptions.map(option => (
                  <button
                    key={option.textureKey}
                    className={s.option}
                    type="button"
                    onClick={() => {
                      props.onChange(option.textureKey);
                      setQuery("");
                    }}
                  >
                    {option.label} - {option.textureKey}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={s.visualPreviewBox}>
          {previewSrc ? (
            <SpriteHexPreview
              src={previewSrc}
              alt={previewLabel}
              imageStyle={{
                width: props.metadata.targetSpriteSize?.width,
                height: props.metadata.targetSpriteSize?.height,
                transform: `rotate(${props.metadata.rotationDegrees ?? 0}deg)`,
              }}
            />
          ) : (
            <p className={s.hint}>No sprite selected.</p>
          )}
          <pre className={s.visualMetadataPreview}>
            {JSON.stringify({
              textureKey: props.value,
              status: props.draft ? "pending upload" : props.selectedAsset ? props.selectedAsset.atlasSrc ? "registered animation" : "registered" : "missing asset",
              animationFrames: props.selectedAsset?.animationFrames,
              metadata: props.metadata,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}

function createInitialForm(monsterId: string, monster: MonsterDefinition | null): MonsterForm {
  const inferred = inferMonsterPartsFromId(monsterId);
  const source = monster ?? createDefaultMonster(inferred.region, inferred.itemName);

  return {
    region: inferred.region,
    itemName: inferred.itemName,
    displayName: source.displayName,
    minimumCityVisibilityThreshold: stringifyOptionalNumber(source.minimumCityVisibilityThreshold, "0"),
    strengthCost: String(source.strengthCost),
    selectionWeight: stringifyOptionalNumber(source.selectionWeight, ""),
    kind: source.kind,
    pressure: String(source.pressure),
    maxHitPoints: String(source.maxHitPoints),
    armor: String(source.armor),
    hitRadius: String(source.hitRadius),
    shotDistance: stringifyOptionalNumber(source.shotDistance, ""),
    keywords: source.keywords.join(", "),
    textureKey: source.sprite.textureKey,
    ...createMetadataFormFields(ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY[source.sprite.textureKey]?.metadata),
    swarmSize: stringifyOptionalNumber(source.swarmSize, ""),
    swarmSizeMax: stringifyOptionalNumber(source.swarmSizeMax, ""),
    movementKind: source.movement.kind,
    speedHexRadiusPerSecond: String(source.movement.speedHexRadiusPerSecond),
    wobbleAmplitudeHexRadius: stringifyOptionalNumber(source.movement.wobbleAmplitudeHexRadius, ""),
    sameTrajectoryTimeSeconds: stringifyOptionalNumber(
      source.movement.sameTrajectoryTimeSeconds,
      source.movement.kind === "randomLines" ? "1" : "",
    ),
  };
}

function createDefaultMonster(region: MonsterRegion, itemName: string): MonsterDefinition {
  const id = `enemies.${region}.${normalizeIdPart(itemName)}`;

  return {
    id,
    displayName: titleFromIdPart(id),
    minimumCityVisibilityThreshold: 0,
    strengthCost: 10,
    selectionWeight: 1,
    kind: "melee",
    pressure: 2,
    maxHitPoints: 4,
    armor: 0,
    hitRadius: 0.1875,
    keywords: [],
    sprite: {
      textureKey: `enemy_${camelToSnake(normalizeIdPart(itemName))}`,
    },
    movement: {
      kind: "wallboundWobble",
      speedHexRadiusPerSecond: 0.7031,
      wobbleAmplitudeHexRadius: 0.125,
    },
  };
}

function createPreview(
  form: MonsterForm,
  generatedId: string,
  baseDefinition: MonsterDefinition | null,
  effectiveTextureKey: string,
): MonsterDefinition {
  const preview: MonsterDefinition = {
    ...(baseDefinition ?? {}),
    id: generatedId,
    displayName: form.displayName.trim() || titleFromIdPart(generatedId),
    minimumCityVisibilityThreshold: parseNumberOrFallback(form.minimumCityVisibilityThreshold, 0),
    strengthCost: parseNumberOrFallback(form.strengthCost, 1),
    selectionWeight: parseOptionalNumber(form.selectionWeight) ?? undefined,
    kind: form.kind,
    pressure: parseNumberOrFallback(form.pressure, 0),
    maxHitPoints: parseNumberOrFallback(form.maxHitPoints, 1),
    armor: parseNumberOrFallback(form.armor, 0),
    hitRadius: parseNumberOrFallback(form.hitRadius, 1),
    shotDistance: form.kind === "ranged" ? parseOptionalNumber(form.shotDistance) ?? undefined : undefined,
    keywords: parseKeywords(form.keywords),
    sprite: {
      textureKey: effectiveTextureKey,
    },
    swarmSize: parseOptionalNumber(form.swarmSize) ?? undefined,
    swarmSizeMax: parseOptionalNumber(form.swarmSizeMax) ?? undefined,
    movement: {
      kind: form.movementKind,
      speedHexRadiusPerSecond: parseNumberOrFallback(form.speedHexRadiusPerSecond, 1),
      wobbleAmplitudeHexRadius: parseOptionalNumber(form.wobbleAmplitudeHexRadius) ?? undefined,
      sameTrajectoryTimeSeconds: form.movementKind === "randomLines"
        ? parseOptionalNumber(form.sameTrajectoryTimeSeconds) ?? 1
        : undefined,
    },
  };

  return removeEmpty(preview) as MonsterDefinition;
}

async function saveMonsterSprite(args: {
  region: MonsterRegion;
  textureKey: string;
  previousTextureKey?: string;
  spriteDraft: SpriteDraft;
  metadata: EnemyVisualMetadata;
}): Promise<{action?: string; file?: string} | undefined> {
  const formData = new FormData();
  formData.append("kind", "enemy");
  formData.append("vector", args.region);
  formData.append("assetId", args.textureKey);
  formData.append("fileStem", args.textureKey);
  formData.append("metadata", JSON.stringify(args.metadata));
  if (args.previousTextureKey && args.previousTextureKey !== args.textureKey) {
    formData.append("previousFileStem", args.previousTextureKey);
  }
  formData.append("image", args.spriteDraft.file, args.spriteDraft.file.name);

  const response = await fetch(`${localDataServerUrl}/entity-sprites`, {
    method: "POST",
    body: formData,
  });
  const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

  if (!response.ok) {
    throw new Error(responseBody?.error ?? `Sprite upload failed with status ${response.status}.`);
  }

  return responseBody ?? {};
}

async function saveMonsterSpriteMetadata(args: {
  region: MonsterRegion;
  textureKey: string;
  metadata: EnemyVisualMetadata;
}): Promise<{action?: string; file?: string} | undefined> {
  const response = await fetch(`${localDataServerUrl}/entity-sprite-metadata`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      kind: "enemy",
      vector: args.region,
      fileStem: args.textureKey,
      metadata: args.metadata,
    }),
  });
  const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

  if (!response.ok) {
    throw new Error(responseBody?.error ?? `Sprite metadata save failed with status ${response.status}.`);
  }

  return responseBody ?? {};
}

function findStoredMonster(id: string): MonsterDefinition | null {
  const {region} = inferMonsterPartsFromId(id);
  return rawDefinitionsByRegion[region].find(item => item.id === id) ?? null;
}

function inferMonsterPartsFromId(id: string): {region: MonsterRegion; itemName: string} {
  const [collection, rawRegion, ...rest] = id.split(".");
  const region = isMonsterRegion(rawRegion) ? rawRegion : "wasteland";
  const itemName = collection === "enemies" && rest.length > 0 ? rest.join(".") : "newMonster";

  return {
    region,
    itemName,
  };
}

function isMonsterRegion(value: string | undefined): value is MonsterRegion {
  return value === "wasteland";
}

function parseKeywords(value: string): string[] {
  return [...new Set(value.split(",").map(keyword => keyword.trim()).filter(Boolean))];
}

function parseOptionalNumber(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseNumberOrFallback(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function stringifyOptionalNumber(value: number | undefined, fallback: string): string {
  return value === undefined || value === null ? fallback : String(value);
}

function createMetadataFormFields(metadata: EnemyVisualMetadata | undefined): Pick<
  MonsterForm,
  "sourceSpriteWidth" | "sourceSpriteHeight" | "spriteZoom" | "rotationDegrees"
> {
  const sourceSpriteSize = metadata?.sourceSpriteSize;
  const targetSpriteSize = metadata?.targetSpriteSize;

  return {
    sourceSpriteWidth: stringifyOptionalNumber(sourceSpriteSize?.width, ""),
    sourceSpriteHeight: stringifyOptionalNumber(sourceSpriteSize?.height, ""),
    spriteZoom: stringifyOptionalNumber(getSpriteZoom(sourceSpriteSize, targetSpriteSize), "1"),
    rotationDegrees: stringifyOptionalNumber(metadata?.rotationDegrees, "-90"),
  };
}

function createEnemyVisualMetadata(form: MonsterForm, fallbackMetadata?: EnemyVisualMetadata): EnemyVisualMetadata {
  const sourceSpriteSize = {
    width: parsePositiveNumberOrFallback(form.sourceSpriteWidth, fallbackMetadata?.sourceSpriteSize?.width ?? 1),
    height: parsePositiveNumberOrFallback(form.sourceSpriteHeight, fallbackMetadata?.sourceSpriteSize?.height ?? 1),
  };
  const spriteZoom = parsePositiveNumberOrFallback(
    form.spriteZoom,
    getSpriteZoom(fallbackMetadata?.sourceSpriteSize, fallbackMetadata?.targetSpriteSize) ?? 1,
  );

  return {
    sourceSpriteSize,
    targetSpriteSize: scaleSpriteSize(sourceSpriteSize, spriteZoom),
    rotationDegrees: parseNumberOrFallback(form.rotationDegrees, fallbackMetadata?.rotationDegrees ?? -90),
  };
}

function getSpriteZoom(
  sourceSpriteSize: {width: number; height: number} | undefined,
  targetSpriteSize: {width: number; height: number} | undefined,
): number | undefined {
  if (!sourceSpriteSize || !targetSpriteSize) return undefined;
  const widthZoom = targetSpriteSize.width / sourceSpriteSize.width;
  const heightZoom = targetSpriteSize.height / sourceSpriteSize.height;
  const zoom = Math.min(widthZoom, heightZoom);

  return Number.isFinite(zoom) && zoom > 0 ? Number(zoom.toFixed(4)) : undefined;
}

function scaleSpriteSize(sourceSpriteSize: {width: number; height: number}, zoom: number) {
  return {
    width: Math.max(1, Math.round(sourceSpriteSize.width * zoom)),
    height: Math.max(1, Math.round(sourceSpriteSize.height * zoom)),
  };
}

function parsePositiveNumberOrFallback(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function fitSpriteSize(sourceSpriteSize: {width: number; height: number}, maxWidth: number, maxHeight: number) {
  const scale = Math.min(maxWidth / sourceSpriteSize.width, maxHeight / sourceSpriteSize.height);

  return {
    width: Math.max(1, Math.round(sourceSpriteSize.width * scale)),
    height: Math.max(1, Math.round(sourceSpriteSize.height * scale)),
  };
}

function readImageSize(src: string): Promise<{width: number; height: number}> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({width: image.naturalWidth, height: image.naturalHeight});
    image.onerror = () => reject(new Error("Image could not be loaded"));
    image.src = src;
  });
}

function normalizeIdPart(value: string): string {
  const compact = value
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
  if (!compact) return "newMonster";
  return compact.charAt(0).toLowerCase() + compact.slice(1);
}

function titleFromIdPart(id: string): string {
  const lastPart = id.split(".").at(-1) ?? "New Monster";
  return lastPart
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, char => char.toUpperCase())
    .trim();
}

function getMonsterTextureKey(id: string): string {
  return `enemy_${camelToSnake(id.split(".").at(-1) ?? id)}`;
}

function camelToSnake(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function removeEmpty<T extends Record<string, unknown>>(source: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(source).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  );
}
