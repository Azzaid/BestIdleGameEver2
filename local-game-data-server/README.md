# Local Game Data Server

Minimal dependency-free Node.js server for local development data files.

It runs independently from the Vite frontend:

```sh
npm start
```

Default URL:

```txt
http://127.0.0.1:4317
```

Endpoints:

- `GET /health`
- `GET /game-files/sample-game-state.json`
- `PUT /game-files/sample-game-state.json`
- `GET /game-files/high-level-content-plan.json`
- `PUT /game-files/high-level-content-plan.json`
- `POST /entities`
- `POST /entity-sprites`
- `POST /entity-sprite-metadata`
- `DELETE /entity-sprites`
- `POST /gun-part-metadata`
- `POST /global-events`
- `POST /global-event-images`
- `DELETE /global-event-images`
- `POST /hex-background-sprites`
- `POST /battle-effect-sprites`
- `POST /battle-damage-area-vfx`
- `POST /global-modifiers`
- `POST /homogeneous-values`

Only `.json` files inside this folder's `data` directory are readable or writable.

`POST /entities` writes to the project's JSON data catalogs under `../src/data`.
The target file is selected from the entity `id`:

- `buildings.{vector}.{item}` -> `src/data/buildings/{vector}.json`
- `enemies.{region}.{item}` -> `src/data/enemies/{region}.json`
- `gunParts.{vector}.{slot}.{item}` -> `src/data/gunParts/{vector}.json`
- `research.{vector}.{item}` -> `src/data/research/{vector}.json`
- `wallSegments.{vector}.{item}` -> `src/data/wallSegments/{vector}.json`
- `wallSuperstructures.{vector}.{item}` -> `src/data/wallSuperstructures/{vector}.json`

The server appends new entities and updates existing entities with the same ID. Set `GAME_DATA_DIR` to point at a different data root for tests.

`POST /entity-sprites` saves sprite PNG files under `src/assets` with paired metadata JSON for sprite-backed entity types. Send it as `multipart/form-data`:

```txt
kind=wallSegment
vector=medieval
assetId=wallSegments.medieval.scrapBarricade
fileStem=wall_medieval_scrap-barricade
previousFileStem=optional_previous_stem
metadata={"sourceSpriteSize":{"width":80,"height":80},"targetSpriteSize":{"width":80,"height":80}}
image=<PNG file>
```

Use `kind=projectile` for ammo projectile sprites. Projectile uploads save PNG files under `src/assets/projectiles/{vector}` and do not require metadata.

`POST /entity-sprite-metadata` writes paired sprite metadata JSON for sprite-backed entity types:

```json
{
  "kind": "enemy",
  "vector": "wasteland",
  "fileStem": "enemy_scrapling",
  "metadata": {
    "sourceSpriteSize": {"width": 256, "height": 256},
    "targetSpriteSize": {"width": 48, "height": 48},
    "rotationDegrees": -90
  }
}
```

`DELETE /entity-sprites` removes a sprite PNG and paired metadata JSON when present. Send JSON with `kind`, `vector`, and `fileStem`; include `slot` for gun parts.

`POST /gun-part-metadata` writes tower-part socket metadata to `src/assets/gunParts/{vector}/{fileStem}.json`:

```json
{
  "vector": "medieval",
  "fileStem": "medieval_launchSystem_crude-sling",
  "metadata": {
    "sourceSpriteSize": {"width": 1536, "height": 1024},
    "targetSpriteSize": {"width": 150, "height": 100},
    "rotationDegrees": 270,
    "inputSocket": {"x": 773, "y": 631},
    "outputSockets": {}
  }
}
```

`POST /global-events` writes event definitions to `src/data/globalEvents/events.json`.
`POST /global-event-images` saves a PNG event image under `src/assets/events/{fileStem}.png`. Send it as `multipart/form-data` with `fileStem`, optional `previousFileStem`, and an `image` file field.
`DELETE /global-event-images` removes an event PNG. Send JSON with `fileStem`.
`POST /hex-background-sprites` saves a PNG under `src/assets/hexBackgrounds/{type}/{biome}/{vector}/{fileStem}.png`. Send it as `multipart/form-data` with `type`, `biome`, `vector`, `fileStem`, and an `image` file field.
`POST /battle-effect-sprites` saves a PNG under `src/assets/battle/effects/{fileStem}.png`. Send it as `multipart/form-data` with `fileStem` and an `image` file field.
`POST /battle-damage-area-vfx` writes damage-area VFX mappings to `src/data/battleDamageAreaVfxDefinitions.json`. Send JSON with a `definition` object.
`POST /global-modifiers` writes modifier definitions to `src/data/globalModifiers/modifiers.json`.
Global event and modifier endpoints append new definitions and update existing definitions with the same ID.
`POST /homogeneous-values` updates existing homogeneous value definitions in `src/data/homogeneousValues/index.ts`.
