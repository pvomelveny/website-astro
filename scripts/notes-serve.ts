/**
 * Runs `wanshi serve`, and mirrors its generated indexes back to the build output.
 *
 * Why this wrapper exists: wanshi's serve and build modes cannot write to the
 * same directory. Serve mode hardcodes `base-url` to `/` (BuildMode::Serve in
 * wanshi's `src/environment/config_access.rs`) because its miniserve serves the
 * output directory at the root, while `[wanshi].base-url` here is `/notes/`.
 * Sharing one directory therefore means each mode overwrites the other's pages
 * with links the other cannot resolve. `[serve].output` is consequently a
 * scratch directory of its own, and `public/notes/` belongs to `wanshi build`
 * alone.
 *
 * That separation costs one thing, which this script buys back. Two consumers
 * read the generated indexes out of the *build* output:
 *
 *   public/notes/wanshi.json        src/data/notes.ts — homepage list, RSS,
 *                                   sitemap; and the Neovim slug completion
 *   public/notes/wanshi.graph.json  the Neovim backlink/link commands
 *
 * Both would freeze at the last `npm run notes:build` while you write. So this
 * copies each index from the serve output into the build output after every
 * rebuild, leaving the pages alone. Nothing else crosses between the two.
 *
 * Usage — see package.json:
 *   node scripts/notes-serve.ts              # notes:serve, with the browser
 *   node scripts/notes-serve.ts --no-server  # notes:watch, rebuild only
 * Extra arguments are passed through to `wanshi serve`.
 */

import { spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, watch } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const configPath = join(projectRoot, "notes", "Wanshi.toml");

/** The indexes wanshi generates beside its pages, and the only files mirrored. */
const INDEXES = ["wanshi.json", "wanshi.graph.json"];

/**
 * Read `output` from one section of Wanshi.toml.
 *
 * A three-key regex reader rather than a TOML dependency: `output` is set under
 * both `[build]` and `[serve]`, so the section has to be tracked, but nothing
 * else here needs parsing. Paths in the file are relative to its own directory.
 *
 * @param section the table to read, e.g. `build`
 * @returns the absolute output path, or `undefined` if that section sets none
 */
function outputDir(section: string): string | undefined {
  const toml = readFileSync(configPath, "utf8");
  let current = "";
  for (const line of toml.split("\n")) {
    const header = /^\s*\[([^\]]+)\]/.exec(line);
    if (header) {
      current = header[1].trim();
      continue;
    }
    if (current !== section) continue;
    const match = /^\s*output\s*=\s*"([^"]*)"/.exec(line);
    if (match) return resolve(dirname(configPath), match[1]);
  }
  return undefined;
}

const serveOut = outputDir("serve");
const buildOut = outputDir("build");

if (!serveOut || !buildOut) {
  console.error(
    `[notes-serve] ${configPath} must set \`output\` under both [build] and [serve].`,
  );
  process.exit(1);
}

if (serveOut === buildOut) {
  console.error(
    "[notes-serve] [serve].output and [build].output are the same directory.\n" +
      "              Serve mode rewrites every link to be root-relative, so sharing\n" +
      "              one directory breaks whichever mode wrote it last. Point\n" +
      "              [serve].output at a scratch directory.",
  );
  process.exit(1);
}

mkdirSync(serveOut, { recursive: true });
mkdirSync(buildOut, { recursive: true });

/** Copy the indexes across, ignoring one that a rebuild is mid-write on. */
function mirrorIndexes(): void {
  for (const name of INDEXES) {
    const from = join(serveOut, name);
    if (!existsSync(from)) continue;
    try {
      copyFileSync(from, join(buildOut, name));
    } catch (error) {
      console.warn(`[notes-serve] could not mirror ${name}:`, error);
    }
  }
}

let pending: NodeJS.Timeout | undefined;
watch(serveOut, (_event, filename) => {
  if (filename && !INDEXES.includes(filename)) return;
  // Debounced: a rebuild writes both indexes, and fires several events per file.
  clearTimeout(pending);
  pending = setTimeout(mirrorIndexes, 150);
});

mirrorIndexes();

// `--indexes` and `--graph` are not optional. Serve mode leaves both off by
// default, and they are what this script mirrors — without them the homepage
// list, the RSS feed, the notes' sitemap entries and the Neovim backlink
// commands all quietly read a stale index.
const child = spawn(
  "wanshi",
  ["serve", "--indexes", "--graph", "--config", configPath, ...process.argv.slice(2)],
  { stdio: "inherit" },
);

child.on("exit", (code, signal) => {
  clearTimeout(pending);
  // Mirror one last time: the final rebuild may have landed inside the debounce.
  mirrorIndexes();
  process.exit(signal ? 1 : (code ?? 0));
});

child.on("error", (error) => {
  console.error("[notes-serve] could not start wanshi:", error);
  process.exit(1);
});
