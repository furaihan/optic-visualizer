import React, { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import { translations, type Language } from '@lib/translations';
import { MATERIALS_DB } from '@data/materials';
import { buttonVariants } from '@components/ui/button';
import { Visualizer } from '@components/Visualizer';
import type { LensIndex } from '@lib/optic-engine/types';
import {
  EXAMPLE_BEVEL,
  EXAMPLE_FRAME,
  EXAMPLE_LENS,
  EXAMPLE_PATIENT,
  INDEX_LADDER,
  MATERIAL_FOR,
  computeExample,
  signed,
} from './work';
import { useDrift } from './useDrift';

/**
 * The front door.
 *
 * The page opens on the instrument itself: the same drawing board the
 * simulator uses, driven by a control the visitor can move. The promise
 * sits beside it, and one action opens the full workbench.
 */
export function LandingHero({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [sph, setSph] = useState(EXAMPLE_LENS.sph);
  const [index, setIndex] = useState<LensIndex>(EXAMPLE_LENS.index);

  const lens = useMemo(() => ({ ...EXAMPLE_LENS, sph, index }), [sph, index]);
  const result = useMemo(() => computeExample(lens), [lens]);
  const activeMaterial = useMemo(
    () => MATERIALS_DB.find((material) => Math.abs(material.index - index) < 0.02),
    [index],
  );
  // The one moving picture on the page: the drawing board drifts against the
  // scroll, a few pixels, so the first screen reads as a board and not a shot.
  const drawingRef = useDrift<HTMLDivElement>(22);

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 pt-10 pb-16 sm:px-10 lg:pt-16 lg:pb-24">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-x-12 lg:gap-y-6">
        <div className="order-1 lg:col-start-1 lg:row-start-1">
          <h1 className="reveal max-w-[15ch] text-[36px] font-medium leading-[1.04] tracking-[-0.035em] text-sheet-ink lg:text-[62px] lg:leading-[1.02]">
            {t.landHeroTitle}
          </h1>

          <p className="reveal reveal-1 mt-6 max-w-[46ch] text-[20px] leading-[1.55] text-sheet-muted">
            {t.landHeroLead}
          </p>

          <div className="reveal reveal-2 mt-8 flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              to="/visualizer"
              search={{ lang, activeTab: 'visualizer', view: 'side' }}
              className={buttonVariants({
                size: 'lg',
                className:
                  'group h-12 gap-3 rounded-sm bg-sheet-accent px-6 text-[16px] font-medium text-sheet-accent-ink hover:bg-sheet-accent/90',
              })}
            >
              {t.landHeroAction}
              <ArrowRightIcon
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <a
              href="#instruments"
              className="text-[16px] text-sheet-ink underline decoration-sheet-muted underline-offset-[6px] transition-colors hover:decoration-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent"
            >
              {t.landHeroSecondary}
            </a>
          </div>
        </div>

        {/* The product, doing its job, at its own size. */}
        <div className="reveal reveal-2 order-2 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:pt-2">
          <div ref={drawingRef} className="will-change-transform">
            <div className="h-[500px] lg:h-[600px]">
              <Visualizer
                lens={lens}
                frame={EXAMPLE_FRAME}
                patient={EXAMPLE_PATIENT}
                result={result}
                lang={lang}
                view="side"
                bevelPercent={EXAMPLE_BEVEL}
              />
            </div>
          </div>
          <p className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[13px] text-sheet-muted">
            <span>{t.landHeroReadout}</span>
            <span className="tnum">{t.landHeroEngine}</span>
          </p>
        </div>

        {/* The live thing: one control, and the drawing answers it. */}
        <div className="reveal reveal-3 order-3 lg:col-start-1 lg:row-start-2">
          <div className="max-w-[440px]">
            <div className="flex items-baseline justify-between gap-4">
              <label
                htmlFor="landing-sphere"
                className="text-[16px] font-medium text-sheet-ink"
              >
                {t.landHeroControl}
              </label>
              <span className="text-[22px] font-medium leading-none text-sheet-ink tnum">
                {signed(sph)} D
              </span>
            </div>

            <input
              id="landing-sphere"
              type="range"
              min={-10}
              max={6}
              step={0.25}
              value={sph}
              onChange={(event) => setSph(Number(event.target.value))}
              className="mt-4 h-6 w-full accent-sheet-accent"
            />

            <div className="mt-6">
              <div className="flex items-baseline justify-between gap-4">
                <p className="text-[16px] font-medium text-sheet-ink">
                  {t.landHeroIndex}
                </p>
                <span className="text-[16px] text-sheet-muted tnum">
                  {t.landProofAbbe} {activeMaterial?.abbe ?? '—'}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
                {INDEX_LADDER.map((value) => {
                  const active = value === index;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setIndex(value)}
                      aria-pressed={active}
                      className={`flex flex-col items-center gap-0.5 rounded-sm px-1 py-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet-accent ${
                        active
                          ? 'bg-sheet-ink text-sheet-ground'
                          : 'bg-sheet-panel text-sheet-ink hover:bg-sheet-stage'
                      }`}
                    >
                      <span className="text-[16px] leading-none tnum">
                        {value.toFixed(2)}
                      </span>
                      <span className="text-[13px] leading-none opacity-80">
                        {MATERIAL_FOR[value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 text-[16px] leading-snug text-sheet-muted">
              {t.landHeroControlHint}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
