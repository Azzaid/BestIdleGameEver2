import type {DevelopmentVectorKey} from "../models/DevlopmentVector.ts";
import type {TowerPartSlot} from "../models/battle/towerParts.ts";
import type {TowerPartVisualMetadata} from "../models/battle/towerPartVisualMetadata.ts";
import type {WallSpriteMetadata} from "../models/sprites/walls/WallSpriteAtlas.ts";
import type {WallTopSpriteMetadata} from "../models/sprites/wallTops/WallTopSpriteMetadata.ts";
import buildingTechFarm1Url from "../assets/buildings/tech/building_tech_farm_1.png";
import buildingTechFarm2Url from "../assets/buildings/tech/building_tech_farm_2.png";
import buildingTechFarm4Url from "../assets/buildings/tech/building_tech_farm_4.png";
import buildingTechFarm5Url from "../assets/buildings/tech/building_tech_farm_5.png";
import buildingTechFossilFuelPowerPlantUrl from "../assets/buildings/tech/building_tech_fossil-fuel-power-plant.png";
import medievalWallTimberBulwarkMetadata from "../assets/wallSegments/medieval/wall_medieval_timber-bulwark.json";
import medievalWallTimberBulwarkUrl from "../assets/wallSegments/medieval/wall_medieval_timber-bulwark.png";
import medievalWallTopScaffoldTowerBaseMetadata from "../assets/wallSuperstructures/medieval/walltop_medieval_scaffold-tower-base.json";
import medievalWallTopScaffoldTowerBaseUrl from "../assets/wallSuperstructures/medieval/walltop_medieval_scaffold-tower-base.png";
import medievalAmmoCrudeStoneMetadata from "../assets/gunParts/medieval/medieval_ammo_crude-stone.json";
import medievalAmmoCrudeStoneUrl from "../assets/gunParts/medieval/medieval_ammo_crude-stone.png";
import medievalBaseCrudeWoodMetadata from "../assets/gunParts/medieval/medieval_base_crude-wood.json";
import medievalBaseCrudeWoodUrl from "../assets/gunParts/medieval/medieval_base_crude-wood.png";
import medievalLauncherCrudeSlingMetadata from "../assets/gunParts/medieval/medieval_launcher_crude-sling.json";
import medievalLauncherCrudeSlingUrl from "../assets/gunParts/medieval/medieval_launcher_crude-sling.png";

export type EntityVisualAssetKind = "building" | "wallSegment" | "wallSuperstructure" | "gunPart";

type EntityVisualAssetBase<Metadata> = {
  id: string;
  label: string;
  kind: EntityVisualAssetKind;
  vector: DevelopmentVectorKey;
  src: string;
  metadata?: Metadata;
};

export type BuildingVisualAsset = EntityVisualAssetBase<never> & {
  kind: "building";
};

export type WallSegmentVisualAsset = EntityVisualAssetBase<WallSpriteMetadata> & {
  kind: "wallSegment";
  metadata: WallSpriteMetadata;
};

export type WallSuperstructureVisualAsset = EntityVisualAssetBase<WallTopSpriteMetadata> & {
  kind: "wallSuperstructure";
  metadata: WallTopSpriteMetadata;
};

export type GunPartVisualAssetOption = EntityVisualAssetBase<TowerPartVisualMetadata> & {
  kind: "gunPart";
  slot: TowerPartSlot;
  metadata: TowerPartVisualMetadata;
};

export type EntityVisualAsset =
  | BuildingVisualAsset
  | WallSegmentVisualAsset
  | WallSuperstructureVisualAsset
  | GunPartVisualAssetOption;

export const ENTITY_VISUAL_ASSETS: readonly EntityVisualAsset[] = [
  {
    id: "building_tech_farm_1",
    label: "Tech Farm 1",
    kind: "building",
    vector: "tech",
    src: buildingTechFarm1Url,
  },
  {
    id: "building_tech_farm_2",
    label: "Tech Farm 2",
    kind: "building",
    vector: "tech",
    src: buildingTechFarm2Url,
  },
  {
    id: "building_tech_farm_4",
    label: "Tech Farm 4",
    kind: "building",
    vector: "tech",
    src: buildingTechFarm4Url,
  },
  {
    id: "building_tech_farm_5",
    label: "Tech Farm 5",
    kind: "building",
    vector: "tech",
    src: buildingTechFarm5Url,
  },
  {
    id: "building_tech_fossil-fuel-power-plant",
    label: "Tech Fossil Fuel Power Plant",
    kind: "building",
    vector: "tech",
    src: buildingTechFossilFuelPowerPlantUrl,
  },
  {
    id: "wall_medieval_timber-bulwark",
    label: "Medieval Timber Bulwark",
    kind: "wallSegment",
    vector: "medieval",
    src: medievalWallTimberBulwarkUrl,
    metadata: medievalWallTimberBulwarkMetadata,
  },
  {
    id: "walltop_medieval_scaffold-tower-base",
    label: "Medieval Scaffold Tower Base",
    kind: "wallSuperstructure",
    vector: "medieval",
    src: medievalWallTopScaffoldTowerBaseUrl,
    metadata: medievalWallTopScaffoldTowerBaseMetadata,
  },
  {
    id: "gunParts.medieval.ammo.stoneBasket",
    label: "Medieval Ammo Crude Stone",
    kind: "gunPart",
    vector: "medieval",
    slot: "ammo",
    src: medievalAmmoCrudeStoneUrl,
    metadata: medievalAmmoCrudeStoneMetadata,
  },
  {
    id: "medieval_base_crude-wood",
    label: "Medieval Base Crude Wood",
    kind: "gunPart",
    vector: "medieval",
    slot: "platform",
    src: medievalBaseCrudeWoodUrl,
    metadata: medievalBaseCrudeWoodMetadata,
  },
  {
    id: "gunParts.medieval.launchSystem.crudeSling",
    label: "Medieval Launcher Crude Sling",
    kind: "gunPart",
    vector: "medieval",
    slot: "launchSystem",
    src: medievalLauncherCrudeSlingUrl,
    metadata: medievalLauncherCrudeSlingMetadata,
  },
];

export const ENTITY_VISUAL_ASSETS_BY_ID = Object.fromEntries(
  ENTITY_VISUAL_ASSETS.map(asset => [asset.id, asset]),
) as Record<string, EntityVisualAsset>;

export function getEntityVisualAssetsForKind(kind: EntityVisualAssetKind): EntityVisualAsset[] {
  return ENTITY_VISUAL_ASSETS.filter(asset => asset.kind === kind);
}
