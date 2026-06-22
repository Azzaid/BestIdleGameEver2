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

Only `.json` files inside this folder's `data` directory are readable or writable.
