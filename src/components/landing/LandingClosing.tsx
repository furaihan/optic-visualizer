import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import { translations, type Language } from '@lib/translations';
import { JobTicket } from '@components/sheet/JobTicket';
import { EXAMPLE_BEVEL, EXAMPLE_FRAME, EXAMPLE_LENS, EXAMPLE_PATIENT, computeExample } from './work';

/**
 * The close: the first screen, already open.
 *
 * The lab order the workbench ends with — the thing the optician hands over —
 * beside the sentence that sends the visitor there.
 */
export function LandingClosing({ lang }: { lang: Language }) {
  const t = translations[lang];
  const result = computeExample();

  return (
    <section className="mt-28 bg-sheet-panel sm:mt-36">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 py-20 sm:px-10 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-28">
        <div className="reveal lg:col-span-4">
          <p className="text-[36px] font-medium leading-[1.04] tracking-[-0.035em] text-sheet-ink lg:text-[62px] lg:leading-[1.02]">
            {t.landCtaLine}
          </p>
          <p className="mt-6 max-w-[40ch] text-[20px] leading-[1.6] text-sheet-muted">
            {t.landCtaBody}
          </p>
          <Link
            to="/visualizer"
            search={{ lang, activeTab: 'visualizer', view: 'side' }}
            className="group mt-9 inline-flex h-12 items-center gap-3 rounded-sm bg-sheet-accent px-6 text-[16px] font-medium text-sheet-accent-ink transition-colors hover:bg-sheet-accent/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent"
          >
            {t.landHeroAction}
            <ArrowRightIcon
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="reveal reveal-1 lg:col-span-8">
          <div className="rounded-sm bg-sheet-ground p-4 sm:p-5">
            <JobTicket
              lens={EXAMPLE_LENS}
              frame={EXAMPLE_FRAME}
              patient={EXAMPLE_PATIENT}
              result={result}
              frameType="full"
              bevelPercent={EXAMPLE_BEVEL}
              lang={lang}
              columns={2}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
