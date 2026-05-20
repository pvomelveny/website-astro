export type TeachingRole = 'TA' | 'Instructor';

export interface TeachingEntry {
  title: string;
  /** Term string, e.g. "Autumn 2025" or "Spring 2026". Used for display and sort order. */
  term: string;
  /** Academic year number — used to sort entries reverse-chronologically. */
  year: number;
  /** Numeric term order within a year for sorting: higher = later in the year. */
  termOrder: number;
  role: TeachingRole;
  institution: string;
  /** Optional URL (e.g. course page or Canvas) — only used for the current course. */
  url?: string;
}
