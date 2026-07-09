import type { DamageProfile } from "../models/battle/damage.ts";
import type {
  DamageAreaVfxAsset,
  DamageAreaVfxDefinition,
  DamageAreaVfxDefinitionData,
} from "../models/battle/damageAreaVfx.ts";
import battleDamageAreaVfxDefinitionData from "./battleDamageAreaVfxDefinitions.json";

const battleEffectImages = import.meta.glob("../assets/battle/effects/*.png", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export const BATTLE_DAMAGE_AREA_VFX_ASSETS: readonly DamageAreaVfxAsset[] = Object.entries(battleEffectImages)
  .map(([path, src]) => {
    const fileStem = getFileStem(path);

    return {
      id: `battle.effects.${kebabToCamel(fileStem)}`,
      fileStem,
      label: titleFromId(fileStem),
      src,
    };
  })
  .sort((left, right) => left.label.localeCompare(right.label));

export const BATTLE_DAMAGE_AREA_VFX_DEFINITION_DATA = battleDamageAreaVfxDefinitionData as readonly DamageAreaVfxDefinitionData[];

export const BATTLE_DAMAGE_AREA_VFX_DEFINITIONS: readonly DamageAreaVfxDefinition[] = (
  BATTLE_DAMAGE_AREA_VFX_DEFINITION_DATA.map(definition => ({
    ...definition,
    src: getBattleEffectImageSrc(definition.assetFileStem),
  }))
);

export function getDamageAreaVfxForProfile(damageProfile: DamageProfile): DamageAreaVfxDefinition | undefined {
  return BATTLE_DAMAGE_AREA_VFX_DEFINITIONS
    .filter(definition => definition.requiredDamageKeywords.every(keyword => damageProfile.keywords.has(keyword)))
    .sort((left, right) => right.priority - left.priority)[0];
}

function getBattleEffectImageSrc(fileStem: string): string {
  return battleEffectImages[`../assets/battle/effects/${fileStem}.png`] ?? "";
}

function getFileStem(path: string): string {
  return path.split("/").at(-1)?.replace(/\.png$/i, "") ?? path;
}

function kebabToCamel(value: string): string {
  return value.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
}

function titleFromId(id: string): string {
  return id
    .replace(/[_.-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .filter(Boolean)
    .map(part => part[0]?.toUpperCase() ? `${part[0].toUpperCase()}${part.slice(1)}` : part)
    .join(" ");
}
