import { Assets } from 'pixi.js';
import type { ProgressCallback, UnresolvedAsset } from 'pixi.js';
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
import { WALL_SUPERSTRUCTURE_BUILDINGS } from '../../../data/wallSuperstructures/index.ts';
import { BATTLE_DAMAGE_AREA_VFX_DEFINITIONS } from '../../../data/battleDamageAreaVfx.ts';
import type { BattlefieldTerrainHex } from '../../../models/battle/battlefieldTerrain.ts';

type BattleAsset = UnresolvedAsset;

type LoadBattleAssetsOptions = {
    backgroundId?: BattleBackgroundId;
    wallSegments?: BattleWallSegment[];
    terrainHexes?: readonly BattlefieldTerrainHex[];
    onProgress?: ProgressCallback;
};

export async function loadBattleBackground(backgroundId: BattleBackgroundId): Promise<void> {
    const assetsToLoad = collectBattleBackgroundAssets(backgroundId);

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

function collectBattleBackgroundAssets(backgroundId: BattleBackgroundId): BattleAsset[] {
    const background = BATTLE_BACKGROUNDS[backgroundId];

    if (Assets.cache.has(background.textureAlias)) return [];

    return [{
        alias: background.textureAlias,
        src: background.src,
    }];
}

export async function loadTowerPartAssets(): Promise<void> {
    const assetsToLoad = collectTowerPartAssets();

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

function collectTowerPartAssets(): BattleAsset[] {
    const partTextureKeys = new Set(TOWER_PARTS.map((part) => part.sprite.textureKey));
    const towerPartAssetsToLoad = [...partTextureKeys]
        .flatMap((textureKey) => {
            if (Assets.cache.has(textureKey)) return [];

            const asset = TOWER_PART_VISUAL_ASSETS[textureKey];
            return asset
                ? [{
                    alias: textureKey,
                    src: asset.src,
                }]
                : [];
        });
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

    return assetsToLoad;
}

export async function loadBattleWallAssets(wallSegments: BattleWallSegment[]): Promise<void> {
    const assetsToLoad = collectBattleWallAssets(wallSegments);

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

function collectBattleWallAssets(wallSegments: BattleWallSegment[]): BattleAsset[] {
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

    return assetsToLoad;
}

export async function loadEnemyAssets(): Promise<void> {
    const assetsToLoad = collectEnemyAssets();

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

function collectEnemyAssets(): BattleAsset[] {
    const textureKeys = new Set(Object.values(BATTLE_ENEMY_BLUEPRINTS).map(enemy => enemy.sprite.textureKey));
    const assetsToLoad = [...textureKeys].flatMap(textureKey => {
        if (Assets.cache.has(textureKey)) return [];

        const asset = ENEMY_VISUAL_ASSETS_BY_TEXTURE_KEY[textureKey];
        return asset ? [{
            alias: textureKey,
            src: asset.atlasSrc ?? asset.src,
            data: asset.atlasImageFilename ? {
                imageFilename: asset.atlasImageFilename,
            } : undefined,
        }] : [];
    });

    return assetsToLoad;
}

export async function loadBattleDamageAreaVfxAssets(): Promise<void> {
    const assetsToLoad = collectBattleDamageAreaVfxAssets();

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

function collectBattleDamageAreaVfxAssets(): BattleAsset[] {
    const assetsToLoad = BATTLE_DAMAGE_AREA_VFX_DEFINITIONS
        .filter(definition => definition.src && !Assets.cache.has(definition.textureAlias))
        .map(definition => ({
            alias: definition.textureAlias,
            src: definition.src,
        }));

    return assetsToLoad;
}

export async function loadBattlefieldTerrainAssets(terrainHexes: readonly BattlefieldTerrainHex[]): Promise<void> {
    const assetsToLoad = collectBattlefieldTerrainAssets(terrainHexes);

    if (assetsToLoad.length === 0) return;

    await Assets.load(assetsToLoad);
}

function collectBattlefieldTerrainAssets(terrainHexes: readonly BattlefieldTerrainHex[]): BattleAsset[] {
    const queuedAliases = new Set<string>();
    const assetsToLoad = terrainHexes.flatMap((terrainHex) => {
        const textureAlias = terrainHex.backgroundSpriteId;
        if (!terrainHex.backgroundSpriteSrc || Assets.cache.has(textureAlias) || queuedAliases.has(textureAlias)) return [];

        queuedAliases.add(textureAlias);

        return [{
            alias: textureAlias,
            src: terrainHex.backgroundSpriteSrc,
        }];
    });

    return assetsToLoad;
}

/** Loads only assets needed by the current battle scene. */
export async function loadBattleAssets(args?: LoadBattleAssetsOptions): Promise<void> {
    const assetsToLoad = dedupeBattleAssets([
        ...collectEnemyAssets(),
        ...collectTowerPartAssets(),
        ...collectBattleWallAssets(args?.wallSegments ?? []),
        ...collectBattlefieldTerrainAssets(args?.terrainHexes ?? []),
        ...collectBattleDamageAreaVfxAssets(),
        ...(args?.backgroundId ? collectBattleBackgroundAssets(args.backgroundId) : []),
    ]);

    if (assetsToLoad.length === 0) {
        args?.onProgress?.(1);
        return;
    }

    args?.onProgress?.(0);
    await Assets.load(assetsToLoad, args?.onProgress);
    args?.onProgress?.(1);
}

function getWallSpriteLookupKey(wallKey: string) {
    return WALL_SEGMENT_BUILDINGS[wallKey]?.visualAssetId ?? wallKey;
}

function getWallTopSpriteLookupKey(wallTopKey: string) {
    return WALL_SUPERSTRUCTURE_BUILDINGS[wallTopKey]?.visualAssetId ?? wallTopKey;
}

function dedupeBattleAssets(assets: BattleAsset[]) {
    const queuedAliases = new Set<string>();

    return assets.filter((asset) => {
        const alias = Array.isArray(asset.alias) ? asset.alias[0] : asset.alias;
        if (!alias) return true;
        if (queuedAliases.has(alias)) return false;

        queuedAliases.add(alias);
        return true;
    });
}
