import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    // Frontmatter date must be YYYY-MM-DD (no quotes) so Astro parses it as a Date object.
    date: z.date(),
    // The four canonical tag values — used for display labels and filtering.
    tag: z.enum(['note', 'exposition', 'problem', 'reading']),
    /** One-line description shown in the notes index and as the page meta description. */
    description: z.string(),
    /** Optional italic subtitle shown below the title on the note page. */
    subtitle: z.string().optional(),
  }),
});

export const collections = { notes };
