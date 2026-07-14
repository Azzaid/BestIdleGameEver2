import {Application, Container, Graphics} from "pixi.js";
import {createEntityId, createWorld} from "./core/world.ts";
import {runSystems} from "./systems/runSystems.ts";
import {loadBattleAssets} from "./assets/assetLoader.ts";
import {getWallContactY} from "./core/wallGeometry.ts";
import {buildTowerVisualContainer} from "./factories/towerVisualRenderer.ts";
import {createTowerVisualDefinitionFromAssembly, findTowerVisualSocketOffset} from "../../data/gunParts/visuals.ts";
import {CITY_HEX_WIDTH} from "../../data/constants.ts";
import type {BattleMetrics, BattleResult, MonsterMovementModifiers, WallZoneEffects} from "../../models/battle/world.ts";
import type {BattleWallSegment} from "../../models/battle/wallSegment.ts";
import type {StandaloneTowerDefense} from "../../models/battle/tower.ts";
import type {TowerAssemblyResolved} from "../../models/battle/towerParts.ts";
import type {BattlefieldTerrainHex} from "../../models/battle/battlefieldTerrain.ts";
import {
    createTowerData,
    getStandaloneTowerDefensePosition,
    getTowerAnchorPosition,
    getTowerZeroRotationRadians,
    sendEnemiesToSideBorders,
} from "./ui/BattleStage.tsx";

export type CityBattleRuntimeConfig = {
    battleKey: string;
    wallSegments: BattleWallSegment[];
    terrainHexes: readonly BattlefieldTerrainHex[];
    standaloneTowerDefenses: StandaloneTowerDefense[];
    battlefieldWidth: number;
    battlefieldHeight: number;
    wallY: number;
    runtimeResetKey: string | number;
    retreatEnemiesSignal: number;
    resolvedTowers: TowerAssemblyResolved[];
    initialThreat: number;
    targetThreat: number;
    threatGrowthPerSecond: number;
    waveThreatToCityThreatRatio: number;
    simultaneousMonstersLimit: number;
    timeBetweenWavesSeconds: number;
    fastForwardWavesWhenCleared: boolean;
    completesWhenThreatTargetReached: boolean;
    wallResilience: number;
    wallIgnoredThreat: number;
    monsterMovementModifiers: MonsterMovementModifiers;
    wallZoneEffects: WallZoneEffects;
    showDebugOutlines: boolean;
    showSiegeOutline: boolean;
    origin: {
        x: number;
        y: number;
    };
    onBattleMetrics?: (metrics: BattleMetrics) => void;
    onBattleEnded?: (result: BattleResult) => void;
    onSiegeOverwhelmed?: () => void;
};

export type MountedCityBattleRuntime = {
    destroy: () => void;
    sendEnemiesToSideBorders: () => void;
};

export async function mountCityBattleRuntime({
    app,
    parent,
    config,
}: {
    app: Application;
    parent: Container;
    config: CityBattleRuntimeConfig;
}): Promise<MountedCityBattleRuntime> {
    await loadBattleAssets({
        wallSegments: config.wallSegments,
        terrainHexes: config.terrainHexes,
    });

    const wallContactY = getWallContactY({
        wallY: config.wallY,
        wallSegments: config.wallSegments,
        segmentSize: CITY_HEX_WIDTH,
    });
    const world = createWorld({
        battlefieldWidth: config.battlefieldWidth,
        battlefieldHeight: config.battlefieldHeight,
        wallY: config.wallY,
        wallContactY,
        app,
        initialThreat: config.initialThreat,
        targetThreat: config.targetThreat,
        threatGrowthPerSecond: config.threatGrowthPerSecond,
        waveThreatToCityThreatRatio: config.waveThreatToCityThreatRatio,
        simultaneousMonstersLimit: config.simultaneousMonstersLimit,
        timeBetweenWavesSeconds: config.timeBetweenWavesSeconds,
        fastForwardWavesWhenCleared: config.fastForwardWavesWhenCleared,
        completesWhenThreatTargetReached: config.completesWhenThreatTargetReached,
        wallResilience: config.wallResilience,
        wallIgnoredThreat: config.wallIgnoredThreat,
        monsterMovementModifiers: config.monsterMovementModifiers,
        wallZoneEffects: config.wallZoneEffects,
        onBattleMetrics: config.onBattleMetrics,
        onBattleEnded: config.onBattleEnded,
        onSiegeOverwhelmed: config.onSiegeOverwhelmed,
    });
    world.worldLayer.position.set(config.origin.x, config.origin.y);
    parent.addChild(world.worldLayer);

    if (config.showDebugOutlines) {
        const fullBoundsPlaceholder = new Graphics();
        fullBoundsPlaceholder
            .rect(0, 0, config.battlefieldWidth, config.battlefieldHeight)
            .stroke({color: 0x45d0ff, width: 3});
        fullBoundsPlaceholder.zIndex = 200;
        world.worldLayer.addChild(fullBoundsPlaceholder);

        const activeBattlefieldPlaceholder = new Graphics();
        activeBattlefieldPlaceholder
            .rect(0, 0, config.battlefieldWidth, wallContactY)
            .stroke({color: 0xffd166, width: 2});
        activeBattlefieldPlaceholder.zIndex = 201;
        activeBattlefieldPlaceholder.visible = config.showSiegeOutline;
        world.worldLayer.addChild(activeBattlefieldPlaceholder);
    }

    const standaloneTowerWallCellKeys = new Set(
        config.standaloneTowerDefenses.flatMap((defense) => defense.wallCellKey ? [defense.wallCellKey] : []),
    );

    config.resolvedTowers.forEach((resolvedTower, index) => {
        const baseId = createEntityId(world);
        const gunId = createEntityId(world);
        const towerPosition = getTowerAnchorPosition({
            towerIndex: index,
            towerCount: config.resolvedTowers.length,
            wallSegments: config.wallSegments,
            excludedWallCellKeys: standaloneTowerWallCellKeys,
            segmentSize: CITY_HEX_WIDTH,
            battlefieldWidth: config.battlefieldWidth,
            wallY: config.wallY,
        });
        const zeroRotationRadians = getTowerZeroRotationRadians({
            towerPosition,
            battlefieldWidth: config.battlefieldWidth,
            battlefieldHeight: config.battlefieldHeight,
        });
        world.transforms.set(baseId, {position: towerPosition, rotationRadians: zeroRotationRadians});
        world.transforms.set(gunId, {position: towerPosition, rotationRadians: zeroRotationRadians});

        const towerVisualDefinition = createTowerVisualDefinitionFromAssembly(resolvedTower);
        const towerVisual = buildTowerVisualContainer(towerVisualDefinition, {warn: () => {}});
        towerVisual.container.zIndex = 30;
        world.worldLayer.addChild(towerVisual.container);
        world.sprites.set(baseId, towerVisual.container);

        const gunAimPivot = new Container();
        world.worldLayer.addChild(gunAimPivot);
        world.sprites.set(gunId, gunAimPivot);

        const launchSystemId = resolvedTower.selectedParts.launchSystem?.id;
        const projectileSpawnOffset = launchSystemId
            ? findTowerVisualSocketOffset(towerVisualDefinition, launchSystemId, "muzzle") ?? {x: 0, y: 0}
            : {x: 0, y: 0};
        world.towersData.set(baseId, createTowerData({
            stats: resolvedTower.stats,
            damageProfiles: resolvedTower.damageProfiles,
            projectileSprite: resolvedTower.selectedParts.ammo?.projectileSprite,
            keywords: new Set(resolvedTower.keywords),
            zeroRotationRadians,
            gunEntity: gunId,
            projectileSpawnOffset,
            aimKeywords: resolvedTower.aimKeywords,
        }));
    });

    config.standaloneTowerDefenses.forEach((defense) => {
        const baseId = createEntityId(world);
        const towerPosition = getStandaloneTowerDefensePosition({
            defense,
            wallSegments: config.wallSegments,
            segmentSize: CITY_HEX_WIDTH,
            battlefieldWidth: config.battlefieldWidth,
            wallY: config.wallY,
        });
        const zeroRotationRadians = getTowerZeroRotationRadians({
            towerPosition,
            battlefieldWidth: config.battlefieldWidth,
            battlefieldHeight: config.battlefieldHeight,
        });

        world.transforms.set(baseId, {position: towerPosition, rotationRadians: zeroRotationRadians});
        world.towersData.set(baseId, createTowerData({
            stats: defense.stats,
            damageProfiles: defense.damageProfiles,
            keywords: new Set(defense.keywords),
            zeroRotationRadians,
            gunEntity: baseId,
            projectileSpawnOffset: {x: 0, y: 0},
            aimKeywords: defense.aimKeywords,
        }));
    });

    let previousTimeMs = performance.now();
    const tick = () => {
        const nowMs = performance.now();
        const dt = Math.min(0.25, (nowMs - previousTimeMs) / 1000);
        previousTimeMs = nowMs;
        runSystems(world, dt);
    };
    app.ticker.add(tick);

    return {
        destroy: () => {
            app.ticker.remove(tick);
            world.worldLayer.parent?.removeChild(world.worldLayer);
            world.worldLayer.destroy({children: true});
        },
        sendEnemiesToSideBorders: () => sendEnemiesToSideBorders(world),
    };
}
