import React from 'react';
import { translations, type Language } from '@lib/translations';

/**
 * The questions an optician actually asks, answered from the tool itself.
 * One tile opens at a time.
 */
export function LandingFaq({ lang }: { lang: Language }) {
  const t = translations[lang];

  const questions = [
    { q: t.landFaq1Q, a: t.landFaq1A },
    { q: t.landFaq2Q, a: t.landFaq2A },
    { q: t.landFaq3Q, a: t.landFaq3A },
    { q: t.landFaq4Q, a: t.landFaq4A },
    { q: t.landFaq5Q, a: t.landFaq5A },
    { q: t.landFaq6Q, a: t.landFaq6A },
  ];

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-4">
          <h2 className="reveal text-[32px] font-medium leading-[1.08] tracking-[-0.03em] text-sheet-ink lg:sticky lg:top-24">
            {t.landFaqTitle}
          </h2>
        </div>

        <div className="reveal reveal-1 flex flex-col gap-2 lg:col-span-8">
          {questions.map((question) => (
            <details
              key={question.q}
              name="landing-faq"
              className="group rounded-sm bg-transparent open:bg-sheet-info lg:bg-sheet-panel lg:open:bg-sheet-info"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-[18px] font-medium text-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent">
                {question.q}
                <span
                  aria-hidden="true"
                  className="relative h-4 w-4 shrink-0 before:absolute before:left-0 before:top-1/2 before:h-[3px] before:w-4 before:-translate-y-1/2 before:bg-current after:absolute after:left-1/2 after:top-0 after:h-4 after:w-[3px] after:-translate-x-1/2 after:bg-current after:transition-transform after:duration-200 group-open:after:scale-y-0"
                />
              </summary>
              <p className="max-w-[62ch] px-6 pb-6 text-[18px] leading-[1.6] text-sheet-ink">
                {question.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
