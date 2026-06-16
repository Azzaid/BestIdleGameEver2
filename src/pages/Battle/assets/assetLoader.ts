import { Assets } from 'pixi.js';
import { BATTLE_BACKGROUNDS } from '../../../data/battle/backgrounds.ts';
import type { BattleBackgroundId } from '../../../data/battle/backgrounds.ts';
import { TOWER_PARTS } from '../../../data/towers/index.ts';
import { TOWER_PART_VISUAL_ASSETS } from '../../../data/towers/partVisualMetadata.ts';
import type { BattleWallSegment } from '../../../models/battle/wallSegment.ts';
import { wallSpriteMetadataAtlas, wallSpritesAtlas } from '../../../models/sprites/walls/wallsSpriteAtlas.ts';
import { wallTopSpriteMetadataAtlas, wallTopSpritesAtlas } from '../../../models/sprites/wallTops/wallTopSpriteAtlas.ts';

export async function loadBattleBackground(backgroundId: BattleBackgroundId): Promise<void> {
    const background = BATTLE_BACKGROUNDS[backgroundId];

    if (Assets.cache.has(background.textureAlias)) return;

    await Assets.load({
        alias: background.textureAlias,
        src: background.src,
    });
}

export async function loadTowerPartAssets(): Promise<void> {
    const spriteAliases = new Set(TOWER_PARTS.map((part) => part.sprite.textureKey));
    const assetsToLoad = Object.values(TOWER_PART_VISUAL_ASSETS)
        .filter((asset) => spriteAliases.has(asset.metadata.spriteId))
        .filter((asset) => !Assets.cache.has(asset.metadata.spriteId))
        .map((asset) => ({
            alias: asset.metadata.spriteId,
            src: asset.src,
        }));

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

export async function loadBattleWallAssets(wallSegments: BattleWallSegment[]): Promise<void> {
    const queuedAliases = new Set<string>();
    const wallAssetsToLoad = wallSegments.flatMap((segment) => {
        if (!segment.wallKey || !segment.wallDevelopmentVector) return [];

        const metadata = wallSpriteMetadataAtlas[segment.wallDevelopmentVector][segment.wallKey];
        const src = wallSpritesAtlas[segment.wallDevelopmentVector][segment.wallKey];
        if (!metadata || !src || Assets.cache.has(metadata.spriteId) || queuedAliases.has(metadata.spriteId)) return [];
        queuedAliases.add(metadata.spriteId);

        return [{
            alias: metadata.spriteId,
            src,
        }];
    });
    const wallTopAssetsToLoad = wallSegments.flatMap((segment) => {
        if (!segment.wallTopKey || !segment.wallTopDevelopmentVector) return [];

        const metadata = wallTopSpriteMetadataAtlas[segment.wallTopDevelopmentVector][segment.wallTopKey];
        const src = wallTopSpritesAtlas[segment.wallTopDevelopmentVector][segment.wallTopKey];
        if (!metadata || !src || Assets.cache.has(metadata.spriteId) || queuedAliases.has(metadata.spriteId)) return [];
        queuedAliases.add(metadata.spriteId);

        return [{
            alias: metadata.spriteId,
            src,
        }];
    });
    const assetsToLoad = [...wallAssetsToLoad, ...wallTopAssetsToLoad];

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

/** Loads only assets needed by the current battle scene. */
export async function loadBattleAssets(args?: {
    backgroundId?: BattleBackgroundId;
    wallSegments?: BattleWallSegment[];
}): Promise<void> {
    await loadTowerPartAssets();
    await loadBattleWallAssets(args?.wallSegments ?? []);

    if (args?.backgroundId) {
        await loadBattleBackground(args.backgroundId);
    }
}
