# Patrick O'Melveny — Personal Website

Personal academic website built with [Astro](https://astro.build). Deployed as a static site on AWS S3 + CloudFront.

---

## What is where

```
src/
  data/
    site.ts          ← Global personal info: name, email, GitHub, Scholar, CV URL
    research.ts      ← All publications and talks (papers, preprints, talks arrays)

  content/
    notes/           ← One .mdx file per note — filename becomes the URL slug
  content.config.ts  ← Zod schema for note frontmatter (Astro 6 format)

  pages/
    index.astro      ← Landing page — bio, research interests, recent notes
    about.astro      ← About page — personal statement, research interests, CV link
    research.astro   ← Research page — reads from src/data/research.ts
    teaching.astro   ← Teaching page
    notes/
      index.astro    ← Notes index — lists all notes grouped by year
      [slug].astro   ← Individual note page — renders MDX from content collection

  components/
    BaseLayout.astro ← HTML shell: fonts, KaTeX CSS, meta tags
    Nav.astro        ← Top navigation bar (reads name from site.ts)
    Footer.astro     ← Footer with email/GitHub/Scholar links (reads from site.ts)
    NoteLayout.astro ← Layout for individual notes: header, sidenote CSS + JS
    Paper.astro      ← Single paper/preprint entry with abstract toggle
    Talk.astro       ← Single talk entry
    Sidenote.astro   ← Sidenote block used inside note MDX files
    SidenoteRef.astro← Inline superscript reference marker for sidenotes

  scripts/
    sidenotes.ts     ← Client-side: positions sidenotes beside their references
    abstracts.ts     ← Client-side: toggles abstract open/closed on research page

  styles/
    global.css       ← CSS custom properties (color tokens, font variables, layout)

  types/
    note.ts          ← TypeScript types for note frontmatter
    research.ts      ← TypeScript interfaces for papers, preprints, talks
    teaching.ts      ← TypeScript interface for teaching entries

public/              ← Static assets served as-is: photo.jpg, cv.pdf, favicon
```

---

## Common tasks

### Update personal info

Edit **`src/data/site.ts`** — name, email, GitHub, Google Scholar URL, CV path. This file is imported by Nav and Footer so a change here propagates everywhere.

### Update page content (bio, research statement, etc.)

Each page has a `// ── Page content ──` block near the top of its `---` frontmatter. Everything inside that block is a plain `const` — edit the strings directly.

### Update the teaching page

All teaching data lives in the `// ── Page content ──` block at the top of **`src/pages/teaching.astro`**.

**Current course** — set `currentCourse` to an object (or `null` when not teaching):

```ts
const currentCourse: TeachingEntry = {
  title: 'Math 308 — Matrix Algebra',
  term: 'Spring 2026',
  year: 2026,
  termOrder: 2,       // controls sort order, see below
  role: 'TA',         // 'TA' or 'Instructor'
  institution: 'University of Washington',
  url: 'https://canvas.uw.edu/courses/...',  // optional — omit if no link
};
```

When `url` is set the Canvas note renders as a link; without it, it's plain text. Edit `canvasNote` to change the message.

**Past courses** — append objects to `pastCourses`. The list sorts automatically, so order doesn't matter:

```ts
const pastCourses: TeachingEntry[] = [
  {
    title: 'Math 407 — Linear Programming',
    term: 'Autumn 2025',
    year: 2025,
    termOrder: 3,
    role: 'TA',
    institution: 'University of Washington',
  },
  {
    title: 'Math 308 — Matrix Algebra',
    term: 'Spring 2025',
    year: 2025,
    termOrder: 2,
    role: 'TA',
    institution: 'University of Washington',
  },
];
```

`termOrder` is only used for sorting within a year — use a consistent scheme, e.g. Winter=1, Spring=2, Summer=3, Autumn=4. The `term` string is what actually displays.

### Add a publication or talk

Open **`src/data/research.ts`** and append an object to `papers`, `preprints`, or `talks`. The page re-renders automatically on the next build — no HTML changes needed.

Authors are listed **alphabetically by last name**. Your own entry must match `site.fullName` exactly — it will display as bare initials (e.g. `PVO`); co-authors display as full names.

Optional fields can be omitted entirely. The full file shape with one entry in each list:

```ts
const research: ResearchData = {
  papers: [
    {
      title: "Facets of the spanning tree polytope",
      authors: ["Patrick O'Melveny", "Jane Smith"],  // alphabetical by last name
      year: 2025,
      venue: "Journal of Combinatorial Theory, Series B",
      volume: 168,         // optional
      pages: "214–239",    // optional — use an en-dash, not a hyphen
      tags: ["polyhedral combinatorics", "network design"],
      links: {
        journal: "https://doi.org/...",
        pdf: "/papers/spanning-tree.pdf",  // optional, if you host a version
        arxiv: "https://arxiv.org/abs/...",
      },
      abstract: "We characterize a new family of facet-defining inequalities...",
    },
  ],

  preprints: [
    {
      title: "On the integrality gap of the subtour LP",
      authors: ["Patrick O'Melveny", "Jane Smith"],
      year: 2025,
      tags: ["combinatorial optimization", "TSP"],
      links: {
        arxiv: "https://arxiv.org/abs/...",
        pdf: "/papers/subtour-gap.pdf",  // optional, if you host a version
      },
      abstract: "We construct a new family of TSP instances...",
    },
  ],

  talks: [
    {
      title: "Polyhedral methods in combinatorial optimization",
      venue: "SIAM Conference on Optimization",
      location: "Seattle, WA",          // optional
      year: 2025,
      month: "May",                     // optional
      links: {
        slides: "/slides/siam-opt-2025.pdf",  // optional
      },
    },
  ],
};
```

### Write a note

Create a new `.mdx` file in `src/content/notes/`. The filename (without extension) becomes the URL slug — e.g. `matching-polytope.mdx` → `/notes/matching-polytope`.

Complete minimal file:

```mdx
---
title: "Why is the matching polytope half-integral?"
date: 2026-06-01
tag: exposition
description: "A look at what LP relaxations know about matchings."
subtitle: "Optional italic subtitle — omit this line if not needed."
---

import Sidenote from '../../components/Sidenote.astro';
import SidenoteRef from '../../components/SidenoteRef.astro';

The matching polytope is the convex hull of all incidence vectors of matchings
in a graph $G = (V, E)$.<SidenoteRef n={1}/> Understanding its facet structure
is central to polyhedral combinatorics.

<Sidenote n={1}>
  For a full treatment see Schrijver, *Combinatorial Optimization*, ch. 24–25.
</Sidenote>

The natural LP relaxation is defined by

$$
x_e \geq 0 \quad \forall\, e \in E, \qquad \sum_{e \ni v} x_e \leq 1 \quad \forall\, v \in V.
$$

Every vertex of this polytope is half-integral.<SidenoteRef n={2}/>

<Sidenote n={2}>
  This follows from total half-integrality of the constraint matrix.
</Sidenote>
```

**Frontmatter fields:**
- `date` — `YYYY-MM-DD`, no quotes, so Astro parses it as a date object
- `tag` — exactly one of: `note` · `exposition` · `problem` · `reading`
- `description` — one sentence; shown in the index list and used as the page meta description
- `subtitle` — optional italic line shown below the title on the note page

**Sidenotes:** The `n` value is just a label pairing `<SidenoteRef>` with its `<Sidenote>` — it doesn't have to be sequential, but each pair must match. Sidenotes appear in the right margin on wide screens and inline in the text on narrow screens.

**Math:** Standard LaTeX — `$...$` for inline, `$$...$$` for display.

---

## Development

```sh
npm run dev      # start local dev server at http://localhost:4321
npm run build    # production build → dist/
npm run preview  # serve the dist/ build locally to check before deploying
```

Astro rebuilds on every file save during `dev`. The production build is fully static — just files in `dist/`.

---

## Deployment (AWS)

> **Status:** The infrastructure below still needs to be created. This section describes the intended workflow once the S3 bucket and CloudFront distribution exist.

### One-time setup (to do)

1. Create an S3 bucket (e.g. `pvomelveny-website`) with static website hosting **disabled** — CloudFront will serve the files directly, not S3.
2. Create a CloudFront distribution pointing at the S3 bucket. Use an Origin Access Control (OAC) so the bucket stays private and only CloudFront can read from it.
3. Attach a TLS certificate via ACM for the custom domain.
4. Create an IAM user or role with `s3:PutObject` + `s3:DeleteObject` on the bucket and `cloudfront:CreateInvalidation` on the distribution. Store the credentials as GitHub Actions secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID`.

### Manual deploy (once setup is done)

```sh
npm run build
aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
aws cloudfront create-invalidation \
  --distribution-id YOUR-DISTRIBUTION-ID \
  --paths "/*"
```

`--delete` removes stale files from S3. The CloudFront invalidation flushes the CDN cache so visitors see the new version immediately (free up to 1,000 path invalidations/month).

### Automated deploy via GitHub Actions (to do)

Create `.github/workflows/deploy.yml` — runs on every push to `main`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }} --delete
      - run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

With this in place, pushing to `main` builds and deploys the site automatically with no manual steps.
