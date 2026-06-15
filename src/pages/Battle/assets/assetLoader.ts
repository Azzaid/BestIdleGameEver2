import { Assets } from 'pixi.js';
import { BATTLE_BACKGROUNDS } from '../../../data/battle/backgrounds.ts';
import type { BattleBackgroundId } from '../../../data/battle/backgrounds.ts';
import { TOWER_PARTS } from '../../../data/towers/index.ts';
import { TOWER_PART_VISUAL_ASSETS } from '../../../data/towers/partVisualMetadata.ts';

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

/** Loads only assets needed by the current battle scene. */
export async function loadBattleAssets(args?: {
    backgroundId?: BattleBackgroundId;
}): Promise<void> {
    await loadTowerPartAssets();

    if (args?.backgroundId) {
        await loadBattleBackground(args.backgroundId);
    }
}
