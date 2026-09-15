#!/usr/bin/env node
/**
 * Nitro + Rolldown emit a circular SSR entry:
 *   ssr.mjs re-exports missing `ssr_exports`
 *   ssr2.mjs imports `__exportAll` from ssr.mjs
 * That 500s every published page. Break the cycle and point `s` at the real
 * server entry (`server_default.fetch`). Also copy PGLite wasm assets the
 * preview fallback expects next to the bundled driver.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const func = join(root, ".vercel/output/functions/__server.func");
const ssrDir = join(func, "_ssr");
const ssr = join(ssrDir, "ssr.mjs");
const ssr2 = join(ssrDir, "ssr2.mjs");
const libs = join(func, "_libs");

const EXPORT_ALL = `function __exportAll$1(all, no_symbols) {
  const target = {};
  for (const name in all) Object.defineProperty(target, name, { get: all[name], enumerable: true });
  if (!no_symbols) Object.defineProperty(target, Symbol.toStringTag, { value: "Module" });
  return target;
}
`;

let changed = false;

if (existsSync(ssr)) {
  let src = readFileSync(ssr, "utf8");
  if (src.includes("ssr_exports as s")) {
    src = src.replaceAll("ssr_exports as s", "server_default as s");
    writeFileSync(ssr, src);
    changed = true;
  }
}

if (existsSync(ssr2)) {
  let src = readFileSync(ssr2, "utf8");
  if (src.includes('from "./ssr.mjs"')) {
    src = src.replace(/import \{ c as __exportAll\$1 \} from "\.\/ssr\.mjs";\n/, EXPORT_ALL);
    writeFileSync(ssr2, src);
    changed = true;
  }
}

const pgliteDist = join(root, "node_modules/@electric-sql/pglite/dist");
if (existsSync(libs)) {
  mkdirSync(libs, { recursive: true });
  for (const name of ["pglite.data", "pglite.wasm", "initdb.wasm"]) {
    const from = join(pgliteDist, name);
    const to = join(libs, name);
    if (existsSync(from) && !existsSync(to)) {
      copyFileSync(from, to);
      changed = true;
    }
  }
}

if (changed) console.log("[fix-ssr-export] patched nitro SSR entry");
