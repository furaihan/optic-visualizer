import React, { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon } from 'lucide-react';
import { translations, type Language } from '@lib/translations';
import { MATERIALS_DB } from '@data/materials';
import { LIMITS, limitLabel } from '@data/limits';
import { prismReference } from '@lib/limits';
import { calculateLens, OPTICAL_ENGINE_VERSION } from '@lib/optic-engine/optical';
import { calculateAsphericLens } from '@lib/optic-engine/aspheric';
import type { FrameParameters, LensIndex, PatientParameters } from '@lib/optic-engine/types';
import {
  EXAMPLE_BEVEL,
  EXAMPLE_FRAME,
  EXAMPLE_LENS,
  EXAMPLE_PATIENT,
  MATERIAL_FOR,
  computeExample,
  mm,
  signed,
} from '../work';

const REFERENCE_FRAME: FrameParameters = { a: 52, b: 40, dbl: 18, depth: 4.5, ed: 54 };
const REFERENCE_PATIENT: PatientParameters = { pd: 63, fittingHeight: 22 };

const ASPHERIC_EXAMPLE = {
  conic: -0.52,
  A2: -1.8e-4,
  A4: 2.1e-7,
  A6: -4.0e-10,
  A8: 8.0e-13,
};

/**
 * Two instruments, told apart by how they are built.
 *
 * Set off the meridian at different widths — the simulator, which is the
 * everyday tool, takes the wide column; the surface designer takes the
 * narrow one and sits lower. The page is not a row of equal cards.
 */
export function CrossInstruments({ lang }: { lang: Language }) {
  const t = translations[lang];

  const spherical = useMemo(
    () =>
      calculateLens(
        { sph: -4, cyl: 0, axis: 180, index: 1.6 as LensIndex, baseCurve: 4 },
        REFERENCE_FRAME,
        REFERENCE_PATIENT,
      ),
    [],
  );

  const aspheric = useMemo(
    () =>
      calculateAsphericLens(
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
      ),
    [],
  );

  const outputs = [
    { key: t.edgeThick, value: mm(spherical.et) },
    { key: t.center, value: mm(spherical.ct) },
    { key: t.anteriorProt, value: mm(spherical.anteriorProtrusion) },
    { key: t.posteriorProt, value: mm(spherical.posteriorProtrusion) },
    { key: t.lensWeight, value: `${spherical.weight.toFixed(1)} g` },
    { key: t.minBlank, value: `${(spherical.minBlank ?? 0).toFixed(0)} mm` },
  ];

  const surfaces = [
    { key: t.conicConstant, value: ASPHERIC_EXAMPLE.conic.toFixed(2) },
    { key: t.coeffA2, value: ASPHERIC_EXAMPLE.A2.toExponential(1) },
    { key: t.coeffA4, value: ASPHERIC_EXAMPLE.A4.toExponential(1) },
    { key: t.coeffA6, value: ASPHERIC_EXAMPLE.A6.toExponential(1) },
    { key: t.coeffA8, value: ASPHERIC_EXAMPLE.A8.toExponential(1) },
    { key: t.asphericDeparture, value: mm(aspheric.departure ?? 0) },
  ];

  return (
    <section id="instruments" className="cross-band">
      <div className="cross-track pt-[clamp(52px,8vh,92px)] pb-[clamp(52px,8vh,92px)]">
        <div className="cross-head">
          <h2 className="cross-h2">{t.landModulesTitle}</h2>
          <p className="cross-body">{t.landModulesBody}</p>
        </div>

        <div className="mt-[clamp(32px,5vh,56px)] grid gap-[clamp(36px,6vw,80px)] lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="cross-h3">{t.landModuleOne}</h3>
            <p className="cross-body mt-4 max-w-[46ch]">{t.landModuleOneBody}</p>

            <dl className="mt-8 grid grid-cols-2 gap-x-8 sm:grid-cols-3">
              {outputs.map((output) => (
                <div
                  key={output.key}
                  className="flex flex-col gap-1 py-3"
                  style={{
                    borderTop: '1px solid color-mix(in srgb, var(--cross-rule) 20%, transparent)',
                  }}
                >
                  <dt className="cross-label">{output.key}</dt>
                  <dd className="cross-fig text-[1.15rem]">{output.value}</dd>
                </div>
              ))}
            </dl>

            <Link
              to="/visualizer"
              search={{ lang, activeTab: 'visualizer', view: 'side' }}
              className="cross-btn cross-btn--pine mt-9"
            >
              <span>{t.landHeroAction}</span>
              <ArrowRightIcon className="cross-btn__arrow h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="lg:col-span-4 lg:col-start-9 lg:pt-[clamp(16px,3vh,40px)]">
            <h3 className="cross-h3">{t.landModuleTwo}</h3>
            <p className="cross-body mt-4 max-w-[42ch]">{t.landModuleTwoBody}</p>

            <dl className="mt-8 flex flex-col">
              {surfaces.map((surface) => (
                <div
                  key={surface.key}
                  className="flex items-baseline justify-between gap-6 py-2.5"
                  style={{
                    borderBottom: '1px solid color-mix(in srgb, var(--cross-rule) 14%, transparent)',
                  }}
                >
                  <dt className="cross-label">{surface.key}</dt>
                  <dd className="cross-fig text-[1rem]">{surface.value}</dd>
                </div>
              ))}
            </dl>

            <Link
              to="/aspheric"
              search={{ lang, activeTab: 'visualizer', view: 'side' }}
              className="cross-link mt-7 inline-flex items-center gap-2 text-[1rem]"
            >
              {t.landModuleTwoOpen}
              <ArrowRightIcon className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * What the numbers are measured against.
 *
 * The material ladder, measured by the engine for one lens rather than quoted
 * from a table, and the input ranges the tool refuses to pass without a note.
 * A limit either names a standard or says it is the tool's own working rule,
 * and this page says the latter.
 */
export function CrossStandards({ lang }: { lang: Language }) {
  const t = translations[lang];

  const ladder = useMemo(() => {
    const reference = calculateLens(
      { ...EXAMPLE_LENS, index: 1.5 as LensIndex },
      REFERENCE_FRAME,
      REFERENCE_PATIENT,
    ).et;

    return ([1.5, 1.56, 1.6, 1.67, 1.74] as LensIndex[]).map((index) => {
      const entry = MATERIALS_DB.find((material) => Math.abs(material.index - index) < 0.02);
      const edge = calculateLens(
        { ...EXAMPLE_LENS, index },
        REFERENCE_FRAME,
        REFERENCE_PATIENT,
      ).et;
      const reduction = reference > 0 ? Math.max(0, (1 - edge / reference) * 100) : 0;
      return {
        index,
        name: MATERIAL_FOR[index],
        abbe: entry?.abbe ?? 0,
        edge,
        reduction: Math.round(reduction),
      };
    });
  }, []);

  const ranges = [
    { key: t.aSize, value: '35–65 mm' },
    { key: t.bSize, value: '20–55 mm' },
    { key: t.dbl, value: '10–28 mm' },
    { key: t.ed, value: '≤ 75 mm' },
    { key: t.minBlank, value: limitLabel('blank') },
    { key: t.edgeThick, value: limitLabel('et') },
    { key: t.center, value: limitLabel('ct') },
    { key: t.lensWeight, value: limitLabel('weight') },
  ];

  return (
    <section id="standards" className="cross-band">
      <div className="cross-track pt-[clamp(52px,8vh,92px)] pb-[clamp(52px,8vh,92px)]">
        <div className="cross-head">
          <h2 className="cross-h2">{t.landProofTitle}</h2>
          <p className="cross-body max-w-[56ch]">{t.landShowcaseBody}</p>
        </div>

        <div className="mt-[clamp(32px,5vh,56px)]">
          <p className="cross-label">{t.landProofMaterials}</p>
          <div className="cross-ladder mt-5">
            {ladder.map((material) => (
              <div key={material.index} className="flex flex-col gap-1.5 pb-5">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="cross-fig text-[1.4rem]">{material.index.toFixed(2)}</span>
                  <span className="cross-label">{material.name}</span>
                </div>
                <p className="cross-label tnum">
                  {t.landProofAbbe} {material.abbe}
                </p>
                <p className="cross-ladder__value">{mm(material.edge)}</p>
                <p className="cross-ladder__share">
                  {material.reduction === 0 ? '0%' : `−${material.reduction}%`}
                </p>
              </div>
            ))}
          </div>
          <p className="cross-label mt-3">{t.landProofVolume}</p>
        </div>

        <div className="mt-[clamp(36px,6vh,64px)]">
          <p className="cross-label">{t.landProofLimits}</p>
          <dl className="mt-4 grid grid-cols-2 gap-x-8 sm:grid-cols-4">
            {ranges.map((range) => (
              <div
                key={range.key}
                className="flex flex-col gap-1 py-3"
                style={{
                  borderTop: '1px solid color-mix(in srgb, var(--cross-rule) 20%, transparent)',
                }}
              >
                <dt className="cross-label">{range.key}</dt>
                <dd className="cross-fig text-[1rem]">{range.value}</dd>
              </div>
            ))}
          </dl>
          <p className="cross-body mt-6 max-w-[62ch] text-[0.9375rem]">{t.flatFrameNote}</p>
        </div>
      </div>
    </section>
  );
}

/** The questions an optician actually asks, answered from the tool itself. */
export function CrossQuestions({ lang }: { lang: Language }) {
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
    <section id="questions" className="cross-band">
      <div className="cross-track pt-[clamp(52px,8vh,92px)] pb-[clamp(52px,8vh,92px)]">
        <div className="cross-split">
          <div>
            <h2 className="cross-h2">{t.landFaqTitle}</h2>
          </div>
          <div>
            {questions.map((question) => (
              <details key={question.q} name="cross-faq" className="cross-q">
                <summary>
                  <span>{question.q}</span>
                  <span className="cross-q__mark" aria-hidden="true" />
                </summary>
                <p className="cross-body max-w-[62ch] pb-6">{question.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The close.
 *
 * The lab order the workbench hands over, beside the sentence that sends the
 * visitor there. The plate carries the ticket; the claim sits on paper, off
 * the meridian, so the page ends on the same two lines it opened with.
 */
export function CrossClose({ lang }: { lang: Language }) {
  const t = translations[lang];
  const result = useMemo(() => computeExample(), []);
  const prism = prismReference(result, EXAMPLE_LENS);

  const ticketRows = [
    {
      k: `${t.rxLine} · SPH / CYL / AXIS`,
      v: `${signed(EXAMPLE_LENS.sph)} · ${signed(EXAMPLE_LENS.cyl)} · ${EXAMPLE_LENS.axis.toFixed(0)}°`,
    },
    {
      k: `${t.refractiveIndex} · BC`,
      v: `${EXAMPLE_LENS.index.toFixed(2)} · ${EXAMPLE_LENS.baseCurve.toFixed(2)} D`,
    },
    {
      k: 'A / B / DBL / ED',
      v: `${EXAMPLE_FRAME.a} · ${EXAMPLE_FRAME.b} · ${EXAMPLE_FRAME.dbl} · ${EXAMPLE_FRAME.ed}`,
    },
    { k: t.frameDepth, v: mm(EXAMPLE_FRAME.depth) },
    {
      k: `${t.pd} / ${t.fittingHeight}`,
      v: `${EXAMPLE_PATIENT.pd} · ${EXAMPLE_PATIENT.fittingHeight}`,
    },
    { k: t.bevelPos, v: `${Math.round(EXAMPLE_BEVEL * 100)}%` },
    { k: t.edgeThick, v: mm(result.et) },
    { k: t.center, v: mm(result.ct) },
    { k: t.minBlank, v: `${(result.minBlank ?? 0).toFixed(0)} mm` },
    { k: t.lensWeight, v: `${result.weight.toFixed(1)} g` },
    { k: t.inducedPrism, v: `${prism.value.toFixed(2)} Δ` },
  ];

  return (
    <section className="cross-band">
      <div className="cross-track py-[clamp(56px,9vh,104px)]">
        <div className="grid gap-[clamp(36px,6vw,72px)] lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p
              className="text-[clamp(1.9rem,3.6vw,3rem)] leading-[1.02] tracking-[-0.03em]"
              style={{
                fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif",
                fontStretch: '114%',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: 'var(--cross-ink)',
                textWrap: 'balance',
              }}
            >
              {t.landCtaLine}
            </p>
            <p className="cross-body mt-5 max-w-[42ch]">{t.landCtaBody}</p>
            <Link
              to="/visualizer"
              search={{ lang, activeTab: 'visualizer', view: 'side' }}
              className="cross-btn mt-8"
            >
              <span>{t.landHeroAction}</span>
              <ArrowRightIcon className="cross-btn__arrow h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="lg:col-span-8 lg:col-start-5">
            <div
              className="p-[clamp(14px,1.6vw,22px)]"
              style={{
                background: 'var(--cross-paper-2)',
                border: '1px solid color-mix(in srgb, var(--cross-rule) 26%, transparent)',
              }}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-3">
                <p className="cross-label cross-label--ink">{t.labOrder}</p>
                <p className="cross-label tnum">
                  {t.landHeroEngine.replace('{version}', OPTICAL_ENGINE_VERSION)}
                </p>
              </div>

              <dl className="flex flex-col">
                {ticketRows.map((row) => (
                  <div
                    key={row.k}
                    className="flex items-baseline justify-between gap-6 py-2"
                    style={{
                      borderTop: '1px solid color-mix(in srgb, var(--cross-rule) 14%, transparent)',
                    }}
                  >
                    <dt className="cross-label">{row.k}</dt>
                    <dd className="cross-fig text-[1.0625rem]">{row.v}</dd>
                  </div>
                ))}
              </dl>

              <p className="cross-label pt-3">{t.landCrossFlatPlane}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CrossFooter({ lang }: { lang: Language }) {
  const t = translations[lang];

  return (
    <footer className="cross-band">
      <div className="cross-track pt-[clamp(44px,7vh,76px)] pb-[clamp(32px,5vh,56px)]">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="cross-body max-w-[26ch] text-[1.0625rem]" style={{ color: 'var(--cross-ink)' }}>
              {t.landFooterAbout}
            </p>
          </div>

          <nav aria-label={t.landModulesTitle} className="lg:col-span-3">
            <p className="cross-label">{t.landModulesTitle}</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <Link
                  to="/visualizer"
                  search={{ lang, activeTab: 'visualizer', view: 'side' }}
                  className="cross-link text-[1rem]"
                >
                  {t.landModuleOne}
                </Link>
              </li>
              <li>
                <Link
                  to="/aspheric"
                  search={{ lang, activeTab: 'visualizer', view: 'side' }}
                  className="cross-link text-[1rem]"
                >
                  {t.landModuleTwo}
                </Link>
              </li>
              <li>
                <Link to="/contact" search={{ lang }} className="cross-link text-[1rem]">
                  {t.landNavContact}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="cross-label">{t.landFooterInstitute}</p>
            <p className="cross-body mt-4 text-[1rem]" style={{ color: 'var(--cross-ink)' }}>
              {t.landFooterCity}
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="cross-label">{t.landHeroReadout}</p>
            <p className="cross-fig mt-4 text-[0.9375rem]">
              {t.landHeroEngine.replace('{version}', OPTICAL_ENGINE_VERSION)}
            </p>
          </div>
        </div>

        <div
          className="mt-[clamp(36px,6vh,64px)] flex flex-wrap items-baseline justify-between gap-4 pt-6"
          style={{ borderTop: '1px solid color-mix(in srgb, var(--cross-rule) 22%, transparent)' }}
        >
          <p className="cross-label">{t.landFooterRights}</p>
          <p className="cross-label">{t.landFooterInstitute}</p>
        </div>
      </div>
    </footer>
  );
}
