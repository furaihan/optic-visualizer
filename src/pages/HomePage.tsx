import { useSearch } from '@tanstack/react-router';
import { CrossLanding } from '@components/landing/CrossLanding';

/**
 * The front door.
 *
 * The tool's claim, one live drawing that answers it, and the three calls the
 * instrument makes. No hero card, no gradient, no icon stack: the page is set
 * on the optical cross the drawing is measured from.
 */
export function HomePage() {
  const search = useSearch({ from: '/' });

  return <CrossLanding lang={search.lang} />;
}
