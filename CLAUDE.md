# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal academic website for a researcher. Built with Astro, deployed to AWS S3 + CloudFront via GitHub Actions.

## Commands

```sh
npm run dev          # build notes, then start the Astro dev server
npm run build        # generate chrome → check notes → build notes → astro build → dist/
npm run preview      # preview production build locally

npm run notes:watch  # rebuild notes on save (run beside `npm run dev`)
npm run notes:new -- <path>   # scaffold a note, e.g. `-- algebra/monoids`
npm run notes:check  # validate the note graph (strict)
npm run notes:build  # build notes only → public/notes/
npm run notes:chrome # regenerate the site chrome wanshi injects
```

`npm run dev` builds the notes once and does not watch them — `astro dev` only
watches Astro sources. To edit notes with live reload, run `npm run notes:watch`
in a second terminal; it rebuilds into `public/notes/`, which the dev server is
already serving.

Requires [Typst](https://typst.app) and [wanshi](https://github.com/pvomelveny/wanshi)
on `PATH` (`brew install typst`; `cargo install --path .` from a wanshi clone).

Deployment: manual from the local machine — `npm run build` → `aws s3 sync dist/ s3://<bucket> --delete` → `aws cloudfront create-invalidation`. A GitHub Actions workflow is planned (see README) but not yet wired up; no `.github/workflows/` exists.

## Code style

- All script logic is TypeScript — use `.ts` files and Astro's built-in TS processing. Never write plain `.js` for anything with logic.
- Components should be modular and single-responsibility. Prefer smaller focused components over monolithic pages.
- Add JSDoc comments to non-trivial TypeScript functions and to component props interfaces.
- Design for extensibility: data-driven where possible (YAML collections), props-driven components.

## Architecture

```
src/
  pages/          # index.astro, about.astro, research.astro, teaching.astro, rss.xml.ts
  data/           # research.ts, teaching.ts, site.ts, notes.ts (reads wanshi.json)
  components/     # Nav, Footer, BaseLayout, Paper, Talk, ...
  styles/         # global.css (design tokens + resets)
  types/          # shared TypeScript interfaces (Research, Note, etc.)
  scripts/        # client-side TS (abstract toggles)
scripts/          # build-time TS — gen-wanshi-chrome.ts
notes/            # the wanshi project: Wanshi.toml, trees/, assets/, import-*.html
public/           # CV PDF, headshot photo; notes/ generated here (gitignored)
```

**Two generators, one site.** Astro owns `/`, `/about`, `/research`, `/teaching`,
and `/rss.xml`. wanshi owns everything under `/notes/`. They meet in exactly two
places: `public/notes/` (where wanshi writes and Astro copies from) and
`wanshi.json` (which Astro reads for the homepage list and the feed).

**`src/data/site.ts`** holds all global personal info: `firstName`, `lastName`, `fullName`, `email`, `github`, `scholar`, `cvUrl`. Nav and Footer import this directly — update once, reflects everywhere.

**Page-specific content** (bio, role, department, research interests, intro paragraphs) lives as named `const` variables in the frontmatter (`---` block) at the top of each page file. Look for the `// ── Page content ──` comment block. This is the intended editing point for content changes.

**Research page** is data-driven from `src/data/research.ts` — a typed TypeScript file. Adding a publication = appending an object to the `papers`, `preprints`, or `talks` array. See `src/types/research.ts` for the full schema. (YAML was considered but Astro/Vite doesn't support YAML imports natively.)

**No content collections.** Notes moved to wanshi, which removed the only one;
`src/content.config.ts` and `src/content/` no longer exist. The `@astrojs/mdx`,
`remark-math` and `rehype-katex` dependencies and the KaTeX stylesheet in
`BaseLayout.astro` are now unused — kept in case an Astro page wants math or
MDX later. Remove them if not.

**Notes** are a [wanshi](https://github.com/pvomelveny/wanshi) forest — Typst
sources under `notes/trees/`, built to standalone HTML in `public/notes/`. There
is no Astro route for them; Astro copies `public/` into `dist/` verbatim. See
the "Notes" section below.

The abstract toggle on research items is a small client-side TS module.

**About page** content is hardcoded directly in `about.astro` (not a separate content file).

## Design system

All design tokens (colors, fonts, layout constants) live as CSS custom properties in **`src/styles/global.css`** under `:root`. That file is the source of truth — read it directly rather than relying on values copied here.

Tokens defined there:

- Colors: `--accent`, `--accent-hover`, `--bg`, `--surface`, `--border`, `--muted`, `--ink` — a warm cream/maroon palette.
- Fonts: `--font-display` (Playfair Display, 400/500 + italic 400) and `--font-body` (Source Serif 4, opsz 8–60, weights 300 + 400). Loaded via Google Fonts in `BaseLayout.astro`. Math: KaTeX via `remark-math` + `rehype-katex`.
- Layout: `--page-max` (960px), `--content-max` (900px), `--notes-max` (700px), `--pad-h` (3rem desktop, 1.5rem ≤680px), `--breakpoint` (680px).
- **Type**: `--text-xs` (11px) · `--text-sm` (13px) · `--text-base` (16px) · `--text-lg` (20px) · `--text-xl` (32px), and `--leading-tight` (1.4) · `--leading-normal` (1.6) · `--leading-relaxed` (1.8).

**Never hardcode a font-size or line-height.** The scale replaced ten ad-hoc
sizes, of which 11/12/13/14 alone accounted for 36 uses — differences too small
to read as intentional. **Pick a token by role, not by size**: if something
seems to need a size that is not in the scale, the question is which role it
has, not whether to add a sixth step.

When adding new tokens, define them in `global.css`.

**wanshi pages do not see `global.css`.** They are standalone documents with
their own stylesheet, so tokens are bridged by hand in
`notes/import-style.html` — the colour palette, and the subset of the type
scale the injected chrome uses. wanshi's "Parchment & walnut" palette already
matches `--bg`, `--surface` and `--border` exactly; `--ink`, `--muted`,
`--accent` and `--accent-hover` are overridden there. **Change any bridged value
in `global.css` and you must change it in `notes/import-style.html` too** —
nothing keeps them in sync.

## Notes (wanshi)

Notes are Typst, built by [wanshi](https://github.com/pvomelveny/wanshi) — a
Zettelkasten/forest generator. The project lives in `notes/`; its docs are in
the wanshi repo under `docs/users/`.

### Writing a note

```sh
npm run notes:new -- algebra/monoids   # creates notes/trees/algebra/monoids.typ
npm run notes:watch                    # rebuild on save, beside `npm run dev`
```

A note is a Typst file declaring metadata and linking to its neighbours:

```typst
#import "/_lib/wanshi.typ": *

#show: wanshi

#metadata((
  "title": "Monoids",
  "taxon": "definition",
  "date": "2026-06-01",
  "description": "One line, used on the homepage list and in the RSS feed.",
))

Builds on #local("/semigroups").
```

- **Slug** = path under `notes/trees/` minus the extension. `notes/trees/algebra/monoids.typ`
  → `/notes/algebra/monoids.html`. Renaming breaks inbound links and public URLs.
- **`title`, `date`, `description`** are what Astro reads for the homepage list
  and the feed; `description` is a custom key, and also renders in the page's
  metadata row.
- **`taxon`** is the note kind, and the vocabulary is open — see the
  conventions section below. wanshi's sixteen semantic helpers
  (`#definition(...)`, `#theorem(...)`, …) set it for you on subtrees; set it by
  hand in `#metadata` when a whole note *is* that kind of thing.
- **Links and backlinks** are derived from `#local("/slug")`. Backlinks are
  automatic — every link pays for itself twice.
- **Math** is MathML, rendered by Typst; no KaTeX involved and no CDN request.
  Diagrams (fletcher, cetz) need `#auto-figure(auto-frame(...))` to survive the
  HTML export.
- **Footnotes** are Typst's `#footnote[...]`, rendered at the end of the note.
  (The old MDX margin-sidenotes did not survive the move; wanshi has no
  equivalent.)
- **`notes/trees/index.typ`** is the forest root, published at `/notes/`. Its
  `#children()` call lists every note automatically, so it never needs editing
  when you add one. It is marked `"collect": "true"`, which is what excludes it
  from the homepage list and feed.
- Directories beginning with `_` are skipped — that is why `trees/_lib/` holds
  the bundled Typst library without becoming a page.

Run `npm run notes:check` before committing; it catches dangling links,
duplicate slugs, and Typst errors. `npm run build` runs it in strict mode, so a
warning fails the build.

### How it joins the Astro site

wanshi emits complete standalone HTML — it cannot render into an Astro layout.
Integration is therefore four hook files in `notes/`, spliced into every page:

| File | Role |
| --- | --- |
| `import-header.html` | site nav, injected at the top of `<body>` |
| `import-footer.html` | site footer, injected at the end of `<body>` |
| `import-meta.html` | SVG favicon + RSS autodiscovery |
| `import-style.html` | palette bridge + CSS for the injected chrome |

The first three are **generated** by `scripts/gen-wanshi-chrome.ts` from
`src/data/site.ts`, so the nav and footer cannot drift from the rest of the site
— edit `site.ts` or that script, never the HTML. They are committed so that
`cd notes && wanshi serve` works standalone. `import-style.html` is hand-written.

`notes/assets/favicon.ico` is a **symlink** to `public/favicon.ico`; wanshi
follows it and publishes a real file, so the notes carry the site's icon.

Data flows the other way through `wanshi.json`, the metadata index wanshi writes
beside its pages. `src/data/notes.ts` reads it for three consumers:

- the homepage's "recent notes" list (`getNotes()`),
- the RSS feed at `src/pages/rss.xml.ts` (`getNotes()`),
- the sitemap's `customPages` in `astro.config.ts` (`getNotePagePaths()`) —
  necessary because `@astrojs/sitemap` only discovers routes Astro generates,
  and would otherwise drop every note silently.

That is why the build order matters: **wanshi must run before Astro**, which
`npm run build` enforces. `astro.config.ts` is TypeScript (not `.mjs`) so it can
import that loader rather than re-parsing the index.

### Gotchas

- **Run wanshi with `notes/` as the working directory.** It resolves
  `[build].output` relative to the config file but `typst-root` relative to the
  cwd, so `wanshi build --config notes/Wanshi.toml` from the repo root fails to
  find the Typst sources. Every npm script does `cd notes && wanshi …`.
- **wanshi is installed separately** (`cargo install --path .` from a clone) and
  is not an npm dependency. `cargo install` copies the binary — editing the
  wanshi source changes nothing until you reinstall.
- **`public/notes/` is generated and gitignored.** Never edit it; edit
  `notes/trees/`. wanshi keeps `public/notes/assets/` an exact mirror of
  `notes/assets/` and deletes anything else there, so do not put site files in
  it.
- **Creating a new `import-*.html` while `wanshi serve` is running has no
  effect** until you restart — a file that did not exist at startup is not
  watched.
- **`pretty-urls` is on**, so notes are linked as `/notes/welcome`, not
  `/notes/welcome.html`. wanshi still writes flat `.html` files, so both forms
  resolve and no published link ever breaks. Extensionless resolution is *not*
  free, though — it is implemented twice and **both must stay in step**:
  the CloudFront Function (README, deployment section) for production, and the
  `notesDevUrls` Vite plugin in `astro.config.ts` for `npm run dev`. Astro's dev
  server serves `public/` by exact path only, so without the plugin every note
  link 404s locally. `npm run preview` needs neither.
- **Keep dots out of note filenames.** `v1.2.typ` yields `/notes/v1.2`, which
  both rewrites read as a file and pass through unrewritten → 404.
- **Directory indexes work as hubs.** `trees/algebra/index.typ` is published at
  `/notes/algebra/` and becomes the parent of everything beside it, so
  `#children()` on it lists that directory. `noteHref()` in `src/types/note.ts`
  maps the `<dir>/index` slug to the trailing-slash URL to match.
- **RSS** is wanshi's `[publish].rss = false` on purpose. The site publishes one
  feed, at `/rss.xml`, built by Astro. Enabling wanshi's would need an absolute
  `base-url`, which makes every generated link point at production and breaks
  local preview.

## Key conventions

- **Never use "blog" or "posts"** — always "notes" everywhere (URLs, nav, code, copy).
- **A taxon is an arbitrary string.** wanshi imposes no vocabulary — it capitalizes whatever it is given, appends `". "` for display, and puts the bare value in `data-taxon` (which is what `src/data/notes.ts` reads). Anything consuming a taxon must cope with a value it has not seen before; the homepage chip is styled to wrap rather than break the row.
  - **`reference` is the sole exception**, and it is a compiler behaviour, not a convention: `Taxon::is_reference` matches any taxon **starting with** "reference" (or `参考`) and makes the section a citation target, changing how inbound links render. `isReferenceTaxon()` in `src/types/note.ts` mirrors it. Do not use the prefix for anything else.
  - Every other taxon is a label and a sort key with no behaviour attached. There is **no** difference between the taxons wanshi's helpers preset and ones you invent — `#definition(...)` and `"taxon": "definition"` produce the same thing.
  - `COMMON_TAXONS` in `src/types/note.ts` lists the values in use. It is a memory aid, not a schema. Prefer reusing one over coining one, since taxons are only useful as a filter key when consistent — and append to it when you do coin one.
- Nav and footer markup exists twice: `src/components/{Nav,Footer}.astro` for Astro pages, and generated HTML for wanshi pages. Both read `src/data/site.ts`; a *structural* change means updating `scripts/gen-wanshi-chrome.ts` as well.
- Paper titles render in Playfair Display italic.
- Papers and preprints use a `coauthors` field (list collaborators only, omit yourself). Rendered as small muted "with" label + names in ink.
- Nav: `First Last` (last name italic, `--accent`) on left; `about · research · teaching · notes · cv` text-transform lowercase on right.
- Footer: name (Playfair Display, `--muted`) left; email + github + google scholar right.
- CV is a PDF link only — no separate CV page.
- arXiv links on published papers only when the paper also appears elsewhere; preprints use arXiv as primary link.
- Dark mode deferred — keep routing all colors through CSS custom properties regardless. It is no longer the "one-file change" this line used to promise, because wanshi pages carry their own stylesheet; see the survey notes under Future considerations.

## Future considerations

- **Dark mode** — deferred 2026-08-17, not abandoned. Findings from the survey are below, so this does not have to be re-derived.
- `/links` page — curated list of other sites and interests
- ~~Typst → HTML export pipeline~~ — done, via wanshi
- Interactive math components via Astro islands
- Drop `@astrojs/mdx`, `remark-math`, `rehype-katex` and the KaTeX CDN link in `BaseLayout.astro` if no Astro page ever needs math (wanshi notes use MathML and need none)
- Self-host fonts via `notes/import-font.html` + BaseLayout to remove the Google Fonts dependency entirely

### Dark mode — survey notes (deferred 2026-08-17)

**It is two jobs, not one.** The old claim that dark mode is "a one-file change
because all colors are custom properties" was true of the Astro pages and is no
longer true of the site: `/notes/**` are standalone wanshi documents that never
see `global.css`. Both halves need doing, and they need to agree.

**The wanshi half is smaller than it looks.** Measured in `src/include/main.css`:

```
color literals, total     16
  in the :root body block 10   <- the tokens to override
  scattered elsewhere      6   <- 4 are transparent rgba(0,0,0,0) on
                                  theme-option brackets; 2 target Typst
                                  SVG fills (#000000)
prefers-color-scheme        0
data-theme                  0
```

**The hard part already exists.** `src/include/main.js` carries a CSS filter
solver — `invert → sepia → saturate → hue-rotate → brightness → contrast`, with
a loss function — that recolors Typst's black SVG output
(`path.typst-shape[fill="#000000"]`, `.typst-text use[...]`) to match the active
theme, persisted in `localStorage` under `wanshi-theme`. Recoloring rendered SVG
is the thing that usually makes dark mode painful on a Typst site, and it is
already written; it is simply wired to the vestigial theme picker rather than to
a light/dark switch.

**Answer this before estimating.** Does that invert pass re-run when the color
scheme changes, or only on an explicit theme selection? The whole "small job"
read depends on it. If it only fires on theme selection, dark mode needs new
plumbing to trigger it from a `prefers-color-scheme` media query listener, and
is a substantially bigger piece of work.

**Then, in order:** override the ~10 tokens in wanshi behind
`prefers-color-scheme`; clean up the two `#000000` SVG selectors; add matching
dark tokens to `src/styles/global.css`; mirror them in
`notes/import-style.html`, which already hand-bridges `--ink`, `--muted`,
`--accent` and `--accent-hover`. Remember the wanshi side needs
`cargo install --path .` and a forest rebuild — `main.css` and `main.js` are
compiled into the binary, unlike the `import-*.html` hooks.
