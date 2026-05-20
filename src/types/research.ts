export interface PaperLinks {
  journal?: string;
  pdf?: string;
  arxiv?: string;
}

export interface Paper {
  title: string;
  /** Co-authors only — omit yourself. Rendered as "with Name, Name". */
  coauthors?: string[];
  year: number;
  /** Journal or conference name, rendered italic. */
  venue: string;
  volume?: number;
  /** Page range string, e.g. "214–239". Use an en-dash. */
  pages?: string;
  tags: string[];
  links: PaperLinks;
  abstract: string;
}

export interface PreprintLinks {
  arxiv?: string;
  pdf?: string;
}

export interface Preprint {
  title: string;
  /** Co-authors only — omit yourself. Rendered as "with Name, Name". */
  coauthors?: string[];
  year: number;
  tags: string[];
  links: PreprintLinks;
  abstract: string;
}

export interface TalkLinks {
  slides?: string;
}

export interface Talk {
  title: string;
  venue: string;
  location?: string;
  year: number;
  month?: string;
  links?: TalkLinks;
}

export interface ResearchData {
  papers: Paper[];
  preprints: Preprint[];
  talks: Talk[];
}
