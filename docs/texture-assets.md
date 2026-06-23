# Texture Asset Workflow

Use this when adding or moving gameplay textures. Keep active textures in typed registries and move unused images to `src/assets/unused`.

## Folder Layout

- City building textures: `src/assets/buildings/<vector>/building_<vector>_<id>.png`
- City wall segment textures: `src/assets/wallSegments/<vector>/wall_<vector>_<id>.png`
- City wall segment metadata: `src/assets/wallSegments/<vector>/wall_<vector>_<id>.json`
- City wall-top/superstructure textures: `src/assets/wallSuperstructures/<vector>/walltop_<vector>_<id>.png`
- City wall-top/superstructure metadata: `src/assets/wallSuperstructures/<vector>/walltop_<vector>_<id>.json`
- Tower component textures: `src/assets/gunParts/<vector>/<vector>_<slot>_<id>.png`
- Tower component metadata: `src/assets/gunParts/<vector>/<vector>_<slot>_<id>.json`
- Battle backgrounds: `src/assets/battle/backgrounds/<id>.png`
- City backgrounds: `src/assets/city/background/<id>.<ext>`
- Unused images: `src/assets/unused/...`

Use the development vector folder names from `src/models/DevlopmentVector.ts`: `tech`, `nature`, `medieval`, and `aether`.

## Add A City Building Texture

1. Add the id in `src/data/identificators/buildings/<vector>.ts` if it does not exist.
2. Add or confirm the building definition in `src/data/buildings/<vector>.ts`.
3. Put the image in `src/assets/buildings/<vector>/`.
4. Import and map the texture in `src/data/entityVisualAssets.ts`, then register active runtime sprites in `src/models/sprites/buildings/<vector>.ts` as needed.
5. The City page reads through `buildingsSpriteAtlas`; do not import building textures directly in page components.

## Add A Wall Segment Texture

1. Add the id in `src/data/identificators/walls/<vector>.ts` if it does not exist.
2. Add or confirm the segment definition in `src/data/wallSegments/<vector>.json`.
3. Put the PNG and JSON metadata in `src/assets/wallSegments/<vector>/`.
4. Import and map both files in `src/data/entityVisualAssets.ts`, then register active runtime sprites in `src/models/sprites/walls/<vector>.ts` as a sprite asset keyed by the wall id from `src/data/identificators/walls/<vector>.ts`: `{ src, metadata }`.
5. Keep wall metadata JSON limited to image sizing/bounds. Do not duplicate `id`, `spriteId`, or `wallId` in the JSON; the registry key is the wall id and battle texture alias.
6. City rendering uses `wallSpritesAtlas`; battle loading uses `wallSpriteMetadataAtlas` and `wallSpritesAtlas`.
7. Set `targetSpriteSize` to the intended city SVG size at zoom 1. City hex rendering centers that size on the hex and clips anything outside the hex border. Battle wall rendering scales that size by `BATTLEFIELD_PIXELS_PER_CITY_SIDE_HEX / CITY_HEX_SIZE`.
8. If the source PNG has transparent padding, set `sourceVisiblePixelBounds` to the opaque/content bounds in source image pixels. Battle enemy contact uses the top of these visible pixel bounds so enemies stop at the wall face, not the full transparent image box.

## Add A Wall-Top/Superstructure Texture

1. Add the id in `src/data/identificators/superstructures/<vector>.ts` if it does not exist.
2. Add or confirm the superstructure definition in `src/data/wallSuperstructures/<vector>.ts`.
3. Put the PNG and JSON metadata in `src/assets/wallSuperstructures/<vector>/`.
4. Import and map both files in `src/data/entityVisualAssets.ts`, then register active runtime sprites in `src/models/sprites/wallTops/<vector>.ts` as a sprite asset keyed by the superstructure id: `{ src, metadata }`.
5. Keep wall-top metadata JSON limited to image sizing/bounds. Do not duplicate `id`, `spriteId`, or `superstructureId` in the JSON; the registry key is the superstructure id and battle texture alias.
6. The City page reads through `wallTopSpritesAtlas`; do not import wall-top textures directly in page components.
7. Set `targetSpriteSize` to the intended city SVG size at zoom 1. City hex rendering centers that size on the hex and clips anything outside the hex border.

## Add A Tower Component Texture

1. Add the id in `src/data/identificators/gunparts/<vector>.ts` and its slot group in `src/data/identificators/gunparts/index.ts`.
2. Add or confirm the tower part definition in `src/data/gunParts/<vector>.json`.
3. Put the PNG and JSON metadata in `src/assets/gunParts/<vector>/`.
4. Import and map both files in `src/data/entityVisualAssets.ts`; `src/data/gunParts/partVisualMetadata.ts` derives tower part visual metadata from that registry.
5. Keep tower part metadata JSON limited to sockets, source size, target size, and rotation. Do not duplicate `id` or `spriteId` in the JSON; the visual asset registry key is the Pixi texture alias.
6. Use `/gun-part-editor` to check sockets and `/ids` to check id/data/asset coverage.

## Cleanup Rules

- Do not leave active textures outside the folders above.
- Move any image that is not imported or loaded by a registry to `src/assets/unused`, preserving useful source subfolders when possible.
- After moving textures, run `rg "oldFolderOrFileName" src docs AGENTS.md` to catch stale paths.
- For behavior-visible texture changes, run `npm run lint` and `npm run build` when practical, then inspect the affected page.
