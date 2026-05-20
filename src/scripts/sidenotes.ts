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
 * Safe to call multiple times (e.g., on resize). Resets state before
 * recalculating so the output is always consistent.
 */
export function alignSidenotes(): void {
  const container = document.querySelector<HTMLElement>('.note-content');
  if (!container) return;

  const COLUMN_WIDTH = 200;
  const GAP = 48; // 3rem at default font size
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
