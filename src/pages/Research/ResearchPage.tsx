import {type CSSProperties, type ReactNode, useMemo} from "react";
import {BUILDINGS_ATLAS, STRUCTURES_BY_ID} from "../../data/buildings/index.ts";
import {TOWER_PARTS_BY_ID} from "../../data/gunParts/index.ts";
import {researchTree} from "../../data/research/index.ts";
import {DEVELOPMENT_VECTOR_LABELS, DEVELOPMENT_VECTORS, type DevelopmentVectorKey} from "../../models/DevlopmentVector.ts";
import type {Building} from "../../models/city/Building.ts";
import type {ResearchNodeData} from "../../models/research/ResearchNode.ts";
import {canPurchaseResearch, hasAnyResearchPrerequisiteMet} from "../../models/research/researchGraph.ts";
import {
  PROGRESSION_GRAPH,
} from "../Progression/data/catalog.ts";
import {
  buildProgressionMap,
  getProgressionMapNodeKey,
  type ProgressionMapBranch,
  type ProgressionMapItem,
  type ProgressionMapLane,
} from "../Progression/data/mapLayout.ts";
import type {ProgressionNodeKind} from "../Progression/data/types.ts";
import {useTypedSelector} from "../../store/hooks.ts";
import {selectBuiltStructureIds, selectCompleteCityStructureIds, selectCityHexes} from "../../store/city/selectors.ts";
import {selectAetherAtmosphereLevels} from "../../store/homogeneousValues/selectors.ts";
import {selectPurchasedTechsIds} from "../../store/research/selectors.ts";
import {selectCityResolution} from "../../store/upkeep/selectors.ts";
import * as s from "./ResearchPage.css.ts";

const VECTOR_COLORS: Record<DevelopmentVectorKey, string> = {
  neutral: "#8f8778",
  tech: "#3f7fd9",
  nature: "#419a5a",
  medieval: "#b98135",
  aether: "#7c6ff0",
};

const KIND_ICONS: Record<Extract<ProgressionNodeKind, "building" | "towerPart">, string> = {
  building: "B",
  towerPart: "P",
};

export default function ResearchPage() {
  const purchasedTechsIds = useTypedSelector(selectPurchasedTechsIds);
  const cityHexes = useTypedSelector(selectCityHexes);
  const builtStructureIds = useTypedSelector(selectBuiltStructureIds);
  const completeStructureIds = useTypedSelector(selectCompleteCityStructureIds);
  const resolvedCityData = useTypedSelector(selectCityResolution);
  const aetherAtmosphereLevels = useTypedSelector(selectAetherAtmosphereLevels);
  const {effectiveUpkeep} = resolvedCityData;

  const purchased = useMemo(() => new Set(purchasedTechsIds), [purchasedTechsIds]);
  const builtBuildingIds = useMemo(() => {
    return new Set(cityHexes.flatMap(hex => [
      !hex.partOfStructureId || (hex.structureCoreCellKey ?? hex.cellKey) === hex.cellKey ? hex.buildingKey : null,
      hex.wallKey,
      hex.wallTopKey,
    ].filter((buildingId): buildingId is string => Boolean(buildingId))));
  }, [cityHexes]);

  const visibleNodeKeys = useMemo(() => {
    const visible = new Set<string>();
    const visibleResearchIds = new Set<string>();

    for (const technology of Object.values(researchTree)) {
      const discovered = purchased.has(technology.id);
      const nextInLine = !discovered && isNextInLineTechnology(technology, {
        purchased,
        builtBuildingIds,
        completeStructureIds,
        effectiveUpkeep,
        aetherAtmosphereLevels,
        resolvedCityData,
      });

      if (discovered || nextInLine) {
        visible.add(getProgressionMapNodeKey({kind: "research", id: technology.id}));
        visibleResearchIds.add(technology.id);
      }
    }

    for (const node of PROGRESSION_GRAPH.nodes) {
      if (node.kind !== "building" && node.kind !== "towerPart") continue;
      const ownerResearchIds = node.requirements?.research ?? [];
      if (ownerResearchIds.some(id => visibleResearchIds.has(id) && purchased.has(id))) {
        visible.add(getProgressionMapNodeKey(node));
      }
    }

    return visible;
  }, [
    aetherAtmosphereLevels,
    builtBuildingIds,
    completeStructureIds,
    effectiveUpkeep,
    purchased,
    resolvedCityData,
  ]);

  const lanes = useMemo(
    () => buildProgressionMap(PROGRESSION_GRAPH, visibleNodeKeys),
    [visibleNodeKeys],
  );

  return (
    <main className={s.researchPage} data-nav-scroll-ignore="true">
      {lanes.length ? (
        <div className={s.mapBoard}>
          {lanes.map(lane => (
            <ResearchLane
              key={lane.vector}
              lane={lane}
              purchased={purchased}
              builtStructureIds={builtStructureIds}
            />
          ))}
        </div>
      ) : (
        <div className={s.emptyMap}>No research discoveries yet.</div>
      )}
    </main>
  );
}

function ResearchLane({
  lane,
  purchased,
  builtStructureIds,
}: {
  lane: ProgressionMapLane;
  purchased: ReadonlySet<string>;
  builtStructureIds: readonly string[];
}) {
  const style = {
    "--vector-color": VECTOR_COLORS[lane.vector],
  } as CSSProperties;

  return (
    <section className={s.lane} style={style}>
      <div className={s.laneHeader}>
        <span className={s.laneSwatch} />
        <span>{DEVELOPMENT_VECTOR_LABELS[DEVELOPMENT_VECTORS[lane.vector]]}</span>
      </div>
      <div className={s.branchStack}>
        {lane.branches.map(branch => (
          <ResearchBranch
            key={branch.id}
            branch={branch}
            vector={lane.vector}
            purchased={purchased}
            builtStructureIds={builtStructureIds}
          />
        ))}
      </div>
    </section>
  );
}

function ResearchBranch({
  branch,
  vector,
  purchased,
  builtStructureIds,
}: {
  branch: ProgressionMapBranch;
  vector: DevelopmentVectorKey;
  purchased: ReadonlySet<string>;
  builtStructureIds: readonly string[];
}) {
  const technology = branch.gate ? researchTree[branch.gate.id] : undefined;
  const discovered = technology ? purchased.has(technology.id) : false;
  const buildings = discovered ? branch.items.filter(item => item.kind === "building") : [];
  const towerParts = discovered ? branch.items.filter(item => item.kind === "towerPart") : [];

  return (
    <section className={s.branch}>
      {technology ? (
        <TechnologyGate
          technology={technology}
          vector={branch.gate?.vector ?? vector}
          discovered={discovered}
        />
      ) : (
        <div className={[s.gateColumn, s.gateColumnHidden].join(" ")}>
          <strong className={s.gateTitle}>{branch.title}</strong>
        </div>
      )}
      {discovered ? (
        <div className={s.unlockColumn}>
          <ContentSection title="Buildings" emptyText="No buildings revealed by this technology." count={buildings.length}>
            {buildings.map(item => (
              <ContentCard
                key={getProgressionMapNodeKey(item)}
                item={item}
                vector={item.vector ?? vector}
                builtStructureIds={builtStructureIds}
              />
            ))}
          </ContentSection>
          <ContentSection title="Tower Parts" emptyText="No tower parts revealed by this technology." count={towerParts.length}>
            <div className={s.partChipGrid}>
              {towerParts.map(item => (
                <TowerPartChip key={getProgressionMapNodeKey(item)} item={item} vector={item.vector ?? vector} />
              ))}
            </div>
          </ContentSection>
        </div>
      ) : null}
      {branch.children.length ? (
        <div className={s.childBranchStack}>
          {branch.children.map(child => (
            <ResearchBranch
              key={child.id}
              branch={child}
              vector={vector}
              purchased={purchased}
              builtStructureIds={builtStructureIds}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function TechnologyGate({
  technology,
  vector,
  discovered,
}: {
  technology: ResearchNodeData;
  vector: DevelopmentVectorKey;
  discovered: boolean;
}) {
  const style = {"--card-color": VECTOR_COLORS[vector]} as CSSProperties;

  return (
    <article className={[s.gateColumn, discovered ? "" : s.nextGate].filter(Boolean).join(" ")} style={style}>
      <div className={s.cardHeading}>
        <span className={s.kindIcon}>T</span>
        <strong className={s.gateTitle}>{technology.name}</strong>
      </div>
      {discovered && technology.summary ? (
        <p className={s.description}>{technology.summary}</p>
      ) : null}
    </article>
  );
}

function ContentSection({
  title,
  emptyText,
  count,
  children,
}: {
  title: string;
  emptyText: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className={s.contentSection}>
      <span className={s.shelfLabel}>{title}</span>
      {count ? children : <p className={s.emptySection}>{emptyText}</p>}
    </section>
  );
}

function ContentCard({
  item,
  vector,
  builtStructureIds,
}: {
  item: ProgressionMapItem;
  vector: DevelopmentVectorKey;
  builtStructureIds: readonly string[];
}) {
  const content = findBuilding(item.id);
  const isUnbuiltMultistructure = Boolean(content?.isMultistructure && !builtStructureIds.includes(item.id));
  const description = isUnbuiltMultistructure
    ? getMultistructureHint(item.id, content)
    : content?.description;
  const style = {"--card-color": VECTOR_COLORS[vector]} as CSSProperties;

  return (
    <article className={s.contentCard} style={style}>
      <div className={s.cardHeading}>
        <span className={s.kindIcon}>{KIND_ICONS.building}</span>
        <strong className={s.cardTitle}>{item.name}</strong>
      </div>
      {description ? <p className={s.contentDescription}>{description}</p> : null}
    </article>
  );
}

function getMultistructureHint(id: string, building: Building | undefined): string | undefined {
  return STRUCTURES_BY_ID[id]?.hint ?? building?.multiHexStructure?.[0]?.hint ?? building?.description;
}

function TowerPartChip({
  item,
  vector,
}: {
  item: ProgressionMapItem;
  vector: DevelopmentVectorKey;
}) {
  const part = TOWER_PARTS_BY_ID[item.id];
  const style = {"--card-color": VECTOR_COLORS[vector]} as CSSProperties;

  return (
    <article className={s.partChip} style={style}>
      <div className={s.cardHeading}>
        <span className={s.kindIcon}>{KIND_ICONS.towerPart}</span>
        <strong className={s.cardTitle}>{item.name}</strong>
      </div>
      {part?.description ? <p className={s.contentDescription}>{part.description}</p> : null}
    </article>
  );
}

function findBuilding(id: string): Building | undefined {
  for (const vector of Object.values(DEVELOPMENT_VECTORS)) {
    const building = BUILDINGS_ATLAS[vector][id];
    if (building) return building;
  }

  return undefined;
}

function isNextInLineTechnology(
  technology: ResearchNodeData,
  context: Parameters<typeof canPurchaseResearch>[1],
): boolean {
  return canPurchaseResearch(technology, context)
    || hasAnyResearchPrerequisiteMet(technology, context.purchased);
}
