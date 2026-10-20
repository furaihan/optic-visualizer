import { useLayoutEffect } from 'react';

/**
 * Arrival: a section's parts fade up once, as they enter the window.
 *
 * The class that arms this is added by script, so a page that never runs
 * script is simply there — nothing is hidden behind an animation that failed.
 */
export function useReveal() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('js-reveal');

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.landing .reveal'));
    if (nodes.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.05 },
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);
}
