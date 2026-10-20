import { useSearch } from '@tanstack/react-router';

import { LandingHero } from '@components/landing/LandingHero';
import { LandingStatement } from '@components/landing/LandingStatement';
import { LandingHowItWorks } from '@components/landing/LandingHowItWorks';
import { LandingShowcase } from '@components/landing/LandingShowcase';
import { LandingFeatures } from '@components/landing/LandingFeatures';
import { LandingModules } from '@components/landing/LandingModules';
import { LandingProof } from '@components/landing/LandingProof';
import { LandingBench } from '@components/landing/LandingBench';
import { LandingFaq } from '@components/landing/LandingFaq';
import { LandingClosing } from '@components/landing/LandingClosing';
import { LandingFooter } from '@components/landing/LandingFooter';
import { useReveal } from '@components/landing/useReveal';

/**
 * The front door.
 *
 * The tool's claim, one live drawing that answers it, and the three things
 * the instrument is made of: what you put in, what it checks, and what it
 * hands back. No hero card, no gradient, no icon stack — the workbench
 * behind this page is a lab sheet, so the page that opens it is set the
 * same way.
 */
export function HomePage() {
  const search = useSearch({ from: '/' });
  const lang = search.lang;

  useReveal();

  return (
    <div className="landing min-h-full bg-sheet-ground text-sheet-ink">
      <LandingHero lang={lang} />

      <LandingStatement lang={lang} />

      <div className="flex flex-col gap-24 sm:gap-32">
        <LandingHowItWorks lang={lang} />
        <LandingShowcase lang={lang} />
        <LandingFeatures lang={lang} />
        <LandingModules lang={lang} />
        <LandingProof lang={lang} />
        <LandingBench lang={lang} />
        <LandingFaq lang={lang} />
      </div>

      <LandingClosing lang={lang} />
      <LandingFooter lang={lang} />
    </div>
  );
}
