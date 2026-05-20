# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal academic website for a researcher. Built with Astro, deployed to AWS S3 + CloudFront via GitHub Actions. `DESIGN.md` is the authoritative design spec; `mockups.html` contains interactive HTML mockups with exact CSS.

## Commands

```sh
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview production build locally
```

Deployment: GitHub Actions → `astro build` → `aws s3 sync dist/ s3://<bucket>` → CloudFront invalidation.

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

| Token | Value |
|---|---|
| `--accent` | `#822727` |
| `--accent-hover` | `#6B1F1F` |
| `--bg` | `#F7F2E7` |
| `--surface` | `#EDE4CE` |
| `--border` | `#BFA882` |
| `--muted` | `#6B5744` |
| `--ink` | `#2E1F14` |

Fonts (loaded via Google Fonts): **Playfair Display** (400, 500, italic 400) for display/headings; **Source Serif 4** (opsz 8–60, weight 300 + 400) for body text. Math: KaTeX via `remark-math` + `rehype-katex`.

**Layout constants**: page max-width 960px; content padding 3rem horizontal (desktop), 1.5rem (≤680px); notes/about max-width 700px; research/landing content max-width 900px. Mobile breakpoint: 680px.

## Key conventions

- **Never use "blog" or "posts"** — always "notes" everywhere (URLs, nav, code, copy).
- Note tags are exactly four values: `note`, `exposition`, `problem`, `reading`.
- Paper titles render in Playfair Display italic. The author's own name is emphasized (`<em>`) so it can be styled differently from co-authors.
- Nav: `First Last` (last name italic, `--accent`) on left; `about · research · teaching · notes · cv` text-transform lowercase on right.
- Footer: name (Playfair Display, `--muted`) left; email + github + google scholar right.
- CV is a PDF link only — no separate CV page.
- arXiv links on published papers only when the paper also appears elsewhere; preprints use arXiv as primary link.
- Authors are listed alphabetically by last name (standard in mathematics). The site owner's entry must match `site.fullName` exactly — `Paper.astro` detects this by string comparison, displays the owner as initials + last name (e.g. "P. O'Melveny") in ink color, and co-authors as full names in muted color.
- Dark mode deferred — all colors must go through CSS custom properties so it's a one-file change later.
