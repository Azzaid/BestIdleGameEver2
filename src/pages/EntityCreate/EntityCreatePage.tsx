import {useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent} from "react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {TowerPartSlot} from "../../models/battle/towerParts.ts";
import type {TowerPartVisualMetadata} from "../../models/battle/towerPartVisualMetadata.ts";
import {getTowerVisualRenderedSize} from "../../models/battle/towerVisualSizing.ts";
import type {
  HomogeneousAdjacencyRule,
  HomogeneousDerivedValueEffect,
  HomogeneousValueEffect,
} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import type {BuildingSpriteMetadata} from "../../models/sprites/buildings/BuildingSpriteMetadata.ts";
import {getBuildingSpriteSize} from "../../models/sprites/buildings/buildingSpriteLayout.ts";
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
import neutralResearchDefinitions from "../../data/research/neutral.json";
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
import {SpriteHexPreview} from "../../components/SpriteHexPreview.tsx";
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

type DerivedValueRow = {
  id: number;
  valueId: string;
  derivedFrom: string;
  derivedMultiplicator: string;
  additionalKeywords: string[];
  additive: string;
  multiplier: string;
  base?: HomogeneousDerivedValueEffect;
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
  derivedValues?: HomogeneousDerivedValueEffect[];
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

type SizedSpriteMetadata = SpriteMetadata & {
  sourceSpriteSize?: {width: number; height: number};
  targetSpriteSize: {width: number; height: number};
  rotationDegrees?: number;
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
const derivedSourceValueOptions = HOMOGENEOUS_VALUE_DEFINITION_LIST.filter(definition => (
  definition.id.startsWith("resource.") || definition.id.startsWith("city.")
));
const defaultDerivedSourceValueId = derivedSourceValueOptions[0]?.id ?? defaultValueId;
const towerDerivedTargetValueOptions = HOMOGENEOUS_VALUE_DEFINITION_LIST.filter(definition => definition.id.startsWith("tower."));
const wallDerivedTargetValueOptions = HOMOGENEOUS_VALUE_DEFINITION_LIST.filter(definition => definition.id.startsWith("wall."));
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
const hexRadiusNumberStep = "0.001";
const visualPreviewZoomMin = 0.25;
const visualPreviewZoomMax = 8;
const visualPreviewZoomStep = 0.25;

let nextRowId = 1;

const rawDefinitionsByType: Record<EntityType, Record<DevelopmentVectorKey, readonly StoredEntityDefinition[]>> = {
  research: {
    neutral: neutralResearchDefinitions as readonly StoredEntityDefinition[],
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
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftName = searchParams.get("name") ?? undefined;
  const draftDescription = searchParams.get("description") ?? undefined;
  const copyFromEntityId = searchParams.get("copyFrom") ?? undefined;
  const [entityType, setEntityType] = useState<EntityType>("research");
  const [vector, setVector] = useState<DevelopmentVectorKey>("medieval");
  const [partType, setPartType] = useState<TowerPartSlot>("launchSystem");
  const [isSuperstructure, setIsSuperstructure] = useState(false);
  const [itemName, setItemName] = useState("newEntity");
  const [displayName, setDisplayName] = useState("New Entity");
  const [parentId, setParentId] = useState("");
  const [description, setDescription] = useState("");
  const [hint, setHint] = useState("");
  const [requiredBuildingRows, setRequiredBuildingRows] = useState<BuildingIdRow[]>([]);
  const [requiredSourceSpriteRows, setRequiredSourceSpriteRows] = useState<RequiredSourceSpriteRow[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [visualAssetId, setVisualAssetId] = useState("");
  const [spriteDraft, setSpriteDraft] = useState<SpriteDraft | null>(null);
  const [visualAssetMetadataDraft, setVisualAssetMetadataDraft] = useState<SpriteMetadata | null>(null);
  const [removedVisualAssetId, setRemovedVisualAssetId] = useState("");
  const [projectileVisualAssetId, setProjectileVisualAssetId] = useState("");
  const [projectileSpriteDraft, setProjectileSpriteDraft] = useState<SpriteDraft | null>(null);
  const [removedProjectileVisualAssetId, setRemovedProjectileVisualAssetId] = useState("");
  const [providedValueRows, setProvidedValueRows] = useState<ValueRow[]>([]);
  const [upkeepValueRows, setUpkeepValueRows] = useState<ValueRow[]>([]);
  const [derivedValueRows, setDerivedValueRows] = useState<DerivedValueRow[]>([]);
  const [effectRows, setEffectRows] = useState<EffectRow[]>([]);
  const [requirementRows, setRequirementRows] = useState<RequirementRow[]>([]);
  const [buildRequirementRows, setBuildRequirementRows] = useState<RequirementRow[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({kind: "idle", message: ""});
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const previousAutomaticKeywordsRef = useRef<string[]>([]);
  const loadedEntity = useMemo(() => entityId === "new" ? null : findStoredEntity(entityId), [entityId]);
  const copiedEntity = useMemo(
    () => entityId === "new" && copyFromEntityId ? findStoredEntity(copyFromEntityId) : null,
    [copyFromEntityId, entityId],
  );
  const isEditingExisting = Boolean(loadedEntity);

  const idPrefix = entityTypeOptions.find(option => option.value === entityType)?.prefix ?? "research";
  const normalizedItemName = normalizeIdPart(itemName);
  const generatedId = entityType === "gunPart"
    ? `${idPrefix}.${vector}.${partType}.${normalizedItemName}`
    : `${idPrefix}.${vector}.${normalizedItemName}`;
  const showBuildingFields = entityType === "building";
  const showBuildRequirements = entityType === "building" || entityType === "wallSegment" || entityType === "wallSuperstructure";
  const showDerivedValues = isDerivedValueEntityType(entityType);
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
      if (copiedEntity) {
        fillFormFromStoredEntity(copiedEntity, {asCopy: true});
        return;
      }

      resetFormForNewEntity({
        name: draftName,
        description: draftDescription,
      });
      return;
    }

    const storedEntity = findStoredEntity(entityId);
    if (!storedEntity) {
      resetFormForUnknownEntity(entityId);
      return;
    }

    fillFormFromStoredEntity(storedEntity);
  }, [copiedEntity, draftDescription, draftName, entityId]);

  const entityPreview = useMemo(() => (
    createPreview({
      entityType,
      vector,
      generatedId,
      partType,
      isSuperstructure,
      displayName,
      parentId,
      description,
      hint,
      requiredBuildingRows,
      requiredSourceSpriteRows,
      keywords,
      visualAssetId: effectiveVisualAssetId,
      projectileVisualAssetId: effectiveProjectileVisualAssetId,
      providedValueRows,
      upkeepValueRows,
      derivedValueRows,
      effectRows,
      requirementRows,
      buildRequirementRows,
      baseDefinition: loadedEntity?.definition ?? copiedEntity?.definition ?? null,
    })
  ), [
    buildRequirementRows,
    description,
    displayName,
    parentId,
    derivedValueRows,
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
    copiedEntity,
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

  function addDerivedValueRow() {
    const targetOptions = getDerivedTargetValueOptions(entityType);
    setDerivedValueRows(rows => [
      ...rows,
      {
        id: nextRowId++,
        valueId: targetOptions[0]?.id ?? HOMOGENEOUS_VALUE_DEFINITION_LIST[0]?.id ?? "tower.projectileDamage",
        derivedFrom: defaultDerivedSourceValueId,
        derivedMultiplicator: "",
        additionalKeywords: [],
        additive: "",
        multiplier: "",
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
          {entityId === "new" && copyFromEntityId && !copiedEntity && (
            <p className={s.subtitle}>No stored entity found for {copyFromEntityId}; starting with a blank draft.</p>
          )}
        </header>

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Identity</h2>
          </div>
          <div className={s.grid}>
            <label className={s.field}>
              <span className={s.label}>Entity type</span>
              <SearchableSelect
                value={entityType}
                options={entityTypeOptions}
                placeholder="Search entity types"
                onChange={value => setEntityType(value as EntityType)}
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>Vector</span>
              <SearchableSelect
                value={vector}
                options={vectorOptions.map(option => ({value: option, label: option}))}
                placeholder="Search vectors"
                onChange={value => setVector(value as DevelopmentVectorKey)}
              />
            </label>
            {entityType === "gunPart" && (
              <label className={s.field}>
                <span className={s.label}>Part type</span>
                <SearchableSelect
                  value={partType}
                  options={TOWER_PART_SLOT_ORDER.map(option => ({value: option.key, label: option.label}))}
                  placeholder="Search part types"
                  onChange={value => setPartType(value as TowerPartSlot)}
                />
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
                metadataOverride={visualAssetMetadataDraft ?? undefined}
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
            {entityType === "research" && (
              <label className={s.field}>
                <span className={s.label}>Parent technology</span>
                <SearchableSelect
                  value={parentId}
                  options={[
                    {value: "", label: "No parent"},
                    ...technologyIds
                      .filter(technologyId => technologyId !== generatedId)
                      .map(technologyId => ({value: technologyId, label: technologyId})),
                  ]}
                  placeholder="Search technologies"
                  onChange={updateParentId}
                />
              </label>
            )}
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

        {showDerivedValues && (
          <DerivedValueSection
            entityType={entityType}
            rows={derivedValueRows}
            onAdd={addDerivedValueRow}
            onUpdate={updateDerivedValueRow}
            onRemove={removeDerivedValueRow}
          />
        )}

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
                  <span className={s.label}>Radius (hexR)</span>
                  <input className={s.input} type="number" step={hexRadiusNumberStep} value={row.radius} onChange={event => updateEffectRow(row.id, {radius: event.target.value})} />
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

  function updateDerivedValueRow(rowId: number, patch: Partial<DerivedValueRow>) {
    setDerivedValueRows(rows => rows.map(row => row.id === rowId ? {...row, ...patch} : row));
  }

  function removeDerivedValueRow(rowId: number) {
    setDerivedValueRows(rows => rows.filter(row => row.id !== rowId));
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

  function updateParentId(nextParentId: string) {
    const previousParentId = parentId;
    setParentId(nextParentId);
    setRequirementRows(rows => rows.filter(row => !(
      row.type === "technologyUnlocked"
      && (row.target === previousParentId || row.target === nextParentId)
    )));
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
    setVisualAssetMetadataDraft(null);
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
      setVisualAssetMetadataDraft(null);
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
      setVisualAssetMetadataDraft(null);
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
    if (spriteDraft) {
      setSpriteDraft({...spriteDraft, metadata});
      return;
    }

    setVisualAssetMetadataDraft(metadata);
  }

  async function saveEntity() {
    setSaveStatus({kind: "saving", message: "Saving to local data server..."});

    try {
      const existingGeneratedEntity = findStoredEntity(generatedId);
      if (existingGeneratedEntity && existingGeneratedEntity.definition.id !== loadedEntity?.definition.id) {
        setSaveStatus({
          kind: "error",
          message: `Entity "${generatedId}" already exists. Choose a different id before saving.`,
        });
        return;
      }

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
      const spriteMetadataResult = !spriteAction && visualAssetKind && effectiveVisualAssetId && visualAssetMetadataDraft
        ? await applySpriteMetadataSaveAction({
          ...getSpriteMetadataSaveTarget(entityType, vector, partType, effectiveVisualAssetId),
          metadata: visualAssetMetadataDraft,
        })
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
        parentId,
        description,
        hint,
        requiredBuildingRows,
        requiredSourceSpriteRows: savedRequiredSourceSpriteRows,
        keywords,
        providedValueRows,
        upkeepValueRows,
        derivedValueRows,
        effectRows,
        requirementRows,
        buildRequirementRows,
        visualAssetId: effectiveVisualAssetId,
        projectileVisualAssetId: effectiveProjectileVisualAssetId,
        baseDefinition: loadedEntity?.definition ?? copiedEntity?.definition ?? null,
      });
      const response = await fetch(`${localDataServerUrl}/entities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entity: previewToSave,
          previousEntityId: loadedEntity?.definition.id,
        }),
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
          spriteMetadataResult?.action ? `sprite metadata ${spriteMetadataResult.action}` : "",
          projectileSpriteResult?.action ? `projectile sprite ${projectileSpriteResult.action}` : "",
          requiredBuildingSpriteResults.length ? `${requiredBuildingSpriteResults.length} multistructure sprite${requiredBuildingSpriteResults.length === 1 ? "" : "s"} saved` : "",
        ].filter(Boolean).join("; ") + ".",
      });
      setSpriteDraft(null);
      setRemovedVisualAssetId("");
      setVisualAssetId(effectiveVisualAssetId);
      if (spriteMetadataResult) setVisualAssetMetadataDraft(null);
      setProjectileSpriteDraft(null);
      setRemovedProjectileVisualAssetId("");
      setProjectileVisualAssetId(effectiveProjectileVisualAssetId);
      setRequiredSourceSpriteRows(savedRequiredSourceSpriteRows);
      if (entityId !== generatedId) {
        navigate(`/dev/entity-create/${encodeURIComponent(generatedId)}`, {replace: true});
      }
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message: error instanceof Error
          ? error.message
          : "Could not reach local data server at http://127.0.0.1:4317.",
      });
    }
  }

  function resetFormForNewEntity(draft?: {name?: string; description?: string}) {
    setEntityType("research");
    setVector("medieval");
    setPartType("launchSystem");
    setIsSuperstructure(false);
    setItemName(draft?.name ? normalizeIdPart(draft.name) : "newEntity");
    setDisplayName(draft?.name?.trim() || "New Entity");
    setParentId("");
    setDescription(draft?.description?.trim() || "");
    setHint("");
    setRequiredBuildingRows([]);
    setRequiredSourceSpriteRows([]);
    setKeywords(getAutomaticKeywords("research", "medieval", "launchSystem"));
    setVisualAssetId("");
    setSpriteDraft(null);
    setVisualAssetMetadataDraft(null);
    setRemovedVisualAssetId("");
    setProjectileVisualAssetId("");
    setProjectileSpriteDraft(null);
    setRemovedProjectileVisualAssetId("");
    setProvidedValueRows([]);
    setUpkeepValueRows([]);
    setDerivedValueRows([]);
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
    setParentId("");
    setDescription("");
    setHint("");
    setRequiredBuildingRows([]);
    setRequiredSourceSpriteRows([]);
    setKeywords(getAutomaticKeywords(inferred.entityType, inferred.vector, inferred.partType ?? "launchSystem"));
    setVisualAssetId("");
    setSpriteDraft(null);
    setVisualAssetMetadataDraft(null);
    setRemovedVisualAssetId("");
    setProjectileVisualAssetId("");
    setProjectileSpriteDraft(null);
    setRemovedProjectileVisualAssetId("");
    setProvidedValueRows([]);
    setUpkeepValueRows([]);
    setDerivedValueRows([]);
    setEffectRows([]);
    setRequirementRows([]);
    setBuildRequirementRows([]);
  }

  function fillFormFromStoredEntity(storedEntity: StoredEntityLookup, options?: {asCopy?: boolean}) {
    const definition = storedEntity.definition;
    const itemName = definition.id.split(".").at(-1) ?? "newEntity";
    const displayName = definition.name ?? titleFromIdPart(definition.id);
    setEntityType(storedEntity.entityType);
    setVector(storedEntity.vector);
    setPartType(definition.slot ?? "launchSystem");
    setIsSuperstructure(definition.kind === "superstructure");
    setItemName(options?.asCopy ? `${itemName}Copy` : itemName);
    setDisplayName(options?.asCopy ? `${displayName} Copy` : displayName);
    setParentId(definition.parentId ?? "");
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
    setVisualAssetMetadataDraft(null);
    setRemovedVisualAssetId("");
    setProjectileVisualAssetId(definition.projectileSpriteTextureKey ?? "");
    setProjectileSpriteDraft(null);
    setRemovedProjectileVisualAssetId("");
    setProvidedValueRows(createValueRows(definition.values ?? [], "production"));
    setUpkeepValueRows(createValueRows(definition.values ?? [], "upkeep"));
    setDerivedValueRows(createDerivedValueRows(definition.derivedValues ?? []));
    setEffectRows(createEffectRows(definition.effects ?? []));
    setRequirementRows(createRequirementRows(removeParentTechnologyRequirement(
      definition.requirements ?? [],
      definition.parentId ?? "",
    )));
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
              <SearchableSelect
                value={row.valueId}
                options={HOMOGENEOUS_VALUE_DEFINITION_LIST.map(definition => ({value: definition.id, label: definition.label}))}
                placeholder="Search values"
                onChange={valueId => props.onUpdate(row.id, {valueId})}
              />
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
              <span className={s.label}>{getValueAmountLabel("Additive", row.valueId)}</span>
              <input className={s.input} type="number" step={getValueAmountStep(row.valueId)} value={row.additive} onChange={event => props.onUpdate(row.id, {additive: event.target.value})} />
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

function DerivedValueSection(props: {
  entityType: EntityType;
  rows: DerivedValueRow[];
  onAdd: () => void;
  onUpdate: (rowId: number, patch: Partial<DerivedValueRow>) => void;
  onRemove: (rowId: number) => void;
}) {
  const targetOptions = getDerivedTargetValueOptions(props.entityType);

  return (
    <section className={s.section}>
      <div className={s.sectionHeader}>
        <h2 className={s.sectionTitle}>Derived Values</h2>
        <button className={s.button} type="button" onClick={props.onAdd} title="Add derived value">+</button>
      </div>
      <div className={s.rowList}>
        {props.rows.length === 0 && <span className={s.hint}>No derived values yet.</span>}
        {props.rows.map(row => (
          <div key={row.id} className={s.row}>
            <label className={s.field}>
              <span className={s.label}>Derived value</span>
              <SearchableSelect
                value={targetOptions.some(option => option.id === row.valueId) ? row.valueId : (targetOptions[0]?.id ?? "")}
                options={targetOptions.map(definition => ({value: definition.id, label: definition.label}))}
                placeholder="Search values"
                onChange={valueId => props.onUpdate(row.id, {valueId})}
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>Derived from</span>
              <SearchableSelect
                value={derivedSourceValueOptions.some(option => option.id === row.derivedFrom) ? row.derivedFrom : defaultDerivedSourceValueId}
                options={derivedSourceValueOptions.map(definition => ({value: definition.id, label: definition.label}))}
                placeholder="Search source values"
                onChange={derivedFrom => props.onUpdate(row.id, {derivedFrom})}
              />
            </label>
            <label className={s.field}>
              <span className={s.label}>{getValueAmountLabel("Derived multiplicator", row.valueId)}</span>
              <input className={s.input} type="number" step={getValueAmountStep(row.valueId)} value={row.derivedMultiplicator} onChange={event => props.onUpdate(row.id, {derivedMultiplicator: event.target.value})} />
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
              <span className={s.label}>{getValueAmountLabel("Additive", row.valueId)}</span>
              <input className={s.input} type="number" step={getValueAmountStep(row.valueId)} value={row.additive} onChange={event => props.onUpdate(row.id, {additive: event.target.value})} />
            </label>
            <label className={s.field}>
              <span className={s.label}>Multiplier</span>
              <input className={s.input} type="number" value={row.multiplier} onChange={event => props.onUpdate(row.id, {multiplier: event.target.value})} />
            </label>
            <button className={s.dangerButton} type="button" onClick={() => props.onRemove(row.id)} title="Remove derived value">x</button>
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
              <SearchableSelect
                value={row.buildingId}
                options={[{value: "", label: "Select building"}, ...buildingIds.map(buildingId => ({value: buildingId, label: buildingId}))]}
                placeholder="Search buildings"
                onChange={buildingId => props.onUpdate(row.id, {buildingId})}
              />
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
  metadataOverride?: SpriteMetadata;
  value: string;
  draft: SpriteDraft | null;
  onChange: (value: string) => void;
  onDropFile: (file: File) => void;
  onMetadataChange: (metadata: SpriteMetadata) => void;
  onRemove: () => void;
}) {
  const [query, setQuery] = useState("");
  const [visualZoom, setVisualZoom] = useState(1);
  const previewSrc = props.draft?.previewUrl ?? props.selectedAsset?.src;
  const previewLabel = props.draft?.file.name ?? props.selectedAsset?.label ?? props.value;
  const previewMetadata = props.draft?.metadata ?? props.metadataOverride ?? props.selectedAsset?.metadata;
  const towerPartPreviewMetadata = previewMetadata && isTowerPartVisualMetadata(previewMetadata)
    ? previewMetadata
    : undefined;
  const towerPartRenderedSize = towerPartPreviewMetadata
    ? getTowerVisualRenderedSize(towerPartPreviewMetadata)
    : undefined;
  const buildingPreviewSize = previewMetadata && isBuildingSpriteMetadata(previewMetadata)
    ? getBuildingSpriteSize(previewMetadata)
    : undefined;
  const previewImageStyle = previewMetadata && isBuildingSpriteMetadata(previewMetadata) && buildingPreviewSize
    ? {
      width: buildingPreviewSize.width,
      height: buildingPreviewSize.height,
      transform: `translate(${previewMetadata.shift.x}px, ${previewMetadata.shift.y}px)`,
    }
    : previewMetadata && isSizedSpriteMetadata(previewMetadata)
    ? {
      width: previewMetadata.targetSpriteSize.width,
      height: previewMetadata.targetSpriteSize.height,
      transform: `rotate(${previewMetadata.rotationDegrees ?? 0}deg)`,
    }
    : towerPartRenderedSize
      ? {
        width: towerPartRenderedSize.width,
        height: towerPartRenderedSize.height,
        transform: `rotate(${towerPartPreviewMetadata?.rotationDegrees ?? 0}deg)`,
      }
    : undefined;
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
    if (!previewMetadata || !isBuildingSpriteMetadata(previewMetadata)) return;
    props.onMetadataChange({
      ...previewMetadata,
      ...patch,
      shift: {
        ...previewMetadata.shift,
        ...patch.shift,
      },
    });
  }

  function updateSizedSpriteMetadata(patch: Partial<Pick<WallSpriteMetadata, "targetSpriteSize" | "rotationDegrees">>) {
    if (!previewMetadata || !isSizedSpriteMetadata(previewMetadata)) return;
    props.onMetadataChange({
      ...previewMetadata,
      ...patch,
      targetSpriteSize: {
        ...previewMetadata.targetSpriteSize,
        ...patch.targetSpriteSize,
      },
    });
  }

  function updateTowerPartMetadata(patch: Partial<Pick<TowerPartVisualMetadata, "zoom" | "rotationDegrees">>) {
    if (!previewMetadata || !isTowerPartVisualMetadata(previewMetadata)) return;
    props.onMetadataChange({
      ...previewMetadata,
      ...patch,
    });
  }

  function adjustRotation(deltaDegrees: number) {
    if (!previewMetadata || !isSizedSpriteMetadata(previewMetadata)) return;
    updateSizedSpriteMetadata({
      rotationDegrees: normalizeDegrees((previewMetadata.rotationDegrees ?? 0) + deltaDegrees),
    });
  }

  function updateSizedSpriteZoom(zoom: number) {
    if (!previewMetadata || !isSizedSpriteMetadata(previewMetadata)) return;
    const sourceSpriteSize = previewMetadata.sourceSpriteSize ?? previewMetadata.targetSpriteSize;

    updateSizedSpriteMetadata({
      targetSpriteSize: scaleSpriteSize(sourceSpriteSize, zoom),
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
              <label className={s.field}>
                <span className={s.label}>Visual Zoom</span>
                <input
                  className={s.input}
                  type="number"
                  min={visualPreviewZoomMin}
                  max={visualPreviewZoomMax}
                  step={visualPreviewZoomStep}
                  value={visualZoom}
                  onChange={event => setVisualZoom(clamp(
                    parsePositiveNumberOrFallback(event.target.value, visualZoom),
                    visualPreviewZoomMin,
                    visualPreviewZoomMax,
                  ))}
                />
              </label>
              <SpriteHexPreview src={previewSrc} alt={previewLabel} imageStyle={previewImageStyle} visualZoom={visualZoom} />
              {previewMetadata && isBuildingSpriteMetadata(previewMetadata) && (
                <div className={s.row}>
                  <label className={s.field}>
                    <span className={s.label}>Zoom</span>
                    <input
                      className={s.input}
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={previewMetadata.zoom}
                      onChange={event => updateBuildingMetadata({zoom: parseNumberOrFallback(event.target.value, 1)})}
                    />
                  </label>
                  <label className={s.field}>
                    <span className={s.label}>Shift X</span>
                    <input
                      className={s.input}
                      type="number"
                      step="1"
                      value={previewMetadata.shift.x}
                      onChange={event => updateBuildingMetadata({shift: {x: parseNumberOrFallback(event.target.value, 0), y: previewMetadata.shift.y}})}
                    />
                  </label>
                  <label className={s.field}>
                    <span className={s.label}>Shift Y</span>
                    <input
                      className={s.input}
                      type="number"
                      step="1"
                      value={previewMetadata.shift.y}
                      onChange={event => updateBuildingMetadata({shift: {x: previewMetadata.shift.x, y: parseNumberOrFallback(event.target.value, 0)}})}
                    />
                  </label>
                </div>
              )}
              {previewMetadata && isSizedSpriteMetadata(previewMetadata) && (
                <div className={s.spriteMetadataControls}>
                  <label className={s.field}>
                    <span className={s.label}>Sprite Zoom</span>
                    <input
                      className={s.input}
                      type="number"
                      min="0.001"
                      step="0.001"
                      value={getSizedSpriteZoom(previewMetadata)}
                      onChange={event => updateSizedSpriteZoom(parsePositiveNumberOrFallback(event.target.value, getSizedSpriteZoom(previewMetadata)))}
                    />
                  </label>
                  <div className={s.pairedFields}>
                    <label className={s.field}>
                      <span className={s.label}>Source Width</span>
                      <input className={s.input} readOnly value={previewMetadata.sourceSpriteSize?.width ?? ""} />
                    </label>
                    <label className={s.field}>
                      <span className={s.label}>Source Height</span>
                      <input className={s.input} readOnly value={previewMetadata.sourceSpriteSize?.height ?? ""} />
                    </label>
                  </div>
                  <div className={s.spriteRotationControls}>
                    <button className={s.button} type="button" onClick={() => adjustRotation(-90)}>-90</button>
                    <button className={s.button} type="button" onClick={() => updateSizedSpriteMetadata({rotationDegrees: 0})}>0</button>
                    <button className={s.button} type="button" onClick={() => adjustRotation(90)}>+90</button>
                    <label className={s.field}>
                      <span className={s.label}>Rotation degrees</span>
                      <input
                        className={s.input}
                        type="number"
                        step="1"
                        value={previewMetadata.rotationDegrees ?? 0}
                        onChange={event => updateSizedSpriteMetadata({rotationDegrees: parseNumberOrFallback(event.target.value, 0)})}
                      />
                    </label>
                  </div>
                </div>
              )}
              {previewMetadata && isTowerPartVisualMetadata(previewMetadata) && (
                <div className={s.spriteMetadataControls}>
                  <div className={s.pairedFields}>
                    <label className={s.field}>
                      <span className={s.label}>Sprite Zoom</span>
                      <input
                        className={s.input}
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={previewMetadata.zoom}
                        onChange={event => updateTowerPartMetadata({zoom: parsePositiveNumberOrFallback(event.target.value, previewMetadata.zoom)})}
                      />
                    </label>
                    <label className={s.field}>
                      <span className={s.label}>Rotation degrees</span>
                      <input
                        className={s.input}
                        type="number"
                        step="1"
                        value={previewMetadata.rotationDegrees ?? 0}
                        onChange={event => updateTowerPartMetadata({rotationDegrees: parseNumberOrFallback(event.target.value, 0)})}
                      />
                    </label>
                  </div>
                  <div className={s.pairedFields}>
                    <label className={s.field}>
                      <span className={s.label}>Source Width</span>
                      <input className={s.input} readOnly value={previewMetadata.sourceSpriteSize.width} />
                    </label>
                    <label className={s.field}>
                      <span className={s.label}>Source Height</span>
                      <input className={s.input} readOnly value={previewMetadata.sourceSpriteSize.height} />
                    </label>
                  </div>
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
              <SearchableSelect
                value={row.type}
                options={requirementTypeOptions}
                placeholder="Search requirement types"
                onChange={value => props.onUpdate(row.id, {type: value as RequirementType, target: "", amount: ""})}
              />
            </label>
            {row.type === "buildingKeywordExists" ? (
              <label className={s.field}>
                <span className={s.label}>Keyword</span>
                <SearchableSelect
                  value={row.target}
                  options={[{value: "", label: "Select keyword"}, ...buildingKeywordOptions.map(keyword => ({value: keyword, label: keyword}))]}
                  placeholder="Search keywords"
                  onChange={target => props.onUpdate(row.id, {target})}
                />
              </label>
            ) : row.type === "homogeneousValueAtLeast" || row.type === "homogeneousValueLessThan" ? (
              <>
                <label className={s.field}>
                  <span className={s.label}>Value</span>
                  <SearchableSelect
                    value={row.target}
                    options={[{value: "", label: "Select value"}, ...HOMOGENEOUS_VALUE_DEFINITION_LIST.map(definition => ({value: definition.id, label: definition.label}))]}
                    placeholder="Search values"
                    onChange={target => props.onUpdate(row.id, {target})}
                  />
                </label>
                <label className={s.field}>
                  <span className={s.label}>{getValueAmountLabel("Amount", row.target)}</span>
                  <input className={s.input} type="number" step={getValueAmountStep(row.target)} value={row.amount} onChange={event => props.onUpdate(row.id, {amount: event.target.value})} />
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
                <SearchableSelect
                  value={row.target}
                  options={[
                    {value: "", label: `Select ${row.type === "buildingExists" ? "building" : "technology"}`},
                    ...(row.type === "buildingExists" ? buildingIds : technologyIds).map(id => ({value: id, label: id})),
                  ]}
                  placeholder={`Search ${row.type === "buildingExists" ? "buildings" : "technologies"}`}
                  onChange={target => props.onUpdate(row.id, {target})}
                />
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

async function applySpriteMetadataSaveAction(action: {
  kind: EntityVisualAssetKind;
  vector: DevelopmentVectorKey;
  slot?: TowerPartSlot;
  fileStem: string;
  metadata: SpriteMetadata;
}): Promise<{action?: string; file?: string} | undefined> {
  const response = await fetch(`${localDataServerUrl}/entity-sprite-metadata`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(action),
  });
  const responseBody = await response.json().catch(() => null) as {action?: string; file?: string; error?: string} | null;

  if (!response.ok) {
    throw new Error(responseBody?.error ?? `Sprite metadata save failed with status ${response.status}.`);
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

function getSpriteMetadataSaveTarget(
  entityType: EntityType,
  vector: DevelopmentVectorKey,
  partType: TowerPartSlot,
  assetId: string,
): {
  kind: EntityVisualAssetKind;
  vector: DevelopmentVectorKey;
  slot?: TowerPartSlot;
  fileStem: string;
} {
  const selectedAsset = ENTITY_VISUAL_ASSETS_BY_ID[assetId];
  const targetKind = selectedAsset?.kind && selectedAsset.kind !== "projectile"
    ? selectedAsset.kind
    : getVisualAssetKind(entityType);
  if (!targetKind) {
    throw new Error(`Entity type "${entityType}" does not support sprite metadata.`);
  }

  const targetVector = selectedAsset?.vector ?? vector;
  const targetSlot = selectedAsset?.kind === "gunPart" ? selectedAsset.slot : partType;

  return {
    kind: targetKind,
    vector: targetVector,
    slot: targetKind === "gunPart" ? targetSlot : undefined,
    fileStem: getSpriteFileStem(targetKind, targetVector, targetSlot, assetId),
  };
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
      rotationDegrees: 0,
    };
  }

  if (entityType === "wallSuperstructure") {
    return {
      sourceSpriteSize,
      targetSpriteSize: fitSpriteSize(sourceSpriteSize, 80, 80),
      rotationDegrees: 0,
    };
  }

  const center = {
    x: Math.round(sourceSpriteSize.width / 2),
    y: Math.round(sourceSpriteSize.height / 2),
  };

  return {
    sourceSpriteSize,
    zoom: getFitSpriteZoom(sourceSpriteSize, 120, 80),
    rotationDegrees: 0,
    inputSocket: center,
    outputSockets: getDefaultOutputSockets(partType, center),
  };
}

function getFitSpriteZoom(sourceSpriteSize: {width: number; height: number}, maxWidth: number, maxHeight: number) {
  return Math.min(maxWidth / sourceSpriteSize.width, maxHeight / sourceSpriteSize.height);
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

  return scaleSpriteSize(sourceSpriteSize, scale);
}

function getSizedSpriteZoom(metadata: SizedSpriteMetadata): number {
  const sourceSpriteSize = metadata.sourceSpriteSize ?? metadata.targetSpriteSize;
  const widthZoom = metadata.targetSpriteSize.width / sourceSpriteSize.width;
  const heightZoom = metadata.targetSpriteSize.height / sourceSpriteSize.height;
  const zoom = Math.min(widthZoom, heightZoom);

  return Number.isFinite(zoom) && zoom > 0 ? Number(zoom.toFixed(4)) : 1;
}

function scaleSpriteSize(sourceSpriteSize: {width: number; height: number}, zoom: number) {
  return {
    width: Math.max(1, Math.round(sourceSpriteSize.width * zoom)),
    height: Math.max(1, Math.round(sourceSpriteSize.height * zoom)),
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
  parentId: string;
  description: string;
  hint: string;
  requiredBuildingRows: BuildingIdRow[];
  requiredSourceSpriteRows: RequiredSourceSpriteRow[];
  keywords: string[];
  providedValueRows: ValueRow[];
  upkeepValueRows: ValueRow[];
  derivedValueRows: DerivedValueRow[];
  effectRows: EffectRow[];
  requirementRows: RequirementRow[];
  buildRequirementRows: RequirementRow[];
  visualAssetId: string;
  projectileVisualAssetId: string;
  baseDefinition: StoredEntityDefinition | null;
}): Record<string, unknown> {
  const keywords = args.keywords;
  const parentTechnologyId = args.entityType === "research" && args.parentId.trim() !== args.generatedId
    ? args.parentId.trim()
    : "";
  const values = [
    ...args.providedValueRows.map(row => createValueEffect(row, "production")),
    ...args.upkeepValueRows.map(row => createValueEffect(row, "upkeep")),
  ]
    .filter((value): value is HomogeneousValueEffect => Boolean(value));
  const derivedValues = isDerivedValueEntityType(args.entityType)
    ? args.derivedValueRows
      .map(row => createDerivedValueEffect(row, args.entityType))
      .filter((value): value is HomogeneousDerivedValueEffect => Boolean(value))
    : [];
  const effects = args.effectRows
    .map(createAdjacencyRule)
    .filter((effect): effect is HomogeneousAdjacencyRule => Boolean(effect));
  const manualRequirements = args.requirementRows
    .map(createRequirement)
    .filter((requirement): requirement is Requirement => Boolean(requirement));
  const requirements = [
    ...(parentTechnologyId && !manualRequirements.some(requirement => (
      requirement.type === "technologyUnlocked" && requirement.technologyId === parentTechnologyId
    ))
      ? [{type: "technologyUnlocked", technologyId: parentTechnologyId} satisfies Requirement]
      : []),
    ...manualRequirements,
  ];
  const buildRequirements = args.buildRequirementRows
    .map(createRequirement)
    .filter((requirement): requirement is Requirement => Boolean(requirement));
  const preview: Record<string, unknown> = args.baseDefinition ? {...args.baseDefinition} : {
    id: args.generatedId,
  };
  preview.id = args.generatedId;

  if (args.entityType === "research") {
    preview.parentId = parentTechnologyId || null;
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

  if (derivedValues.length > 0) {
    preview.derivedValues = derivedValues;
  } else {
    delete preview.derivedValues;
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

function removeParentTechnologyRequirement(requirements: readonly Requirement[], parentId: string): Requirement[] {
  if (!parentId) return [...requirements];

  return requirements.filter(requirement => !(
    requirement.type === "technologyUnlocked" && requirement.technologyId === parentId
  ));
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

function createDerivedValueEffect(row: DerivedValueRow, entityType: EntityType): HomogeneousDerivedValueEffect | null {
  const targetValueId = getValidDerivedTargetValueId(entityType, row.valueId);
  const sourceValueId = getValidDerivedSourceValueId(row.derivedFrom);
  const derivedMultiplicator = parseOptionalNumber(row.derivedMultiplicator);
  const additive = parseOptionalNumber(row.additive);
  const multiplier = parseOptionalNumber(row.multiplier);
  if (!row.base && derivedMultiplicator === null && additive === null && multiplier === null) return null;
  if (derivedMultiplicator === null) return null;

  const retainedKeywords = row.additionalKeywords
    .filter(keyword => keyword !== "production" && keyword !== "upkeep");

  const effect: HomogeneousDerivedValueEffect = {
    ...row.base,
    valueId: targetValueId,
    derivedFrom: sourceValueId,
    derivedMultiplicator,
    additionalKeywords: ["production", ...retainedKeywords],
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

function createDerivedValueRows(values: readonly HomogeneousDerivedValueEffect[]): DerivedValueRow[] {
  return values.map(value => ({
    id: nextRowId++,
    valueId: value.valueId,
    derivedFrom: value.derivedFrom,
    derivedMultiplicator: String(value.derivedMultiplicator),
    additionalKeywords: getAdditionalValueKeywords(value),
    additive: value.additive === undefined || value.additive === null ? "" : String(value.additive),
    multiplier: value.multiplier === undefined || value.multiplier === null ? "" : String(value.multiplier),
    base: value,
  }));
}

function getDerivedTargetValueOptions(entityType: EntityType) {
  if (entityType === "gunPart") return towerDerivedTargetValueOptions;
  if (entityType === "wallSegment") return wallDerivedTargetValueOptions;
  if (entityType === "wallSuperstructure") return [...wallDerivedTargetValueOptions, ...towerDerivedTargetValueOptions];

  return [];
}

function isDerivedValueEntityType(entityType: EntityType): boolean {
  return entityType === "gunPart" || entityType === "wallSegment" || entityType === "wallSuperstructure";
}

function getValidDerivedTargetValueId(entityType: EntityType, valueId: string): string {
  const options = getDerivedTargetValueOptions(entityType);
  return options.some(option => option.id === valueId)
    ? valueId
    : options[0]?.id ?? "tower.projectileDamage";
}

function getValidDerivedSourceValueId(valueId: string): string {
  return derivedSourceValueOptions.some(option => option.id === valueId)
    ? valueId
    : defaultDerivedSourceValueId;
}

function getValueAmountLabel(label: string, valueId: string): string {
  const displayMethod = HOMOGENEOUS_VALUE_DEFINITION_LIST.find(definition => definition.id === valueId)?.displayMethod;

  if (displayMethod === "distance") return `${label} (hexR)`;
  if (displayMethod === "distancePerSecond") return `${label} (hexR/s)`;
  if (displayMethod === "degrees") return `${label} (deg)`;
  if (displayMethod === "degreesPerSecond") return `${label} (deg/s)`;

  return label;
}

function getValueAmountStep(valueId: string): string | undefined {
  const displayMethod = HOMOGENEOUS_VALUE_DEFINITION_LIST.find(definition => definition.id === valueId)?.displayMethod;

  return displayMethod === "distance" || displayMethod === "distancePerSecond" || displayMethod === "degrees" || displayMethod === "degreesPerSecond"
    ? hexRadiusNumberStep
    : undefined;
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

function parsePositiveNumberOrFallback(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function isBuildingSpriteMetadata(metadata: SpriteMetadata): metadata is BuildingSpriteMetadata {
  return "zoom" in metadata && "shift" in metadata;
}

function isSizedSpriteMetadata(metadata: SpriteMetadata): metadata is SizedSpriteMetadata {
  return "targetSpriteSize" in metadata;
}

function isTowerPartVisualMetadata(metadata: SpriteMetadata): metadata is TowerPartVisualMetadata {
  return "zoom" in metadata && "inputSocket" in metadata && "outputSockets" in metadata;
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
