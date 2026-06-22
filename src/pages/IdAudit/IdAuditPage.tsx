import {BUILDINGS_ATLAS} from "../../data/buildings/index.ts";
import {useMemo, useState} from "react";
import {PROGRESSION_RULES} from "../../data/progression/rules.ts";
import {getRuleForTarget} from "../../data/progression/progression.ts";
import {BATTLE_ENEMY_BLUEPRINTS} from "../../data/enemies/index.ts";
import {
  buildings,
  enemies,
  gunpartIdRows,
  superstructures,
  technologies,
  walls,
} from "../../data/identificators/index.ts";
import {researchTree} from "../../data/research/index.ts";
import {TOWER_PARTS_BY_ID} from "../../data/towers/index.ts";
import {TOWER_PART_VISUAL_ASSETS} from "../../data/towers/partVisualMetadata.ts";
import {WALL_SEGMENT_BUILDINGS, WALL_TOWER_BUILDINGS} from "../../data/wall/index.ts";
import {buildingsSpriteAtlas} from "../../models/sprites/buildings/buildingsSpriteAtlas.ts";
import {wallSpritesAtlas} from "../../models/sprites/walls/wallsSpriteAtlas.ts";
import {wallTopSpritesAtlas} from "../../models/sprites/wallTops/wallTopSpriteAtlas.ts";
import type {ProgressionNodeKind} from "../../data/progression/types.ts";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {Building} from "../../models/city/Building.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import {HOMOGENEOUS_VALUE_IDS} from "../../data/homogeneousValues/index.ts";
import {
  getProducedValues,
  resolveHomogeneousValueContributions,
} from "../../models/homogeneousValueResolution.ts";
import * as s from "./IdAuditPage.css.ts";

type AuditStatus = "ok" | "missing" | "none";

type AuditRow = {
  category: string;
  path: string;
  id: string;
  name?: string;
  dataStatus: AuditStatus;
  progressionStatus: AuditStatus;
  assetStatus: AuditStatus;
  notes: string;
};

type StatusFilter = AuditStatus | "any";

const metadataModules = import.meta.glob("../../assets/battle/towerParts/**/*.json", {
  eager: true,
}) as Record<string, unknown>;

const imageModules = import.meta.glob("../../assets/battle/towerParts/**/*.png", {
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
      dataStatus: data ? "ok" : "missing",
      progressionStatus: getProgressionStatus("building", item.id),
      assetStatus: hasAsset ? "ok" : "none",
      notes: data ? `${vector} / ${data.type.description ?? "building"} / asset ${hasAsset ? "yes" : "no"}` : "No building definition",
    });
  }

  for (const item of flattenGroupedIds(technologies, "technologies")) {
    const data = researchTree[item.id];
    rows.push({
      category: "Technology",
      path: item.path,
      id: item.id,
      name: data?.name,
      dataStatus: data ? "ok" : "missing",
      progressionStatus: getProgressionStatus("research", item.id),
      assetStatus: "none",
      notes: data ? data.summary ?? "" : "No research node",
    });
  }

  for (const item of gunpartIdRows) {
    const data = TOWER_PARTS_BY_ID[item.id];
    const hasPng = gunPartImageIds.has(item.id);
    const hasJson = gunPartMetadataIds.has(item.id);
    const isRegistered = registeredTowerPartAssetIds.has(item.id);

    rows.push({
      category: "Tower Part",
      path: `gunparts.${item.slotGroup}.${item.vector}.${item.key}`,
      id: item.id,
      name: data?.name,
      dataStatus: data ? "ok" : "missing",
      progressionStatus: getProgressionStatus("towerPart", item.id),
      assetStatus: hasPng && hasJson && isRegistered ? "ok" : "missing",
      notes: data ? `${data.slot ?? "unknown slot"} / PNG ${hasPng ? "yes" : "no"} / JSON ${hasJson ? "yes" : "no"} / registry ${isRegistered ? "yes" : "no"}` : "No tower part definition",
    });
  }

  for (const item of flattenGroupedIds(enemies, "enemies")) {
    const data = BATTLE_ENEMY_BLUEPRINTS[item.id];
    rows.push({
      category: "Enemy",
      path: item.path,
      id: item.id,
      name: data?.displayName,
      dataStatus: data ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: data?.sprite.textureKey ? "ok" : "missing",
      notes: data ? `${data.kind} / pressure ${data.pressure}` : "No enemy blueprint",
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
      dataStatus: data ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: hasAsset ? "ok" : "none",
      notes: data ? `${describeWallBuildingStats(data)} / asset ${hasAsset ? "yes" : "no"}` : "No wall segment definition",
    });
  }

  for (const item of flattenGroupedIds(superstructures, "superstructures")) {
    const data = WALL_TOWER_BUILDINGS[item.id];
    const vector = item.groupName as DevelopmentVectorKey;
    const hasAsset = Boolean(wallTopSpritesAtlas[DEVELOPMENT_VECTORS[vector]]?.[item.id]?.src);
    rows.push({
      category: "Tower",
      path: item.path,
      id: item.id,
      name: data?.name,
      dataStatus: data ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: hasAsset ? "ok" : "none",
      notes: data ? `${describeWallBuildingStats(data)} / asset ${hasAsset ? "yes" : "no"}` : "No wall superstructure definition",
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
    unregisteredRows.push({
      category: "Tower Part Asset",
      path: "missing identificator asset",
      id,
      dataStatus: TOWER_PARTS_BY_ID[id] ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: "ok",
      notes: "Asset file exists but id is not in src/data/identificators",
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

  for (const tower of Object.values(WALL_TOWER_BUILDINGS)) {
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
    dataStatus: "ok",
    progressionStatus: "none",
    assetStatus: "none",
    notes: "Definition exists but id is not in src/data/identificators",
  };
}

export default function IdAuditPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dataFilter, setDataFilter] = useState<StatusFilter>("any");
  const [progressionFilter, setProgressionFilter] = useState<StatusFilter>("any");
  const [assetFilter, setAssetFilter] = useState<StatusFilter>("any");
  const [problemsOnly, setProblemsOnly] = useState(false);
  const registeredRows = useMemo(() => createRows(), []);
  const rows = useMemo(() => [...registeredRows, ...getUnregisteredRows(registeredRows)], [registeredRows]);
  const categories = useMemo(() => [...new Set(rows.map(row => row.category))].sort(), [rows]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows
      .filter(row => categoryFilter === "all" || row.category === categoryFilter)
      .filter(row => dataFilter === "any" || row.dataStatus === dataFilter)
      .filter(row => progressionFilter === "any" || row.progressionStatus === progressionFilter)
      .filter(row => assetFilter === "any" || row.assetStatus === assetFilter)
      .filter(row => !problemsOnly || (
        row.dataStatus === "missing"
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
  const missingData = rows.filter(row => row.dataStatus === "missing").length;
  const missingProgression = rows.filter(row => row.progressionStatus === "missing").length;
  const missingAssets = rows.filter(row => row.assetStatus === "missing").length;
  const unregistered = rows.filter(row => row.path.startsWith("missing identificator")).length;

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
        <SummaryItem label="Unregistered Data" value={unregistered} />
      </div>

      <section className={s.filters} aria-label="ID table filters">
        <label className={s.field}>
          <span className={s.filterLabel}>Search</span>
          <input
            className={s.input}
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Path, id, name, notes"
          />
        </label>
        <label className={s.field}>
          <span className={s.filterLabel}>Category</span>
          <select className={s.input} value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>
            <option value="all">All categories</option>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <StatusSelect label="Data" value={dataFilter} onChange={setDataFilter} />
        <StatusSelect label="Progression" value={progressionFilter} onChange={setProgressionFilter} />
        <StatusSelect label="Assets" value={assetFilter} onChange={setAssetFilter} />
        <label className={s.toggle}>
          <input
            type="checkbox"
            checked={problemsOnly}
            onChange={event => setProblemsOnly(event.target.checked)}
          />
          Problems only
        </label>
      </section>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th className={s.headCell}>Category</th>
              <th className={s.headCell}>Identifier Path</th>
              <th className={s.headCell}>ID</th>
              <th className={s.headCell}>Name</th>
              <th className={s.headCell}>Data</th>
              <th className={s.headCell}>Progression</th>
              <th className={s.headCell}>Assets</th>
              <th className={s.headCell}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(row => (
              <tr key={`${row.category}:${row.path}:${row.id}`}>
                <td className={s.cell}>{row.category}</td>
                <td className={`${s.cell} ${s.mono}`}>{row.path}</td>
                <td className={`${s.cell} ${s.mono}`}>{row.id}</td>
                <td className={s.cell}>{row.name ?? <span className={s.muted}>Missing</span>}</td>
                <td className={s.cell}><StatusBadge status={row.dataStatus} /></td>
                <td className={s.cell}><StatusBadge status={row.progressionStatus} /></td>
                <td className={s.cell}><StatusBadge status={row.assetStatus} /></td>
                <td className={s.cell}>{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function StatusSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
}) {
  return (
    <label className={s.field}>
      <span className={s.filterLabel}>{label}</span>
      <select className={s.input} value={value} onChange={event => onChange(event.target.value as StatusFilter)}>
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
