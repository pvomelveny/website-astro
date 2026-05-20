import type { ResearchData } from "../types/research";

/**
 * Research publications and talks.
 *
 * To add a paper: append an object to `papers` (published) or `preprints`.
 * To add a talk: append an object to `talks`.
 *
 * Fields marked optional (?) can be omitted.
 * For papers, include `links.arxiv` only if the paper also appears in a journal
 * (not for preprints-only entries — those go in `preprints`).
 * `coauthors` lists collaborators only — omit yourself.
 */
const research: ResearchData = {
  papers: [
    {
      title: "Mixed volumes of normal complexes",
      coauthors: ["Lauren Nowak", "Dustin Ross"],
      year: 2024,
      venue: "Discrete and Computational Geometry",
      volume: 74,
      pages: "135–176",
      tags: ["combinatorics", "algebraic geometry"],
      links: {
        journal: "https://link.springer.com/article/10.1007/s00454-024-00662-w",
        arxiv: "https://arxiv.org/abs/2301.05278",
      },
      abstract:
        "Normal complexes are orthogonal truncations of polyhedral fans. In this paper, we develop the study of mixed volumes for normal complexes. Our main result is a sufficiency condition that ensures when the mixed volumes of normal complexes associated to a given fan satisfy the Alexandrov-Fenchel inequalities. By specializing to Bergman fans of matroids, we give a new proof of the Heron-Rota-Welsh Conjecture as a consequence of the Alexandrov-Fenchel inequalities for normal complexes.",
    },
  ],
  preprints: [],
  talks: [],
};

export default research;
