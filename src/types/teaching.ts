export type TeachingRole = 'TA' | 'Instructor';

export interface TeachingEntry {
  title: string;
  /** Term string, e.g. "Spring 2026" or "Fall 2025". Used for display; year and
   *  term name are parsed automatically for reverse-chronological sorting.
   *  Order within a year: Winter=1, Spring=2, Summer=3, Fall=4. */
  term: string;
  role: TeachingRole;
  institution: string;
  /** Optional URL (e.g. Canvas link) — only shown for the current course. */
  url?: string;
}
