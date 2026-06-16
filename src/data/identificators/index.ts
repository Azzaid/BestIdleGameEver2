export {buildings, buildingIds} from "./buildings/index.ts";
export {technologies, technologyIds} from "./technologies/index.ts";
export {gunparts, gunpartIds, gunpartIdRows} from "./gunparts/index.ts";
export {enemies, enemyIds} from "./enemies/index.ts";
export {walls, wallIds} from "./walls/index.ts";
export {superstructures, superstructureIds} from "./superstructures/index.ts";

/*
Global checklist when adding a new id:
1. Add it to the correct identificators subfolder first.
2. Use the exported identifier in content data instead of a string literal.
3. Add the domain definition, progression rule, assets, and UI registry entries listed in the category checklist.
4. Run npm run lint and npm run build.
5. Inspect /ids; missing cells are intentional only for future content.
*/
