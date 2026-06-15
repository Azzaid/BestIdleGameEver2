import dryGroundUrl from '../../assets/battle/backgrounds/dryGround.png';

export const BATTLE_BACKGROUND_IDS = ['dryGround'] as const;

export type BattleBackgroundId = typeof BATTLE_BACKGROUND_IDS[number];

export interface BattleBackgroundDefinition {
    id: BattleBackgroundId;
    textureAlias: string;
    src: string;
}

export const BATTLE_BACKGROUNDS: Record<BattleBackgroundId, BattleBackgroundDefinition> = {
    dryGround: {
        id: 'dryGround',
        textureAlias: 'battle_background_dry_ground',
        src: dryGroundUrl,
    },
};

export const DEFAULT_BATTLE_BACKGROUND_ID: BattleBackgroundId = 'dryGround';
