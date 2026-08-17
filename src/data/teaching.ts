import type { TeachingEntry } from "../types/teaching";

/**
 * Teaching history.
 *
 * Set `currentCourse` to the active course, or null when not teaching.
 * Append past courses to `pastCourses` in any order — the page sorts them
 * reverse-chronologically by parsing the `term` string automatically.
 * Term order within a year: Winter < Spring < Summer < Fall.
 */

export const currentCourse: TeachingEntry | null = null;

export const currentClassNote =
  "If you are a current student in this course, information for this course is found on Canvas. Use the Ed discussion board to contact the TA's for this course.";

export const pastCourses: TeachingEntry[] = [
  {
    title: "Math 208 — Linear Algebra",
    term: "Spring 2026",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 125 — Calculus with Analytic Geometry II",
    term: "Winter 2026",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 124 — Calculus with Analytic Geometry I",
    term: "Autumn 2025",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 224 — Advanced Multivariable Calculus",
    term: "Summer 2025",
    role: "Instructor",
    institution: "University of Washington",
  },
  {
    title: "Math 208 — Linear Algebra",
    term: "Spring 2025",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 125 — Calculus with Analytic Geometry II",
    term: "Winter 2025",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 126 — Calculus with Analytic Geometry III",
    term: "Autumn 2024",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 124 — Calculus with Analytic Geometry I",
    term: "Summer 2024",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 126 — Calculus with Analytic Geometry III",
    term: "Spring 2024",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 124 — Calculus with Analytic Geometry I",
    term: "Winter 2024",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 124 — Calculus with Analytic Geometry I",
    term: "Autumn 2023",
    role: "TA",
    institution: "University of Washington",
  },
  {
    title: "Math 123 — Mathematics for Elementary Statistics",
    term: "Autumn 2022",
    role: "Instructor",
    institution: "San Francisco State University",
  },
  {
    title: "Math 228 — Calculus I",
    term: "Spring 2023",
    role: "TA",
    institution: "San Francisco State University",
  },
  {
    title: "Math 198 — Prelude to Calculus II",
    term: "Spring 2022",
    role: "Instructor",
    institution: "San Francisco State University",
  },
  {
    title: "Math 197 — Prelude to Calculus I",
    term: "Autumn 2021",
    role: "Instructor",
    institution: "San Francisco State University",
  },
  {
    title: "Math 228 — Calculus I",
    term: "Spring 2021",
    role: "TA",
    institution: "San Francisco State University",
  },
];
