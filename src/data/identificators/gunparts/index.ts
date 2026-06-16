import {aetherGunparts} from "./aether.ts";
import {medievalGunparts} from "./medieval.ts";
import {natureGunparts} from "./nature.ts";
import {techGunparts} from "./tech.ts";

export const gunparts = {
  bases: {
    tech: techGunparts.bases,
    nature: natureGunparts.bases,
    medieval: medievalGunparts.bases,
    aether: aetherGunparts.bases,
  },
  barrels: {
    tech: techGunparts.barrels,
    nature: natureGunparts.barrels,
    medieval: medievalGunparts.barrels,
    aether: aetherGunparts.barrels,
  },
  ammo: {
    tech: techGunparts.ammo,
    nature: natureGunparts.ammo,
    medieval: medievalGunparts.ammo,
    aether: aetherGunparts.ammo,
  },
  aimSystems: {
    tech: techGunparts.aimSystems,
    nature: natureGunparts.aimSystems,
    medieval: medievalGunparts.aimSystems,
    aether: aetherGunparts.aimSystems,
  },
  barrelAttachments: {
    tech: techGunparts.barrelAttachments,
    nature: natureGunparts.barrelAttachments,
    medieval: medievalGunparts.barrelAttachments,
    aether: aetherGunparts.barrelAttachments,
  },
  loadingSystems: {
    tech: techGunparts.loadingSystems,
    nature: natureGunparts.loadingSystems,
    medieval: medievalGunparts.loadingSystems,
    aether: aetherGunparts.loadingSystems,
  },
  launchSystems: {
    tech: techGunparts.launchSystems,
    nature: natureGunparts.launchSystems,
    medieval: medievalGunparts.launchSystems,
    aether: aetherGunparts.launchSystems,
  },
} as const;

export const gunpartIds = Object.values(gunparts).flatMap(byVector => (
  Object.values(byVector).flatMap(group => Object.values(group))
));

export const gunpartIdRows = Object.entries(gunparts).flatMap(([slotGroup, byVector]) => (
  Object.entries(byVector).flatMap(([vector, group]) => (
    Object.entries(group).map(([key, id]) => ({slotGroup, vector, key, id}))
  ))
));

/*
Checklist when adding a tower part id:
1. Add the id here, in the vector file and slot group that owns it.
2. Add the GunPart definition under src/data/towers/parts/<vector>.ts using this identifier.
3. Add or update unlock rules in src/data/content/rules.ts.
4. Add PNG and JSON metadata under src/assets/battle/towerParts when the part needs a visual asset.
5. Add visual metadata mapping in src/data/towers/partVisualMetadata.ts when needed by battle rendering.
6. Open /gun-part-editor and /ids to check that the id has data and assets.
*/
