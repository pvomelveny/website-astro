/**
 * Types for the notes forest.
 *
 * Notes are Typst files built by wanshi (see `notes/`), not an Astro content
 * collection. Astro reads the metadata index wanshi emits — `wanshi.json` — to
 * render the "recent notes" list on the homepage and the RSS feed. See
 * `src/data/notes.ts` for the loader.
 */

/**
 * The canonical note kinds, rendered by wanshi as the `taxon` label before a
 * note's title. Set with `"taxon": "exposition"` in a note's `#metadata`.
 *
 * wanshi does not enforce a vocabulary — any string is accepted — so this type
 * documents the convention rather than constraining the build. A note using
 * something else still renders; it just won't match this union.
 */
export type NoteTag = "note" | "exposition" | "problem" | "reading";

/** A single note, flattened from its `wanshi.json` entry. */
export interface Note {
  /** wanshi slug — the source path under `notes/trees/`, minus the extension. */
  slug: string;
  /** Plain-text title, with any Typst markup stripped. */
  title: string;
  /** Site-absolute URL of the note's page. */
  href: string;
  /** Parsed `date` metadata. Absent when the note declares none. */
  date?: Date;
  /** Note kind — the `taxon`, normalized (`"Note"`, not wanshi's `"Note. "`). */
  tag?: string;
  /** One-line summary from the note's custom `description` metadata. */
  description?: string;
}

/**
 * Build the public URL for a note from its wanshi slug.
 *
 * Mirrors how wanshi links its own pages with `[build].pretty-urls = true`
 * (see notes/Wanshi.toml):
 *
 *   index              → /notes/                  (the forest root)
 *   algebra/index      → /notes/algebra/          (a directory index)
 *   welcome            → /notes/welcome
 *   algebra/monoids    → /notes/algebra/monoids
 *
 * A note named `index` is linked as its directory, since that is what serves
 * it. Everything else drops the `.html` suffix — the file on disk still has
 * one, so the extensionless form depends on the host resolving it (a
 * CloudFront Function in production, a dev middleware locally; see
 * astro.config.ts).
 */
export function noteHref(slug: string): string {
  if (slug === "index") return "/notes/";
  if (slug.endsWith("/index")) return `/notes/${slug.slice(0, -"index".length)}`;
  return `/notes/${slug}`;
}
