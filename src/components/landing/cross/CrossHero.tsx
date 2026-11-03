import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import { translations, type Language } from '@lib/translations';
import { MATERIALS_DB } from '@data/materials';
import { LIMITS } from '@data/limits';
import type { LensIndex } from '@lib/optic-engine/types';
import { OPTICAL_ENGINE_VERSION } from '@lib/optic-engine/optical';
import {
  EXAMPLE_BEVEL,
  EXAMPLE_FRAME,
  EXAMPLE_LENS,
  EXAMPLE_PATIENT,
  INDEX_LADDER,
  MATERIAL_FOR,
  computeExample,
  signed,
} from '../work';
import { CrossElevation, CrossSection } from './CrossSection';

/**
 * The front door, set on the cross.
 *
 * The claim sits in the top-left cell of the meridian, the frame's own values
 * hang at the arm ends above the rule, and the live section takes the plate
 * below it — bleeding to the edge of the page. One control moves, and the
 * section, the figures beside it, and the check line above it all answer
 * together, because they are the same measurement.
 */
export function CrossHero({ lang }: { lang: Language }) {
  const t = translations[lang];
  const [sph, setSph] = useState(EXAMPLE_LENS.sph);
  const [index, setIndex] = useState<LensIndex>(EXAMPLE_LENS.index);

  const lens = useMemo(() => ({ ...EXAMPLE_LENS, sph, index }), [sph, index]);
  const result = useMemo(() => computeExample(lens), [lens]);
  const material = useMemo(
    () => MATERIALS_DB.find((entry) => Math.abs(entry.index - index) < 0.02),
    [index],
  );

  // The check the whole page turns on: is the edge inside the tool's rule?
  const over = result.et > LIMITS.et.value;

  // One authored demonstration: on arrival the sphere moves half a dioptre and
  // comes back, so the coupling between the control, the section and its two
  // figures is seen rather than inferred. It runs once, it never changes the
  // value the visitor finds, it stops the moment the visitor takes the control,
  // and it is skipped entirely when motion is reduced.
  //
  // While it plays the verdict is not announced: twelve live-region updates
  // before the visitor has touched anything is noise, not information.
  const [demonstrating, setDemonstrating] = useState(true);
  const touched = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDemonstrating(false);
      return;
    }

    let frame = 0;
    let cancelled = false;

    const start = window.setTimeout(() => {
      const from = EXAMPLE_LENS.sph;
      const peak = from - 0.5;
      const begin = performance.now();
      const DURATION = 900;

      const tick = (now: number) => {
        if (cancelled || touched.current) {
          setSph(from);
          setDemonstrating(false);
          return;
        }
        const t = Math.min(1, (now - begin) / DURATION);
        // A there-and-back sweep, eased so it settles rather than snaps.
        const eased = Math.sin(t * Math.PI);
        setSph(Math.round((from + (peak - from) * eased) * 4) / 4);
        if (t < 1) frame = requestAnimationFrame(tick);
        else {
          setSph(from);
          setDemonstrating(false);
        }
      };
      frame = requestAnimationFrame(tick);
    }, 700);

    return () => {
      cancelled = true;
      window.clearTimeout(start);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /** The visitor has taken the control: the demonstration is over for good. */
  const claim = () => {
    touched.current = true;
  };

  return (
    <section className="cross-hero">
      <div className="cross-track">
        <div className="cross-hero__grid">
          <div className="cross-hero__head">
            <h1 className="cross-hero__title cross-arrive">{t.landHeroTitle}</h1>
          </div>

          <div className="cross-hero__labels">
            <p className="cross-label cross-label--ink">
              SPH {signed(sph)} · BC {EXAMPLE_LENS.baseCurve.toFixed(2)} D
            </p>
            <p
              className="cross-label cross-label--ink tnum"
              aria-live={demonstrating ? 'off' : 'polite'}
              style={{ color: over ? 'var(--cross-check)' : undefined }}
            >
              {t.edgeThick} {result.et.toFixed(2)} · {over ? t.overLimit : t.withinLimit}
            </p>
          </div>

          <div className="cross-hero__rule" aria-hidden="true" />

          <div className="cross-hero__arm">
            <p className="cross-body cross-arrive cross-arrive-2 max-w-[46ch] text-[0.9375rem] leading-[1.6]">
              {t.landHeroLead}
            </p>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              <Link
                to="/visualizer"
                search={{ lang, activeTab: 'visualizer', view: 'side' }}
                className="cross-btn"
              >
                <span>{t.landHeroAction}</span>
                <ArrowRightIcon className="cross-btn__arrow h-4 w-4" aria-hidden="true" />
              </Link>
              <a href="#how" className="cross-link text-[1rem]">
                {t.landHeroSecondary}
              </a>
            </div>

            <div className="cross-hero__control">
              <div className="cross-hero__control-head">
                <label htmlFor="cross-sphere" className="cross-label cross-label--ink">
                  {t.landHeroControl}
                </label>
                <output htmlFor="cross-sphere" className="cross-hero__figure tnum">
                  {signed(sph)} D
                </output>
              </div>
              <input
                id="cross-sphere"
                type="range"
                min={-10}
                max={6}
                step={0.25}
                value={sph}
                onPointerDown={claim}
                onKeyDown={(event) => {
                  // Tab is navigation, not adjustment: a visitor who is merely
                  // reaching the control has not taken it.
                  if (
                    event.key.startsWith('Arrow') ||
                    event.key === 'Home' ||
                    event.key === 'End' ||
                    event.key === 'PageUp' ||
                    event.key === 'PageDown'
                  ) {
                    claim();
                  }
                }}
                onChange={(event) => {
                  claim();
                  setSph(Number(event.target.value));
                }}
                className="cross-range"
              />
              <p className="cross-note">{t.landHeroControlHint}</p>
            </div>

            <div className="cross-hero__control">
              <div className="cross-hero__control-head">
                <p className="cross-label cross-label--ink">{t.landHeroIndex}</p>
                <p className="cross-label tnum">
                  {t.landProofAbbe} {material?.abbe ?? '—'}
                </p>
              </div>
              <div className="cross-hero__ladder">
                {INDEX_LADDER.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      claim();
                      setIndex(value);
                    }}
                    aria-pressed={value === index}
                    className="cross-stop"
                  >
                    <span className="cross-fig text-[0.9375rem] leading-none">
                      {value.toFixed(2)}
                    </span>
                    <span className="text-[0.75rem] leading-tight opacity-75">
                      {MATERIAL_FOR[value]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <p
              className="cross-label cross-hero__verdict tnum"
              aria-live={demonstrating ? 'off' : 'polite'}
              style={{ color: over ? 'var(--cross-check)' : undefined }}
            >
              {t.edgeThick} {result.et.toFixed(2)} mm · {over ? t.overLimit : t.withinLimit}
            </p>
          </div>

          <div className="cross-hero__stage">
            <div className="cross-hero__plate">
              <div className="cross-hero__plate-head">
                <p className="cross-label">
                  {t.landCrossSection.replace('{pct}', Math.round(EXAMPLE_BEVEL * 100).toString())}
                </p>
                <p className="cross-label">{t.landHeroReadout}</p>
              </div>

              <div className="cross-hero__drawing">
                <CrossSection
                  result={result}
                  frameB={EXAMPLE_FRAME.b}
                  bevelPercent={EXAMPLE_BEVEL}
                  className="h-full w-full"
                />
                <div className="flex h-full flex-col justify-between gap-3 py-1">
                  <p className="cross-label cross-elevation-label">{t.landCrossElevation}</p>
                  <CrossElevation
                    a={EXAMPLE_FRAME.a}
                    b={EXAMPLE_FRAME.b}
                    dbl={EXAMPLE_FRAME.dbl}
                    decentration={result.decentration}
                    className="w-full min-h-0 flex-1"
                  />
                  <p className="cross-label tnum">
                    {t.decentration} {result.decentration.toFixed(2)} mm
                  </p>
                </div>
              </div>

              <div className="cross-hero__plate-foot">
                <p className="cross-label">
                  A {EXAMPLE_FRAME.a} · B {EXAMPLE_FRAME.b} · DBL {EXAMPLE_FRAME.dbl} · ED{' '}
                  {EXAMPLE_FRAME.ed}
                </p>
                <p className="cross-label">
                  PD {EXAMPLE_PATIENT.pd} · FH {EXAMPLE_PATIENT.fittingHeight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
