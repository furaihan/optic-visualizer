import React, { useState } from 'react';
import { translations, type Language } from '@lib/translations';
import { SheetRow } from './parts';
import { OVERSIZED_RX, computeExample, mm } from './work';

/**
 * A warning is a row.
 *
 * The same measurement, shown three ways: as it arrives, opened to the note
 * behind it, and past the limit it is measured against. The middle copy is
 * live — click the row and the note opens.
 */
export function LandingShowcase({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [open, setOpen] = useState(true);

  const within = computeExample();
  const over = computeExample(OVERSIZED_RX);

  const states = [
    {
      label: t.landShowcaseState1,
      rx: '−4.00 · MR-8',
      row: (
        <SheetRow
          label={t.edgeThick}
          value={mm(within.et)}
          limit="≤ 6.00 mm"
          ok
          lang={lang}
        />
      ),
    },
    {
      label: t.landShowcaseState2,
      rx: '−4.00 · MR-8',
      row: (
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent"
        >
          <SheetRow
            label={t.edgeThick}
            value={mm(within.et)}
            limit="≤ 6.00 mm"
            ok
            detail={t.caliperEt}
            open={open}
            lang={lang}
          />
        </button>
      ),
    },
    {
      label: t.landShowcaseState3,
      rx: '−6.00 · CR-39',
      row: (
        <SheetRow
          label={t.edgeThick}
          value={mm(over.et)}
          limit="≤ 6.00 mm"
          ok={false}
          lang={lang}
        />
      ),
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
      <div className="reveal grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="text-[32px] font-medium leading-[1.1] tracking-[-0.025em] text-sheet-ink">
            {t.landShowcaseTitle}
          </h2>
          <p className="mt-4 max-w-[42ch] text-[20px] leading-[1.6] text-sheet-muted">
            {t.landShowcaseBody}
          </p>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-14">
        {states.map((state, index) => (
          <div
            key={state.label}
            className={`reveal grid gap-4 lg:grid-cols-12 lg:gap-10 ${
              index === 1 ? 'reveal-1' : index === 2 ? 'reveal-2' : ''
            }`}
          >
            <p className="text-[20px] leading-snug text-sheet-muted lg:col-span-3 lg:pt-4 lg:text-right">
              {state.label}
              <span className="mt-1 block text-[13px] text-sheet-muted tnum">{state.rx}</span>
            </p>
            <div
              data-ui
              className="overflow-hidden rounded-sm transition-transform duration-200 hover:-translate-y-0.5 lg:col-span-6"
            >
              {state.row}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
