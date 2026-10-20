import React from 'react';
import { translations, type Language } from '@lib/translations';
import { MiniMark } from './parts';

/**
 * The claim of the page, said once: a prescription and a frame go in, one
 * measured drawing comes out. The three marks inside the sentence are tight
 * crops of the drawing itself.
 */
export function LandingStatement({ lang }: { lang: Language }) {
  const t = translations[lang];

  // The sentence carries a token where a crop of the drawing belongs.
  const marks: ('rx' | 'frame' | 'drawing')[] = ['rx', 'frame', 'drawing'];
  const pieces = t.landStatement.split('¦');

  return (
    <section className="px-6 py-[14vh] sm:px-10">
      <p className="reveal mx-auto max-w-[52ch] text-center text-[24px] font-medium leading-[1.24] tracking-[-0.02em] text-sheet-ink md:text-[32px]">
        {pieces.map((piece, index) => (
          <React.Fragment key={index}>
            {index > 0 && <MiniMark kind={marks[index - 1]} />}
            {piece}
          </React.Fragment>
        ))}
      </p>
    </section>
  );
}
