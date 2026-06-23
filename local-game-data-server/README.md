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
- `POST /entities`

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
