export interface PaperLinks {
  journal?: string;
  pdf?: string;
  arxiv?: string;
  /** Generic link, e.g. a library catalog entry. */
  link?: string;
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
  /** Generic link, e.g. a library catalog entry. */
  link?: string;
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
  year: number;
  month: number; // 1–12
  links?: TalkLinks;
}

export interface WritingLinks {
  pdf?: string;
  link?: string;
}

export interface Writing {
  title: string;
  /** Short descriptor shown below the title, e.g. "M.S. Thesis, San Francisco State University" */
  subtitle: string;
  year: number;
  coauthors?: string[];
  links: WritingLinks;
  abstract?: string;
}

export interface ResearchData {
  papers: Paper[];
  preprints: Preprint[];
  talks: Talk[];
  additionalWriting: Writing[];
}
