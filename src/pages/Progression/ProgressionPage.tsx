import {type CSSProperties, type ReactNode, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {
  PROGRESSION_GRAPH,
  PROGRESSION_VALIDATION_ERRORS,
} from "./data/catalog.ts";
import {
  buildProgressionMap,
  getProgressionMapNodeKey,
  type ProgressionMapBranch,
  type ProgressionMapItem,
  type ProgressionMapLane,
} from "./data/mapLayout.ts";
import type {
  ProgressionEdge,
  ProgressionGraphNode,
  ProgressionNodeKind,
} from "./data/types.ts";
import {DEVELOPMENT_VECTOR_LABELS, DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import {BUILDINGS_ATLAS} from "../../data/buildings/index.ts";
import {researchTree} from "../../data/research/index.ts";
import {TOWER_PARTS_BY_ID} from "../../data/gunParts/index.ts";
import {WALL_SEGMENT_BUILDINGS} from "../../data/wallSegments/index.ts";
import {WALL_SUPERSTRUCTURE_BUILDINGS} from "../../data/wallSuperstructures/index.ts";
import {getHomogeneousValueDefinition} from "../../data/homogeneousValues/index.ts";
import {ENTITY_VISUAL_ASSETS_BY_ID} from "../../data/entityVisualAssets.ts";
import type {Building} from "../../models/city/Building.ts";
import {BUILDING_TYPES, type BuildingTypesValue} from "../../models/city/BuildingTypes.ts";
import type {WallBuilding} from "../../models/city/Wall.ts";
import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import type {HomogeneousAdjacencyRule, HomogeneousValueEffect} from "../../models/homogeneousValues.ts";
import type {Requirement} from "../../models/progression/requirements.ts";
import * as s from "./ProgressionPage.css.ts";

const NODE_KIND_LABELS: Record<ProgressionNodeKind, string> = {
  research: "Technology",
  building: "Building",
  towerPart: "Tower Part",
  structure: "Superstructure",
};

const VECTOR_COLORS: Record<DevelopmentVectorKey, string> = {
  neutral: "#8f8778",
  tech: "#3f7fd9",
  nature: "#419a5a",
  medieval: "#b98135",
  aether: "#7c6ff0",
};

const KIND_ICONS: Record<ProgressionNodeKind, string> = {
  research: "T",
  building: "B",
  towerPart: "P",
  structure: "S",
};

const CARD_KIND_CLASSES: Record<ProgressionNodeKind, string> = {
  research: s.cardKind_research,
  building: s.cardKind_building,
  towerPart: s.cardKind_towerPart,
  structure: s.cardKind_structure,
};

type DetailRow = {
  label: string;
  value: string;
};

type SelectedItemDetails = {
  description?: string;
  keywords: readonly string[];
  stats: DetailRow[];
  spriteSrc?: string;
  spriteLabel?: string;
  editPath: string;
};

export default function ProgressionPage() {
  const [search, setSearch] = useState("");
  const [enabledKinds, setEnabledKinds] = useState<Record<ProgressionNodeKind, boolean>>({
    research: true,
    building: true,
    towerPart: true,
    structure: true,
  });
  const [selectedNodeKey, setSelectedNodeKey] = useState(
    PROGRESSION_GRAPH.nodes[0] ? getProgressionMapNodeKey(PROGRESSION_GRAPH.nodes[0]) : "",
  );

  const filteredNodeKeys = useMemo(() => {
    const query = search.trim().toLowerCase();

    return new Set(PROGRESSION_GRAPH.nodes
      .filter(node => enabledKinds[node.kind])
      .filter(node => {
        if (!query) return true;
        return node.id.toLowerCase().includes(query) || node.name.toLowerCase().includes(query);
      })
      .map(getProgressionMapNodeKey));
  }, [enabledKinds, search]);

  const lanes = useMemo(
    () => buildProgressionMap(PROGRESSION_GRAPH, filteredNodeKeys),
    [filteredNodeKeys],
  );

  const selectedNode = PROGRESSION_GRAPH.nodes.find(node => getProgressionMapNodeKey(node) === selectedNodeKey)
    ?? PROGRESSION_GRAPH.nodes[0];
  const selectedKey = selectedNode ? getProgressionMapNodeKey(selectedNode) : "";
  const incoming = PROGRESSION_GRAPH.edges.filter(edge => getProgressionMapNodeKey(edge.to) === selectedKey);
  const outgoing = PROGRESSION_GRAPH.edges.filter(edge => getProgressionMapNodeKey(edge.from) === selectedKey);
  const selectedDetails = selectedNode ? getSelectedItemDetails(selectedNode) : undefined;

  return (
    <section className={s.page}>
      <aside className={s.panel}>
        <h1 className={s.heading}>Progression Map</h1>
        <label className={s.field}>
          <span className={s.label}>Search</span>
          <input
            className={s.input}
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Node name or id"
          />
        </label>
        <div className={s.field}>
          <span className={s.label}>Node Types</span>
          <div className={s.checkList}>
            {(Object.keys(NODE_KIND_LABELS) as ProgressionNodeKind[]).map(kind => (
              <label className={s.checkItem} key={kind}>
                <input
                  type="checkbox"
                  checked={enabledKinds[kind]}
                  onChange={event => {
                    setEnabledKinds(current => ({
                      ...current,
                      [kind]: event.target.checked,
                    }));
                  }}
                />
                {NODE_KIND_LABELS[kind]}
              </label>
            ))}
          </div>
        </div>
        {PROGRESSION_VALIDATION_ERRORS.length ? (
          <div className={s.warning}>
            <strong>Validation</strong>
            <ul className={s.list}>
              {PROGRESSION_VALIDATION_ERRORS.map(error => <li key={error}>{error}</li>)}
            </ul>
          </div>
        ) : (
          <p className={s.muted}>No progression validation errors.</p>
        )}
      </aside>
      <main className={s.mapScroll}>
        {lanes.length ? (
          <div className={s.mapBoard}>
            {lanes.map(lane => (
              <ProgressionLane
                key={lane.vector}
                lane={lane}
                selectedNodeKey={selectedKey}
                onSelect={setSelectedNodeKey}
              />
            ))}
          </div>
        ) : (
          <div className={s.emptyMap}>No matching progression nodes.</div>
        )}
      </main>
      <aside className={s.detailsPanel}>
        <h2 className={s.heading}>{selectedNode?.name ?? "No node"}</h2>
        {selectedNode ? (
          <>
            <p className={s.muted}>{NODE_KIND_LABELS[selectedNode.kind]} - {selectedNode.id}</p>
            <div className={s.previewArea}>
              {selectedDetails?.spriteSrc ? (
                <img
                  className={s.spritePreview}
                  src={selectedDetails.spriteSrc}
                  alt={selectedDetails.spriteLabel ?? selectedNode.name}
                />
              ) : (
                <div className={s.emptyPreview}>No sprite</div>
              )}
            </div>
            <Link className={s.editButton} to={selectedDetails?.editPath ?? `/dev/entity-create/${encodeURIComponent(selectedNode.id)}`}>
              Edit Entity
            </Link>
            {selectedDetails?.description ? (
              <p className={s.description}>{selectedDetails.description}</p>
            ) : null}
            <StatsList rows={selectedDetails?.stats ?? []} />
            <TagList title="Keywords" tags={selectedDetails?.keywords ?? []} />
            <RequirementList node={selectedNode} />
            <DetailList title="Requires" edges={incoming} emptyText="No graph requirements." />
            <DetailList title="Unlocks / Enables" edges={outgoing} emptyText="No outgoing unlocks." useTarget />
          </>
        ) : null}
      </aside>
    </section>
  );
}

function ProgressionLane({
  lane,
  selectedNodeKey,
  onSelect,
}: {
  lane: ProgressionMapLane;
  selectedNodeKey: string;
  onSelect: (key: string) => void;
}) {
  const color = VECTOR_COLORS[lane.vector];
  const style = {
    "--vector-color": color,
  } as CSSProperties;

  return (
    <section className={s.lane} style={style}>
      <div className={s.laneHeader}>
        <span className={s.laneSwatch} />
        <span>{DEVELOPMENT_VECTOR_LABELS[DEVELOPMENT_VECTORS[lane.vector]]}</span>
      </div>
      <div className={s.branchStack}>
        {lane.branches.map(branch => (
          <ProgressionBranch
            key={branch.id}
            branch={branch}
            vector={lane.vector}
            selectedNodeKey={selectedNodeKey}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function ProgressionBranch({
  branch,
  vector,
  selectedNodeKey,
  onSelect,
}: {
  branch: ProgressionMapBranch;
  vector: DevelopmentVectorKey;
  selectedNodeKey: string;
  onSelect: (key: string) => void;
}) {
  const buildings = branch.items.filter(item => item.kind === "building");
  const structures = branch.items.filter(item => item.kind === "structure");
  const towerParts = branch.items.filter(item => item.kind === "towerPart");
  const towerPartAssignments = new Set<string>();

  return (
    <section className={s.branch}>
      {branch.gate ? (
        <TechnologyGate
          gate={{...branch.gate, layoutDepth: branch.depth, ownerBuildingIds: []}}
          color={VECTOR_COLORS[branch.gate.vector ?? vector]}
          selectedNodeKey={selectedNodeKey}
          onSelect={onSelect}
        />
      ) : (
        <div className={[s.gateColumn, s.gateColumnHidden].join(" ")}>
          <div className={s.cardHeading}>
            <span className={s.kindIcon}>{KIND_ICONS.research}</span>
            <strong className={s.cardTitle}>{branch.title}</strong>
          </div>
          <div className={s.hiddenGateText}>
            <span>{branch.branch}</span>
          </div>
        </div>
      )}
      <div className={s.unlockColumn}>
        <div className={s.contentGrid}>
          {[...buildings, ...structures].map(item => {
            const childTowerParts = towerParts.filter(part => part.ownerBuildingIds.includes(item.id));
            for (const part of childTowerParts) {
              towerPartAssignments.add(getProgressionMapNodeKey(part));
            }

            return (
              <ProgressionCard
                key={getProgressionMapNodeKey(item)}
                item={item}
                color={VECTOR_COLORS[item.vector ?? vector]}
                selectedNodeKey={selectedNodeKey}
                onSelect={onSelect}
              >
                {childTowerParts.length ? (
                  <div className={s.childPartRow}>
                    {childTowerParts.map(part => (
                      <button
                        key={getProgressionMapNodeKey(part)}
                        type="button"
                        className={getCardClass(part, selectedNodeKey, s.childPartChip)}
                        onClick={event => {
                          event.stopPropagation();
                          onSelect(getProgressionMapNodeKey(part));
                        }}
                      >
                        <span className={s.kindIcon}>{KIND_ICONS.towerPart}</span>
                        {part.name}
                      </button>
                    ))}
                  </div>
                ) : null}
              </ProgressionCard>
            );
          })}
        </div>
        {towerParts.some(part => !towerPartAssignments.has(getProgressionMapNodeKey(part))) ? (
          <div className={s.towerPartShelf}>
            <span className={s.shelfLabel}>Tower Parts</span>
            <div className={s.partChipGrid}>
              {towerParts
                .filter(part => !towerPartAssignments.has(getProgressionMapNodeKey(part)))
                .map(part => (
                  <button
                    key={getProgressionMapNodeKey(part)}
                    type="button"
                    className={getCardClass(part, selectedNodeKey, s.partChip)}
                    onClick={() => onSelect(getProgressionMapNodeKey(part))}
                  >
                    <span className={s.kindIcon}>{KIND_ICONS.towerPart}</span>
                    {part.name}
                  </button>
                ))}
            </div>
          </div>
        ) : null}
      </div>
      {branch.children.length ? (
        <div className={s.childBranchStack}>
          {branch.children.map(child => (
            <ProgressionBranch
              key={child.id}
              branch={child}
              vector={vector}
              selectedNodeKey={selectedNodeKey}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ProgressionCard({
  item,
  color,
  selectedNodeKey,
  onSelect,
  children,
}: {
  item: ProgressionMapItem;
  color: string;
  selectedNodeKey: string;
  onSelect: (key: string) => void;
  children?: ReactNode;
}) {
  const key = getProgressionMapNodeKey(item);
  const style = {"--card-color": color} as CSSProperties;

  return (
    <article
      className={getCardClass(item, selectedNodeKey, s.contentCard)}
      style={style}
      onClick={() => onSelect(key)}
    >
      <div className={s.cardHeading}>
        <span className={s.kindIcon}>{KIND_ICONS[item.kind]}</span>
        <strong className={s.cardTitle}>{item.name}</strong>
      </div>
      {children}
    </article>
  );
}

function TechnologyGate({
  gate,
  color,
  selectedNodeKey,
  onSelect,
}: {
  gate: ProgressionMapItem;
  color: string;
  selectedNodeKey: string;
  onSelect: (key: string) => void;
}) {
  const key = getProgressionMapNodeKey(gate);
  const style = {"--card-color": color} as CSSProperties;

  return (
    <article
      className={[
        s.gateColumn,
        getProgressionMapNodeKey(gate) === selectedNodeKey ? s.cardSelected : "",
      ].filter(Boolean).join(" ")}
      style={style}
      onClick={() => onSelect(key)}
    >
      <div className={s.cardHeading}>
        <span className={s.kindIcon}>{KIND_ICONS.research}</span>
        <strong className={s.gateTitle}>{gate.name}</strong>
      </div>
      <div className={s.cardSubline}>Depth {gate.layoutDepth + 1}</div>
    </article>
  );
}

function getCardClass(
  item: Pick<ProgressionGraphNode, "kind" | "id">,
  selectedNodeKey: string,
  baseClass: string,
): string {
  return [
    baseClass,
    CARD_KIND_CLASSES[item.kind],
    getProgressionMapNodeKey(item) === selectedNodeKey ? s.cardSelected : "",
  ].filter(Boolean).join(" ");
}

function StatsList({rows}: {rows: readonly DetailRow[]}) {
  return (
    <div className={s.field}>
      <span className={s.label}>Stats</span>
      {rows.length ? (
        <dl className={s.statList}>
          {rows.map((row, index) => (
            <div className={s.statRow} key={`${row.label}:${index}`}>
              <dt className={s.statTerm}>{row.label}</dt>
              <dd className={s.statValue}>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className={s.muted}>No stats defined.</p>
      )}
    </div>
  );
}

function TagList({title, tags}: {title: string; tags: readonly string[]}) {
  if (!tags.length) return null;

  return (
    <div className={s.field}>
      <span className={s.label}>{title}</span>
      <div className={s.tagList}>
        {tags.map(tag => <span className={s.tag} key={tag}>{tag}</span>)}
      </div>
    </div>
  );
}

function DetailList({
  title,
  edges,
  emptyText,
  useTarget = false,
}: {
  title: string;
  edges: ProgressionEdge[];
  emptyText: string;
  useTarget?: boolean;
}) {
  return (
    <div className={s.field}>
      <span className={s.label}>{title}</span>
      {edges.length ? (
        <ul className={s.list}>
          {edges.map(edge => {
            const ref = useTarget ? edge.to : edge.from;
            const node = PROGRESSION_GRAPH.nodes.find(candidate => (
              candidate.kind === ref.kind && candidate.id === ref.id
            ));

            return (
              <li key={edge.id}>
                {node?.name ?? ref.id} <span className={s.muted}>({edge.kind})</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={s.muted}>{emptyText}</p>
      )}
    </div>
  );
}

function RequirementList({node}: {node: ProgressionGraphNode}) {
  const requirements = getRequirementLines(node);

  if (!requirements.length) return null;

  return (
    <div className={s.field}>
      <span className={s.label}>Unlock Requirements</span>
      <ul className={s.list}>
        {requirements.map(requirement => <li key={requirement}>{requirement}</li>)}
      </ul>
    </div>
  );
}

function getRequirementLines(node: ProgressionGraphNode): string[] {
  return (findContentRequirements(node) ?? []).map(formatRequirement);
}

function findContentRequirements(node: ProgressionGraphNode): readonly Requirement[] | undefined {
  if (node.kind === "towerPart") return TOWER_PARTS_BY_ID[node.id]?.requirements;
  if (node.kind === "building") {
    const building = Object.values(DEVELOPMENT_VECTORS)
      .map(vector => BUILDINGS_ATLAS[vector][node.id])
      .find(Boolean);

    return building?.requirements
      ?? WALL_SEGMENT_BUILDINGS[node.id]?.requirements
      ?? WALL_SUPERSTRUCTURE_BUILDINGS[node.id]?.requirements;
  }

  if (node.kind === "research") return researchTree[node.id]?.requirements;
  if (node.kind === "structure") return WALL_SUPERSTRUCTURE_BUILDINGS[node.id]?.requirements;

  return undefined;
}

function getSelectedItemDetails(node: ProgressionGraphNode): SelectedItemDetails {
  const baseStats: DetailRow[] = [
    {label: "Type", value: NODE_KIND_LABELS[node.kind]},
    {label: "Vector", value: node.vector ?? "unknown"},
    {label: "Level", value: typeof node.level === "number" ? String(node.level) : "derived"},
    {label: "Branch", value: node.branch ?? "derived"},
  ];

  if (node.kind === "research") {
    const research = researchTree[node.id];
    return {
      description: research?.summary,
      keywords: research?.keywords ?? [],
      stats: [
        ...baseStats,
        ...getResearchStats(research),
        ...getValueRows(research?.values),
        ...getEffectRows(research?.effects),
      ],
      editPath: `/dev/entity-create/${encodeURIComponent(node.id)}`,
    };
  }

  if (node.kind === "towerPart") {
    const part = TOWER_PARTS_BY_ID[node.id];
    const asset = getVisualAsset(part?.sprite.textureKey ?? node.id);

    return {
      description: part?.description,
      keywords: part ? [...part.keywords] : [],
      stats: [
        ...baseStats,
        {label: "Slot", value: part?.slot ?? "unknown"},
        ...getValueRows(part?.values),
        ...getEffectRows(part?.effects),
        ...getOptionalListRow("Aim", part?.aimKeywords),
        ...getOptionalListRow("Conflicts", part?.conflictsWithKeywords),
      ],
      spriteSrc: asset?.src,
      spriteLabel: asset?.label,
      editPath: `/dev/entity-create/${encodeURIComponent(node.id)}`,
    };
  }

  const building = findBuildingContent(node);
  const asset = getVisualAsset(getBuildingVisualAssetId(building) ?? node.id);

  return {
    description: building?.description,
    keywords: building?.keywords ?? [],
    stats: [
      ...baseStats,
      {label: "Building Type", value: formatBuildingType(building?.type)},
      ...getBuildingStats(building),
      ...getValueRows(building?.values),
      ...getEffectRows(building?.effects),
    ],
    spriteSrc: asset?.src,
    spriteLabel: asset?.label,
    editPath: `/dev/entity-create/${encodeURIComponent(node.id)}`,
  };
}

function findBuildingContent(node: ProgressionGraphNode): Building | WallBuilding | undefined {
  if (node.kind === "structure") return WALL_SUPERSTRUCTURE_BUILDINGS[node.id];

  const regularBuilding = Object.values(DEVELOPMENT_VECTORS)
    .map(vector => BUILDINGS_ATLAS[vector][node.id])
    .find(Boolean);

  return regularBuilding
    ?? WALL_SEGMENT_BUILDINGS[node.id]
    ?? WALL_SUPERSTRUCTURE_BUILDINGS[node.id];
}

function getVisualAsset(id: string | undefined) {
  if (!id) return undefined;
  return ENTITY_VISUAL_ASSETS_BY_ID[id];
}

function getBuildingVisualAssetId(building: Building | WallBuilding | undefined): string | undefined {
  if (!building || !("visualAssetId" in building)) return undefined;
  return building.visualAssetId;
}

function formatBuildingType(type: BuildingTypesValue | undefined): string {
  if (type === BUILDING_TYPES.produce) return "Produce";
  if (type === BUILDING_TYPES.research) return "Research";
  if (type === BUILDING_TYPES.wallSegment) return "Wall Segment";
  if (type === BUILDING_TYPES.tower) return "Tower";

  return "unknown";
}

function getResearchStats(research: ResearchNodeData | undefined): DetailRow[] {
  if (!research) return [];

  return [
    {label: "Parent", value: research.parentId ?? "root"},
    ...getOptionalListRow("Unlocks", research.unlocks),
    ...getOptionalListRow("Also Requires", research.alsoRequires),
    ...getOptionalListRow("Buildings", research.requiredBuildings),
    ...getOptionalListRow("Structures", research.requiredStructures),
    ...getOptionalNumberRow("Biodiversity", research.requiredBiodiversity),
  ];
}

function getBuildingStats(building: Building | WallBuilding | undefined): DetailRow[] {
  if (!building) return [];

  const rows: DetailRow[] = [];
  if ("level" in building) rows.push({label: "Content Level", value: String(building.level)});
  if ("isMultiHex" in building) rows.push({label: "Multi-Hex", value: building.isMultiHex ? "yes" : "no"});
  if ("isMultistructure" in building) rows.push({label: "Multi-Structure", value: building.isMultistructure ? "yes" : "no"});
  if ("adjacencyDescription" in building) rows.push({label: "Adjacency", value: building.adjacencyDescription});

  return rows;
}

function getValueRows(values: readonly HomogeneousValueEffect[] | undefined): DetailRow[] {
  return (values ?? []).map(value => ({
    label: getHomogeneousValueDefinition(value.valueId).label,
    value: formatValueEffect(value),
  }));
}

function getEffectRows(effects: readonly HomogeneousAdjacencyRule[] | undefined): DetailRow[] {
  return (effects ?? []).map((effect, index) => ({
    label: `Adjacency ${index + 1}`,
    value: [
      effect.radius ? `radius ${effect.radius}` : undefined,
      effect.requiredBuildingKeywords?.length ? `near ${effect.requiredBuildingKeywords.join(", ")}` : undefined,
      effect.requiredValueKeywords?.length ? `values ${effect.requiredValueKeywords.join(", ")}` : undefined,
      formatNumericEffect(effect),
    ].filter(Boolean).join("; "),
  }));
}

function getOptionalListRow(label: string, values: readonly string[] | undefined): DetailRow[] {
  return values?.length ? [{label, value: values.join(", ")}] : [];
}

function getOptionalNumberRow(label: string, value: number | undefined): DetailRow[] {
  return value === undefined ? [] : [{label, value: String(value)}];
}

function formatValueEffect(value: HomogeneousValueEffect): string {
  return [
    formatNumericEffect(value),
    value.additionalKeywords?.length ? `adds ${value.additionalKeywords.join(", ")}` : undefined,
    value.removedKeywords?.length ? `removes ${value.removedKeywords.join(", ")}` : undefined,
  ].filter(Boolean).join("; ") || "configured";
}

function formatNumericEffect(value: Pick<HomogeneousValueEffect, "additive" | "multiplier">): string {
  return [
    value.additive === undefined || value.additive === null ? undefined : `+${value.additive}`,
    value.multiplier === undefined || value.multiplier === null ? undefined : `x${value.multiplier}`,
  ].filter(Boolean).join(" ");
}

function formatRequirement(requirement: Requirement): string {
  if (requirement.type === "buildingKeywordExists") {
    return `Building keyword exists: ${requirement.keyword}`;
  }

  if (requirement.type === "buildingExists") {
    return `Building exists: ${requirement.buildingId}`;
  }

  if (requirement.type === "technologyUnlocked") {
    return `Technology unlocked: ${requirement.technologyId}`;
  }

  if (requirement.type === "globalFlagExists") {
    return `Flag exists: ${requirement.flagId}`;
  }

  if (requirement.type === "globalFlagMissing") {
    return `Flag missing: ${requirement.flagId}`;
  }

  if (requirement.type === "homogeneousValueAtLeast") {
    const definition = getHomogeneousValueDefinition(requirement.valueId);
    return `${definition.label} at least ${requirement.amount}`;
  }

  const definition = getHomogeneousValueDefinition(requirement.valueId);
  return `${definition.label} less than ${requirement.amount}`;
}
