import {useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent} from "react";
import {useParams} from "react-router-dom";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {TowerPartSlot} from "../../models/battle/towerParts.ts";
import type {TowerPartVisualMetadata} from "../../models/battle/towerPartVisualMetadata.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import type {BuildingSpriteMetadata} from "../../models/sprites/buildings/BuildingSpriteMetadata.ts";
import type {WallSpriteMetadata} from "../../models/sprites/walls/WallSpriteAtlas.ts";
import type {WallTopSpriteMetadata} from "../../models/sprites/wallTops/WallTopSpriteMetadata.ts";
import {ALL_BUILDING_KEYWORDS} from "../../models/city/Keywords.ts";
import {HOMOGENEOUS_VALUE_DEFINITION_LIST} from "../../data/homogeneousValues/index.ts";
import {TOWER_PART_SLOT_ORDER} from "../../data/gunParts/index.ts";
import {buildingIds, technologyIds} from "../../data/ids.ts";
import {STRUCTURES_BY_ID} from "../../data/buildings/index.ts";
import {
  ENTITY_VISUAL_ASSETS_BY_ID,
  getEntityVisualAssetsForKind,
  type EntityVisualAsset,
  type EntityVisualAssetKind,
  type ProjectileVisualAsset,
  type VisualAssetKind,
} from "../../data/entityVisualAssets.ts";
import aetherBuildingDefinitions from "../../data/buildings/aether.json";
import medievalBuildingDefinitions from "../../data/buildings/medieval.json";
import natureBuildingDefinitions from "../../data/buildings/nature.json";
import neutralBuildingDefinitions from "../../data/buildings/neutral.json";
import techBuildingDefinitions from "../../data/buildings/tech.json";
import aetherResearchDefinitions from "../../data/research/aether.json";
import medievalResearchDefinitions from "../../data/research/medieval.json";
import natureResearchDefinitions from "../../data/research/nature.json";
import techResearchDefinitions from "../../data/research/tech.json";
import aetherWallSegmentDefinitions from "../../data/wallSegments/aether.json";
import medievalWallSegmentDefinitions from "../../data/wallSegments/medieval.json";
import natureWallSegmentDefinitions from "../../data/wallSegments/nature.json";
import neutralWallSegmentDefinitions from "../../data/wallSegments/neutral.json";
import techWallSegmentDefinitions from "../../data/wallSegments/tech.json";
import aetherWallSuperstructureDefinitions from "../../data/wallSuperstructures/aether.json";
import medievalWallSuperstructureDefinitions from "../../data/wallSuperstructures/medieval.json";
import natureWallSuperstructureDefinitions from "../../data/wallSuperstructures/nature.json";
import neutralWallSuperstructureDefinitions from "../../data/wallSuperstructures/neutral.json";
import techWallSuperstructureDefinitions from "../../data/wallSuperstructures/tech.json";
import aetherGunPartDefinitions from "../../data/gunParts/aether.json";
import medievalGunPartDefinitions from "../../data/gunParts/medieval.json";
import natureGunPartDefinitions from "../../data/gunParts/nature.json";
import neutralGunPartDefinitions from "../../data/gunParts/neutral.json";
import techGunPartDefinitions from "../../data/gunParts/tech.json";
import * as s from "./EntityCreatePage.css.ts";

type EntityType = "research" | "wallSegment" | "wallSuperstructure" | "building" | "gunPart";
type RequirementType = Requirement["type"];
type ValueRole = "production" | "upkeep";

type ValueRow = {
  id: number;
  valueId: string;
  additionalKeywords: string[];
  additive: string;
  multiplier: string;
  base?: HomogeneousValueEffect;
};

type EffectRow = {
  id: number;
  requiredBuildingKeywords: string[];
  additionalBuildingKeywords: string[];
  requiredValueKeywords: string[];
  additive: string;
  multiplier: string;
  radius: string;
  base?: HomogeneousAdjacencyRule;
};

type RequirementRow = {
  id: number;
  type: RequirementType;
  target: string;
  amount: string;
};

type BuildingIdRow = {
  id: number;
  buildingId: string;
};

type RequiredSourceSpriteRow = {
  sourceBuildingId: string;
  visualAssetId: string;
  spriteDraft: SpriteDraft | null;
};

type RequiredBuildingSpriteMap = Record<string, string>;

type StoredEntityDefinition = {
  id: string;
  parentId?: string | null;
  slot?: TowerPartSlot;
  name?: string;
  kind?: "building" | "superstructure";
  description?: string;
  summary?: string;
  keywords?: string[];
  requiredBuildingIds?: string[];
  requiredBuildingSprites?: RequiredBuildingSpriteMap;
  hint?: string;
  requirements?: Requirement[];
  buildRequirements?: Requirement[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
  visualAssetId?: string;
  spriteTextureKey?: string;
  projectileSpriteTextureKey?: string;
};

type StoredEntityLookup = {
  entityType: EntityType;
  vector: DevelopmentVectorKey;
  definition: StoredEntityDefinition;
};

type SaveStatus = {
  kind: "idle" | "saving" | "success" | "error";
  message: string;
};

type SpriteMetadata = BuildingSpriteMetadata | WallSpriteMetadata | WallTopSpriteMetadata | TowerPartVisualMetadata;

type SpriteDraft = {
  file: File;
  previewUrl: string;
  metadata?: SpriteMetadata;
};

type SpriteSaveAction = {
  kind: VisualAssetKind;
  vector: DevelopmentVectorKey;
  slot?: TowerPartSlot;
  assetId: string;
  fileStem: string;
  previousFileStem?: string;
  metadata?: SpriteMetadata;
};

const entityTypeOptions: {value: EntityType; label: string; prefix: string}[] = [
  {value: "research", label: "Research", prefix: "research"},
  {value: "wallSegment", label: "Wall Segment", prefix: "wallSegments"},
  {value: "wallSuperstructure", label: "Wall Superstructure", prefix: "wallSuperstructures"},
  {value: "building", label: "Building", prefix: "buildings"},
  {value: "gunPart", label: "Gun Part", prefix: "gunParts"},
];

const requirementTypeOptions: {value: RequirementType; label: string}[] = [
  {value: "buildingKeywordExists", label: "Building keyword exists"},
  {value: "buildingExists", label: "Building exists"},
  {value: "technologyUnlocked", label: "Technology unlocked"},
  {value: "globalFlagExists", label: "Global flag exists"},
  {value: "globalFlagMissing", label: "Global flag missing"},
  {value: "homogeneousValueAtLeast", label: "Value at least"},
  {value: "homogeneousValueLessThan", label: "Value less than"},
];

const vectorOptions = Object.keys(DEVELOPMENT_VECTORS) as DevelopmentVectorKey[];
const defaultValueId = HOMOGENEOUS_VALUE_DEFINITION_LIST[0]?.id ?? "resource.people";
const buildingKeywordOptions = [...ALL_BUILDING_KEYWORDS];
const valueKeywordOptions = Array.from(new Set(
  HOMOGENEOUS_VALUE_DEFINITION_LIST.flatMap(definition => definition.keywords),
)).sort();
const entityKeywordOptions = Array.from(new Set([
  ...buildingKeywordOptions,
  ...valueKeywordOptions,
  ...vectorOptions,
  ...TOWER_PART_SLOT_ORDER.map(slot => slot.key),
])).sort();
const localDataServerUrl = "http://127.0.0.1:4317";

let nextRowId = 1;

const rawDefinitionsByType: Record<EntityType, Record<DevelopmentVectorKey, readonly StoredEntityDefinition[]>> = {
  research: {
    neutral: [],
    tech: techResearchDefinitions as readonly StoredEntityDefinition[],
    nature: natureResearchDefinitions as readonly StoredEntityDefinition[],
    medieval: medievalResearchDefinitions as readonly StoredEntityDefinition[],
    aether: aetherResearchDefinitions as readonly StoredEntityDefinition[],
  },
  wallSegment: {
    neutral: neutralWallSegmentDefinitions as readonly StoredEntityDefinition[],
    tech: techWallSegmentDefinitions as readonly StoredEntityDefinition[],
    nature: natureWallSegmentDefinitions as readonly StoredEntityDefinition[],
    medieval: medievalWallSegmentDefinitions as readonly StoredEntityDefinition[],
    aether: aetherWallSegmentDefinitions as readonly StoredEntityDefinition[],
  },
  wallSuperstructure: {
    neutral: neutralWallSuperstructureDefinitions as readonly StoredEntityDefinition[],
    tech: techWallSuperstructureDefinitions as readonly StoredEntityDefinition[],
    nature: natureWallSuperstructureDefinitions as readonly StoredEntityDefinition[],
    medieval: medievalWallSuperstructureDefinitions as readonly StoredEntityDefinition[],
    aether: aetherWallSuperstructureDefinitions as readonly StoredEntityDefinition[],
  },
  building: {
    neutral: neutralBuildingDefinitions as readonly StoredEntityDefinition[],
    tech: techBuildingDefinitions as readonly StoredEntityDefinition[],
    nature: natureBuildingDefinitions as readonly StoredEntityDefinition[],
    medieval: medievalBuildingDefinitions as readonly StoredEntityDefinition[],
    aether: aetherBuildingDefinitions as readonly StoredEntityDefinition[],
  },
  gunPart: {
    neutral: neutralGunPartDefinitions as readonly StoredEntityDefinition[],
    tech: techGunPartDefinitions as readonly StoredEntityDefinition[],
    nature: natureGunPartDefinitions as readonly StoredEntityDefinition[],
    medieval: medievalGunPartDefinitions as readonly StoredEntityDefinition[],
    aether: aetherGunPartDefinitions as readonly StoredEntityDefinition[],
  },
};

export default function EntityCreatePage() {
  const {entityId = "new"} = useParams<{entityId: string}>();
  const [entityType, setEntityType] = useState<EntityType>("research");
  const [vector, setVector] = useState<DevelopmentVectorKey>("medieval");
  const [partType, setPartType] = useState<TowerPartSlot>("launchSystem");
  const [isSuperstructure, setIsSuperstructure] = useState(false);
  const [itemName, setItemName] = useState("newEntity");
  const [displayName, setDisplayName] = useState("New Entity");
  const [description, setDescription] = useState("");
  const [hint, setHint] = useState("");
  const [requiredBuildingRows, setRequiredBuildingRows] = useState<BuildingIdRow[]>([]);
  const [requiredSourceSpriteRows, setRequiredSourceSpriteRows] = useState<RequiredSourceSpriteRow[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [visualAssetId, setVisualAssetId] = useState("");
  const [spriteDraft, setSpriteDraft] = useState<SpriteDraft | null>(null);
  const [removedVisualAssetId, setRemovedVisualAssetId] = useState("");
  const [projectileVisualAssetId, setProjectileVisualAssetId] = useState("");
  const [projectileSpriteDraft, setProjectileSpriteDraft] = useState<SpriteDraft | null>(null);
  const [removedProjectileVisualAssetId, setRemovedProjectileVisualAssetId] = useState("");
  const [providedValueRows, setProvidedValueRows] = useState<ValueRow[]>([]);
  const [upkeepValueRows, setUpkeepValueRows] = useState<ValueRow[]>([]);
  const [effectRows, setEffectRows] = useState<EffectRow[]>([]);
  const [requirementRows, setRequirementRows] = useState<RequirementRow[]>([]);
  const [buildRequirementRows, setBuildRequirementRows] = useState<RequirementRow[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({kind: "idle", message: ""});
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const previousAutomaticKeywordsRef = useRef<string[]>([]);
  const loadedEntity = useMemo(() => entityId === "new" ? null : findStoredEntity(entityId), [entityId]);
  const isEditingExisting = Boolean(loadedEntity);

  const idPrefix = entityTypeOptions.find(option => option.value === entityType)?.prefix ?? "research";
  const normalizedItemName = normalizeIdPart(itemName);
  const generatedId = entityType === "gunPart"
    ? `${idPrefix}.${vector}.${partType}.${normalizedItemName}`
    : `${idPrefix}.${vector}.${normalizedItemName}`;
  const showBuildingFields = entityType === "building";
  const showBuildRequirements = entityType === "building" || entityType === "wallSegment" || entityType === "wallSuperstructure";
  const visualAssetKind = getVisualAssetKind(entityType);
  const generatedVisualAssetId = visualAssetKind
    ? getSpriteAssetId(entityType, vector, generatedId)
    : "";
  const effectiveVisualAssetId = spriteDraft
    ? generatedVisualAssetId
    : removedVisualAssetId
      ? ""
      : visualAssetId;
  const visualAssetOptions = useMemo(
    () => visualAssetKind
      ? getEntityVisualAssetsForKind(visualAssetKind)
        .filter(asset => asset.vector === vector)
        .filter(asset => asset.kind !== "gunPart" || asset.slot === partType)
      : [],
    [partType, vector, visualAssetKind],
  );
  const buildingVisualAssetOptions = useMemo(
    () => getEntityVisualAssetsForKind("building").filter(asset => asset.vector === vector),
    [vector],
  );
  const selectedVisualAsset = effectiveVisualAssetId ? ENTITY_VISUAL_ASSETS_BY_ID[effectiveVisualAssetId] : undefined;
  const showProjectileSpriteField = entityType === "gunPart" && partType === "ammo";
  const generatedProjectileVisualAssetId = showProjectileSpriteField
    ? getProjectileSpriteAssetId(vector, generatedId)
    : "";
  const effectiveProjectileVisualAssetId = projectileSpriteDraft
    ? generatedProjectileVisualAssetId
    : removedProjectileVisualAssetId
      ? ""
      : projectileVisualAssetId;
  const projectileVisualAssetOptions = useMemo(
    () => getEntityVisualAssetsForKind("projectile")
      .filter((asset): asset is ProjectileVisualAsset => asset.kind === "projectile")
      .filter(asset => asset.vector === vector),
    [vector],
  );
  const selectedProjectileVisualAsset = effectiveProjectileVisualAssetId
    ? ENTITY_VISUAL_ASSETS_BY_ID[effectiveProjectileVisualAssetId]
    : undefined;
  const automaticKeywords = useMemo(
    () => getAutomaticKeywords(entityType, vector, partType),
    [entityType, partType, vector],
  );

  useEffect(() => {
    const previousAutomaticKeywords = previousAutomaticKeywordsRef.current;
    setKeywords(currentKeywords => {
      const currentKeywordSet = new Set(currentKeywords);
      const nextKeywords = currentKeywords.filter(keyword => !previousAutomaticKeywords.includes(keyword));

      for (const keyword of automaticKeywords) {
        if (!currentKeywordSet.has(keyword)) {
          nextKeywords.push(keyword);
        }
      }

      return nextKeywords;
    });
    previousAutomaticKeywordsRef.current = automaticKeywords;
  }, [automaticKeywords]);

  useEffect(() => {
    if (!visualAssetId || spriteDraft || removedVisualAssetId) return;
    if (visualAssetOptions.some(asset => asset.id === visualAssetId) || ENTITY_VISUAL_ASSETS_BY_ID[visualAssetId]) return;
    setVisualAssetId("");
  }, [removedVisualAssetId, spriteDraft, visualAssetId, visualAssetOptions]);

  useEffect(() => {
    if (!projectileVisualAssetId || projectileSpriteDraft || removedProjectileVisualAssetId) return;
    if (projectileVisualAssetOptions.some(asset => asset.id === projectileVisualAssetId) || ENTITY_VISUAL_ASSETS_BY_ID[projectileVisualAssetId]) return;
    setProjectileVisualAssetId("");
  }, [projectileSpriteDraft, projectileVisualAssetId, projectileVisualAssetOptions, removedProjectileVisualAssetId]);

  useEffect(() => {
    const sourceBuildingIds = getSourceBuildingIdsForRequirements(requiredBuildingRows.map(row => row.buildingId));
    setRequiredSourceSpriteRows(rows => syncRequiredSourceSpriteRows(rows, sourceBuildingIds));
  }, [requiredBuildingRows]);

  useEffect(() => () => {
    if (spriteDraft) URL.revokeObjectURL(spriteDraft.previewUrl);
  }, [spriteDraft]);

  useEffect(() => () => {
    if (projectileSpriteDraft) URL.revokeObjectURL(projectileSpriteDraft.previewUrl);
  }, [projectileSpriteDraft]);

  useEffect(() => {
    if (entityId === "new") {
      resetFormForNewEntity();
      return;
    }

    const storedEntity = findStoredEntity(entityId);
    if (!storedEntity) {
      resetFormForUnknownEntity(entityId);
      return;
    }

    fillFormFromStoredEntity(storedEntity);
  }, [entityId]);

  const entityPreview = useMemo(() => (
    createPreview({
      entityType,
      vector,
      generatedId,
      partType,
      isSuperstructure,
      displayName,
      description,
      hint,
      requiredBuildingRows,
      requiredSourceSpriteRows,
      keywords,
      visualAssetId: effectiveVisualAssetId,
      projectileVisualAssetId: effectiveProjectileVisualAssetId,
      providedValueRows,
      upkeepValueRows,
      effectRows,
      requirementRows,
      buildRequirementRows,
      baseDefinition: loadedEntity?.definition ?? null,
    })
  ), [
    buildRequirementRows,
    description,
    displayName,
    effectRows,
    entityType,
    generatedId,
    hint,
    isSuperstructure,
    keywords,
    effectiveVisualAssetId,
    effectiveProjectileVisualAssetId,
    partType,
    providedValueRows,
    requiredBuildingRows,
    requiredSourceSpriteRows,
    requirementRows,
    loadedEntity,
    upkeepValueRows,
    vector,
  ]);
  const jsonPreview = useMemo(() => JSON.stringify(entityPreview, null, 2), [entityPreview]);

  function addValueRow(role: ValueRole) {
    const update = role === "production" ? setProvidedValueRows : setUpkeepValueRows;
    update(rows => [
      ...rows,
      {
        id: nextRowId++,
        valueId: defaultValueId,
        additionalKeywords: [],
        additive: "",
        multiplier: "",
      },
    ]);
  }

  function addEffectRow() {
    setEffectRows(rows => [
      ...rows,
      {
        id: nextRowId++,
        requiredBuildingKeywords: [],
        additionalBuildingKeywords: [],
        requiredValueKeywords: [],
        additive: "",
        multiplier: "",
        radius: "",
      },
    ]);
  }

  function addRequirementRow(target: "requirements" | "buildRequirements") {
    const row: RequirementRow = {
      id: nextRowId++,
      type: "technologyUnlocked",
      target: "",
      amount: "",
    };
    if (target === "requirements") {
      setRequirementRows(rows => [...rows, row]);
      return;
    }
    setBuildRequirementRows(rows => [...rows, row]);
  }

  function addRequiredBuildingRow() {
    setRequiredBuildingRows(rows => [
      ...rows,
      {
        id: nextRowId++,
        buildingId: "",
        visualAssetId: "",
        spriteDraft: null,
      },
    ]);
  }

  return (
    <section className={s.page}>
      <div className={s.formPanel}>
        <header className={s.header}>
          <h1 className={s.title}>{isEditingExisting ? `Edit ${entityId}` : "Create entity"}</h1>
          {entityId !== "new" && !loadedEntity && (
            <p className={s.subtitle}>No stored entity found for {entityId}; using the id as a draft.</p>
          )}
        </header>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Identity</h2>
          </div>
          <div className={s.grid}>
            <label className={s.field}>
              <span className={s.label}>Entity type</span>
              <select className={s.input} value={entityType} onChange={event => setEntityType(event.target.value as EntityType)}>
                {entityTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className={s.field}>
              <span className={s.label}>Vector</span>
              <select className={s.input} value={vector} onChange={event => setVector(event.target.value as DevelopmentVectorKey)}>
                {vectorOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            {entityType === "gunPart" && (
              <label className={s.field}>
                <span className={s.label}>Part type</span>
                <select className={s.input} value={partType} onChange={event => setPartType(event.target.value as TowerPartSlot)}>
                  {TOWER_PART_SLOT_ORDER.map(option => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </label>
            )}
            {showBuildingFields && (
              <label className={s.toggle}>
                <input
                  type="checkbox"
                  checked={isSuperstructure}
                  onChange={event => setIsSuperstructure(event.target.checked)}
                />
                Is superstructure
              </label>
            )}
            {visualAssetKind && (
              <VisualAssetField
                title="Visual Asset"
                searchPlaceholder="Search visual assets"
                emptyHint="Drop a PNG or choose an existing image."
                options={visualAssetOptions}
                selectedAsset={selectedVisualAsset}
                value={effectiveVisualAssetId}
                draft={spriteDraft}
                onChange={selectVisualAsset}
                onDropFile={setSpriteFile}
                onMetadataChange={updateSpriteMetadata}
                onRemove={removeSprite}
              />
            )}
            {showProjectileSpriteField && (
              <VisualAssetField
                title="Projectile Sprite"
                searchPlaceholder="Search projectile sprites"
                emptyHint="Drop a PNG or choose an existing projectile image."
                options={projectileVisualAssetOptions}
                selectedAsset={selectedProjectileVisualAsset}
                value={effectiveProjectileVisualAssetId}
                draft={projectileSpriteDraft}
                onChange={selectProjectileVisualAsset}
                onDropFile={setProjectileSpriteFile}
                onMetadataChange={() => {}}
                onRemove={removeProjectileSprite}
              />
            )}
            <label className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>Item name id part</span>
              <input className={s.input} value={itemName} onChange={event => setItemName(event.target.value)} />
            </label>
            <div className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>Generated id</span>
              <div className={s.idPreview}>{generatedId}</div>
            </div>
            <label className={s.field}>
              <span className={s.label}>Name</span>
              <input className={s.input} value={displayName} onChange={event => setDisplayName(event.target.value)} />
            </label>
            <SearchableMultiSelect
              label="Keywords"
              options={entityKeywordOptions}
              selected={keywords}
              onChange={setKeywords}
            />
            <label className={`${s.field} ${s.fullWidth}`}>
              <span className={s.label}>{entityType === "research" ? "Summary" : "Description"}</span>
              <textarea className={s.textarea} value={description} onChange={event => setDescription(event.target.value)} />
            </label>
            {showBuildingFields && isSuperstructure && (
              <>
                <BuildingIdSection
                  title="Required Building IDs"
                  rows={requiredBuildingRows}
                  sourceSpriteRows={requiredSourceSpriteRows}
                  visualAssetOptions={buildingVisualAssetOptions}
                  structureId={generatedId}
                  vector={vector}
                  onAdd={addRequiredBuildingRow}
                  onUpdate={updateRequiredBuildingRow}
                  onUpdateSourceSprite={updateRequiredSourceSprite}
                  onDropFile={setRequiredSourceSpriteFile}
                  onRemoveSprite={removeRequiredSourceSprite}
                  onRemove={removeRequiredBuildingRow}
                />
                <label className={`${s.field} ${s.fullWidth}`}>
                  <span className={s.label}>Hint</span>
                  <textarea className={s.textarea} value={hint} onChange={event => setHint(event.target.value)} />
                </label>
              </>
            )}
          </div>
        </section>

        <RequirementSection
          title="Requirements"
          rows={requirementRows}
          onAdd={() => addRequirementRow("requirements")}
          onUpdate={(rowId, patch) => updateRequirementRow("requirements", rowId, patch)}
          onRemove={rowId => removeRequirementRow("requirements", rowId)}
        />

        {showBuildRequirements && (
            <RequirementSection
              title="Build Requirements"
              rows={buildRequirementRows}
              onAdd={() => addRequirementRow("buildRequirements")}
              onUpdate={(rowId, patch) => updateRequirementRow("buildRequirements", rowId, patch)}
              onRemove={rowId => removeRequirementRow("buildRequirements", rowId)}
            />
        )}

        <ValueSection
          title="Provides"
          emptyText="No provided values yet."
          rows={providedValueRows}
          onAdd={() => addValueRow("production")}
          onUpdate={(rowId, patch) => updateValueRow("production", rowId, patch)}
          onRemove={rowId => removeValueRow("production", rowId)}
        />

        <ValueSection
          title="Upkeep"
          emptyText="No upkeep values yet."
          rows={upkeepValueRows}
          onAdd={() => addValueRow("upkeep")}
          onUpdate={(rowId, patch) => updateValueRow("upkeep", rowId, patch)}
          onRemove={rowId => removeValueRow("upkeep", rowId)}
        />

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Effects</h2>
            <button className={s.button} type="button" onClick={addEffectRow} title="Add effect">+</button>
          </div>
          <div className={s.rowList}>
            {effectRows.length === 0 && <span className={s.hint}>No effects yet.</span>}
            {effectRows.map(row => (
              <div key={row.id} className={s.effectRow}>
                <SearchableMultiSelect
                  label="Required building keywords"
                  options={buildingKeywordOptions}
                  selected={row.requiredBuildingKeywords}
                  onChange={requiredBuildingKeywords => updateEffectRow(row.id, {requiredBuildingKeywords})}
                />
                <SearchableMultiSelect
                  label="Added building keywords"
                  options={buildingKeywordOptions}
                  selected={row.additionalBuildingKeywords}
                  onChange={additionalBuildingKeywords => updateEffectRow(row.id, {additionalBuildingKeywords})}
                />
                <SearchableMultiSelect
                  label="Required value keywords"
                  options={valueKeywordOptions}
                  selected={row.requiredValueKeywords}
                  onChange={requiredValueKeywords => updateEffectRow(row.id, {requiredValueKeywords})}
                />
                <label className={s.field}>
                  <span className={s.label}>Additive</span>
                  <input className={s.input} type="number" value={row.additive} onChange={event => updateEffectRow(row.id, {additive: event.target.value})} />
                </label>
                <label className={s.field}>
                  <span className={s.label}>Multiplier</span>
                  <input className={s.input} type="number" value={row.multiplier} onChange={event => updateEffectRow(row.id, {multiplier: event.target.value})} />
                </label>
                <label className={s.field}>
                  <span className={s.label}>Radius</span>
                  <input className={s.input} type="number" value={row.radius} onChange={event => updateEffectRow(row.id, {radius: event.target.value})} />
                </label>
                <button className={s.dangerButton} type="button" onClick={() => removeEffectRow(row.id)} title="Remove effect">x</button>
              </div>
            ))}
          </div>
        </section>
        <section className={s.previewPanel}>
          <button
            className={s.previewToggle}
            type="button"
            onClick={() => setIsPreviewOpen(isOpen => !isOpen)}
          >
            {isPreviewOpen ? "Hide JSON preview" : "Show JSON preview"}
          </button>
          {isPreviewOpen && (
            <pre className={`${s.preview} ${s.mono}`}>{jsonPreview}</pre>
          )}
        </section>

        <div className={s.saveRow}>
          <button
            className={s.primaryButton}
            type="button"
            disabled={saveStatus.kind === "saving"}
            onClick={saveEntity}
          >
            {saveStatus.kind === "saving" ? "Saving..." : "Save"}
          </button>
          {saveStatus.message && (
            <span className={saveStatus.kind === "error" ? s.errorText : s.statusText}>{saveStatus.message}</span>
          )}
        </div>
      </div>
    </section>
  );

  function updateValueRow(role: ValueRole, rowId: number, patch: Partial<ValueRow>) {
    const update = (rows: ValueRow[]) => rows.map(row => row.id === rowId ? {...row, ...patch} : row);
    if (role === "production") {
      setProvidedValueRows(update);
      return;
    }
    setUpkeepValueRows(update);
  }

  function removeValueRow(role: ValueRole, rowId: number) {
    const remove = (rows: ValueRow[]) => rows.filter(row => row.id !== rowId);
    if (role === "production") {
      setProvidedValueRows(remove);
      return;
    }
    setUpkeepValueRows(remove);
  }

  function updateEffectRow(rowId: number, patch: Partial<EffectRow>) {
    setEffectRows(rows => rows.map(row => row.id === rowId ? {...row, ...patch} : row));
  }

  function removeEffectRow(rowId: number) {
    setEffectRows(rows => rows.filter(row => row.id !== rowId));
  }

  function updateRequirementRow(target: "requirements" | "buildRequirements", rowId: number, patch: Partial<RequirementRow>) {
    const update = (rows: RequirementRow[]) => rows.map(row => row.id === rowId ? {...row, ...patch} : row);
    if (target === "requirements") {
      setRequirementRows(update);
      return;
    }
    setBuildRequirementRows(update);
  }

  function removeRequirementRow(target: "requirements" | "buildRequirements", rowId: number) {
    const remove = (rows: RequirementRow[]) => rows.filter(row => row.id !== rowId);
    if (target === "requirements") {
      setRequirementRows(remove);
      return;
    }
    setBuildRequirementRows(remove);
  }

  function updateRequiredBuildingRow(rowId: number, patch: Partial<BuildingIdRow>) {
    setRequiredBuildingRows(rows => rows.map(row => row.id === rowId ? {...row, ...patch} : row));
  }

  function removeRequiredBuildingRow(rowId: number) {
    setRequiredBuildingRows(rows => rows.filter(row => row.id !== rowId));
  }

  function updateRequiredSourceSprite(sourceBuildingId: string, patch: Partial<Pick<RequiredSourceSpriteRow, "visualAssetId">>) {
    setRequiredSourceSpriteRows(rows => rows.map(row => {
      if (row.sourceBuildingId !== sourceBuildingId) return row;
      if (patch.visualAssetId !== undefined && row.spriteDraft) {
        URL.revokeObjectURL(row.spriteDraft.previewUrl);
      }

      return {
        ...row,
        ...patch,
        spriteDraft: patch.visualAssetId !== undefined ? null : row.spriteDraft,
      };
    }));
  }

  function selectVisualAsset(nextVisualAssetId: string) {
    setSpriteDraft(null);
    setRemovedVisualAssetId("");
    setVisualAssetId(nextVisualAssetId);
  }

  function selectProjectileVisualAsset(nextVisualAssetId: string) {
    setProjectileSpriteDraft(null);
    setRemovedProjectileVisualAssetId("");
    setProjectileVisualAssetId(nextVisualAssetId);
  }

  async function setSpriteFile(file: File) {
    if (!visualAssetKind) return;

    if (file.type !== "image/png") {
      setSaveStatus({kind: "error", message: "Sprites must be PNG files."});
      return;
    }

    try {
      const draft = await createSpriteDraft(file, entityType, partType);
      setSpriteDraft(draft);
      setRemovedVisualAssetId("");
      setSaveStatus({kind: "idle", message: ""});
    } catch (error) {
      setSaveStatus({kind: "error", message: "Could not read the dropped image."});
    }
  }

  async function setProjectileSpriteFile(file: File) {
    if (file.type !== "image/png") {
      setSaveStatus({kind: "error", message: "Projectile sprites must be PNG files."});
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setProjectileSpriteDraft({
      file,
      previewUrl,
    });
    setRemovedProjectileVisualAssetId("");
    setSaveStatus({kind: "idle", message: ""});
  }

  async function setRequiredSourceSpriteFile(sourceBuildingId: string, file: File) {
    if (file.type !== "image/png") {
      setSaveStatus({kind: "error", message: "Sprites must be PNG files."});
      return;
    }

    try {
      const draft = await createSpriteDraft(file, "building", partType);
      setRequiredSourceSpriteRows(rows => rows.map(row => {
        if (row.sourceBuildingId !== sourceBuildingId) return row;
        if (row.spriteDraft) URL.revokeObjectURL(row.spriteDraft.previewUrl);
        return {
          ...row,
          spriteDraft: draft,
        };
      }));
      setSaveStatus({kind: "idle", message: ""});
    } catch (error) {
      setSaveStatus({kind: "error", message: "Could not read the dropped image."});
    }
  }

  function removeRequiredSourceSprite(sourceBuildingId: string) {
    setRequiredSourceSpriteRows(rows => rows.map(row => {
      if (row.sourceBuildingId !== sourceBuildingId) return row;
      if (row.spriteDraft) URL.revokeObjectURL(row.spriteDraft.previewUrl);
      return {
        ...row,
        visualAssetId: "",
        spriteDraft: null,
      };
    }));
  }

  function removeSprite() {
    if (spriteDraft) {
      setSpriteDraft(null);
      return;
    }

    if (effectiveVisualAssetId) {
      setRemovedVisualAssetId(effectiveVisualAssetId);
      setVisualAssetId("");
    }
  }

  function removeProjectileSprite() {
    if (projectileSpriteDraft) {
      setProjectileSpriteDraft(null);
      return;
    }

    if (effectiveProjectileVisualAssetId) {
      setRemovedProjectileVisualAssetId(effectiveProjectileVisualAssetId);
      setProjectileVisualAssetId("");
    }
  }

  function updateSpriteMetadata(metadata: SpriteMetadata) {
    setSpriteDraft(currentDraft => currentDraft ? {...currentDraft, metadata} : currentDraft);
  }

  async function saveEntity() {
    setSaveStatus({kind: "saving", message: "Saving to local data server..."});

    try {
      const spriteAction = visualAssetKind
        ? createSpriteSaveAction({
          kind: visualAssetKind,
          vector,
          partType,
          entityType,
          generatedVisualAssetId,
          selectedVisualAssetId: visualAssetId,
          removedVisualAssetId,
          spriteDraft,
        })
        : undefined;
      const spriteResult = spriteAction
        ? await applySpriteSaveAction(spriteAction, spriteDraft)
        : undefined;
      const projectileSpriteAction = showProjectileSpriteField
        ? createProjectileSpriteSaveAction({
          vector,
          generatedProjectileVisualAssetId,
          selectedVisualAssetId: projectileVisualAssetId,
          removedVisualAssetId: removedProjectileVisualAssetId,
          spriteDraft: projectileSpriteDraft,
        })
        : undefined;
      const projectileSpriteResult = projectileSpriteAction
        ? await applySpriteSaveAction(projectileSpriteAction, projectileSpriteDraft)
        : undefined;
      const requiredBuildingSpriteActions = createRequiredBuildingSpriteSaveActions({
        vector,
        structureId: generatedId,
        requiredSourceSpriteRows,
      });
      const requiredBuildingSpriteResults: ({action?: string; file?: string} | undefined)[] = [];
      for (const action of requiredBuildingSpriteActions) {
        const row = requiredSourceSpriteRows.find(requiredRow => requiredRow.sourceBuildingId === action.sourceBuildingId);
        const result = await applySpriteSaveAction(action.spriteAction, row?.spriteDraft ?? null);
        requiredBuildingSpriteResults.push(result);
      }
      const savedRequiredSourceSpriteRows = requiredSourceSpriteRows.map(row => {
        const savedAction = requiredBuildingSpriteActions.find(action => action.sourceBuildingId === row.sourceBuildingId);
        if (savedAction && row.spriteDraft) URL.revokeObjectURL(row.spriteDraft.previewUrl);
        return savedAction
          ? {...row, visualAssetId: savedAction.spriteAction.assetId, spriteDraft: null}
          : row;
      });
      const previewToSave = createPreview({
        entityType,
        vector,
        generatedId,
        partType,
        isSuperstructure,
        displayName,
        description,
        hint,
        requiredBuildingRows,
        requiredSourceSpriteRows: savedRequiredSourceSpriteRows,
        keywords,
        providedValueRows,
        upkeepValueRows,
        effectRows,
        requirementRows,
        buildRequirementRows,
        visualAssetId: effectiveVisualAssetId,
        projectileVisualAssetId: effectiveProjectileVisualAssetId,
        baseDefinition: loadedEntity?.definition ?? null,
      });
      const response = await fetch(`${localDataServerUrl}/entities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(previewToSave),
      });
      const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

      if (!response.ok) {
        setSaveStatus({
          kind: "error",
          message: responseBody?.error ?? `Save failed with status ${response.status}.`,
        });
        return;
      }

      setSaveStatus({
        kind: "success",
        message: [
          `${responseBody?.action ?? "saved"} in ${responseBody?.file ?? "data file"}`,
          spriteResult?.action ? `sprite ${spriteResult.action}` : "",
          projectileSpriteResult?.action ? `projectile sprite ${projectileSpriteResult.action}` : "",
          requiredBuildingSpriteResults.length ? `${requiredBuildingSpriteResults.length} multistructure sprite${requiredBuildingSpriteResults.length === 1 ? "" : "s"} saved` : "",
        ].filter(Boolean).join("; ") + ".",
      });
      setSpriteDraft(null);
      setRemovedVisualAssetId("");
      setVisualAssetId(effectiveVisualAssetId);
      setProjectileSpriteDraft(null);
      setRemovedProjectileVisualAssetId("");
      setProjectileVisualAssetId(effectiveProjectileVisualAssetId);
      setRequiredSourceSpriteRows(savedRequiredSourceSpriteRows);
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message: error instanceof Error
          ? error.message
          : "Could not reach local data server at http://127.0.0.1:4317.",
      });
    }
  }

  function resetFormForNewEntity() {
    setEntityType("research");
    setVector("medieval");
    setPartType("launchSystem");
    setIsSuperstructure(false);
    setItemName("newEntity");
    setDisplayName("New Entity");
    setDescription("");
    setHint("");
    setRequiredBuildingRows([]);
    setRequiredSourceSpriteRows([]);
    setKeywords(getAutomaticKeywords("research", "medieval", "launchSystem"));
    setVisualAssetId("");
    setSpriteDraft(null);
    setRemovedVisualAssetId("");
    setProjectileVisualAssetId("");
    setProjectileSpriteDraft(null);
    setRemovedProjectileVisualAssetId("");
    setProvidedValueRows([]);
    setUpkeepValueRows([]);
    setEffectRows([]);
    setRequirementRows([]);
    setBuildRequirementRows([]);
  }

  function resetFormForUnknownEntity(id: string) {
    const inferred = inferEntityPartsFromId(id);
    setEntityType(inferred.entityType);
    setVector(inferred.vector);
    setPartType(inferred.partType ?? "launchSystem");
    setIsSuperstructure(false);
    setItemName(inferred.itemName);
    setDisplayName(titleFromIdPart(id));
    setDescription("");
    setHint("");
    setRequiredBuildingRows([]);
    setRequiredSourceSpriteRows([]);
    setKeywords(getAutomaticKeywords(inferred.entityType, inferred.vector, inferred.partType ?? "launchSystem"));
    setVisualAssetId("");
    setSpriteDraft(null);
    setRemovedVisualAssetId("");
    setProjectileVisualAssetId("");
    setProjectileSpriteDraft(null);
    setRemovedProjectileVisualAssetId("");
    setProvidedValueRows([]);
    setUpkeepValueRows([]);
    setEffectRows([]);
    setRequirementRows([]);
    setBuildRequirementRows([]);
  }

  function fillFormFromStoredEntity(storedEntity: StoredEntityLookup) {
    const definition = storedEntity.definition;
    setEntityType(storedEntity.entityType);
    setVector(storedEntity.vector);
    setPartType(definition.slot ?? "launchSystem");
    setIsSuperstructure(definition.kind === "superstructure");
    setItemName(definition.id.split(".").at(-1) ?? "newEntity");
    setDisplayName(definition.name ?? titleFromIdPart(definition.id));
    setDescription(definition.summary ?? definition.description ?? "");
    setHint(definition.hint ?? "");
    setRequiredBuildingRows(createBuildingIdRows(
      definition.requiredBuildingIds ?? [],
    ));
    setRequiredSourceSpriteRows(createRequiredSourceSpriteRows(
      definition.requiredBuildingIds ?? [],
      definition.requiredBuildingSprites ?? {},
    ));
    setKeywords(mergeKeywords(
      getAutomaticKeywords(storedEntity.entityType, storedEntity.vector, definition.slot ?? "launchSystem"),
      definition.keywords ?? [],
    ));
    setVisualAssetId(getStoredVisualAssetId(storedEntity));
    setSpriteDraft(null);
    setRemovedVisualAssetId("");
    setProjectileVisualAssetId(definition.projectileSpriteTextureKey ?? "");
    setProjectileSpriteDraft(null);
    setRemovedProjectileVisualAssetId("");
    setProvidedValueRows(createValueRows(definition.values ?? [], "production"));
    setUpkeepValueRows(createValueRows(definition.values ?? [], "upkeep"));
    setEffectRows(createEffectRows(definition.effects ?? []));
    setRequirementRows(createRequirementRows(definition.requirements ?? []));
    setBuildRequirementRows(createRequirementRows(definition.buildRequirements ?? []));
  }
}

function ValueSection(props: {
  title: string;
  emptyText: string;
  rows: ValueRow[];
  onAdd: () => void;
  onUpdate: (rowId: number, patch: Partial<ValueRow>) => void;
  onRemove: (rowId: number) => void;
}) {
  return (
    <section className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>{props.title}</h2>
        <button className={s.button} type="button" onClick={props.onAdd} title={`Add ${props.title}`}>+</button>
      </div>
      <div className={s.rowList}>
        {props.rows.length === 0 && <span className={s.hint}>{props.emptyText}</span>}
        {props.rows.map(row => (
          <div key={row.id} className={s.row}>
            <label className={s.field}>
              <span className={s.label}>Value type</span>
              <select
                className={s.input}
                value={row.valueId}
                onChange={event => props.onUpdate(row.id, {valueId: event.target.value})}
              >
                {HOMOGENEOUS_VALUE_DEFINITION_LIST.map(definition => (
                  <option key={definition.id} value={definition.id}>{definition.label}</option>
                ))}
              </select>
            </label>
            <div className={s.field}>
              <span className={s.label}>Additional keywords</span>
              <SearchableMultiSelect
                label=""
                options={entityKeywordOptions}
                selected={row.additionalKeywords}
                onChange={additionalKeywords => props.onUpdate(row.id, {additionalKeywords})}
              />
            </div>
            <label className={s.field}>
              <span className={s.label}>Additive</span>
              <input className={s.input} type="number" value={row.additive} onChange={event => props.onUpdate(row.id, {additive: event.target.value})} />
            </label>
            <label className={s.field}>
              <span className={s.label}>Multiplier</span>
              <input className={s.input} type="number" value={row.multiplier} onChange={event => props.onUpdate(row.id, {multiplier: event.target.value})} />
            </label>
            <button className={s.dangerButton} type="button" onClick={() => props.onRemove(row.id)} title="Remove value">x</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function BuildingIdSection(props: {
  title: string;
  rows: BuildingIdRow[];
  sourceSpriteRows: RequiredSourceSpriteRow[];
  visualAssetOptions: readonly EntityVisualAsset[];
  structureId: string;
  vector: DevelopmentVectorKey;
  onAdd: () => void;
  onUpdate: (rowId: number, patch: Partial<BuildingIdRow>) => void;
  onUpdateSourceSprite: (sourceBuildingId: string, patch: Partial<Pick<RequiredSourceSpriteRow, "visualAssetId">>) => void;
  onDropFile: (sourceBuildingId: string, file: File) => void;
  onRemoveSprite: (sourceBuildingId: string) => void;
  onRemove: (rowId: number) => void;
}) {
  return (
    <section className={`${s.section} ${s.fullWidth}`}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>{props.title}</h2>
        <button className={s.button} type="button" onClick={props.onAdd} title={`Add ${props.title}`}>+</button>
      </div>
      <div className={s.rowList}>
        {props.rows.length === 0 && <span className={s.hint}>No required building ids yet.</span>}
        {props.rows.map(row => (
          <div key={row.id} className={s.idRow}>
            <label className={s.field}>
              <span className={s.label}>Building id</span>
              <select className={s.input} value={row.buildingId} onChange={event => props.onUpdate(row.id, {buildingId: event.target.value})}>
                <option value="">Select building</option>
                {buildingIds.map(buildingId => (
                  <option key={buildingId} value={buildingId}>{buildingId}</option>
                ))}
              </select>
            </label>
            <button className={s.dangerButton} type="button" onClick={() => props.onRemove(row.id)} title="Remove building id">x</button>
          </div>
        ))}
        {props.sourceSpriteRows.length > 0 && (
          <div className={s.sourceSpriteList}>
            {props.sourceSpriteRows.map(row => (
              <RequiredBuildingSpriteField
                key={row.sourceBuildingId}
                row={row}
                structureId={props.structureId}
                vector={props.vector}
                options={props.visualAssetOptions}
                onSelect={visualAssetId => props.onUpdateSourceSprite(row.sourceBuildingId, {visualAssetId})}
                onDropFile={file => props.onDropFile(row.sourceBuildingId, file)}
                onRemove={() => props.onRemoveSprite(row.sourceBuildingId)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RequiredBuildingSpriteField(props: {
  row: RequiredSourceSpriteRow;
  structureId: string;
  vector: DevelopmentVectorKey;
  options: readonly EntityVisualAsset[];
  onSelect: (visualAssetId: string) => void;
  onDropFile: (file: File) => void;
  onRemove: () => void;
}) {
  const [query, setQuery] = useState("");
  const generatedAssetId = getRequiredBuildingSpriteAssetId(
    props.vector,
    props.structureId,
    props.row.sourceBuildingId,
  );
  const selectedAsset = props.row.visualAssetId
    ? ENTITY_VISUAL_ASSETS_BY_ID[props.row.visualAssetId]
    : undefined;
  const previewSrc = props.row.spriteDraft?.previewUrl ?? selectedAsset?.src;
  const previewLabel = props.row.spriteDraft?.file.name ?? selectedAsset?.label ?? props.row.visualAssetId;
  const visibleOptions = props.options
    .filter(option => {
      const fileStem = "fileStem" in option ? option.fileStem : "";
      return `${option.label} ${option.id} ${fileStem}`.toLowerCase().includes(query.trim().toLowerCase());
    })
    .slice(0, 10);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) props.onDropFile(file);
  }

  function onDrop(event: DragEvent<HTMLLabelElement | HTMLDivElement>) {
    event.preventDefault();
    handleFiles(event.dataTransfer.files);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
    event.target.value = "";
  }

  return (
    <div className={s.requiredSpriteField}>
      <span className={s.label}>Replacement sprite for {props.row.sourceBuildingId}</span>
      {previewSrc ? (
        <div
          className={s.requiredSpriteCard}
          onDragOver={event => event.preventDefault()}
          onDrop={onDrop}
        >
          <img className={s.requiredSpriteThumb} src={previewSrc} alt={previewLabel} />
          <span className={s.spriteCaption}>{props.row.spriteDraft ? generatedAssetId : props.row.visualAssetId}</span>
          <div className={s.requiredSpriteActions}>
            <label className={s.spriteReplaceButton}>
              Replace
              <input className={s.fileInput} type="file" accept="image/png" onChange={onFileChange} />
            </label>
            <button className={s.dangerButton} type="button" onClick={props.onRemove} title="Clear replacement sprite">Clear</button>
          </div>
        </div>
      ) : (
        <label
          className={s.requiredSpriteDropZone}
          onDragOver={event => event.preventDefault()}
          onDrop={onDrop}
        >
          <input className={s.fileInput} type="file" accept="image/png" onChange={onFileChange} />
          <span className={s.spriteDropTitle}>Drop PNG</span>
          <span className={s.hint}>source asset: {generatedAssetId}</span>
        </label>
      )}
      <div className={s.multiSelect}>
        <input
          className={s.multiSearch}
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search existing building sprites"
        />
        {visibleOptions.length > 0 && (
          <div className={s.optionList}>
            {visibleOptions.map(option => (
              <button
                key={option.id}
                className={s.option}
                type="button"
                onClick={() => {
                  props.onSelect(option.id);
                  setQuery("");
                }}
              >
                {option.label} - {option.id}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VisualAssetField(props: {
  title: string;
  searchPlaceholder: string;
  emptyHint: string;
  options: readonly EntityVisualAsset[];
  selectedAsset: EntityVisualAsset | undefined;
  value: string;
  draft: SpriteDraft | null;
  onChange: (value: string) => void;
  onDropFile: (file: File) => void;
  onMetadataChange: (metadata: SpriteMetadata) => void;
  onRemove: () => void;
}) {
  const [query, setQuery] = useState("");
  const previewSrc = props.draft?.previewUrl ?? props.selectedAsset?.src;
  const previewLabel = props.draft?.file.name ?? props.selectedAsset?.label ?? props.value;
  const previewMetadata = props.draft?.metadata ?? props.selectedAsset?.metadata;
  const visibleOptions = props.options
    .filter(option => `${option.label} ${option.id}`.toLowerCase().includes(query.trim().toLowerCase()))
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

  function updateBuildingMetadata(patch: Partial<BuildingSpriteMetadata>) {
    if (!props.draft?.metadata || !isBuildingSpriteMetadata(props.draft.metadata)) return;
    props.onMetadataChange({
      ...props.draft.metadata,
      ...patch,
      shift: {
        ...props.draft.metadata.shift,
        ...patch.shift,
      },
    });
  }

  return (
    <section className={`${s.section} ${s.fullWidth}`}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>{props.title}</h2>
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
          placeholder={props.searchPlaceholder}
            />
            {visibleOptions.length > 0 && (
              <div className={s.optionList}>
                {visibleOptions.map(option => (
                  <button
                    key={option.id}
                    className={s.option}
                    type="button"
                    onClick={() => {
                      props.onChange(option.id);
                      setQuery("");
                    }}
                  >
                    {option.label} - {option.id}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={s.visualPreviewBox}>
          {previewSrc ? (
            <>
              <img className={s.visualPreviewImage} src={previewSrc} alt={previewLabel} />
              {props.draft?.metadata && isBuildingSpriteMetadata(props.draft.metadata) && (
                <div className={s.row}>
                  <label className={s.field}>
                    <span className={s.label}>Zoom</span>
                    <input
                      className={s.input}
                      type="number"
                      min="0.01"
                      step="0.05"
                      value={props.draft.metadata.zoom}
                      onChange={event => updateBuildingMetadata({zoom: parseNumberOrFallback(event.target.value, 1)})}
                    />
                  </label>
                  <label className={s.field}>
                    <span className={s.label}>Shift X</span>
                    <input
                      className={s.input}
                      type="number"
                      step="1"
                      value={props.draft.metadata.shift.x}
                      onChange={event => updateBuildingMetadata({shift: {x: parseNumberOrFallback(event.target.value, 0), y: props.draft?.metadata && isBuildingSpriteMetadata(props.draft.metadata) ? props.draft.metadata.shift.y : 0}})}
                    />
                  </label>
                  <label className={s.field}>
                    <span className={s.label}>Shift Y</span>
                    <input
                      className={s.input}
                      type="number"
                      step="1"
                      value={props.draft.metadata.shift.y}
                      onChange={event => updateBuildingMetadata({shift: {x: props.draft?.metadata && isBuildingSpriteMetadata(props.draft.metadata) ? props.draft.metadata.shift.x : 0, y: parseNumberOrFallback(event.target.value, 0)}})}
                    />
                  </label>
                </div>
              )}
              {previewMetadata && (
                <pre className={`${s.visualMetadataPreview} ${s.mono}`}>{JSON.stringify(previewMetadata, null, 2)}</pre>
              )}
            </>
          ) : (
            <span className={s.hint}>{props.emptyHint}</span>
          )}
        </div>
      </div>
    </section>
  );
}

function RequirementSection(props: {
  title: string;
  rows: RequirementRow[];
  onAdd: () => void;
  onUpdate: (rowId: number, patch: Partial<RequirementRow>) => void;
  onRemove: (rowId: number) => void;
}) {
  return (
    <section className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>{props.title}</h2>
        <button className={s.button} type="button" onClick={props.onAdd} title={`Add ${props.title}`}>+</button>
      </div>
      <div className={s.rowList}>
        {props.rows.length === 0 && <span className={s.hint}>No {props.title.toLowerCase()} yet.</span>}
        {props.rows.map(row => (
          <div key={row.id} className={s.requirementRow}>
            <label className={s.field}>
              <span className={s.label}>Type</span>
              <select
                className={s.input}
                value={row.type}
                onChange={event => props.onUpdate(row.id, {type: event.target.value as RequirementType, target: "", amount: ""})}
              >
                {requirementTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            {row.type === "buildingKeywordExists" ? (
              <label className={s.field}>
                <span className={s.label}>Keyword</span>
                <select className={s.input} value={row.target} onChange={event => props.onUpdate(row.id, {target: event.target.value})}>
                  <option value="">Select keyword</option>
                  {buildingKeywordOptions.map(keyword => (
                    <option key={keyword} value={keyword}>{keyword}</option>
                  ))}
                </select>
              </label>
            ) : row.type === "homogeneousValueAtLeast" || row.type === "homogeneousValueLessThan" ? (
              <>
                <label className={s.field}>
                  <span className={s.label}>Value</span>
                  <select className={s.input} value={row.target} onChange={event => props.onUpdate(row.id, {target: event.target.value})}>
                    <option value="">Select value</option>
                    {HOMOGENEOUS_VALUE_DEFINITION_LIST.map(definition => (
                      <option key={definition.id} value={definition.id}>{definition.label}</option>
                    ))}
                  </select>
                </label>
                <label className={s.field}>
                  <span className={s.label}>Amount</span>
                  <input className={s.input} type="number" value={row.amount} onChange={event => props.onUpdate(row.id, {amount: event.target.value})} />
                </label>
              </>
            ) : row.type === "globalFlagExists" || row.type === "globalFlagMissing" ? (
              <label className={s.field}>
                <span className={s.label}>Flag id</span>
                <input className={s.input} value={row.target} onChange={event => props.onUpdate(row.id, {target: event.target.value})} />
              </label>
            ) : (
              <label className={s.field}>
                <span className={s.label}>{row.type === "buildingExists" ? "Building id" : "Technology id"}</span>
                <select className={s.input} value={row.target} onChange={event => props.onUpdate(row.id, {target: event.target.value})}>
                  <option value="">Select {row.type === "buildingExists" ? "building" : "technology"}</option>
                  {(row.type === "buildingExists" ? buildingIds : technologyIds).map(id => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </label>
            )}
            <button className={s.dangerButton} type="button" onClick={() => props.onRemove(row.id)} title="Remove requirement">x</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function SearchableMultiSelect(props: {
  label: string;
  options: readonly string[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const selectedSet = new Set(props.selected);
  const visibleOptions = props.options
    .filter(option => !selectedSet.has(option))
    .filter(option => option.toLowerCase().includes(query.trim().toLowerCase()))
    .slice(0, 16);

  function addOption(option: string) {
    props.onChange([...props.selected, option]);
    setQuery("");
  }

  function removeOption(option: string) {
    props.onChange(props.selected.filter(selected => selected !== option));
  }

  return (
    <div className={s.field}>
      <span className={s.label}>{props.label}</span>
      <div className={s.multiSelect}>
        {props.selected.length > 0 && (
          <div className={s.chipList}>
            {props.selected.map(option => (
              <button key={option} className={s.chip} type="button" onClick={() => removeOption(option)} title={`Remove ${option}`}>
                {option} x
              </button>
            ))}
          </div>
        )}
        <input
          className={s.multiSearch}
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search keywords"
        />
        {visibleOptions.length > 0 && (
          <div className={s.optionList}>
            {visibleOptions.map(option => (
              <button key={option} className={s.option} type="button" onClick={() => addOption(option)}>
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

async function createSpriteDraft(file: File, entityType: EntityType, partType: TowerPartSlot): Promise<SpriteDraft> {
  const previewUrl = URL.createObjectURL(file);

  try {
    const sourceSpriteSize = await readImageSize(previewUrl);

    return {
      file,
      previewUrl,
      metadata: createDefaultSpriteMetadata(entityType, partType, sourceSpriteSize),
    };
  } catch (error) {
    URL.revokeObjectURL(previewUrl);
    throw error;
  }
}

function createSpriteSaveAction(args: {
  kind: EntityVisualAssetKind;
  vector: DevelopmentVectorKey;
  partType: TowerPartSlot;
  entityType: EntityType;
  generatedVisualAssetId: string;
  selectedVisualAssetId: string;
  removedVisualAssetId: string;
  spriteDraft: SpriteDraft | null;
}): SpriteSaveAction | undefined {
  if (args.spriteDraft) {
    const fileStem = getSpriteFileStem(args.entityType, args.vector, args.partType, args.generatedVisualAssetId);
    const previousVisualAssetId = args.selectedVisualAssetId || args.removedVisualAssetId;
    const previousFileStem = previousVisualAssetId && previousVisualAssetId !== args.generatedVisualAssetId
      ? getSpriteFileStem(args.entityType, args.vector, args.partType, previousVisualAssetId)
      : undefined;

    return {
      kind: args.kind,
      vector: args.vector,
      slot: args.entityType === "gunPart" ? args.partType : undefined,
      assetId: args.generatedVisualAssetId,
      fileStem,
      previousFileStem,
      metadata: args.spriteDraft.metadata,
    };
  }

  if (args.removedVisualAssetId) {
    return {
      kind: args.kind,
      vector: args.vector,
      slot: args.entityType === "gunPart" ? args.partType : undefined,
      assetId: args.removedVisualAssetId,
      fileStem: getSpriteFileStem(args.entityType, args.vector, args.partType, args.removedVisualAssetId),
    };
  }

  return undefined;
}

function createProjectileSpriteSaveAction(args: {
  vector: DevelopmentVectorKey;
  generatedProjectileVisualAssetId: string;
  selectedVisualAssetId: string;
  removedVisualAssetId: string;
  spriteDraft: SpriteDraft | null;
}): SpriteSaveAction | undefined {
  if (args.spriteDraft) {
    const fileStem = getProjectileSpriteFileStem(args.vector, args.generatedProjectileVisualAssetId);
    const previousVisualAssetId = args.selectedVisualAssetId || args.removedVisualAssetId;
    const previousFileStem = previousVisualAssetId && previousVisualAssetId !== args.generatedProjectileVisualAssetId
      ? getProjectileSpriteFileStem(args.vector, previousVisualAssetId)
      : undefined;

    return {
      kind: "projectile",
      vector: args.vector,
      assetId: args.generatedProjectileVisualAssetId,
      fileStem,
      previousFileStem,
    };
  }

  if (args.removedVisualAssetId) {
    return {
      kind: "projectile",
      vector: args.vector,
      assetId: args.removedVisualAssetId,
      fileStem: getProjectileSpriteFileStem(args.vector, args.removedVisualAssetId),
    };
  }

  return undefined;
}

function createRequiredBuildingSpriteSaveActions(args: {
  vector: DevelopmentVectorKey;
  structureId: string;
  requiredSourceSpriteRows: readonly RequiredSourceSpriteRow[];
}): {sourceBuildingId: string; spriteAction: SpriteSaveAction}[] {
  return args.requiredSourceSpriteRows.flatMap(row => {
    if (!row.spriteDraft) return [];
    const assetId = getRequiredBuildingSpriteAssetId(args.vector, args.structureId, row.sourceBuildingId);

    return [{
      sourceBuildingId: row.sourceBuildingId,
      spriteAction: {
        kind: "building",
        vector: args.vector,
        assetId,
        fileStem: assetId,
        metadata: row.spriteDraft.metadata,
      },
    }];
  });
}

function getEffectiveRequiredBuildingSpriteId(row: RequiredSourceSpriteRow): string | null {
  return row.spriteDraft ? "" : row.visualAssetId || null;
}

function getRequiredBuildingSpriteAssetId(
  vector: DevelopmentVectorKey,
  structureId: string,
  sourceBuildingId: string,
): string {
  return `building_${vector}_${camelToKebab(getEntityItemName(structureId))}-from-${camelToKebab(getEntityItemName(sourceBuildingId))}`;
}

async function applySpriteSaveAction(
  action: SpriteSaveAction,
  spriteDraft: SpriteDraft | null,
): Promise<{action?: string; file?: string} | undefined> {
  if (!spriteDraft) {
    const response = await fetch(`${localDataServerUrl}/entity-sprites`, {
      method: "DELETE",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(action),
    });
    const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

    if (!response.ok) {
      throw new Error(responseBody?.error ?? `Sprite delete failed with status ${response.status}.`);
    }

    return responseBody ?? {};
  }

  const formData = new FormData();
  formData.append("kind", action.kind);
  formData.append("vector", action.vector);
  if (action.slot) formData.append("slot", action.slot);
  formData.append("assetId", action.assetId);
  formData.append("fileStem", action.fileStem);
  if (action.previousFileStem) formData.append("previousFileStem", action.previousFileStem);
  if (action.metadata) formData.append("metadata", JSON.stringify(action.metadata));
  formData.append("image", spriteDraft.file, spriteDraft.file.name);

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

function getSpriteAssetId(
  entityType: EntityType,
  vector: DevelopmentVectorKey,
  entityId: string,
): string {
  if (entityType === "building") return `building_${vector}_${camelToKebab(getEntityItemName(entityId))}`;
  if (entityType === "gunPart") return entityId;
  if (entityType === "wallSegment" || entityType === "wallSuperstructure") return entityId;
  return "";
}

function getProjectileSpriteAssetId(vector: DevelopmentVectorKey, entityId: string): string {
  return `projectiles.${vector}.${getEntityItemName(entityId)}`;
}

function getSpriteFileStem(
  entityType: EntityType,
  vector: DevelopmentVectorKey,
  partType: TowerPartSlot,
  assetId: string,
): string {
  if (entityType === "building") {
    return assetId.includes(".") ? `building_${vector}_${camelToKebab(getEntityItemName(assetId))}` : assetId;
  }

  if (entityType === "wallSegment") {
    return assetId.startsWith(`wall_${vector}_`) ? assetId : `wall_${vector}_${camelToKebab(getEntityItemName(assetId))}`;
  }

  if (entityType === "wallSuperstructure") {
    return assetId.startsWith(`walltop_${vector}_`) ? assetId : `walltop_${vector}_${camelToKebab(getEntityItemName(assetId))}`;
  }

  if (entityType === "gunPart") {
    return assetId.startsWith(`${vector}_${partType}_`) ? assetId : `${vector}_${partType}_${camelToKebab(getEntityItemName(assetId))}`;
  }

  return assetId;
}

function getProjectileSpriteFileStem(vector: DevelopmentVectorKey, assetId: string): string {
  return assetId.startsWith(`${vector}_projectile_`)
    ? assetId
    : `${vector}_projectile_${camelToKebab(getEntityItemName(assetId))}`;
}

function createDefaultSpriteMetadata(
  entityType: EntityType,
  partType: TowerPartSlot,
  sourceSpriteSize: {width: number; height: number},
): SpriteMetadata | undefined {
  if (entityType === "building") {
    return {
      zoom: 1,
      shift: {
        x: 0,
        y: 0,
      },
    };
  }

  if (entityType === "wallSegment") {
    return {
      sourceSpriteSize,
      targetSpriteSize: fitSpriteSize(sourceSpriteSize, 80, 80),
    };
  }

  if (entityType === "wallSuperstructure") {
    return {
      sourceSpriteSize,
      targetSpriteSize: fitSpriteSize(sourceSpriteSize, 80, 80),
    };
  }

  const center = {
    x: Math.round(sourceSpriteSize.width / 2),
    y: Math.round(sourceSpriteSize.height / 2),
  };

  return {
    sourceSpriteSize,
    targetSpriteSize: fitSpriteSize(sourceSpriteSize, 120, 80),
    inputSocket: center,
    outputSockets: getDefaultOutputSockets(partType, center),
  };
}

function getDefaultOutputSockets(partType: TowerPartSlot, center: {x: number; y: number}): Record<string, {x: number; y: number}> {
  if (partType !== "launchSystem") return {};

  return {
    platform: center,
    ammo: center,
    barrel: center,
    aimSystem: center,
    loadingSystem: center,
  };
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

function getEntityItemName(id: string): string {
  return id.split(".").at(-1) ?? id;
}

function camelToKebab(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function createPreview(args: {
  entityType: EntityType;
  vector: DevelopmentVectorKey;
  generatedId: string;
  partType: TowerPartSlot;
  isSuperstructure: boolean;
  displayName: string;
  description: string;
  hint: string;
  requiredBuildingRows: BuildingIdRow[];
  requiredSourceSpriteRows: RequiredSourceSpriteRow[];
  keywords: string[];
  providedValueRows: ValueRow[];
  upkeepValueRows: ValueRow[];
  effectRows: EffectRow[];
  requirementRows: RequirementRow[];
  buildRequirementRows: RequirementRow[];
  visualAssetId: string;
  projectileVisualAssetId: string;
  baseDefinition: StoredEntityDefinition | null;
}): Record<string, unknown> {
  const keywords = args.keywords;
  const values = [
    ...args.providedValueRows.map(row => createValueEffect(row, "production")),
    ...args.upkeepValueRows.map(row => createValueEffect(row, "upkeep")),
  ]
    .filter((value): value is HomogeneousValueEffect => Boolean(value));
  const effects = args.effectRows
    .map(createAdjacencyRule)
    .filter((effect): effect is HomogeneousAdjacencyRule => Boolean(effect));
  const requirements = args.requirementRows
    .map(createRequirement)
    .filter((requirement): requirement is Requirement => Boolean(requirement));
  const buildRequirements = args.buildRequirementRows
    .map(createRequirement)
    .filter((requirement): requirement is Requirement => Boolean(requirement));
  const preview: Record<string, unknown> = args.baseDefinition ? {...args.baseDefinition} : {
    id: args.generatedId,
  };
  preview.id = args.generatedId;

  if (args.entityType === "research") {
    preview.parentId = null;
  }

  if (args.entityType === "gunPart") {
    preview.slot = args.partType;
    delete preview.visualAssetId;
    if (args.visualAssetId) {
      preview.spriteTextureKey = args.visualAssetId;
    } else {
      delete preview.spriteTextureKey;
    }

    if (args.partType === "ammo" && args.projectileVisualAssetId) {
      preview.projectileSpriteTextureKey = args.projectileVisualAssetId;
    } else {
      delete preview.projectileSpriteTextureKey;
    }
  } else {
    delete preview.spriteTextureKey;
    delete preview.projectileSpriteTextureKey;
    if (args.visualAssetId) {
      preview.visualAssetId = args.visualAssetId;
    } else {
      delete preview.visualAssetId;
    }
  }

  preview.name = args.displayName.trim() || titleFromIdPart(args.generatedId);

  if (args.entityType === "building") {
    preview.kind = args.isSuperstructure ? "superstructure" : "building";
  }

  if (args.entityType === "research") {
    preview.summary = args.description.trim();
  } else {
    preview.description = args.description.trim();
  }

  if (args.entityType === "building" && args.isSuperstructure) {
    const validRequiredBuildingRows = args.requiredBuildingRows.filter(row => row.buildingId);
    const requiredBuildingIds = validRequiredBuildingRows.map(row => row.buildingId);
    const requiredBuildingSpriteEntries = args.requiredSourceSpriteRows.flatMap(row => {
      const spriteId = row.spriteDraft
        ? getRequiredBuildingSpriteAssetId(args.vector, args.generatedId, row.sourceBuildingId)
        : getEffectiveRequiredBuildingSpriteId(row);

      return spriteId ? [[row.sourceBuildingId, spriteId] as const] : [];
    });
    const requiredBuildingSprites = Object.fromEntries(requiredBuildingSpriteEntries);
    if (requiredBuildingIds.length > 0) {
      preview.requiredBuildingIds = requiredBuildingIds;
    }
    if (requiredBuildingSpriteEntries.length > 0) {
      preview.requiredBuildingSprites = requiredBuildingSprites;
    } else {
      delete preview.requiredBuildingSprites;
    }
  }

  if (args.entityType === "building" && args.isSuperstructure && args.hint.trim()) {
    preview.hint = args.hint.trim();
  }

  if (keywords.length > 0) {
    preview.keywords = keywords;
  }

  if (requirements.length > 0) {
    preview.requirements = requirements;
  }

  if (
    (args.entityType === "building" || args.entityType === "wallSegment" || args.entityType === "wallSuperstructure")
    && buildRequirements.length > 0
  ) {
    preview.buildRequirements = buildRequirements;
  }

  if (values.length > 0) {
    preview.values = values;
  }

  if (effects.length > 0) {
    preview.effects = effects;
  }

  return removeEmpty(preview);
}

function createRequirement(row: RequirementRow): Requirement | null {
  if (!row.target.trim()) return null;

  if (row.type === "buildingKeywordExists") {
    return {type: row.type, keyword: row.target};
  }

  if (row.type === "buildingExists") {
    return {type: row.type, buildingId: row.target};
  }

  if (row.type === "technologyUnlocked") {
    return {type: row.type, technologyId: row.target};
  }

  if (row.type === "globalFlagExists" || row.type === "globalFlagMissing") {
    return {type: row.type, flagId: row.target};
  }

  const amount = parseOptionalNumber(row.amount);
  if (amount === null) return null;

  return {type: row.type, valueId: row.target, amount};
}

function getStoredVisualAssetId(storedEntity: StoredEntityLookup): string {
  const explicitVisualAssetId = storedEntity.definition.spriteTextureKey ?? storedEntity.definition.visualAssetId;
  if (explicitVisualAssetId) return explicitVisualAssetId;

  const inferredVisualAssetId = getSpriteAssetId(
    storedEntity.entityType,
    storedEntity.vector,
    storedEntity.definition.id,
  );

  return inferredVisualAssetId && ENTITY_VISUAL_ASSETS_BY_ID[inferredVisualAssetId]
    ? inferredVisualAssetId
    : "";
}

function findStoredEntity(id: string): StoredEntityLookup | null {
  const inferred = inferEntityPartsFromId(id);
  const definitions = rawDefinitionsByType[inferred.entityType][inferred.vector];
  const definition = definitions.find(item => item.id === id);
  if (!definition) {
    for (const vector of vectorOptions) {
      const crossVectorDefinition = rawDefinitionsByType[inferred.entityType][vector].find(item => item.id === id);
      if (crossVectorDefinition) {
        return {
          entityType: inferred.entityType,
          vector,
          definition: crossVectorDefinition,
        };
      }
    }

    return null;
  }

  return {
    entityType: inferred.entityType,
    vector: inferred.vector,
    definition,
  };
}

function inferEntityPartsFromId(id: string): {entityType: EntityType; vector: DevelopmentVectorKey; itemName: string; partType?: TowerPartSlot} {
  const [prefix, rawVector, ...rest] = id.split(".");
  const entityType = getEntityTypeFromPrefix(prefix);
  const vector = isDevelopmentVectorKey(rawVector) ? rawVector : "medieval";
  const partType = entityType === "gunPart" && isTowerPartSlot(rest[0]) ? rest[0] : undefined;
  const rawItemName = entityType === "gunPart" && rest.length > 1
    ? rest.slice(1).join(".")
    : rest.join(".");

  return {
    entityType,
    vector,
    itemName: rawItemName || "newEntity",
    partType,
  };
}

function getEntityTypeFromPrefix(prefix: string | undefined): EntityType {
  if (prefix === "buildings") return "building";
  if (prefix === "wallSegments") return "wallSegment";
  if (prefix === "wallSuperstructures") return "wallSuperstructure";
  if (prefix === "gunParts") return "gunPart";
  return "research";
}

function getVisualAssetKind(entityType: EntityType): EntityVisualAssetKind | null {
  if (entityType === "building") return "building";
  if (entityType === "wallSegment") return "wallSegment";
  if (entityType === "wallSuperstructure") return "wallSuperstructure";
  if (entityType === "gunPart") return "gunPart";
  return null;
}

function isDevelopmentVectorKey(value: string | undefined): value is DevelopmentVectorKey {
  return vectorOptions.includes(value as DevelopmentVectorKey);
}

function isTowerPartSlot(value: string | undefined): value is TowerPartSlot {
  return TOWER_PART_SLOT_ORDER.some(slot => slot.key === value);
}

function getAutomaticKeywords(
  entityType: EntityType,
  vector: DevelopmentVectorKey,
  partType: TowerPartSlot,
): string[] {
  if (entityType === "research") return [vector, "technology"];
  if (entityType === "building") return [vector, "building"];
  if (entityType === "wallSegment") return [vector, "wallSegment"];
  if (entityType === "wallSuperstructure") return [vector, "wallSuperstructure"];
  return [vector, "gunPart", partType];
}

function mergeKeywords(defaultKeywords: readonly string[], selectedKeywords: readonly string[]): string[] {
  return [...new Set([...defaultKeywords, ...selectedKeywords])];
}

function createBuildingIdRows(ids: readonly string[]): BuildingIdRow[] {
  return ids.map(buildingId => ({
    id: nextRowId++,
    buildingId,
  }));
}

function createRequiredSourceSpriteRows(
  requiredBuildingIds: readonly string[],
  sprites: RequiredBuildingSpriteMap = {},
): RequiredSourceSpriteRow[] {
  return getSourceBuildingIdsForRequirements(requiredBuildingIds).map(sourceBuildingId => ({
    sourceBuildingId,
    visualAssetId: sprites[sourceBuildingId] ?? "",
    spriteDraft: null,
  }));
}

function syncRequiredSourceSpriteRows(
  rows: readonly RequiredSourceSpriteRow[],
  sourceBuildingIds: readonly string[],
): RequiredSourceSpriteRow[] {
  const rowsBySourceId = new Map(rows.map(row => [row.sourceBuildingId, row]));
  const nextSourceIdSet = new Set(sourceBuildingIds);

  for (const row of rows) {
    if (!nextSourceIdSet.has(row.sourceBuildingId) && row.spriteDraft) {
      URL.revokeObjectURL(row.spriteDraft.previewUrl);
    }
  }

  return sourceBuildingIds.map(sourceBuildingId => rowsBySourceId.get(sourceBuildingId) ?? {
    sourceBuildingId,
    visualAssetId: "",
    spriteDraft: null,
  });
}

function getSourceBuildingIdsForRequirements(requiredBuildingIds: readonly string[]): string[] {
  const sourceBuildingIds = new Set<string>();

  for (const buildingId of requiredBuildingIds) {
    for (const sourceBuildingId of getSourceBuildingIdsForRequirement(buildingId)) {
      sourceBuildingIds.add(sourceBuildingId);
    }
  }

  return [...sourceBuildingIds];
}

function getSourceBuildingIdsForRequirement(buildingId: string): string[] {
  if (!buildingId) return [];
  const structure = STRUCTURES_BY_ID[buildingId];
  if (!structure) return [buildingId];

  const sourceBuildingIds = new Set<string>();
  for (const requiredBuildingId of structure.requiredBuildingIds) {
    for (const sourceBuildingId of getSourceBuildingIdsForRequirement(requiredBuildingId)) {
      sourceBuildingIds.add(sourceBuildingId);
    }
  }

  return [...sourceBuildingIds];
}

function createRequirementRows(requirements: readonly Requirement[]): RequirementRow[] {
  return requirements.map(requirement => {
    if (requirement.type === "buildingKeywordExists") {
      return {
        id: nextRowId++,
        type: requirement.type,
        target: requirement.keyword,
        amount: "",
      };
    }

    if (requirement.type === "buildingExists") {
      return {
        id: nextRowId++,
        type: requirement.type,
        target: requirement.buildingId,
        amount: "",
      };
    }

    if (requirement.type === "technologyUnlocked") {
      return {
        id: nextRowId++,
        type: requirement.type,
        target: requirement.technologyId,
        amount: "",
      };
    }

    if (requirement.type === "globalFlagExists" || requirement.type === "globalFlagMissing") {
      return {
        id: nextRowId++,
        type: requirement.type,
        target: requirement.flagId,
        amount: "",
      };
    }

    return {
      id: nextRowId++,
      type: requirement.type,
      target: requirement.valueId,
      amount: String(requirement.amount),
    };
  });
}

function createValueRows(values: readonly HomogeneousValueEffect[], role: ValueRole): ValueRow[] {
  return values
    .filter(value => getValueRole(value) === role)
    .map(value => ({
      id: nextRowId++,
      valueId: value.valueId,
      additionalKeywords: getAdditionalValueKeywords(value),
      additive: value.additive === undefined || value.additive === null ? "" : String(value.additive),
      multiplier: value.multiplier === undefined || value.multiplier === null ? "" : String(value.multiplier),
      base: value,
    }));
}

function createEffectRows(effects: readonly HomogeneousAdjacencyRule[]): EffectRow[] {
  return effects.map(effect => ({
    id: nextRowId++,
    requiredBuildingKeywords: [...(effect.requiredBuildingKeywords ?? [])],
    additionalBuildingKeywords: [...(effect.additionalBuildingKeywords ?? [])],
    requiredValueKeywords: [...(effect.requiredValueKeywords ?? [])],
    additive: effect.additive === undefined || effect.additive === null ? "" : String(effect.additive),
    multiplier: effect.multiplier === undefined || effect.multiplier === null ? "" : String(effect.multiplier),
    radius: effect.radius === undefined ? "" : String(effect.radius),
    base: effect,
  }));
}

function createValueEffect(row: ValueRow, role: ValueRole): HomogeneousValueEffect | null {
  const additive = parseOptionalNumber(row.additive);
  const multiplier = parseOptionalNumber(row.multiplier);
  if (!row.base && additive === null && multiplier === null) return null;
  const retainedKeywords = row.additionalKeywords
    .filter(keyword => keyword !== "production" && keyword !== "upkeep");

  const effect: HomogeneousValueEffect = {
    ...row.base,
    valueId: row.valueId,
    additionalKeywords: [role, ...retainedKeywords],
  };

  if (additive !== null) {
    effect.additive = additive;
  } else {
    delete effect.additive;
  }

  if (multiplier !== null) {
    effect.multiplier = multiplier;
  } else {
    delete effect.multiplier;
  }

  return effect;
}

function getValueRole(value: HomogeneousValueEffect): ValueRole {
  return value.additionalKeywords?.includes("upkeep") ? "upkeep" : "production";
}

function getAdditionalValueKeywords(value: HomogeneousValueEffect): string[] {
  return (value.additionalKeywords ?? []).filter(keyword => keyword !== "production" && keyword !== "upkeep");
}

function createAdjacencyRule(row: EffectRow): HomogeneousAdjacencyRule | null {
  const additive = parseOptionalNumber(row.additive);
  const multiplier = parseOptionalNumber(row.multiplier);
  const radius = parseOptionalNumber(row.radius);

  if (
    !row.base
    && additive === null
    && multiplier === null
    && radius === null
    && row.requiredBuildingKeywords.length === 0
    && row.additionalBuildingKeywords.length === 0
    && row.requiredValueKeywords.length === 0
  ) {
    return null;
  }

  const effect: HomogeneousAdjacencyRule = {...row.base};

  if (row.requiredBuildingKeywords.length > 0) {
    effect.requiredBuildingKeywords = [...row.requiredBuildingKeywords];
  } else {
    delete effect.requiredBuildingKeywords;
  }

  if (row.additionalBuildingKeywords.length > 0) {
    effect.additionalBuildingKeywords = [...row.additionalBuildingKeywords];
  } else {
    delete effect.additionalBuildingKeywords;
  }

  if (row.requiredValueKeywords.length > 0) {
    effect.requiredValueKeywords = [...row.requiredValueKeywords];
  } else {
    delete effect.requiredValueKeywords;
  }

  if (additive !== null) {
    effect.additive = additive;
  } else {
    delete effect.additive;
  }

  if (multiplier !== null) {
    effect.multiplier = multiplier;
  } else {
    delete effect.multiplier;
  }

  if (radius !== null) {
    effect.radius = radius;
  } else {
    delete effect.radius;
  }

  return effect;
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

function isBuildingSpriteMetadata(metadata: SpriteMetadata): metadata is BuildingSpriteMetadata {
  return "zoom" in metadata && "shift" in metadata;
}

function normalizeIdPart(value: string): string {
  const compact = value
    .trim()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, char: string) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "");
  if (!compact) return "newEntity";
  return compact.charAt(0).toLowerCase() + compact.slice(1);
}

function titleFromIdPart(id: string): string {
  const lastPart = id.split(".").at(-1) ?? "New Entity";
  return lastPart
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, char => char.toUpperCase())
    .trim();
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
