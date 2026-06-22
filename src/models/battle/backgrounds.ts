export const BATTLE_BACKGROUND_IDS = ['dryGround'] as const;

export type BattleBackgroundId = typeof BATTLE_BACKGROUND_IDS[number];

export const DEFAULT_BATTLE_BACKGROUND_ID: BattleBackgroundId = 'dryGround';
