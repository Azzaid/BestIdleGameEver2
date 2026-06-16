# Texture Asset Workflow

Use this when adding or moving gameplay textures. Keep active textures in typed registries and move unused images to `src/assets/unused`.

## Folder Layout

- City building textures: `src/assets/city/buildings/<vector>/building_<vector>_<id>.png`
- City wall segment textures: `src/assets/city/walls/<vector>/wall_<vector>_<id>.png`
- City wall segment metadata: `src/assets/city/walls/<vector>/wall_<vector>_<id>.json`
- City wall-top/superstructure textures: `src/assets/city/wallTops/<vector>/walltop_<vector>_<id>.png`
- Battle tower component textures: `src/assets/battle/towerParts/<vector>/<vector>_<slot>_<id>.png`
- Battle tower component metadata: `src/assets/battle/towerParts/<vector>/<vector>_<slot>_<id>.json`
- Battle backgrounds: `src/assets/battle/backgrounds/<id>.png`
- City backgrounds: `src/assets/city/background/<id>.<ext>`
- Unused images: `src/assets/unused/...`

Use the development vector folder names from `src/models/DevlopmentVector.ts`: `tech`, `nature`, `medieval`, and `aether`.

## Add A City Building Texture

1. Add the id in `src/data/identificators/buildings/<vector>.ts` if it does not exist.
2. Add or confirm the building definition in `src/data/buildings/<vector>.ts`.
3. Put the image in `src/assets/city/buildings/<vector>/`.
4. Import and map the texture in `src/models/sprites/buildings/<vector>.ts`.
5. The City page reads through `buildingsSpriteAtlas`; do not import building textures directly in page components.

## Add A Wall Segment Texture

1. Add the id in `src/data/identificators/walls/<vector>.ts` if it does not exist.
2. Add or confirm the segment definition in `src/data/wall/segments/<vector>.ts`.
3. Put the PNG and JSON metadata in `src/assets/city/walls/<vector>/`.
4. Import and map both files in `src/models/sprites/walls/<vector>.ts`.
5. City rendering uses `wallSpritesAtlas`; battle loading uses `wallSpriteMetadataAtlas` and `wallSpritesAtlas`.

## Add A Wall-Top/Superstructure Texture

1. Add the id in `src/data/identificators/superstructures/<vector>.ts` if it does not exist.
2. Add or confirm the superstructure definition in `src/data/wall/superstructures/<vector>.ts`.
3. Put the image in `src/assets/city/wallTops/<vector>/`.
4. Import and map it in `src/models/sprites/wallTops/<vector>.ts`.
5. The City page reads through `wallTopSpritesAtlas`; do not import wall-top textures directly in page components.

## Add A Tower Component Texture

1. Add the id in `src/data/identificators/gunparts/<vector>.ts` and its slot group in `src/data/identificators/gunparts/index.ts`.
2. Add or confirm the tower part definition in `src/data/towers/parts/<vector>.ts`.
3. Put the PNG and JSON metadata in `src/assets/battle/towerParts/<vector>/`.
4. Import and map both files in `src/data/towers/partVisualMetadata.ts`.
5. Use `/gun-part-editor` to check sockets and `/ids` to check id/data/asset coverage.

## Cleanup Rules

- Do not leave active textures outside the folders above.
- Move any image that is not imported or loaded by a registry to `src/assets/unused`, preserving useful source subfolders when possible.
- After moving textures, run `rg "oldFolderOrFileName" src docs AGENTS.md` to catch stale paths.
- For behavior-visible texture changes, run `npm run lint` and `npm run build` when practical, then inspect the affected page.
