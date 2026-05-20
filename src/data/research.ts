import type { ResearchData } from '../types/research';

/**
 * Research publications and talks.
 *
 * To add a paper: append an object to `papers` (published) or `preprints`.
 * To add a talk: append an object to `talks`.
 *
 * Fields marked optional (?) can be omitted.
 * For papers, include `links.arxiv` only if the paper also appears in a journal
 * (not for preprints-only entries — those go in `preprints`).
 * Authors are alphabetical by last name (standard in mathematics).
 * The site owner's entry must match `site.fullName` exactly — it renders as
 * initials + last name (e.g. "P. O'Melveny"); co-authors show in full.
 */
const research: ResearchData = {
  papers: [],
  preprints: [],
  talks: [],
};

export default research;
