# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal academic website for a researcher. Built with Astro, deployed to AWS S3 + CloudFront via GitHub Actions.

## Commands

```sh
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

Deployment: manual from the local machine — `npm run build` → `aws s3 sync dist/ s3://<bucket> --delete` → `aws cloudfront create-invalidation`. A GitHub Actions workflow is planned (see README) but not yet wired up; no `.github/workflows/` exists.

## Code style

- All script logic is TypeScript — use `.ts` files and Astro's built-in TS processing. Never write plain `.js` for anything with logic.
- Components should be modular and single-responsibility. Prefer smaller focused components over monolithic pages.
- Add JSDoc comments to non-trivial TypeScript functions and to component props interfaces.
- Design for extensibility: data-driven where possible (YAML collections), props-driven components.

## Architecture

```
src/
  pages/          # index.astro, about.astro, research.astro, teaching.astro
  pages/notes/    # index.astro + [slug].astro
  content/        # notes/ as .mdx files (Astro content collection)
  content.config.ts  # collection schema using glob loader (Astro 6)
  data/           # research.ts — typed research publications and talks
  components/     # Nav, Footer, BaseLayout, NoteLayout, Paper, Talk, ...
  styles/         # global.css (design tokens + resets)
  types/          # shared TypeScript interfaces (Research, Note, etc.)
  scripts/        # client-side TS (sidenote alignment, abstract toggles)
public/           # CV PDF, headshot photo
```

**`src/data/site.ts`** holds all global personal info: `firstName`, `lastName`, `fullName`, `email`, `github`, `scholar`, `cvUrl`. Nav and Footer import this directly — update once, reflects everywhere.

**Page-specific content** (bio, role, department, research interests, intro paragraphs) lives as named `const` variables in the frontmatter (`---` block) at the top of each page file. Look for the `// ── Page content ──` comment block. This is the intended editing point for content changes.

**Research page** is data-driven from `src/data/research.ts` — a typed TypeScript file. Adding a publication = appending an object to the `papers`, `preprints`, or `talks` array. See `src/types/research.ts` for the full schema. (YAML was considered but Astro/Vite doesn't support YAML imports natively.)

**Astro 6 API notes** (important — these differ from older Astro docs):
- Content collection config lives at `src/content.config.ts` (not `src/content/config.ts`), uses `glob` loader from `astro/loaders`
- Render MDX entries with `render(entry)` imported from `astro:content` — NOT `entry.render()`
- Collection entries have `id` (file path with extension, e.g. `example.mdx`), not `slug` — strip extension for URLs: `id.replace(/\.mdx?$/, '')`

**Notes** use Astro content collections (`src/content/notes/`) with `.mdx` files. Sidenotes are authored using two MDX components:
- `<SidenoteRef n={1}/>` — inline marker in body text (renders as a superscript number)
- `<Sidenote n={1}>text</Sidenote>` — sidenote block placed anywhere in the file (rendered in the side column on wide screens, or as footnotes at the bottom on narrow screens)

On wide screens (>680px): two-column grid with 200px sidenote column. On narrow screens: single column, footnote section at page bottom. Sidenote vertical alignment is a client-side TypeScript module in `NoteLayout` — positions notes absolutely by matching `data-sn` attributes between refs and sidenote blocks, clamps to prevent overlap, falls back gracefully without JS.

The abstract toggle on research items is a small client-side TS module.

**About page** content is hardcoded directly in `about.astro` (not a separate content file).

## Design system

All design tokens (colors, fonts, layout constants) live as CSS custom properties in **`src/styles/global.css`** under `:root`. That file is the source of truth — read it directly rather than relying on values copied here.

Tokens defined there:

- Colors: `--accent`, `--accent-hover`, `--bg`, `--surface`, `--border`, `--muted`, `--ink` — a warm cream/maroon palette.
- Fonts: `--font-display` (Playfair Display, 400/500 + italic 400) and `--font-body` (Source Serif 4, opsz 8–60, weights 300 + 400). Loaded via Google Fonts in `BaseLayout.astro`. Math: KaTeX via `remark-math` + `rehype-katex`.
- Layout: `--page-max` (960px), `--content-max` (900px), `--notes-max` (700px), `--pad-h` (3rem desktop, 1.5rem ≤680px), `--breakpoint` (680px).

When adding new tokens, define them in `global.css` so dark mode remains a one-file change later.

## Key conventions

- **Never use "blog" or "posts"** — always "notes" everywhere (URLs, nav, code, copy).
- Note tags are exactly four values: `note`, `exposition`, `problem`, `reading`.
- Paper titles render in Playfair Display italic.
- Papers and preprints use a `coauthors` field (list collaborators only, omit yourself). Rendered as small muted "with" label + names in ink.
- Nav: `First Last` (last name italic, `--accent`) on left; `about · research · teaching · notes · cv` text-transform lowercase on right.
- Footer: name (Playfair Display, `--muted`) left; email + github + google scholar right.
- CV is a PDF link only — no separate CV page.
- arXiv links on published papers only when the paper also appears elsewhere; preprints use arXiv as primary link.
- Dark mode deferred — all colors must go through CSS custom properties so it's a one-file change later.

## Future considerations

- Dark mode — straightforward once deferred; all colors already go through CSS custom properties
- `/links` page — curated list of other sites and interests
- Typst → HTML export pipeline once the feature stabilizes
- Interactive math components via Astro islands
