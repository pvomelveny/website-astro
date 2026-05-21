/**
 * Wires up the "± abstract" toggle buttons on the research page.
 * Each button sits inside a `.paper` or `.writing` element that also contains an `.abstract` div.
 */
export function initAbstractToggles(): void {
  document
    .querySelectorAll<HTMLButtonElement>('.abstract-toggle')
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const abstract = btn
          .closest('.paper, .writing')
          ?.querySelector<HTMLElement>('.abstract');
        if (!abstract) return;

        const isOpen = abstract.classList.toggle('open');
        btn.textContent = isOpen ? '− abstract' : '+ abstract';
      });
    });
}
