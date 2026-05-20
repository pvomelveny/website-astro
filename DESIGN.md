# Personal Academic Website — Design Document
_Draft v5 · May 2026_

---

## Goals

A personal academic landing page for researchers, collaborators, and prospective
students/employers. Human, not a CV dump. A home base that can grow.

---

## Technical decisions

| | |
|---|---|
| SSG | Astro — migrating from 11ty |
| Math rendering | KaTeX via remark-math + rehype-katex |
| Hosting | AWS S3 + CloudFront |
| Deploy | GitHub Actions → build → sync to S3 |
| Dark mode | Deferred |
| Typst/HTML | Revisit in 6–12 months when HTML export matures |

---

## Design decisions

| | |
|---|---|
| Aesthetic | Clean minimal with typographic character |
| Accent | `#822727` — dark red |
| Page bg | `#F7F2E7` — parchment |
| Surface | `#EDE4CE` |
| Border | `#BFA882` |
| Muted text | `#6B5744` |
| Ink | `#2E1F14` — walnut |
| Display font | Playfair Display |
| Body font | Source Serif 4 (weight 300) |
| Math font | KaTeX Computer Modern |
| Photo | Yes, on landing page |
| CV | PDF link only |
| Terminology | "Notes" everywhere — never "blog" or "posts" |

---

## Site structure

### / — Landing page
Photo, name in nav (last name italic + accent), role, bio, research preview,
recent notes. No large name heading in the body — nav is sufficient.

### /about — About
Personal statement, research interests in own words, CV (PDF link).

### /research — Research
Papers, preprints, talks. YAML-driven lists. Abstract toggle (small button),
tags, arXiv link where applicable (only when also published elsewhere).

### /teaching — Teaching
Courses taught/TA'd, materials, optional teaching philosophy.

### /notes — Notes index
Short intro paragraph, then chronological list grouped by year.
Each entry: title, date, tag, one-line description.

### /notes/[slug] — Individual note
Full text with sidenotes. See layout details below.

### /links — Links (future)
Curated list of other online presences and interests.

---

## Notes layout

- Nav link, URL, page title, and all copy use "notes" — never "blog"
- Index at `/notes` — intro + chronological list grouped by year
- Individual notes at `/notes/[slug]`
- **Wide screens:** two-column grid — main text left, 200px sidenote column right,
  text left-aligned
- **Narrow screens:** single column, text centered, footnotes at bottom
- Sidenote references: superscript numbers in accent color
- Sidenote text: 12px, muted (`#6B5744`), left border rule
- **Vertical alignment:** vanilla JS in an Astro `<script>` tag scoped to the note
  layout component. On load and resize: finds each sidenote's reference `offsetTop`,
  positions notes absolutely, clamps to prevent overlap. Falls back to natural
  document flow if JS unavailable.
- Tags: `note` · `exposition` · `problem` · `reading`

---

## Research page data model

Content collections in `src/content/research.yaml`:

```yaml
papers:
  - title: "..."
    authors: ["Your Name", "Coauthor"]
    year: 2024
    venue: "Journal Name"
    volume: 168
    pages: "214–239"
    tags: [polyhedral combinatorics, network design]
    links:
      journal: "https://..."
      pdf: "https://..."
      arxiv: "https://..."   # only if also published elsewhere
    abstract: "..."

preprints:
  - title: "..."
    authors: ["Your Name", "Coauthor"]
    year: 2025
    tags: [combinatorial optimization]
    links:
      arxiv: "https://..."
      pdf: "https://..."
    abstract: "..."

talks:
  - title: "..."
    venue: "Conference Name"
    location: "City, Country"
    year: 2025
    month: "May"
    links:
      slides: "https://..."
```

Single Astro component loops over each list to render. Adding a paper =
appending a YAML entry, no HTML changes needed.

---

## Nav structure

```
Your Name (last name italic, accent color)    about · research · teaching · notes · cv
```

Footer: name (left) · email · github · google scholar (right)

---

## Future considerations

- Typst → HTML export pipeline once the feature stabilizes
- Dark mode — straightforward to add with CSS custom properties
- /links page connecting to other personal sites
- Interactive math components via Astro islands
