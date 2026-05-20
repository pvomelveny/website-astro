import type { TeachingEntry } from '../types/teaching';

/**
 * Teaching history.
 *
 * Set `currentCourse` to the active course, or null when not teaching.
 * Append past courses to `pastCourses` in any order — the page sorts them
 * reverse-chronologically by parsing the `term` string automatically.
 * Term order within a year: Winter < Spring < Summer < Fall.
 */

export const currentCourse: TeachingEntry | null = null;

export const canvasNote = 'Course materials and announcements are on Canvas.';

export const pastCourses: TeachingEntry[] = [];
