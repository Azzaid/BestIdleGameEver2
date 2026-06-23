import type {GlobalEventDefinition} from "../../models/globalEvents.ts";
import cityBackgroundImage from "../../assets/city/background/Top-down_map_view_circular_lan.jpeg";

export const GLOBAL_EVENTS: Record<string, GlobalEventDefinition> = {
  fungal_inheritance_migration: {
    id: "fungal_inheritance_migration",
    title: "Fungal Inheritance Migration",
    description: "Preserves a portion of this city's fungal production for future cities.",
    imageSrc: cityBackgroundImage,
    imageAlt: "A circular city map surrounded by wilderness.",
    trigger: {
      type: "migration",
    },
    blockRequirements: [
      {
        type: "globalFlagExists",
        flagId: "migration.fungal_inheritance_claimed",
      },
    ],
    once: true,
    priority: 100,
    actions: [
      {
        type: "applyGlobalModifier",
        modifierId: "fungal_inheritance",
      },
      {
        type: "addFlag",
        flagId: "migration.fungal_inheritance_claimed",
      },
    ],
  },
};

export const GLOBAL_EVENT_LIST = Object.values(GLOBAL_EVENTS);
