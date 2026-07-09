import { Assets } from 'pixi.js';
import { BATTLE_BACKGROUNDS } from './backgrounds.ts';
import type { BattleBackgroundId } from '../../../models/battle/backgrounds.ts';
import { TOWER_PARTS } from '../../../data/gunParts/index.ts';
import { TOWER_PART_VISUAL_ASSETS } from '../../../data/gunParts/partVisualMetadata.ts';
import { ENTITY_VISUAL_ASSETS_BY_ID } from '../../../data/entityVisualAssets.ts';
import type { BattleWallSegment } from '../../../models/battle/wallSegment.ts';
import { wallSpriteMetadataAtlas, wallSpritesAtlas } from '../../../models/sprites/walls/wallsSpriteAtlas.ts';
import { wallTopSpriteMetadataAtlas, wallTopSpritesAtlas } from '../../../models/sprites/wallTops/wallTopSpriteAtlas.ts';
import { BATTLE_ENEMY_BLUEPRINTS } from '../../../data/enemies/index.ts';
import { ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY } from '../../../data/enemies/visuals.ts';
import { WALL_SEGMENT_BUILDINGS } from '../../../data/wallSegments/index.ts';
import { WALL_TOWER_BUILDINGS } from '../../../data/wallSuperstructures/index.ts';

export async function loadBattleBackground(backgroundId: BattleBackgroundId): Promise<void> {
    const background = BATTLE_BACKGROUNDS[backgroundId];

    if (Assets.cache.has(background.textureAlias)) return;

    await Assets.load({
        alias: background.textureAlias,
        src: background.src,
    });
}

export async function loadTowerPartAssets(): Promise<void> {
    const partIds = new Set(TOWER_PARTS.map((part) => part.id));
    const towerPartAssetsToLoad = Object.entries(TOWER_PART_VISUAL_ASSETS)
        .filter(([partId]) => partIds.has(partId))
        .filter(([partId]) => !Assets.cache.has(partId))
        .map(([partId, asset]) => ({
            alias: partId,
            src: asset.src,
        }));
    const projectileTextureKeys = new Set(
        TOWER_PARTS.flatMap((part) => (
            part.slot === 'ammo' && part.projectileSprite?.textureKey
                ? [part.projectileSprite.textureKey]
                : []
        )),
    );
    const projectileAssetsToLoad = [...projectileTextureKeys].flatMap((textureKey) => {
        if (Assets.cache.has(textureKey)) return [];
        const asset = ENTITY_VISUAL_ASSETS_BY_ID[textureKey];
        return asset?.kind === 'projectile'
            ? [{ alias: textureKey, src: asset.src }]
            : [];
    });
    const assetsToLoad = [...towerPartAssetsToLoad, ...projectileAssetsToLoad];

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

export async function loadBattleWallAssets(wallSegments: BattleWallSegment[]): Promise<void> {
    const queuedAliases = new Set<string>();
    const wallAssetsToLoad = wallSegments.flatMap((segment) => {
        if (!segment.wallKey || !segment.wallDevelopmentVector) return [];

        const textureAlias = getWallSpriteLookupKey(segment.wallKey);
        const metadata = wallSpriteMetadataAtlas[segment.wallDevelopmentVector][textureAlias];
        const src = wallSpritesAtlas[segment.wallDevelopmentVector][textureAlias]?.src;
        if (!metadata || !src || Assets.cache.has(textureAlias) || queuedAliases.has(textureAlias)) return [];
        queuedAliases.add(textureAlias);

        return [{
            alias: textureAlias,
            src,
        }];
    });
    const wallTopAssetsToLoad = wallSegments.flatMap((segment) => {
        if (!segment.wallTopKey || !segment.wallTopDevelopmentVector) return [];

        const textureAlias = getWallTopSpriteLookupKey(segment.wallTopKey);
        const metadata = wallTopSpriteMetadataAtlas[segment.wallTopDevelopmentVector][textureAlias];
        const src = wallTopSpritesAtlas[segment.wallTopDevelopmentVector][textureAlias]?.src;
        if (!metadata || !src || Assets.cache.has(textureAlias) || queuedAliases.has(textureAlias)) return [];
        queuedAliases.add(textureAlias);

        return [{
            alias: textureAlias,
            src,
        }];
    });
    const assetsToLoad = [...wallAssetsToLoad, ...wallTopAssetsToLoad];

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

export async function loadEnemyAssets(): Promise<void> {
    const textureKeys = new Set(Object.values(BATTLE_ENEMY_BLUEPRINTS).map(enemy => enemy.sprite.textureKey));
    const assetsToLoad = [...textureKeys].flatMap(textureKey => {
        if (Assets.cache.has(textureKey)) return [];

        const asset = ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY[textureKey];
        return asset ? [{
            alias: textureKey,
            src: asset.atlasSrc ?? asset.src,
        }] : [];
    });

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

/** Loads only assets needed by the current battle scene. */
export async function loadBattleAssets(args?: {
    backgroundId?: BattleBackgroundId;
    wallSegments?: BattleWallSegment[];
}): Promise<void> {
    await loadEnemyAssets();
    await loadTowerPartAssets();
    await loadBattleWallAssets(args?.wallSegments ?? []);

    if (args?.backgroundId) {
        await loadBattleBackground(args.backgroundId);
    }
}

function getWallSpriteLookupKey(wallKey: string) {
    return WALL_SEGMENT_BUILDINGS[wallKey]?.visualAssetId ?? wallKey;
}

function getWallTopSpriteLookupKey(wallTopKey: string) {
    return WALL_TOWER_BUILDINGS[wallTopKey]?.visualAssetId ?? wallTopKey;
}
