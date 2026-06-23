import {useEffect, useMemo, useRef, useState} from "react";
import {useParams} from "react-router-dom";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {TowerPartSlot} from "../../models/battle/towerParts.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import {ALL_BUILDING_KEYWORDS} from "../../models/city/Keywords.ts";
import {HOMOGENEOUS_VALUE_DEFINITION_LIST} from "../../data/homogeneousValues/index.ts";
import {TOWER_PART_SLOT_ORDER} from "../../data/gunParts/index.ts";
import {buildingIds, technologyIds} from "../../data/ids.ts";
import aetherBuildingDefinitions from "../../data/buildings/aether.json";
import medievalBuildingDefinitions from "../../data/buildings/medieval.json";
import natureBuildingDefinitions from "../../data/buildings/nature.json";
import techBuildingDefinitions from "../../data/buildings/tech.json";
import aetherResearchDefinitions from "../../data/research/aether.json";
import medievalResearchDefinitions from "../../data/research/medieval.json";
import natureResearchDefinitions from "../../data/research/nature.json";
import techResearchDefinitions from "../../data/research/tech.json";
import aetherWallSegmentDefinitions from "../../data/wallSegments/aether.json";
import medievalWallSegmentDefinitions from "../../data/wallSegments/medieval.json";
import natureWallSegmentDefinitions from "../../data/wallSegments/nature.json";
import techWallSegmentDefinitions from "../../data/wallSegments/tech.json";
import aetherWallSuperstructureDefinitions from "../../data/wallSuperstructures/aether.json";
import medievalWallSuperstructureDefinitions from "../../data/wallSuperstructures/medieval.json";
import natureWallSuperstructureDefinitions from "../../data/wallSuperstructures/nature.json";
import techWallSuperstructureDefinitions from "../../data/wallSuperstructures/tech.json";
import aetherGunPartDefinitions from "../../data/gunParts/aether.json";
import medievalGunPartDefinitions from "../../data/gunParts/medieval.json";
import natureGunPartDefinitions from "../../data/gunParts/nature.json";
import techGunPartDefinitions from "../../data/gunParts/tech.json";
import * as s from "./EntityCreatePage.css.ts";

type EntityType = "research" | "wallSegment" | "wallSuperstructure" | "building" | "gunPart";
type RequirementType = Requirement["type"];

type ValueRow = {
  id: number;
  valueId: string;
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
  hint?: string;
  requirements?: Requirement[];
  buildRequirements?: Requirement[];
  values?: HomogeneousValueEffect[];
  effects?: HomogeneousAdjacencyRule[];
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
    tech: techResearchDefinitions as readonly StoredEntityDefinition[],
    nature: natureResearchDefinitions as readonly StoredEntityDefinition[],
    medieval: medievalResearchDefinitions as readonly StoredEntityDefinition[],
    aether: aetherResearchDefinitions as readonly StoredEntityDefinition[],
  },
  wallSegment: {
    tech: techWallSegmentDefinitions as readonly StoredEntityDefinition[],
    nature: natureWallSegmentDefinitions as readonly StoredEntityDefinition[],
    medieval: medievalWallSegmentDefinitions as readonly StoredEntityDefinition[],
    aether: aetherWallSegmentDefinitions as readonly StoredEntityDefinition[],
  },
  wallSuperstructure: {
    tech: techWallSuperstructureDefinitions as readonly StoredEntityDefinition[],
    nature: natureWallSuperstructureDefinitions as readonly StoredEntityDefinition[],
    medieval: medievalWallSuperstructureDefinitions as readonly StoredEntityDefinition[],
    aether: aetherWallSuperstructureDefinitions as readonly StoredEntityDefinition[],
  },
  building: {
    tech: techBuildingDefinitions as readonly StoredEntityDefinition[],
    nature: natureBuildingDefinitions as readonly StoredEntityDefinition[],
    medieval: medievalBuildingDefinitions as readonly StoredEntityDefinition[],
    aether: aetherBuildingDefinitions as readonly StoredEntityDefinition[],
  },
  gunPart: {
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
  const [keywords, setKeywords] = useState<string[]>([]);
  const [valueRows, setValueRows] = useState<ValueRow[]>([]);
  const [effectRows, setEffectRows] = useState<EffectRow[]>([]);
  const [requirementRows, setRequirementRows] = useState<RequirementRow[]>([]);
  const [buildRequirementRows, setBuildRequirementRows] = useState<RequirementRow[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({kind: "idle", message: ""});
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
      keywords,
      valueRows,
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
    partType,
    requiredBuildingRows,
    requirementRows,
    loadedEntity,
    valueRows,
    vector,
  ]);
  const jsonPreview = useMemo(() => JSON.stringify(entityPreview, null, 2), [entityPreview]);

  function addValueRow() {
    setValueRows(rows => [
      ...rows,
      {
        id: nextRowId++,
        valueId: defaultValueId,
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
      },
    ]);
  }

  return (
    <section className={s.page}>
      <div className={s.formPanel}>
        <header className={s.header}>
          <h1 className={s.title}>{isEditingExisting ? "Entity Edit" : "Entity Create"}</h1>
          <p className={s.subtitle}>
            {entityId === "new"
              ? "Debug content sketcher for copy-ready JSON definitions."
              : loadedEntity
                ? `Editing ${entityId}`
                : `No stored entity found for ${entityId}; using the id as a draft.`}
          </p>
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
                  onAdd={addRequiredBuildingRow}
                  onUpdate={(rowId, buildingId) => updateRequiredBuildingRow(rowId, buildingId)}
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

        <section className={s.section}>
          <div className={s.sectionHeader}>
            <h2 className={s.sectionTitle}>Values</h2>
            <button className={s.button} type="button" onClick={addValueRow} title="Add value">+</button>
          </div>
          <div className={s.rowList}>
            {valueRows.length === 0 && <span className={s.hint}>No value entries yet.</span>}
            {valueRows.map(row => (
              <div key={row.id} className={s.row}>
                <label className={s.field}>
                  <span className={s.label}>Value type</span>
                  <select
                    className={s.input}
                    value={row.valueId}
                    onChange={event => updateValueRow(row.id, {valueId: event.target.value})}
                  >
                    {HOMOGENEOUS_VALUE_DEFINITION_LIST.map(definition => (
                      <option key={definition.id} value={definition.id}>{definition.label}</option>
                    ))}
                  </select>
                </label>
                <label className={s.field}>
                  <span className={s.label}>Additive</span>
                  <input className={s.input} type="number" value={row.additive} onChange={event => updateValueRow(row.id, {additive: event.target.value})} />
                </label>
                <label className={s.field}>
                  <span className={s.label}>Multiplier</span>
                  <input className={s.input} type="number" value={row.multiplier} onChange={event => updateValueRow(row.id, {multiplier: event.target.value})} />
                </label>
                <button className={s.dangerButton} type="button" onClick={() => removeValueRow(row.id)} title="Remove value">x</button>
              </div>
            ))}
          </div>
        </section>

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
      </div>

      <aside className={s.previewPanel}>
        <header className={s.header}>
          <h2 className={s.title}>JSON Preview</h2>
          <p className={s.subtitle}>Paste into the matching vector JSON file for the selected entity type.</p>
        </header>
        <div className={s.idPreview}>{generatedId}</div>
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
        <pre className={`${s.preview} ${s.mono}`}>{jsonPreview}</pre>
      </aside>
    </section>
  );

  function updateValueRow(rowId: number, patch: Partial<ValueRow>) {
    setValueRows(rows => rows.map(row => row.id === rowId ? {...row, ...patch} : row));
  }

  function removeValueRow(rowId: number) {
    setValueRows(rows => rows.filter(row => row.id !== rowId));
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

  function updateRequiredBuildingRow(rowId: number, buildingId: string) {
    setRequiredBuildingRows(rows => rows.map(row => row.id === rowId ? {...row, buildingId} : row));
  }

  function removeRequiredBuildingRow(rowId: number) {
    setRequiredBuildingRows(rows => rows.filter(row => row.id !== rowId));
  }

  async function saveEntity() {
    setSaveStatus({kind: "saving", message: "Saving to local data server..."});

    try {
      const response = await fetch(`${localDataServerUrl}/entities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entityPreview),
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
        message: `${responseBody?.action ?? "saved"} in ${responseBody?.file ?? "data file"}.`,
      });
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message: "Could not reach local data server at http://127.0.0.1:4317.",
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
    setKeywords(getAutomaticKeywords("research", "medieval", "launchSystem"));
    setValueRows([]);
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
    setKeywords(getAutomaticKeywords(inferred.entityType, inferred.vector, inferred.partType ?? "launchSystem"));
    setValueRows([]);
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
    setRequiredBuildingRows(createBuildingIdRows(definition.requiredBuildingIds ?? []));
    setKeywords(mergeKeywords(
      getAutomaticKeywords(storedEntity.entityType, storedEntity.vector, definition.slot ?? "launchSystem"),
      definition.keywords ?? [],
    ));
    setValueRows(createValueRows(definition.values ?? []));
    setEffectRows(createEffectRows(definition.effects ?? []));
    setRequirementRows(createRequirementRows(definition.requirements ?? []));
    setBuildRequirementRows(createRequirementRows(definition.buildRequirements ?? []));
  }
}

function BuildingIdSection(props: {
  title: string;
  rows: BuildingIdRow[];
  onAdd: () => void;
  onUpdate: (rowId: number, buildingId: string) => void;
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
              <select className={s.input} value={row.buildingId} onChange={event => props.onUpdate(row.id, event.target.value)}>
                <option value="">Select building</option>
                {buildingIds.map(buildingId => (
                  <option key={buildingId} value={buildingId}>{buildingId}</option>
                ))}
              </select>
            </label>
            <button className={s.dangerButton} type="button" onClick={() => props.onRemove(row.id)} title="Remove building id">x</button>
          </div>
        ))}
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
  keywords: string[];
  valueRows: ValueRow[];
  effectRows: EffectRow[];
  requirementRows: RequirementRow[];
  buildRequirementRows: RequirementRow[];
  baseDefinition: StoredEntityDefinition | null;
}): Record<string, unknown> {
  const keywords = args.keywords;
  const values = args.valueRows
    .map(createValueEffect)
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
    const requiredBuildingIds = args.requiredBuildingRows
      .map(row => row.buildingId)
      .filter(Boolean);
    if (requiredBuildingIds.length > 0) {
      preview.requiredBuildingIds = requiredBuildingIds;
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

  const amount = parseOptionalNumber(row.amount);
  if (amount === null) return null;

  return {type: row.type, valueId: row.target, amount};
}

function findStoredEntity(id: string): StoredEntityLookup | null {
  const inferred = inferEntityPartsFromId(id);
  const definitions = rawDefinitionsByType[inferred.entityType][inferred.vector];
  const definition = definitions.find(item => item.id === id);
  if (!definition) return null;

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

function isDevelopmentVectorKey(value: string | undefined): value is DevelopmentVectorKey {
  return value === "tech" || value === "nature" || value === "medieval" || value === "aether";
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

    return {
      id: nextRowId++,
      type: requirement.type,
      target: requirement.valueId,
      amount: String(requirement.amount),
    };
  });
}

function createValueRows(values: readonly HomogeneousValueEffect[]): ValueRow[] {
  return values.map(value => ({
    id: nextRowId++,
    valueId: value.valueId,
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

function createValueEffect(row: ValueRow): HomogeneousValueEffect | null {
  const additive = parseOptionalNumber(row.additive);
  const multiplier = parseOptionalNumber(row.multiplier);
  if (!row.base && additive === null && multiplier === null) return null;

  const effect: HomogeneousValueEffect = {
    ...row.base,
    valueId: row.valueId,
    additionalKeywords: row.base?.additionalKeywords ?? ["production"],
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
