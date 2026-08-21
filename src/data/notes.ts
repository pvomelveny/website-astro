/**
 * Reads the notes forest metadata that wanshi generates.
 *
 * The notes at `/notes/**` are Typst files built by wanshi (project root:
 * `notes/`), which writes complete standalone HTML straight into `public/notes/`
 * — Astro copies that verbatim into `dist/` and otherwise leaves it alone.
 *
 * Two Astro pages still need to *know* about the notes: the homepage's "recent
 * notes" list and the RSS feed. Rather than duplicating that metadata, both
 * read `wanshi.json`, the metadata index wanshi emits beside the pages. It is
 * therefore generated input to the Astro build, which is why `npm run build`
 * runs wanshi first (see package.json).
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Note } from "../types/note";
import { noteHref } from "../types/note";

/**
 * wanshi serializes every metadata value as a tagged union: `{"Plain": "..."}`
 * for plain text, `{"Lazy": ...}` for rich Typst content (a title containing
 * `#emph[...]`, say). Only the plain form is usable as a string here.
 */
type WanshiValue = { Plain: string } | { Lazy: unknown };

type WanshiEntry = Record<string, WanshiValue>;

/** Path to the index wanshi writes beside the pages it generates. */
const INDEX_PATH = join(process.cwd(), "public", "notes", "wanshi.json");

/**
 * Read and parse `wanshi.json`.
 *
 * Returns an empty index if the file is missing, so `astro build` run on its
 * own degrades to a site without note listings instead of failing. The normal
 * path — `npm run build` — always runs wanshi first.
 */
function readIndex(): Record<string, WanshiEntry> {
  try {
    return JSON.parse(readFileSync(INDEX_PATH, "utf8")) as Record<
      string,
      WanshiEntry
    >;
  } catch {
    console.warn(
      `[notes] ${INDEX_PATH} not found — skipping note listings, RSS items and sitemap entries.\n` +
        `        Run \`npm run notes:build\` (or \`npm run build\`) to generate it.`,
    );
    return {};
  }
}

/** Unwrap a wanshi metadata value, yielding `undefined` for rich content. */
function plain(value: WanshiValue | undefined): string | undefined {
  if (value && "Plain" in value && typeof value.Plain === "string") {
    return value.Plain;
  }
  return undefined;
}

/**
 * Parse wanshi's `date` metadata.
 *
 * `YYYY-MM-DD` is handled explicitly and deliberately: `new Date("2026-05-21")`
 * is parsed by spec as UTC midnight, which in this site's timezone renders as
 * the *previous* day. Constructing from parts pins it to local midnight so the
 * date shown is the date written.
 */
function parseDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (iso) {
    return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }
  // wanshi also accepts "October 12, 2025" and "10/12/2025".
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/**
 * Load every published note, newest first.
 *
 * Notes with no `date` sort last, in slug order — matching how wanshi orders
 * its own listings and feed.
 *
 * Excluded:
 *  - the forest root `index`, which is the hub page rather than a note;
 *  - any section marked `"collect": "true"`, wanshi's switch for "this is a
 *    listing page, not a post" — the same rule its RSS feed applies.
 */
export function getNotes(): Note[] {
  const index = readIndex();

  const notes: Note[] = [];
  for (const [slug, entry] of Object.entries(index)) {
    if (slug === "index") continue;
    if (plain(entry["collect"]) === "true") continue;
    // A work cited from a note is not itself a post. Reference stubs are
    // generated from the Zotero library by `npm run refs:sync`, so a batch of
    // them would otherwise arrive in the feed as if they were new writing.
    // They stay in the sitemap — see getNotePagePaths — since they are real,
    // linkable pages.
    if (plain(entry["data-taxon"]) === "reference") continue;

    notes.push({
      slug,
      // `page-title` is wanshi's markup-stripped form of `title`, so it stays a
      // plain string even when the note titles itself with rich Typst content.
      title: plain(entry["page-title"]) ?? plain(entry["title"]) ?? slug,
      href: noteHref(slug),
      date: parseDate(plain(entry["date"])),
      // `data-taxon` is the bare value ("Note"); `taxon` is the display form
      // ("Note. "), punctuation and all.
      tag: plain(entry["data-taxon"]),
      description: plain(entry["description"]),
    });
  }

  return notes.sort((a, b) => {
    if (a.date && b.date) return b.date.getTime() - a.date.getTime();
    if (a.date) return -1;
    if (b.date) return 1;
    return a.slug.localeCompare(b.slug);
  });
}

/**
 * Every published note page, as site-absolute paths, for the sitemap.
 *
 * Unlike {@link getNotes} this includes hub pages — the forest root at
 * `/notes/` and any directory index — because they are real, indexable pages
 * even though they are not posts.
 *
 * @astrojs/sitemap only sees routes Astro itself generates, and the notes are
 * not among them: wanshi writes them straight into `public/`, which Astro
 * copies without inspecting. Without this they would silently drop out of the
 * sitemap. See `customPages` in astro.config.ts.
 */
export function getNotePagePaths(): string[] {
  return Object.keys(readIndex()).map(noteHref).sort();
}
