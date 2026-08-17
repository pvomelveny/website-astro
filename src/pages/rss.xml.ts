import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { site } from "../data/site";
import { getNotes } from "../data/notes";

/**
 * The site's single RSS feed, covering the notes forest.
 *
 * Items come from `wanshi.json` rather than from wanshi's own `feed.xml`, which
 * is switched off (see `[publish]` in notes/Wanshi.toml). wanshi's feed would
 * require `base-url` to be an absolute URL — making every generated link point
 * at production and breaking local preview — and would sit at a second address,
 * /notes/feed.xml, competing with this one. Building it here keeps the feed at
 * the URL readers already have and lets Astro supply absolute links from the
 * `site` in astro.config.ts.
 */
export async function GET(context: APIContext) {
  const notes = getNotes();

  return rss({
    title: site.rssName,
    description: "Notes on mathematics and related topics.",
    site: context.site!,
    // Required. @astrojs/rss appends a trailing slash to item links by default,
    // which would turn "/notes/welcome" into "/notes/welcome/" — a directory
    // URL. The notes are flat files (welcome.html), so that form resolves to
    // "/notes/welcome/index.html" and 404s for every subscriber.
    trailingSlash: false,
    // getNotes() already sorts newest first.
    items: notes.map((note) => ({
      title: note.title,
      description: note.description,
      pubDate: note.date,
      link: note.href,
    })),
    customData: `<language>en-us</language>`,
  });
}
