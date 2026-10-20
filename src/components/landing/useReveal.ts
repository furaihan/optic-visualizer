import { useLayoutEffect } from 'react';

/**
 * Arrival: a section's parts fade up once, as they enter the window.
 *
 * The rule this follows: an entrance must never be the reason a piece of
 * content is missing. An element is hidden only while it is fully below the
 * viewport — off screen, where hiding it cannot be seen — and only when it
 * is close enough that the reader is about to reach it. Everything else is
 * simply there.
 *
 * Because arming happens below the fold and revealing happens well inside
 * it, there is no band where an element is on screen and hidden at once: a
 * fast scroll or a jump to an anchor shows content, never a blank block.
 *
 * The hiding class is added by script, so a page that never runs script is
 * simply there.
 */
export function useReveal() {
  useLayoutEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.landing .reveal'));
    if (nodes.length === 0) return;

    // How far below the fold an element is armed. Beyond this it is left
    // alone: a page this long should not carry hidden blocks it may never
    // scroll to.
    const ARM_BELOW = 3;

    const show = (el: HTMLElement) => {
      if (!el.classList.contains('is-pending')) return;
      el.classList.remove('is-pending');
      el.classList.add('is-in');
    };

    const arm = (el: HTMLElement) => {
      if (el.classList.contains('is-in') || el.classList.contains('is-pending')) return;
      el.classList.add('is-pending');
    };

    let frame = 0;

    const sweep = () => {
      frame = 0;
      const vh = window.innerHeight;
      const revealLine = vh * 0.88;

      for (const el of nodes) {
        const top = el.getBoundingClientRect().top;

        // On screen, or already scrolled past: it must be readable.
        if (top < revealLine) {
          show(el);
          continue;
        }

        // Fully below the fold, but close: hide it now so the rise is what
        // the reader sees. Still off screen, so this cannot be observed.
        if (top > vh && top < vh * ARM_BELOW) arm(el);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(sweep);
    };

    // First paint: arm what is just below the fold, then bring the opening
    // screen up one frame later, so the page arrives rather than being there.
    const vh0 = window.innerHeight;
    nodes.forEach((el) => {
      const top = el.getBoundingClientRect().top;
      if (top > vh0 * 0.4 && top < vh0 * ARM_BELOW) arm(el);
    });

    frame = requestAnimationFrame(() => {
      frame = 0;
      nodes.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) show(el);
      });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
