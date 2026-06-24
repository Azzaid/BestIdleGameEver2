import type {DevelopmentVectorKey} from "../models/DevlopmentVector.ts";
import type {TowerPartSlot} from "../models/battle/towerParts.ts";
import type {TowerPartVisualMetadata} from "../models/battle/towerPartVisualMetadata.ts";
import type {BuildingSpriteMetadata} from "../models/sprites/buildings/BuildingSpriteMetadata.ts";
import type {WallSpriteMetadata} from "../models/sprites/walls/WallSpriteAtlas.ts";
import type {WallTopSpriteMetadata} from "../models/sprites/wallTops/WallTopSpriteMetadata.ts";

export type EntityVisualAssetKind = "building" | "wallSegment" | "wallSuperstructure" | "gunPart";

type EntityVisualAssetBase<Metadata> = {
  id: string;
  label: string;
  kind: EntityVisualAssetKind;
  vector: DevelopmentVectorKey;
  src: string;
  metadata?: Metadata;
};

export type BuildingVisualAsset = EntityVisualAssetBase<BuildingSpriteMetadata> & {
  kind: "building";
  fileStem: string;
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

const vectorKeys = ["tech", "nature", "medieval", "aether"] as const satisfies readonly DevelopmentVectorKey[];

const towerPartSlots = [
  "platform",
  "barrel",
  "ammo",
  "aimSystem",
  "barrelAttachment",
  "loadingSystem",
  "launchSystem",
] as const satisfies readonly TowerPartSlot[];

const buildingImages = import.meta.glob("../assets/buildings/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const buildingMetadata = import.meta.glob("../assets/buildings/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, BuildingSpriteMetadata>;

const wallSegmentImages = import.meta.glob("../assets/wallSegments/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const wallSegmentMetadata = import.meta.glob("../assets/wallSegments/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, WallSpriteMetadata>;

const wallSuperstructureImages = import.meta.glob("../assets/wallSuperstructures/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const wallSuperstructureMetadata = import.meta.glob("../assets/wallSuperstructures/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, WallTopSpriteMetadata>;

const gunPartImages = import.meta.glob("../assets/gunParts/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const gunPartMetadata = import.meta.glob("../assets/gunParts/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, TowerPartVisualMetadata>;

export const ENTITY_VISUAL_ASSETS: readonly EntityVisualAsset[] = [
  ...createBuildingVisualAssets(),
  ...createWallSegmentVisualAssets(),
  ...createWallSuperstructureVisualAssets(),
  ...createGunPartVisualAssets(),
].sort((left, right) => (
  left.kind.localeCompare(right.kind)
  || left.vector.localeCompare(right.vector)
  || left.label.localeCompare(right.label)
));

export const ENTITY_VISUAL_ASSETS_BY_ID = Object.fromEntries(
  ENTITY_VISUAL_ASSETS.flatMap(asset => (
    asset.kind === "building"
      ? [[asset.id, asset] as const, [asset.fileStem, asset] as const]
      : [[asset.id, asset] as const]
  )),
) as Record<string, EntityVisualAsset>;

export function getEntityVisualAssetsForKind(kind: EntityVisualAssetKind): EntityVisualAsset[] {
  return ENTITY_VISUAL_ASSETS.filter(asset => asset.kind === kind);
}

function createBuildingVisualAssets(): BuildingVisualAsset[] {
  return Object.entries(buildingImages).flatMap(([path, src]) => {
    const vector = getVectorFromPath(path);
    if (!vector) return [];
    const fileStem = getFileStem(path);
    const id = getBuildingId(fileStem, vector);

    return [{
      id,
      label: titleFromId(id),
      kind: "building",
      vector,
      src,
      fileStem,
      metadata: buildingMetadata[replaceExtension(path, "json")],
    }];
  });
}

function createWallSegmentVisualAssets(): WallSegmentVisualAsset[] {
  return Object.entries(wallSegmentImages).flatMap(([path, src]) => {
    const vector = getVectorFromPath(path);
    const metadata = wallSegmentMetadata[replaceExtension(path, "json")];
    if (!vector || !metadata) return [];
    const id = getWallSegmentId(getFileStem(path), vector);

    return [{
      id,
      label: titleFromId(id),
      kind: "wallSegment",
      vector,
      src,
      metadata,
    }];
  });
}

function createWallSuperstructureVisualAssets(): WallSuperstructureVisualAsset[] {
  return Object.entries(wallSuperstructureImages).flatMap(([path, src]) => {
    const vector = getVectorFromPath(path);
    const metadata = wallSuperstructureMetadata[replaceExtension(path, "json")];
    if (!vector || !metadata) return [];
    const id = getWallSuperstructureId(getFileStem(path), vector);

    return [{
      id,
      label: titleFromId(id),
      kind: "wallSuperstructure",
      vector,
      src,
      metadata,
    }];
  });
}

function createGunPartVisualAssets(): GunPartVisualAssetOption[] {
  return Object.entries(gunPartImages).flatMap(([path, src]) => {
    const vector = getVectorFromPath(path);
    const metadata = gunPartMetadata[replaceExtension(path, "json")];
    const stem = getFileStem(path);
    const slot = getGunPartSlot(stem);
    if (!vector || !metadata || !slot) return [];
    const id = getGunPartId(stem, vector, slot);

    return [{
      id,
      label: titleFromId(stem),
      kind: "gunPart",
      vector,
      slot,
      src,
      metadata,
    }];
  });
}

function getGunPartSlot(stem: string): TowerPartSlot | undefined {
  const [, slot] = stem.split("_");
  return towerPartSlots.find(option => option === slot);
}

function getBuildingId(stem: string, vector: DevelopmentVectorKey): string {
  return `buildings.${vector}.${getEntityIdPart(stem, `building_${vector}_`)}`;
}

function getWallSegmentId(stem: string, vector: DevelopmentVectorKey): string {
  return `wallSegments.${vector}.${getEntityIdPart(stem, `wall_${vector}_`)}`;
}

function getWallSuperstructureId(stem: string, vector: DevelopmentVectorKey): string {
  return `wallSuperstructures.${vector}.${getEntityIdPart(stem, `walltop_${vector}_`)}`;
}

function getGunPartId(stem: string, vector: DevelopmentVectorKey, slot: TowerPartSlot): string {
  return `gunParts.${vector}.${slot}.${getEntityIdPart(stem, `${vector}_${slot}_`)}`;
}

function getEntityIdPart(stem: string, prefix: string): string {
  const idPart = stem.startsWith(prefix) ? stem.slice(prefix.length) : stem.split("_").at(-1) ?? stem;
  return kebabToCamel(idPart);
}

function kebabToCamel(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

function getVectorFromPath(path: string): DevelopmentVectorKey | undefined {
  return vectorKeys.find(vector => path.includes(`/${vector}/`));
}

function getFileStem(path: string): string {
  return path.split("/").at(-1)?.replace(/\.(json|png)$/i, "") ?? path;
}

function replaceExtension(path: string, extension: "json" | "png"): string {
  return path.replace(/\.(json|png)$/i, `.${extension}`);
}

function titleFromId(id: string): string {
  return id
    .replace(/^gunParts\./, "")
    .replace(/[_.-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
    .join(" ");
}
