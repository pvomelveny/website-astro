export type NoteTag = 'note' | 'exposition' | 'problem' | 'reading';

export interface NoteFrontmatter {
  title: string;
  date: Date;
  tag: NoteTag;
  description: string;
  subtitle?: string;
}

/**
 * Build the public URL for a note from its content-collection `id`.
 * Astro 6's glob loader uses the filename (including `.mdx`) as the id —
 * strip the extension so `welcome.mdx` becomes `/notes/welcome`.
 */
export function noteHref(id: string): string {
  return `/notes/${id.replace(/\.mdx?$/, '')}`;
}
