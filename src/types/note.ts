export type NoteTag = 'note' | 'exposition' | 'problem' | 'reading';

export interface NoteFrontmatter {
  title: string;
  date: Date;
  tag: NoteTag;
  description: string;
  subtitle?: string;
}
