# Texture Asset Workflow

Current implementation note, 2026-06-24:

- Active city building, city hex background, wall segment, wall superstructure, tower component, and global event image assets are cataloged through data registries rather than direct one-off page imports.
- `/ids` audits content IDs and visual coverage.
- `/gun-part-editor` supports tower component socket/visual metadata work.
- `/entity-create/:entityId` and `/global-events` support debug editing flows for entity and event content.
- `/enemy-animation-sprites` cuts enemy sprite sheets into Pixi atlas frames and saves the PNG plus generated atlas JSON through the local data server.

Use this when adding or moving gameplay textures. Keep active textures in typed registries and move unused images to `src/assets/unused`.

## Folder Layout

- City building textures: `src/assets/buildings/<vector>/building_<vector>_<id>.png`
- City building metadata: `src/assets/buildings/<vector>/building_<vector>_<id>.json`
- City wall segment textures: `src/assets/wallSegments/<vector>/wall_<vector>_<id>.png`
- City wall segment metadata: `src/assets/wallSegments/<vector>/wall_<vector>_<id>.json`
- City wall-top/superstructure textures: `src/assets/wallSuperstructures/<vector>/walltop_<vector>_<id>.png`
- City wall-top/superstructure metadata: `src/assets/wallSuperstructures/<vector>/walltop_<vector>_<id>.json`
- City hex background and obstacle textures: `src/assets/hexBackgrounds/<type>/<biome>/<vector>/<id>.png`
- Tower component textures: `src/assets/gunParts/<vector>/<vector>_<slot>_<id>.png`
- Tower component metadata: `src/assets/gunParts/<vector>/<vector>_<slot>_<id>.json`
- Ammo projectile textures: `src/assets/projectiles/<vector>/<vector>_projectile_<id>.png`
- Battle backgrounds: `src/assets/battle/backgrounds/<id>.png`
- Battle damage-area VFX textures: `src/assets/battle/effects/<id>.png`
- Battle enemy textures: `src/assets/enemies/<region>/<textureKey>.png`
- Battle enemy animation atlases: `src/assets/enemies/<region>/<textureKey>.json`
- Legacy city-wide backgrounds: `src/assets/city/background/<id>.<ext>`
- Global event pictures: `src/assets/events/<id>.png`
- Unused images: `src/assets/unused/...`

Use the development vector folder names from `src/models/DevlopmentVector.ts`: `neutral`, `tech`, `nature`, `medieval`, and `aether`. Neutral starter content currently reuses legacy medieval texture file names and IDs where needed for compatibility.
Use the city hex background type folder names from `src/models/city/hexBackgrounds.ts`: `background`, `removableObstacle`, and `permanentObstacle`.
Use the biome folder names from `src/models/city/hexBackgrounds.ts`: `plains`, `desert`, `marsh`, and `alpine`.
Use kebab-case for the file `<id>` segment. The editor derives game IDs from these filenames, for example `wall_medieval_scrap-barricade.png` maps to `wallSegments.medieval.scrapBarricade`.

## Add A City Building Texture

1. Add or confirm the building definition and id in `src/data/buildings/<vector>.json`.
2. Confirm `src/data/ids.ts` derives the building id from the active atlas.
3. Put the PNG and JSON metadata in `src/assets/buildings/<vector>/`.
4. Import and map both files in `src/data/entityVisualAssets.ts`, then register active runtime sprites in `src/models/sprites/buildings/<vector>.ts` as needed.
5. Keep building metadata limited to `zoom` and `shift`. `zoom` scales the city hex sprite from its default hex fit, and `shift.x`/`shift.y` offset it in city SVG units.
6. The City page reads through `buildingsSpriteAtlas`; do not import building textures directly in page components.

## Add A City Hex Background Texture

1. Pick the asset type, biome, and development vector folder.
2. Put the PNG in `src/assets/hexBackgrounds/<type>/<biome>/<vector>/`.
3. The runtime catalog in `src/data/cityHexBackgrounds.ts` discovers the file and exposes it as `hexBackgrounds.<type>.<biome>.<vector>.<fileStem>`.
4. City hexes store a hidden base `background` sprite id in city state. If no sprite exists for the selected biome and vector, the City page fills the hex with a biome/vector fallback color.
5. Unclaimed hexes within the maximum city radius draw a `removableObstacle` sprite over the base background. Hexes outside the maximum city radius draw a `permanentObstacle` sprite. Claimed hexes and built hexes draw only the base background under city objects.
6. In local debug mode, `/hex-background-editor` lists discovered sprites and uploads PNGs through the local data server endpoint `POST /hex-background-sprites`.

## Add A Wall Segment Texture

1. Add or confirm the segment definition and id in `src/data/wallSegments/<vector>.json`.
2. Confirm `src/data/ids.ts` derives the wall id from the active atlas.
3. Put the PNG and JSON metadata in `src/assets/wallSegments/<vector>/`.
4. Import and map both files in `src/data/entityVisualAssets.ts`, then register active runtime sprites in `src/models/sprites/walls/<vector>.ts` as a sprite asset keyed by the wall id: `{ src, metadata }`.
5. Keep wall metadata JSON limited to image sizing, optional `rotationDegrees`, and visible-pixel bounds. Do not duplicate `id`, `spriteId`, or `wallId` in the JSON; the registry key is the wall id and battle texture alias.
6. City rendering uses `wallSpritesAtlas`; battle loading uses `wallSpriteMetadataAtlas` and `wallSpritesAtlas`.
7. Set `targetSpriteSize` to the intended city-pixel size at zoom 1. City hex rendering centers that size on the hex and clips anything outside the hex border. Battle wall rendering uses the same size directly; battle zoom is camera/display scale only.
8. If the source PNG has transparent padding, set `sourceVisiblePixelBounds` to the opaque/content bounds in source image pixels. Battle enemy contact uses the top of these visible pixel bounds so enemies stop at the wall face, not the full transparent image box.

## Add A Wall-Top/Superstructure Texture

1. Add or confirm the superstructure definition and id in `src/data/wallSuperstructures/<vector>.json`.
2. Confirm `src/data/ids.ts` derives the superstructure id from the active atlas.
3. Put the PNG and JSON metadata in `src/assets/wallSuperstructures/<vector>/`.
4. Import and map both files in `src/data/entityVisualAssets.ts`, then register active runtime sprites in `src/models/sprites/wallTops/<vector>.ts` as a sprite asset keyed by the superstructure id: `{ src, metadata }`.
5. Keep wall-top metadata JSON limited to image sizing and optional `rotationDegrees`. Do not duplicate `id`, `spriteId`, or `superstructureId` in the JSON; the registry key is the superstructure id and battle texture alias.
6. The City page reads through `wallTopSpritesAtlas`; do not import wall-top textures directly in page components.
7. Set `targetSpriteSize` to the intended city SVG size at zoom 1. City hex rendering centers that size on the hex, applies `rotationDegrees` around the hex center when present, and clips anything outside the hex border.

## Add A Tower Component Texture

1. Add or confirm the tower part definition, id, vector, and slot in `src/data/gunParts/<vector>.json`.
2. Confirm `src/data/ids.ts` derives the gun part id from the active atlas and slot group.
3. Put the PNG and JSON metadata in `src/assets/gunParts/<vector>/`.
4. Import and map both files in `src/data/entityVisualAssets.ts`; `src/data/gunParts/partVisualMetadata.ts` derives tower part visual metadata from that registry.
5. Keep tower part metadata JSON limited to sockets, source size, zoom, and rotation. `zoom` is a single sprite scale derived from source pixels, so preview and Pixi rendering preserve the source proportions. Do not duplicate `id` or `spriteId` in the JSON; the visual asset registry key is the Pixi texture alias.
6. Use `/gun-part-editor` to check sockets and `/ids` to check id/data/asset coverage.

## Add An Ammo Projectile Texture

1. Add or confirm the ammo tower part definition in `src/data/gunParts/<vector>.json`.
2. Put projectile PNGs in `src/assets/projectiles/<vector>/` using `<vector>_projectile_<id>.png`.
3. Reference the projectile asset from the ammo definition with `projectileSpriteTextureKey`, using the registry id format `projectiles.<vector>.<id>`.
4. The entity edit page can upload or select the projectile sprite alongside the ammo part's main tower-component sprite.

## Add A Battle Damage-Area VFX Texture

1. Put the PNG in `src/assets/battle/effects/` using kebab-case, for example `toxic-cloud.png`.
2. Add or update the runtime mapping in `src/data/battleDamageAreaVfxDefinitions.json`, including the display type and any circular-repeat controls.
3. Match the effect through damage keywords such as `damage.poison`, not through a specific tower, wall, or building id.
4. Use `/damage-area-vfx` in local debug mode to preview existing sprites, upload new PNGs, and save mapping changes through the local data server.
5. See `docs/damage-area-vfx.md` for the scalable matching model.

## Add A Battle Enemy Texture

1. Add or confirm the monster definition and `sprite.textureKey` in `src/data/enemies/<region>.json`.
2. Put the PNG in `src/assets/enemies/<region>/<textureKey>.png`.
3. Add or edit the paired metadata JSON at `src/assets/enemies/<region>/<textureKey>.json` when the battle sprite needs explicit sizing or rotation. `targetSpriteSize` controls the rendered battle size, and `rotationDegrees` is applied to the image inside the moving enemy container.
4. The runtime catalog in `src/data/enemies/visuals.ts` discovers the file and battle loading registers it under `sprite.textureKey`.
5. In local debug mode, `/monster-edit/:monsterId` can upload the PNG, set the texture key automatically, and save enemy sprite metadata.

## Add A Battle Enemy Animation

1. In local debug mode, open `/enemy-animation-sprites`.
2. Choose the enemy biome/region, enter the sprite set name, and upload a PNG sprite sheet.
3. Either tune the X/Y length, initial shift, and gap values until the green frame guides match the sheet, or upload/drop a pre-generated Pixi-style JSON atlas. Dropped JSON frame data drives the guides and preview.
4. Check the Pixi preview. The page renders the generated or uploaded frame atlas before saving.
5. Save through the local data server. This writes `src/assets/enemies/<region>/<textureKey>.png` and a paired Pixi spritesheet JSON at `src/assets/enemies/<region>/<textureKey>.json`.
6. Use `/monster-edit/:monsterId` to select the saved texture key as the monster sprite. The enemy visual catalog treats Pixi spritesheet JSON files as animated assets and loads the atlas in battle.

## Add A Global Event Picture

1. Put the PNG in `src/assets/events/`.
2. Set the global event `imageId` to the file stem without extension.
3. The Global Events editor can upload the PNG and set `imageId` automatically. The runtime event image catalog discovers files in `src/assets/events`.

## Cleanup Rules

- Do not leave active textures outside the folders above.
- Move any image that is not imported or loaded by a registry to `src/assets/unused`, preserving useful source subfolders when possible.
- After moving textures, run `rg "oldFolderOrFileName" src docs AGENTS.md` to catch stale paths.
- For behavior-visible texture changes, run `npm run lint` and `npm run build` when practical, then inspect the affected page.
