import type { EnemyVisualMetadata } from "../../models/battle/enemyVisualMetadata.ts";

export type EnemyVisualAsset = {
  textureKey: string;
  label: string;
  region: string;
  src: string;
  metadata?: EnemyVisualMetadata;
};

const enemyImages = import.meta.glob("../../assets/enemies/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const enemyMetadata = import.meta.glob("../../assets/enemies/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, EnemyVisualMetadata>;

export const ENEMY_VISUAL_ASSETS: readonly EnemyVisualAsset[] = Object.entries(enemyImages)
  .map(([path, src]) => {
    const textureKey = getFileStem(path);

    return {
      textureKey,
      label: titleFromTextureKey(textureKey),
      region: getRegionFromPath(path),
      src,
      metadata: enemyMetadata[replaceExtension(path, "json")],
    };
  })
  .sort((left, right) => left.region.localeCompare(right.region) || left.label.localeCompare(right.label));

export const ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY = Object.fromEntries(
  ENEMY_VISUAL_ASSETS.map(asset => [asset.textureKey, asset]),
) as Record<string, EnemyVisualAsset>;

function getRegionFromPath(path: string): string {
  return path.split("/").at(-2) ?? "wasteland";
}

function getFileStem(path: string): string {
  return path.split("/").at(-1)?.replace(/\.png$/i, "") ?? path;
}

function replaceExtension(path: string, extension: "json" | "png"): string {
  return path.replace(/\.(json|png)$/i, `.${extension}`);
}

function titleFromTextureKey(textureKey: string): string {
  return textureKey
    .replace(/^enemy_/, "")
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
    .join(" ");
}
