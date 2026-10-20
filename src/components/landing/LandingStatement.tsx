import React from 'react';
import { translations, type Language } from '@lib/translations';

/**
 * The claim of the page, said once: a prescription and a frame go in, one
 * measured drawing comes out.
 *
 * The sentence used to carry three inline crops of the drawing between its
 * words. At the size a statement is read they came out as pale rectangles
 * against the paper — ornament that looked like a rendering fault rather
 * than an object. The words do the work on their own, and the space around
 * them is what makes the sentence land.
 */
export function LandingStatement({ lang }: { lang: Language }) {
  const t = translations[lang];
  const sentence = t.landStatement.replace(/¦/g, '');

  return (
    <section className="px-6 py-[13vh] sm:px-10">
      <p className="reveal mx-auto text-left text-[22px] font-medium leading-[1.26] tracking-[-0.02em] text-sheet-ink sm:text-[26px] md:max-w-[44ch] md:text-center md:text-[32px] md:leading-[1.2]">
        {sentence}
      </p>
    </section>
  );
}
