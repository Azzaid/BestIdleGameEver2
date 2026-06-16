import {BUILDINGS_ATLAS} from "../../data/buildings/index.ts";
import {PROGRESSION_RULES} from "../../data/content/rules.ts";
import {getRuleForTarget} from "../../data/content/progression.ts";
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
import {WALL_SEGMENT_BUILDINGS, TOWER_BASE_BUILDINGS} from "../../data/wall/index.ts";
import type {ProgressionNodeKind} from "../../data/content/types.ts";
import {DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {Building} from "../../models/city/Building.ts";
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

const metadataModules = import.meta.glob("../../assets/battle/gunParts/**/*.json", {
  eager: true,
}) as Record<string, { default: { id: string } }>;

const imageModules = import.meta.glob("../../assets/battle/gunParts/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const gunPartMetadataIds = new Set(Object.values(metadataModules).map(module => module.default.id));
const gunPartImageIds = new Set(Object.keys(imageModules).map(getFileStem));

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
    rows.push({
      category: "Building",
      path: item.path,
      id: item.id,
      name: data?.name,
      dataStatus: data ? "ok" : "missing",
      progressionStatus: getProgressionStatus("building", item.id),
      assetStatus: "none",
      notes: data ? `${vector} / ${data.type.description ?? "building"}` : "No building definition",
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

    rows.push({
      category: "Tower Part",
      path: `gunparts.${item.slotGroup}.${item.vector}.${item.key}`,
      id: item.id,
      name: data?.name,
      dataStatus: data ? "ok" : "missing",
      progressionStatus: getProgressionStatus("towerPart", item.id),
      assetStatus: hasPng && hasJson ? "ok" : "missing",
      notes: data ? `${data.slot ?? "unknown slot"} / PNG ${hasPng ? "yes" : "no"} / JSON ${hasJson ? "yes" : "no"}` : "No tower part definition",
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
    rows.push({
      category: "Wall",
      path: item.path,
      id: item.id,
      name: data?.name,
      dataStatus: data ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: "none",
      notes: data ? `resilience ${data.resilience} / ignored threat ${data.ignoredThreat}` : "No wall segment definition",
    });
  }

  for (const item of flattenGroupedIds(superstructures, "superstructures")) {
    const data = TOWER_BASE_BUILDINGS[item.id];
    rows.push({
      category: "Superstructure",
      path: item.path,
      id: item.id,
      name: data?.name,
      dataStatus: data ? "ok" : "missing",
      progressionStatus: "none",
      assetStatus: "none",
      notes: data ? `resilience ${data.resilience} / effects ${data.specialEffects.length}` : "No wall superstructure definition",
    });
  }

  return rows;
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

  for (const enemy of Object.values(BATTLE_ENEMY_BLUEPRINTS)) {
    if (registeredIds.has(enemy.id)) continue;
    unregisteredRows.push(createUnregisteredRow("Enemy", enemy.id, enemy.displayName));
  }

  for (const wall of Object.values(WALL_SEGMENT_BUILDINGS)) {
    if (registeredIds.has(wall.id)) continue;
    unregisteredRows.push(createUnregisteredRow("Wall", wall.id, wall.name));
  }

  for (const structure of Object.values(TOWER_BASE_BUILDINGS)) {
    if (registeredIds.has(structure.id)) continue;
    unregisteredRows.push(createUnregisteredRow("Superstructure", structure.id, structure.name));
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
  const registeredRows = createRows();
  const rows = [...registeredRows, ...getUnregisteredRows(registeredRows)];
  const missingData = rows.filter(row => row.dataStatus === "missing").length;
  const missingProgression = rows.filter(row => row.progressionStatus === "missing").length;
  const missingAssets = rows.filter(row => row.assetStatus === "missing").length;
  const unregistered = rows.filter(row => row.path === "missing identificator").length;

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
        <SummaryItem label="Missing Data" value={missingData} />
        <SummaryItem label="Missing Progression" value={missingProgression} />
        <SummaryItem label="Missing Assets" value={missingAssets} />
        <SummaryItem label="Unregistered Data" value={unregistered} />
      </div>

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
            {rows.map(row => (
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
