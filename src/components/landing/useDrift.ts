import { useLayoutEffect, useRef } from 'react';

/**
 * The drawing drifts against the scroll.
 *
 * One element on the page moves at a slightly different rate from the page
 * itself, which is what makes the first screen read as a drawing board rather
 * than a screenshot. Transform only, a few pixels either way, and nothing at
 * all when motion is reduced.
 */
export function useDrift<T extends HTMLElement>(amount = 18) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;

    const apply = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // Only while the element is anywhere near the screen.
      if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) return;

      // 0 when the element's top is at the fold, 1 when it is a screen up.
      const progress = Math.min(1, Math.max(0, -rect.top / vh + 0.15));
      el.style.transform = `translate3d(0, ${(progress * amount).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
      el.style.transform = '';
    };
  }, [amount]);

  return ref;
}
