import type { EnemyVisualMetadata } from "../../models/battle/enemyVisualMetadata.ts";

export type EnemyVisualAsset = {
  textureKey: string;
  label: string;
  region: string;
  src: string;
  atlasSrc?: string;
  atlasImageFilename?: string;
  animationFrames?: string[];
  fps?: number;
  metadata?: EnemyVisualMetadata;
};

const enemyImages = import.meta.glob("../../assets/enemies/**/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const enemyJson = import.meta.glob("../../assets/enemies/**/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

const enemyJsonUrls = import.meta.glob("../../assets/enemies/**/*.json", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export const ENEMY_VISUAL_ASSETS: readonly EnemyVisualAsset[] = Object.entries(enemyImages)
  .map(([path, src]) => {
    const textureKey = getFileStem(path);
    const jsonPath = replaceExtension(path, "json");
    const json = enemyJson[jsonPath];
    const animationFrames = getAnimationFrames(json, textureKey);
    const metadata = getVisualMetadata(json);

    return {
      textureKey,
      label: titleFromTextureKey(textureKey),
      region: getRegionFromPath(path),
      src,
      atlasSrc: isPixiSpritesheet(json) ? enemyJsonUrls[jsonPath] : undefined,
      atlasImageFilename: isPixiSpritesheet(json) ? getFilenameFromUrl(src) : undefined,
      animationFrames,
      fps: metadata?.fps,
      metadata,
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

function getFilenameFromUrl(url: string): string {
  return url.split(/[?#]/)[0]?.split("/").at(-1) ?? url;
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

function getVisualMetadata(json: unknown): EnemyVisualMetadata | undefined {
  if (!json || typeof json !== "object") return undefined;
  if (isPixiSpritesheet(json)) {
    const metadata = json.meta.enemyVisualMetadata;
    return isRecord(metadata) ? metadata as EnemyVisualMetadata : undefined;
  }

  return json as EnemyVisualMetadata;
}

function getAnimationFrames(json: unknown, textureKey: string): string[] | undefined {
  if (!isPixiSpritesheet(json)) return undefined;

  const namedAnimation = json.animations?.[textureKey];
  if (Array.isArray(namedAnimation) && namedAnimation.every(frame => typeof frame === "string")) {
    return namedAnimation;
  }

  return Object.keys(json.frames);
}

function isPixiSpritesheet(value: unknown): value is {
  frames: Record<string, unknown>;
  animations?: Record<string, unknown>;
  meta: {image?: string; enemyVisualMetadata?: unknown};
} {
  return isRecord(value) && isRecord(value.frames) && isRecord(value.meta);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
