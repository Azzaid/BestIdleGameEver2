import dryGroundUrl from '../../../assets/battle/backgrounds/dryGround.png';
import type {BattleBackgroundId} from '../../../models/battle/backgrounds.ts';

export type BattleBackgroundDefinition = {
    id: BattleBackgroundId;
    textureAlias: string;
    src: string;
};

export const BATTLE_BACKGROUNDS: Record<BattleBackgroundId, BattleBackgroundDefinition> = {
    dryGround: {
        id: 'dryGround',
        textureAlias: 'battle_background_dry_ground',
        src: dryGroundUrl,
    },
};
