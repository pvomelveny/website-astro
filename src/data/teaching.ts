import type { TeachingEntry } from '../types/teaching';

/**
 * Teaching history.
 *
 * Set `currentCourse` to the active course, or null when not teaching.
 * Append past courses to `pastCourses` in any order — the page sorts them
 * reverse-chronologically by year then termOrder.
 *
 * termOrder: use a consistent scheme within a year so sorting is correct,
 * e.g. Winter=1, Spring=2, Summer=3, Autumn=4.
 */

export const currentCourse: TeachingEntry | null = null;

export const canvasNote = 'Course materials and announcements are on Canvas.';

export const pastCourses: TeachingEntry[] = [];
