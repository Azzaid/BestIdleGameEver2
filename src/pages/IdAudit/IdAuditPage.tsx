import {BUILDINGS_ATLAS} from "../../data/buildings/index.ts";
import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {PROGRESSION_RULES} from "../Progression/data/rules.ts";
import {getRuleForTarget} from "../Progression/data/progression.ts";
import {BATTLE_ENEMY_BLUEPRINTS} from "../../data/enemies/index.ts";
import {ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY} from "../../data/enemies/visuals.ts";
import {
  buildings,
  enemies,
  gunpartIdRows,
  superstructures,
  technologies,
  walls,
} from "../../data/ids.ts";
import {researchTree} from "../../data/research/index.ts";
import {TOWER_PARTS_BY_ID} from "../../data/gunParts/index.ts";
import {TOWER_PART_VISUAL_ASSETS} from "../../data/gunParts/partVisualMetadata.ts";
import {WALL_SEGMENT_BUILDINGS} from "../../data/wallSegments/index.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS} from "../../data/wallSuperstructures/index.ts";
import {buildingsSpriteAtlas} from "../../models/sprites/buildings/buildingsSpriteAtlas.ts";
import {wallSpritesAtlas} from "../../models/sprites/walls/wallsSpriteAtlas.ts";
import {wallTopSpritesAtlas} from "../../models/sprites/wallTops/wallTopSpriteAtlas.ts";
import type {ProgressionNodeKind} from "../Progression/data/types.ts";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {Building} from "../../models/city/Building.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import {HOMOGENEOUS_VALUE_DEFINITION_LIST, HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import type {HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import {
  getProducedValues,
  resolveHomogeneousValueContributions,
} from "../../models/homogeneousValueResolution.ts";
import {useDevToolsDispatch, useDevToolsSelector} from "../../devtools/store/hooks.ts";
import {selectIdAuditFilters} from "../../devtools/store/selectors.ts";
import {
  setAllIdAuditValueColumnVisibility,
  setIdAuditBaseColumnVisibility,
  setIdAuditFilters,
  setIdAuditValueColumnVisibility,
  type IdAuditBaseColumnId,
  type IdAuditStatusFilter,
} from "../../devtools/store/state.ts";
import * as s from "./IdAuditPage.css.ts";

type AuditStatus = "ok" | "missing" | "none";

type AuditRow = {
  category: string;
  path: string;
  id: string;
  name?: string;
  pathStatus: IdentifierPathStatus;
  dataStatus: AuditStatus;
  progressionStatus: AuditStatus;
  assetStatus: AuditStatus;
  notes: string;
  valuesEditable: boolean;
  homogeneousValues: readonly HomogeneousValueEffect[];
};

type IdentifierPathStatus = "ok" | "mismatch";

type SaveStatus = {
  kind: "idle" | "saving" | "success" | "error";
  message: string;
};

type ValueRole = "production" | "upkeep";
type ValueCellDraft = Record<ValueRole, string>;
type ValueDrafts = Record<string, Record<string, ValueCellDraft>>;

const localDataServerUrl = "http://127.0.0.1:4317";

const baseColumnOptions: {id: IdAuditBaseColumnId; label: string}[] = [
  {id: "category", label: "Category"},
  {id: "path", label: "Identifier Path"},
  {id: "id", label: "ID"},
  {id: "name", label: "Name"},
  {id: "data", label: "Data"},
  {id: "progression", label: "Progression"},
  {id: "assets", label: "Assets"},
  {id: "notes", label: "Notes"},
  {id: "edit", label: "Edit"},
];

const metadataModules = import.meta.glob("../../assets/gunParts/**/*.json", {
  eager: true,
}) as Record<string, unknown>;

const imageModules = import.meta.glob("../../assets/gunParts/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const gunPartMetadataIds = new Set(Object.keys(metadataModules).map(getFileStem));
const gunPartImageIds = new Set(Object.keys(imageModules).map(getFileStem));
const registeredTowerPartAssetIds = new Set(Object.keys(TOWER_PART_VISUAL_ASSETS));

function getFileStem(path: string) {
  return path.split("/").at(-1)?.replace(/\.(json|png)$/i, "") ?? path;
}

type IdGroups = Readonly<Record<string, Readonly<Record<string, string>>>>;

function flattenGroupedIds(source: IdGroups, category: string) {
  return Object.entries(source).flatMap(([groupName, group]) => (
    Object.entries(group).map(([key, id]) => ({
      path: `${category}.${groupName}.${key}`,
      groupName,
      key,
      id,
    }))
  ));
}

function getProgressionStatus(kind: ProgressionNodeKind, id: string): AuditStatus {
  return getRuleForTarget(PROGRESSION_RULES, kind, id) ? "ok" : "missing";
}

function createRows(): AuditRow[] {
  const rows: AuditRow[] = [];

  for (const item of flattenGroupedIds(buildings, "buildings")) {
    const vector = item.groupName as DevelopmentVectorKey;
    const data = BUILDINGS_ATLAS[DEVELOPMENT_VECTORS[vector]]?.[item.id];
    const hasAsset = Boolean(buildingsSpriteAtlas[DEVELOPMENT_VECTORS[vector]]?.[item.id]?.src);
    rows.push({
      category: "Building",
      path: item.path,
      id: item.id,
      name: data?.name,
      pathStatus: getIdentifierPathStatus(item.path, item.id),
      dataStatus: data ? "ok" : "missing",
      progressionStatus: getProgressionStatus("building", item.id),
      assetStatus: hasAsset ? "ok" : "none",
      notes: data ? `${vector} / ${data.type.description ?? "building"} / asset ${hasAsset ? "yes" : "no"}` : "No building definition",
      valuesEditable: Boolean(data),
      homogeneousValues: data?.values ?? [],
    });
  }

  for (const item of flattenGroupedIds(technologies, "technologies")) {
    const data = researchTree[item.id];
    rows.push({
      category: "Technology",
      path: item.path,
      id: item.id,
      name: data?.name,
      pathStatus: getIdentifierPathStatus(item.path, item.id),
      dataStatus: data ? "ok" : "missing",
      progressionStatus: getProgressionStatus("research", item.id),
      assetStatus: "none",
      notes: data ? data.summary ?? "" : "No research node",
      valuesEditable: false,
      homogeneousValues: [],
    });
  }

  for (const item of gunpartIdRows) {
    const data = TOWER_PARTS_BY_ID[item.id];
    const textureKey = data?.sprite.textureKey ?? item.id;
    const registeredAsset = TOWER_PART_VISUAL_ASSETS[textureKey] ?? TOWER_PART_VISUAL_ASSETS[item.id];
    const hasPng = Boolean(registeredAsset?.src) || gunPartImageIds.has(textureKey);
    const hasJson = Boolean(registeredAsset?.metadata) || gunPartMetadataIds.has(textureKey);
    const isRegistered = Boolean(registeredAsset) || registeredTowerPartAssetIds.has(textureKey);

    rows.push({
      category: "Tower Part",
      path: `gunParts.${item.vector}.${item.slot}.${item.key}`,
      id: item.id,
      name: data?.name,
      pathStatus: getIdentifierPathStatus(`gunParts.${item.vector}.${item.slot}.${item.key}`, item.id),
      dataStatus: data ? "ok" : "missing",
      progressionStatus: getProgressionStatus("towerPart", item.id),
      assetStatus: hasPng && hasJson && isRegistered ? "ok" : "missing",
      notes: data ? `${data.slot ?? "unknown slot"} / texture ${textureKey} / PNG ${hasPng ? "yes" : "no"} / JSON ${hasJson ? "yes" : "no"} / registry ${isRegistered ? "yes" : "no"}` : "No tower part definition",
      valuesEditable: Boolean(data),
      homogeneousValues: data?.values ?? [],
    });
  }

  for (const item of flattenGroupedIds(enemies, "enemies")) {
    const data = BATTLE_ENEMY_BLUEPRINTS[item.id];
    rows.push({
      category: "Enemy",
      path: item.path,
      id: item.id,
      name: data?.displayName,
      pathStatus: getIdentifierPathStatus(item.path, item.id),
      dataStatus: data ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: data?.sprite.textureKey && ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY[data.sprite.textureKey] ? "ok" : "missing",
      notes: data
        ? `${data.kind} / pressure ${data.pressure} / minimum visibility ${data.minimumCityVisibilityThreshold ?? 0} / texture ${data.sprite.textureKey}`
        : "No enemy blueprint",
      valuesEditable: false,
      homogeneousValues: [],
    });
  }

  for (const item of flattenGroupedIds(walls, "walls")) {
    const data = WALL_SEGMENT_BUILDINGS[item.id];
    const vector = item.groupName as DevelopmentVectorKey;
    const hasAsset = Boolean(wallSpritesAtlas[DEVELOPMENT_VECTORS[vector]]?.[item.id]?.src);
    rows.push({
      category: "Wall",
      path: item.path,
      id: item.id,
      name: data?.name,
      pathStatus: getIdentifierPathStatus(item.path, item.id),
      dataStatus: data ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: hasAsset ? "ok" : "none",
      notes: data ? `${describeWallBuildingStats(data)} / asset ${hasAsset ? "yes" : "no"}` : "No wall segment definition",
      valuesEditable: Boolean(data),
      homogeneousValues: data?.values ?? [],
    });
  }

  for (const item of flattenGroupedIds(superstructures, "superstructures")) {
    const data = WALL_SUPERSTRUCTURE_BUILDINGS[item.id];
    const vector = item.groupName as DevelopmentVectorKey;
    const hasAsset = Boolean(wallTopSpritesAtlas[DEVELOPMENT_VECTORS[vector]]?.[item.id]?.src);
    rows.push({
      category: "Tower",
      path: item.path,
      id: item.id,
      name: data?.name,
      pathStatus: getIdentifierPathStatus(item.path, item.id),
      dataStatus: data ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: hasAsset ? "ok" : "none",
      notes: data ? `${describeWallBuildingStats(data)} / asset ${hasAsset ? "yes" : "no"}` : "No wall superstructure definition",
      valuesEditable: Boolean(data),
      homogeneousValues: data?.values ?? [],
    });
  }

  return rows;
}

function describeWallBuildingStats(data: WallBuilding): string {
  const producedValues = getProducedValues(resolveHomogeneousValueContributions(data.values ?? []));
  const resilience = producedValues[HOMOGENEOUS_VALUE_IDS.wallResilience] ?? 0;
  const ignoredThreat = producedValues[HOMOGENEOUS_VALUE_IDS.wallThreatSuppression] ?? 0;

  return `resilience ${resilience} / ignored threat ${ignoredThreat}`;
}

function getUnregisteredRows(rows: readonly AuditRow[]): AuditRow[] {
  const registeredIds = new Set(rows.map(row => row.id));
  const unregisteredRows: AuditRow[] = [];

  const buildingGroups = Object.values(BUILDINGS_ATLAS) as Array<Record<string, Building>>;

  for (const building of buildingGroups.flatMap(group => Object.values(group))) {
    if (registeredIds.has(building.id)) continue;
    unregisteredRows.push(createUnregisteredRow("Building", building.id, building.name));
  }

  for (const research of Object.values(researchTree)) {
    if (registeredIds.has(research.id)) continue;
    unregisteredRows.push(createUnregisteredRow("Technology", research.id, research.name));
  }

  for (const part of Object.values(TOWER_PARTS_BY_ID)) {
    if (registeredIds.has(part.id)) continue;
    unregisteredRows.push(createUnregisteredRow("Tower Part", part.id, part.name));
  }

  for (const id of new Set([...gunPartMetadataIds, ...gunPartImageIds])) {
    if (registeredIds.has(id)) continue;
    if (registeredTowerPartAssetIds.has(id)) continue;
    unregisteredRows.push({
      category: "Tower Part Asset",
      path: "missing identificator asset",
      id,
      pathStatus: "mismatch",
      dataStatus: TOWER_PARTS_BY_ID[id] ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: "ok",
      notes: "Asset file exists but id is not in derived data ids",
      valuesEditable: false,
      homogeneousValues: [],
    });
  }

  for (const enemy of Object.values(BATTLE_ENEMY_BLUEPRINTS)) {
    if (registeredIds.has(enemy.id)) continue;
    unregisteredRows.push(createUnregisteredRow("Enemy", enemy.id, enemy.displayName));
  }

  for (const wall of Object.values(WALL_SEGMENT_BUILDINGS)) {
    if (registeredIds.has(wall.id)) continue;
    unregisteredRows.push(createUnregisteredRow("Wall", wall.id, wall.name));
  }

  for (const tower of Object.values(WALL_SUPERSTRUCTURE_BUILDINGS)) {
    if (registeredIds.has(tower.id)) continue;
    unregisteredRows.push(createUnregisteredRow("Tower", tower.id, tower.name));
  }

  return unregisteredRows;
}

function createUnregisteredRow(category: string, id: string, name?: string): AuditRow {
  return {
    category,
    path: "missing identificator",
    id,
    name,
    pathStatus: "mismatch",
    dataStatus: "ok",
    progressionStatus: "none",
    assetStatus: "none",
    notes: "Definition exists but id is not in derived data ids",
    valuesEditable: false,
    homogeneousValues: [],
  };
}

export default function IdAuditPage() {
  const dispatch = useDevToolsDispatch();
  const [valueDrafts, setValueDrafts] = useState<ValueDrafts>({});
  const [baselineDrafts, setBaselineDrafts] = useState<ValueDrafts>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({kind: "idle", message: ""});
  const {
    search,
    categoryFilter,
    dataFilter,
    progressionFilter,
    assetFilter,
    problemsOnly,
    visibleBaseColumns,
    visibleValueIds,
  } = useDevToolsSelector(selectIdAuditFilters);
  const registeredRows = useMemo(() => createRows(), []);
  const rows = useMemo(() => [...registeredRows, ...getUnregisteredRows(registeredRows)], [registeredRows]);
  const initialValueDrafts = useMemo(() => createValueDrafts(rows), [rows]);
  const categories = useMemo(() => [...new Set(rows.map(row => row.category))].sort(), [rows]);
  const homogeneousValueColumns = HOMOGENEOUS_VALUE_DEFINITION_LIST;
  const visibleHomogeneousValueColumns = useMemo(
    () => homogeneousValueColumns.filter(definition => visibleValueIds[definition.id] ?? true),
    [homogeneousValueColumns, visibleValueIds],
  );
  useEffect(() => {
    setValueDrafts(initialValueDrafts);
    setBaselineDrafts(initialValueDrafts);
  }, [initialValueDrafts]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows
      .filter(row => categoryFilter === "all" || row.category === categoryFilter)
      .filter(row => dataFilter === "any" || row.dataStatus === dataFilter)
      .filter(row => progressionFilter === "any" || row.progressionStatus === progressionFilter)
      .filter(row => assetFilter === "any" || row.assetStatus === assetFilter)
      .filter(row => !problemsOnly || (
        row.pathStatus === "mismatch"
        || row.dataStatus === "missing"
        || row.progressionStatus === "missing"
        || row.assetStatus === "missing"
        || row.path.startsWith("missing identificator")
      ))
      .filter(row => {
        if (!query) return true;
        return [
          row.category,
          row.path,
          row.id,
          row.name ?? "",
          row.notes,
        ].some(value => value.toLowerCase().includes(query));
      });
  }, [assetFilter, categoryFilter, dataFilter, problemsOnly, progressionFilter, rows, search]);
  const changedRows = useMemo(() => (
    rows
      .filter(row => row.valuesEditable)
      .filter(row => !areDraftRowsEqual(valueDrafts[row.id] ?? {}, baselineDrafts[row.id] ?? {}))
  ), [baselineDrafts, rows, valueDrafts]);
  const missingData = rows.filter(row => row.dataStatus === "missing").length;
  const missingProgression = rows.filter(row => row.progressionStatus === "missing").length;
  const missingAssets = rows.filter(row => row.assetStatus === "missing").length;
  const pathMismatches = rows.filter(row => row.pathStatus === "mismatch").length;
  const unregistered = rows.filter(row => row.path.startsWith("missing identificator")).length;

  function updateValueDraft(entityId: string, valueId: string, role: ValueRole, value: string) {
    setValueDrafts(current => ({
      ...current,
      [entityId]: {
        ...(current[entityId] ?? {}),
        [valueId]: {
          ...getValueCellDraft(current[entityId]?.[valueId]),
          [role]: value,
        },
      },
    }));
    setSaveStatus({kind: "idle", message: ""});
  }

  function toggleBaseColumn(columnId: IdAuditBaseColumnId, visible: boolean) {
    dispatch(setIdAuditBaseColumnVisibility({columnId, visible}));
  }

  function toggleValueColumn(valueId: string, visible: boolean) {
    dispatch(setIdAuditValueColumnVisibility({valueId, visible}));
  }

  async function saveValueDrafts() {
    if (changedRows.length === 0 || saveStatus.kind === "saving") return;

    setSaveStatus({kind: "saving", message: "Saving homogeneous values..."});

    try {
      const response = await fetch(`${localDataServerUrl}/entity-values`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          updates: changedRows.map(row => ({
            id: row.id,
            values: getChangedValueDrafts(valueDrafts[row.id] ?? {}, baselineDrafts[row.id] ?? {}),
          })),
        }),
      });
      const responseBody = await response.json().catch(() => null) as {error?: string; updated?: number} | null;

      if (!response.ok) {
        throw new Error(responseBody?.error ?? `Local data server returned ${response.status}.`);
      }

      setBaselineDrafts(valueDrafts);
      setSaveStatus({
        kind: "success",
        message: `Saved ${responseBody?.updated ?? changedRows.length} entities.`,
      });
    } catch (error) {
      setSaveStatus({
        kind: "error",
        message: error instanceof Error
          ? error.message
          : "Could not reach local data server at http://127.0.0.1:4317.",
      });
    }
  }

  return (
    <section className={s.page}>
      <header className={s.header}>
        <div>
          <h1 className={s.title}>ID Audit</h1>
          <p className={s.subtitle}>Single source of truth coverage across content data, progression, and assets.</p>
        </div>
      </header>

      <div className={s.summary}>
        <SummaryItem label="Registered IDs" value={registeredRows.length} />
        <SummaryItem label="Shown Rows" value={filteredRows.length} />
        <SummaryItem label="Missing Data" value={missingData} />
        <SummaryItem label="Missing Progression" value={missingProgression} />
        <SummaryItem label="Missing Assets" value={missingAssets} />
        <SummaryItem label="Path Mismatch" value={pathMismatches} />
        <SummaryItem label="Unregistered Data" value={unregistered} />
      </div>

      <section className={s.filters} aria-label="ID table filters">
        <label className={s.field}>
          <span className={s.filterLabel}>Search</span>
          <input
            className={s.input}
            value={search}
            onChange={event => dispatch(setIdAuditFilters({search: event.target.value}))}
            placeholder="Path, id, name, notes"
          />
        </label>
        <label className={s.field}>
          <span className={s.filterLabel}>Category</span>
          <select
            className={s.input}
            value={categoryFilter}
            onChange={event => dispatch(setIdAuditFilters({categoryFilter: event.target.value}))}
          >
            <option value="all">All categories</option>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <StatusSelect
          label="Data"
          value={dataFilter}
          onChange={value => dispatch(setIdAuditFilters({dataFilter: value}))}
        />
        <StatusSelect
          label="Progression"
          value={progressionFilter}
          onChange={value => dispatch(setIdAuditFilters({progressionFilter: value}))}
        />
        <StatusSelect
          label="Assets"
          value={assetFilter}
          onChange={value => dispatch(setIdAuditFilters({assetFilter: value}))}
        />
        <label className={s.toggle}>
          <input
            type="checkbox"
            checked={problemsOnly}
            onChange={event => dispatch(setIdAuditFilters({problemsOnly: event.target.checked}))}
          />
          Problems only
        </label>
      </section>

      <div className={s.toolbar}>
        <button
          className={s.saveButton}
          type="button"
          disabled={changedRows.length === 0 || saveStatus.kind === "saving"}
          onClick={saveValueDrafts}
        >
          {saveStatus.kind === "saving" ? "Saving..." : `Save${changedRows.length > 0 ? ` (${changedRows.length})` : ""}`}
        </button>
        {saveStatus.message && (
          <span className={saveStatus.kind === "error" ? s.errorText : s.statusText}>{saveStatus.message}</span>
        )}
        <details className={s.columnChooser}>
          <summary className={s.columnChooserSummary}>Columns</summary>
          <div className={s.columnChooserPanel}>
            <div className={s.columnChooserGroup}>
              <span className={s.columnChooserTitle}>Table</span>
              <div className={s.columnOptions}>
                {baseColumnOptions.map(column => (
                  <label key={column.id} className={s.columnOption}>
                    <input
                      type="checkbox"
                      checked={visibleBaseColumns[column.id]}
                      onChange={event => toggleBaseColumn(column.id, event.target.checked)}
                    />
                    {column.label}
                  </label>
                ))}
              </div>
            </div>
            <div className={s.columnChooserGroup}>
              <div className={s.columnChooserHeader}>
                <span className={s.columnChooserTitle}>Homogeneous values</span>
                <div className={s.columnChooserActions}>
                  <button
                    className={s.smallButton}
                    type="button"
                    onClick={() => dispatch(setAllIdAuditValueColumnVisibility(
                      Object.fromEntries(homogeneousValueColumns.map(definition => [definition.id, true])),
                    ))}
                  >
                    Show all
                  </button>
                  <button
                    className={s.smallButton}
                    type="button"
                    onClick={() => dispatch(setAllIdAuditValueColumnVisibility(
                      Object.fromEntries(homogeneousValueColumns.map(definition => [definition.id, false])),
                    ))}
                  >
                    Hide all
                  </button>
                </div>
              </div>
              <div className={s.valueColumnOptions}>
                {homogeneousValueColumns.map(definition => (
                  <label key={definition.id} className={s.columnOption} title={definition.id}>
                    <input
                      type="checkbox"
                      checked={visibleValueIds[definition.id] ?? true}
                      onChange={event => toggleValueColumn(definition.id, event.target.checked)}
                    />
                    <span className={s.mono}>{definition.id}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              {visibleBaseColumns.category && <th className={s.headCell}>Category</th>}
              {visibleBaseColumns.path && <th className={s.headCell}>Identifier Path</th>}
              {visibleBaseColumns.id && <th className={s.headCell}>ID</th>}
              {visibleBaseColumns.name && <th className={s.headCell}>Name</th>}
              {visibleBaseColumns.data && <th className={s.headCell}>Data</th>}
              {visibleBaseColumns.progression && <th className={s.headCell}>Progression</th>}
              {visibleBaseColumns.assets && <th className={s.headCell}>Assets</th>}
              {visibleBaseColumns.notes && <th className={s.headCell}>Notes</th>}
              {visibleHomogeneousValueColumns.map(definition => (
                <th key={definition.id} className={`${s.headCell} ${s.valueHeadCell}`} title={definition.id}>
                  {getShortValueColumnLabel(definition.label, definition.id)}
                </th>
              ))}
              {visibleBaseColumns.edit && <th className={s.headCell}>Edit</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => (
              <tr key={`${row.category}:${row.path}:${row.id}`}>
                {visibleBaseColumns.category && <td className={s.cell}>{row.category}</td>}
                {visibleBaseColumns.path && (
                  <td className={s.cell} title={row.path}>
                    <IdentifierPathBadge status={row.pathStatus} />
                  </td>
                )}
                {visibleBaseColumns.id && <td className={`${s.cell} ${s.mono}`}>{row.id}</td>}
                {visibleBaseColumns.name && <td className={s.cell}>{row.name ?? <span className={s.muted}>Missing</span>}</td>}
                {visibleBaseColumns.data && <td className={s.cell}><StatusBadge status={row.dataStatus} /></td>}
                {visibleBaseColumns.progression && <td className={s.cell}><StatusBadge status={row.progressionStatus} /></td>}
                {visibleBaseColumns.assets && <td className={s.cell}><StatusBadge status={row.assetStatus} /></td>}
                {visibleBaseColumns.notes && <td className={s.cell}>{row.notes}</td>}
                {visibleHomogeneousValueColumns.map(definition => (
                  <td key={definition.id} className={`${s.cell} ${s.valueCell}`}>
                    <div className={s.valueInputPair}>
                      <input
                        className={`${s.valueInput} ${s.provideInput}`}
                        value={getValueCellDraft(valueDrafts[row.id]?.[definition.id]).production}
                        disabled={!row.valuesEditable}
                        title={`${row.id} / ${definition.id} production`}
                        aria-label={`${row.id} ${definition.id} production`}
                        onChange={event => updateValueDraft(row.id, definition.id, "production", event.target.value)}
                      />
                      <input
                        className={`${s.valueInput} ${s.upkeepInput}`}
                        value={getValueCellDraft(valueDrafts[row.id]?.[definition.id]).upkeep}
                        disabled={!row.valuesEditable}
                        title={`${row.id} / ${definition.id} upkeep`}
                        aria-label={`${row.id} ${definition.id} upkeep`}
                        onChange={event => updateValueDraft(row.id, definition.id, "upkeep", event.target.value)}
                      />
                    </div>
                  </td>
                ))}
                {visibleBaseColumns.edit && <td className={s.cell}>
                  {row.category === "Enemy" ? (
                    <Link className={s.editLink} to={`/monster-edit/${encodeURIComponent(row.id)}`}>Edit</Link>
                  ) : isEditableEntityCategory(row.category) ? (
                    <div className={s.actionLinks}>
                      <Link className={s.editLink} to={`/entity-create/${encodeURIComponent(row.id)}`}>Edit</Link>
                      <Link className={s.editLink} to={`/entity-create/new?copyFrom=${encodeURIComponent(row.id)}`}>Copy</Link>
                    </div>
                  ) : (
                    <span className={s.muted}>N/A</span>
                  )}
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function isEditableEntityCategory(category: string): boolean {
  return category === "Building"
    || category === "Technology"
    || category === "Tower Part"
    || category === "Wall"
    || category === "Tower";
}

function getIdentifierPathStatus(path: string, id: string): IdentifierPathStatus {
  return normalizeIdentifierPath(path) === id ? "ok" : "mismatch";
}

function normalizeIdentifierPath(path: string): string {
  const [collection, ...rest] = path.split(".");
  const normalizedCollection = getIdentifierPathCollection(collection);

  return [normalizedCollection, ...rest].join(".");
}

function getIdentifierPathCollection(collection: string | undefined): string {
  if (collection === "technologies") return "research";
  if (collection === "walls") return "wallSegments";
  if (collection === "superstructures") return "wallSuperstructures";
  return collection ?? "";
}

function createValueDrafts(rows: readonly AuditRow[]): ValueDrafts {
  return Object.fromEntries(
    rows
      .filter(row => row.valuesEditable)
      .map(row => [
        row.id,
        Object.fromEntries(
          HOMOGENEOUS_VALUE_DEFINITION_LIST.map(definition => [
            definition.id,
            formatValueCell(row.homogeneousValues, definition.id),
          ]),
        ),
      ]),
  );
}

function formatValueCell(values: readonly HomogeneousValueEffect[], valueId: string): ValueCellDraft {
  const simpleEffects = values.filter(value => value.valueId === valueId && isSimpleAdditiveValueEffect(value));
  const production = simpleEffects.find(value => getCellValueRole(value) === "production")?.additive;
  const upkeep = simpleEffects.find(value => getCellValueRole(value) === "upkeep")?.additive;

  return {
    production: production === undefined ? "" : String(production),
    upkeep: upkeep === undefined ? "" : String(upkeep),
  };
}

function isSimpleAdditiveValueEffect(value: HomogeneousValueEffect): boolean {
  const extraKeywords = (value.additionalKeywords ?? []).filter(keyword => keyword !== "production" && keyword !== "upkeep");

  return extraKeywords.length === 0
    && !value.removedKeywords?.length
    && (value.multiplier === undefined || value.multiplier === null)
    && typeof value.additive === "number";
}

function getCellValueRole(value: HomogeneousValueEffect): "production" | "upkeep" {
  return value.additionalKeywords?.includes("upkeep") ? "upkeep" : "production";
}

function areDraftRowsEqual(left: Record<string, ValueCellDraft>, right: Record<string, ValueCellDraft>): boolean {
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);

  for (const key of keys) {
    const leftDraft = getValueCellDraft(left[key]);
    const rightDraft = getValueCellDraft(right[key]);
    if (leftDraft.production !== rightDraft.production || leftDraft.upkeep !== rightDraft.upkeep) return false;
  }

  return true;
}

function getChangedValueDrafts(
  currentValues: Record<string, ValueCellDraft>,
  baselineValues: Record<string, ValueCellDraft>,
): Record<string, ValueCellDraft> {
  const changedValues: Record<string, ValueCellDraft> = {};
  const keys = new Set([...Object.keys(currentValues), ...Object.keys(baselineValues)]);

  for (const key of keys) {
    const currentDraft = getValueCellDraft(currentValues[key]);
    const baselineDraft = getValueCellDraft(baselineValues[key]);

    if (currentDraft.production === baselineDraft.production && currentDraft.upkeep === baselineDraft.upkeep) continue;

    changedValues[key] = {
      production: currentDraft.production.trim(),
      upkeep: currentDraft.upkeep.trim(),
    };
  }

  return changedValues;
}

function getValueCellDraft(value: ValueCellDraft | undefined): ValueCellDraft {
  return {
    production: value?.production ?? "",
    upkeep: value?.upkeep ?? "",
  };
}

function getShortValueColumnLabel(label: string, id: string): string {
  const lastIdPart = id.split(".").at(-1) ?? id;
  const compactLabel = label
    .replace(/\b(Multiplier|Single-Target|Controlled|Projectile|Distance|Duration|Seconds|Per|Tower|Monster|Wall)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return compactLabel || lastIdPart;
}

function StatusSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: IdAuditStatusFilter;
  onChange: (value: IdAuditStatusFilter) => void;
}) {
  return (
    <label className={s.field}>
      <span className={s.filterLabel}>{label}</span>
      <select className={s.input} value={value} onChange={event => onChange(event.target.value as IdAuditStatusFilter)}>
        <option value="any">Any</option>
        <option value="ok">OK</option>
        <option value="missing">Missing</option>
        <option value="none">N/A</option>
      </select>
    </label>
  );
}

function SummaryItem({label, value}: {label: string; value: number}) {
  return (
    <div className={s.summaryItem}>
      <span className={s.summaryLabel}>{label}</span>
      <span className={s.summaryValue}>{value}</span>
    </div>
  );
}

function StatusBadge({status}: {status: AuditStatus}) {
  if (status === "ok") return <span className={s.okBadge}>OK</span>;
  if (status === "missing") return <span className={s.missingBadge}>Missing</span>;
  return <span className={s.neutralBadge}>N/A</span>;
}

function IdentifierPathBadge({status}: {status: IdentifierPathStatus}) {
  if (status === "ok") return <span className={s.okBadge}>OK</span>;
  return <span className={s.missingBadge}>Mismatch</span>;
}

