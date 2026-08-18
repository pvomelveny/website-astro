/**
 * Types for the notes forest.
 *
 * Notes are Typst files built by wanshi (see `notes/`), not an Astro content
 * collection. Astro reads the metadata index wanshi emits — `wanshi.json` — to
 * render the "recent notes" list on the homepage and the RSS feed. See
 * `src/data/notes.ts` for the loader.
 */

/**
 * **A taxon is an arbitrary string.** wanshi imposes no vocabulary: it
 * capitalizes whatever it is given and appends ". " for display, and carries the
 * bare value in `data-taxon`. Nothing here validates or constrains it, and
 * anything that consumes a taxon must cope with a value it has never seen.
 *
 * The one exception is real and lives in wanshi's compiler (`Taxon::is_reference`):
 * a taxon **starting with** "reference" — or the Chinese 参考 — marks the section
 * as a citation target and changes how inbound links to it render. That is the
 * only taxon with behaviour attached. Every other value is a label and a sort
 * key, nothing more.
 *
 * {@link COMMON_TAXONS} is therefore a convenience list, not a schema.
 */

/**
 * Taxons in common use, purely as a memory aid when writing a note.
 *
 * The first sixteen are the ones wanshi's semantic subtree helpers preset
 * (`#definition(...)`, `#theorem(...)`, …), so they will recur whether or not
 * anyone chooses them deliberately. The rest are this site's own habits. There
 * is no distinction between the two groups as far as wanshi is concerned —
 * `#definition(...)` and `"taxon": "definition"` produce the same thing, and an
 * invented taxon behaves exactly like a preset one.
 *
 * Prefer reusing a value over coining one, since taxons are only useful as a
 * filter and sort key when they are consistent. Append here when you do coin one.
 */
export const COMMON_TAXONS: readonly string[] = [
  "axiom", "claim", "conjecture", "corollary", "definition", "example",
  "exegesis", "exposition", "fact", "hypothesis", "lemma", "note",
  "observation", "postulate", "problem", "proof", "proposition", "reading",
  "remark", "theorem",
];

/**
 * Whether a taxon marks the section as a citation target.
 *
 * Mirrors `Taxon::is_reference` in wanshi's compiler, which matches on a prefix
 * rather than equality — so `reference`, `references` and `reference-book` all
 * qualify.
 */
export function isReferenceTaxon(taxon: string | undefined): boolean {
  if (!taxon) return false;
  const t = taxon.toLowerCase();
  return t.startsWith("reference") || taxon.startsWith("参考");
}

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
