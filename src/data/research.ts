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
  additionalWriting: [
    {
      title: "A Volumetric Proof of the Log-Concavity of the Characteristic Polynomial of Matroids",
      subtitle: "M.S. Thesis, San Francisco State University",
      year: 2023,
      links: {
        link: "https://scholarworks.calstate.edu/concern/theses/5999nb27q",
      },
      abstract:
        "This thesis presents a novel proof of the Heron–Rota–Welsh conjecture using a volume theoretic approach. Originating in the 1950's, the conjecture proposes that the coefficients of the characteristic polynomial of a matroid exhibit the property of log-concavity. A complete proof for all matroids was found only in 2018, when Jun Huh, in collaboration with Karim Adiprasito and Eric Katz, achieved this milestone by developing the theory of combinatorial Hodge theory. We review the link between the combinatorial data of matroids, algebraic objects known as Chow rings, and geometric objects called Bergman fans, and then outline the recent work of Dustin Ross, Anastasia Nathanson, Lauren Nowak, and the author on the theory of normal complexes of fans and their volumetric properties. Our main result stems from showing that the Bergman fans of matroids meet criteria such that the (extended) mixed volumes of their normal complexes obey the Alexandrov–Fenchel inequality, yielding log-concave sequences. We hope this demonstrates that the theory of normal complexes is a tool able to tackle modern problems in mathematics.",
    },
  ],
};

export default research;
