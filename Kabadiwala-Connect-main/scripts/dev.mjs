import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("..", import.meta.url));
const tsxBin = path.join(projectRoot, "node_modules", "tsx", "dist", "cli.mjs");
const viteBin = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js");

const children = [];
let shuttingDown = false;

function start(command, args, label) {
  const child = spawn(command, args, {
    stdio: "inherit",
    cwd: projectRoot,
    env: { ...process.env, NODE_ENV: "development" },
    shell: false,
  });

  child.on("error", (error) => {
    console.error(`[${label}] failed to start:`, error.message);
    if (!shuttingDown) process.exitCode = 1;
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    if (code !== 0) {
      console.error(`[${label}] stopped with code=${code} signal=${signal ?? "none"}`);
      shutdown(code ?? 1);
    }
  });

  children.push(child);
  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(code), 300);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

console.log("[dev] Starting Kabadiwala Connect API on http://localhost:3000 ...");
start(process.execPath, [tsxBin, "server/index.ts"], "api");

console.log("[dev] Starting Vite frontend on http://localhost:5173 ...");
start(process.execPath, [viteBin, "--host"], "vite");
