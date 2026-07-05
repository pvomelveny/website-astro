import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";
import { site } from "../data/site";

export async function GET(context: APIContext) {
  const notes = await getCollection("notes");

  return rss({
    title: `${site.rssName}`,
    description: "Notes on mathematics and related topics.",
    site: context.site!,
    items: notes
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((note) => ({
        title: note.data.title,
        description: note.data.description,
        pubDate: note.data.date,
        link: `/notes/${note.id.replace(/\.mdx?$/, "")}/`,
      })),
    customData: `<language>en-us</language>`,
  });
}
