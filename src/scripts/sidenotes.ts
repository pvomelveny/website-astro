/**
 * Vertically aligns sidenotes with their inline reference markers.
 *
 * On wide screens (>680px):
 *   - Adds `.js-sidenotes` to `.note-content`, switching sidenotes from
 *     CSS float (no-JS fallback) to position:absolute.
 *   - For each `.sn-ref[data-sn]`, finds the matching `.sidenote[data-sn]`
 *     and sets its `top` so it sits beside the reference, clamping each
 *     note below the previous to prevent overlap.
 *   - Expands `.note-content` padding-right to reserve the side column.
 *   - Sets `minHeight` on the container so it always wraps the tallest
 *     sidenote — preventing the footer from overlapping a long side column.
 *
 * On narrow screens (≤680px): no-op — sidenotes appear inline via CSS.
 *
 * Column width and gap are read from the `--sn-col-width` and `--sn-col-gap`
 * custom properties on `.note-content` (see NoteLayout.astro) so the CSS
 * rules and this script always agree.
 *
 * Safe to call multiple times (e.g., on resize). Resets state before
 * recalculating so the output is always consistent.
 */
export function alignSidenotes(): void {
  const container = document.querySelector<HTMLElement>('.note-content');
  if (!container) return;

  const NOTE_GAP = 16; // vertical gap between stacked sidenotes

  if (window.innerWidth <= 680) {
    // Restore natural flow on narrow screens
    container.classList.remove('js-sidenotes');
    container.style.paddingRight = '';
    container.style.minHeight = '';
    container.querySelectorAll<HTMLElement>('.sidenote[data-sn]').forEach((note) => {
      note.style.top = '';
      note.style.right = '';
    });
    return;
  }

  // Resolve column geometry from CSS custom properties — see NoteLayout.astro.
  const styles = getComputedStyle(container);
  const COLUMN_WIDTH = parseCssLength(styles.getPropertyValue('--sn-col-width'), 200);
  const GAP = parseCssLength(styles.getPropertyValue('--sn-col-gap'), 48);

  // Reserve the side column in the content area
  container.classList.add('js-sidenotes');
  container.style.paddingRight = `${COLUMN_WIDTH + GAP}px`;
  container.style.position = 'relative';

  const notes = container.querySelectorAll<HTMLElement>('.sidenote[data-sn]');
  let floor = 0;

  notes.forEach((note) => {
    const id = note.dataset.sn;
    const ref = container.querySelector<HTMLElement>(`.sn-ref[data-sn="${id}"]`);
    if (!ref) return;

    // Position relative to container top (accounting for scroll)
    const containerTop = container.getBoundingClientRect().top;
    const refTop = ref.getBoundingClientRect().top - containerTop + container.scrollTop;

    const top = Math.max(floor, refTop);
    note.style.top = `${top}px`;
    note.style.right = '0';

    floor = top + note.offsetHeight + NOTE_GAP;
  });

  // Expand the container to the bottom of the last sidenote so the footer
  // always clears the side column regardless of main text length.
  container.style.minHeight = `${floor - NOTE_GAP}px`;
}

/**
 * Resolve a CSS length string (e.g. "200px", "3rem") to pixels by letting
 * the browser do the work. Returns `fallback` if the value is empty or
 * resolves to a non-positive number.
 */
function parseCssLength(value: string, fallback: number): number {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const probe = document.createElement('div');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  probe.style.width = trimmed;
  document.body.appendChild(probe);
  const px = probe.offsetWidth;
  document.body.removeChild(probe);
  return px > 0 ? px : fallback;
}
