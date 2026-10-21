import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import { translations, type Language } from '@lib/translations';

/**
 * Two instruments, told apart by how they are built: the first works from a
 * prescription and a frame and answers in millimetres; the second works from
 * a surface and answers in coefficients.
 */
import { calculateLens } from '@lib/optic-engine/optical';
import { calculateAsphericLens } from '@lib/optic-engine/aspheric';
import type { FrameParameters, LensIndex, PatientParameters } from '@lib/optic-engine/types';

/**
 * The lens the figures on the landing page are measured on: a minus four in a
 * standard frame, the prescription most people bring in. The numbers come out
 * of the engine, so the page and the instrument cannot drift apart.
 */
const REFERENCE_FRAME: FrameParameters = {
  a: 52,
  b: 40,
  dbl: 18,
  depth: 4.5,
  ed: 54,
};
const REFERENCE_PATIENT: PatientParameters = { pd: 63, fittingHeight: 22 };

/**
 * The aspheric example: a conic front surface with a small polynomial on top.
 *
 * The polynomial terms are the even powers of the radius in millimetres, so
 * the numbers are small: an A4 of 2e-7 moves the surface by a fifth of a
 * millimetre at a 30 mm radius.
 */
const ASPHERIC_EXAMPLE = {
  conic: -0.52,
  A2: -1.8e-4,
  A4: 2.1e-7,
  A6: -4.0e-10,
  A8: 8.0e-13,
};

export function LandingModules({ lang }: { lang: Language }) {
  const t = translations[lang];

  const spherical = calculateLens(
    { sph: -4, cyl: 0, axis: 180, index: 1.6 as LensIndex, baseCurve: 4 },
    REFERENCE_FRAME,
    REFERENCE_PATIENT,
  );

  const aspheric = calculateAsphericLens(
    {
      sph: -4,
      cyl: 0,
      axis: 180,
      index: 1.6 as LensIndex,
      baseCurve: 4,
      asphericFront: { ...ASPHERIC_EXAMPLE, isActive: true },
      asphericBack: { conic: 0, A2: 0, A4: 0, A6: 0, A8: 0, isActive: false },
    },
    REFERENCE_FRAME,
    REFERENCE_PATIENT,
  );

  const outputs = [
    { key: t.edgeThick, value: `${spherical.et.toFixed(2)} mm` },
    { key: t.center, value: `${spherical.ct.toFixed(2)} mm` },
    { key: t.anteriorProt, value: `${spherical.anteriorProtrusion.toFixed(2)} mm` },
    { key: t.posteriorProt, value: `${spherical.posteriorProtrusion.toFixed(2)} mm` },
    { key: t.lensWeight, value: `${spherical.weight.toFixed(1)} g` },
    { key: t.minBlank, value: `${(spherical.minBlank ?? 0).toFixed(0)} mm` },
  ];

  const surfaces = [
    { key: t.conicConstant, value: ASPHERIC_EXAMPLE.conic.toFixed(2) },
    { key: t.coeffA2, value: ASPHERIC_EXAMPLE.A2.toExponential(1) },
    { key: t.coeffA4, value: ASPHERIC_EXAMPLE.A4.toExponential(1) },
    { key: t.coeffA6, value: ASPHERIC_EXAMPLE.A6.toExponential(1) },
    { key: t.coeffA8, value: ASPHERIC_EXAMPLE.A8.toExponential(1) },
    { key: t.asphericDeparture, value: `${(aspheric.departure ?? 0).toFixed(3)} mm` },
  ];

  return (
    <section id="instruments" className="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
      <div className="reveal grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="text-[32px] font-medium leading-[1.1] tracking-[-0.025em] text-sheet-ink">
            {t.landModulesTitle}
          </h2>
          <p className="mt-4 max-w-[42ch] text-[20px] leading-[1.6] text-sheet-muted">
            {t.landModulesBody}
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-16 lg:grid-cols-12 lg:gap-12">
        <div className="reveal lg:col-span-6">
          <h3 className="text-[22px] font-medium leading-[1.12] tracking-[-0.025em] text-sheet-ink">
            {t.landModuleOne}
          </h3>
          <p className="mt-5 max-w-[46ch] text-[20px] leading-[1.6] text-sheet-muted">
            {t.landModuleOneBody}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
            {outputs.map((output) => (
              <div key={output.key} className="flex flex-col gap-1">
                <dt className="text-[13px] leading-tight text-sheet-muted">{output.key}</dt>
                <dd className="text-[22px] font-medium leading-tight text-sheet-ink tnum">
                  {output.value}
                </dd>
              </div>
            ))}
          </dl>

          <Link
            to="/visualizer"
            search={{ lang, activeTab: 'visualizer', view: 'side' }}
            className="group mt-9 inline-flex items-center gap-2 text-[20px] font-medium text-sheet-ink underline decoration-sheet-muted underline-offset-[6px] transition-colors hover:decoration-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent"
          >
            {t.landHeroAction}
            <ArrowRightIcon
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="reveal reveal-1 lg:col-span-5 lg:col-start-8 lg:pt-10">
          <h3 className="text-[22px] font-medium leading-[1.15] tracking-[-0.02em] text-sheet-ink">
            {t.landModuleTwo}
          </h3>
          <p className="mt-5 max-w-[44ch] text-[20px] leading-[1.6] text-sheet-muted">
            {t.landModuleTwoBody}
          </p>

          <dl className="mt-8 flex flex-col gap-4">
            {surfaces.map((surface) => (
              <div
                key={surface.key}
                className="flex items-baseline justify-between gap-6"
              >
                <dt className="text-[16px] text-sheet-muted">{surface.key}</dt>
                <dd className="text-[22px] font-medium text-sheet-ink tnum">{surface.value}</dd>
              </div>
            ))}
          </dl>

          <Link
            to="/aspheric"
            search={{ lang, activeTab: 'visualizer', view: 'side' }}
            className="group mt-9 inline-flex items-center gap-2 text-[20px] font-medium text-sheet-ink underline decoration-sheet-muted underline-offset-[6px] transition-colors hover:decoration-sheet-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sheet-accent"
          >
            {t.landModuleTwoOpen}
            <ArrowRightIcon
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
