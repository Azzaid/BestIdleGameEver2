import {spawn} from "node:child_process";

const processes = [
  spawn(process.execPath, ["./node_modules/vite/bin/vite.js"], {
    stdio: "inherit",
    shell: false,
  }),
  spawn(process.execPath, ["./local-game-data-server/server.js"], {
    stdio: "inherit",
    shell: false,
  }),
];

let isShuttingDown = false;

function shutdown(exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  for (const child of processes) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 100);
}

for (const child of processes) {
  child.on("exit", code => {
    if (!isShuttingDown) {
      shutdown(code ?? 0);
    }
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
