import React, { useMemo, useState } from 'react';
import { translations, type Language } from '@lib/translations';
import { LIMITS, limitLabel } from '@data/limits';
import { prismReference } from '@lib/limits';
import type { CalculationResult } from '@lib/optic-engine/types';
import {
  EXAMPLE_BEVEL,
  EXAMPLE_FRAME,
  EXAMPLE_LENS,
  EXAMPLE_PATIENT,
  OVERSIZED_RX,
  computeExample,
  mm,
  signed,
} from '../work';

/**
 * The claim, set across the meridian.
 *
 * One sentence, at the size a claim is read, crossing the line the whole page
 * hangs from. Nothing beside it: the space is what makes it land.
 */
export function CrossStatement({ lang }: { lang: Language }) {
  const t = translations[lang];
  const sentence = t.landStatement.replace(/¦/g, '');

  return (
    <section className="cross-band">
      <div className="cross-track py-[clamp(56px,9vh,104px)]">
        <p
          className="max-w-[54ch] text-[clamp(1.35rem,2.5vw,2.05rem)] leading-[1.24] tracking-[-0.015em]"
          style={{
            color: 'var(--cross-ink)',
            textWrap: 'balance',
            fontFamily: "'Archivo Variable', ui-sans-serif, system-ui, sans-serif",
            fontStretch: '104%',
          }}
        >
          {sentence}
        </p>
      </div>
    </section>
  );
}

type Row = {
  id: string;
  label: string;
  value: string;
  limit: string;
  ok: boolean;
  note?: string;
};

function rowsFor(result: CalculationResult, t: (typeof translations)['en']): Row[] {
  const check = (key: keyof typeof LIMITS, value: number) => {
    const rule = LIMITS[key];
    return rule.direction === 'max' ? value <= rule.value : value >= rule.value;
  };

  const rows: Row[] = [
    {
      id: 'et',
      label: t.edgeThick,
      value: mm(result.et),
      limit: limitLabel('et'),
      ok: check('et', result.et),
      note: t.caliperEt,
    },
    {
      id: 'ct',
      label: t.center,
      value: mm(result.ct),
      limit: limitLabel('ct'),
      ok: check('ct', result.ct),
    },
    {
      id: 'anterior',
      label: t.anteriorProt,
      value: mm(result.anteriorProtrusion),
      limit: limitLabel('anterior'),
      ok: check('anterior', result.anteriorProtrusion),
    },
    {
      id: 'posterior',
      label: t.posteriorProt,
      value: mm(result.posteriorProtrusion),
      limit: limitLabel('posterior'),
      ok: check('posterior', result.posteriorProtrusion),
    },
    {
      id: 'weight',
      label: t.lensWeight,
      value: `${result.weight.toFixed(1)} g`,
      limit: limitLabel('weight'),
      ok: check('weight', result.weight),
    },
    {
      id: 'blank',
      label: t.minBlank,
      value: `${(result.minBlank ?? 0).toFixed(0)} mm`,
      limit: limitLabel('blank'),
      ok: check('blank', result.minBlank ?? 0),
    },
  ];

  return rows;
}

/**
 * How the instrument is used, then what it checks.
 *
 * The three calls the workbench makes — the prescription, the frame, the
 * fitting — and then the schedule they produce, measured against the tool's
 * own rules. The two cases share one frame: switch the blank and the rows
 * that fall outside their limit turn the checking red, and nothing else on
 * the page is ever that colour.
 */
export function CrossHow({ lang }: { lang: Language }) {
  const t = translations[lang];
  const standard = useMemo(() => computeExample(), []);
  const pushed = useMemo(() => computeExample(OVERSIZED_RX), []);

  const [pushedCase, setPushedCase] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>('et');

  const result = pushedCase ? pushed : standard;
  const lens = pushedCase ? OVERSIZED_RX : EXAMPLE_LENS;
  const rows = rowsFor(result, t);
  const overCount = rows.filter((row) => !row.ok).length;

  const prism = prismReference(result, lens);

  const degree = (value: number) => `${value.toFixed(0)}°`;

  const steps = [
    {
      key: 'rx',
      title: t.landHow1,
      body: t.landHow1Body,
      pairs: [
        { k: 'SPH', v: signed(lens.sph) },
        { k: 'CYL', v: signed(lens.cyl) },
        { k: 'AXIS', v: degree(lens.axis) },
        { k: t.refractiveIndex, v: lens.index.toFixed(2) },
        { k: 'BC', v: `${lens.baseCurve.toFixed(2)} D` },
      ],
      answers: [
        { k: t.r1Front, v: mm(result.r1) },
        { k: t.r2Back, v: mm(result.r2) },
        { k: t.s1Sag, v: mm(result.s1) },
        { k: t.s2Sag, v: mm(result.s2) },
      ],
    },
    {
      key: 'frame',
      title: t.landHow2,
      body: t.landHow2Body,
      pairs: [
        { k: 'A', v: `${EXAMPLE_FRAME.a}` },
        { k: 'B', v: `${EXAMPLE_FRAME.b}` },
        { k: 'DBL', v: `${EXAMPLE_FRAME.dbl}` },
        { k: 'ED', v: `${EXAMPLE_FRAME.ed}` },
        { k: t.frameDepth, v: mm(EXAMPLE_FRAME.depth) },
      ],
      answers: [
        { k: t.framePd, v: `${(EXAMPLE_FRAME.a + EXAMPLE_FRAME.dbl).toFixed(0)} mm` },
        { k: t.minBlank, v: `${(result.minBlank ?? 0).toFixed(0)} mm` },
        { k: t.groove, v: `${Math.round(EXAMPLE_BEVEL * 100)}%` },
      ],
    },
    {
      key: 'fit',
      title: t.landHow3,
      body: t.landHow3Body,
      pairs: [
        { k: 'PD', v: `${EXAMPLE_PATIENT.pd}` },
        { k: t.fittingHeight, v: `${EXAMPLE_PATIENT.fittingHeight}` },
        { k: t.bevelPos, v: `${Math.round(EXAMPLE_BEVEL * 100)}%` },
      ],
      answers: [
        { k: t.decentration, v: mm(result.decentration) },
        { k: t.inducedPrism, v: `${prism.value.toFixed(2)} Δ` },
      ],
    },
  ];

  return (
    <section id="how" className="cross-band">
      <div className="cross-track cross-track--head pt-[clamp(52px,8vh,92px)]">
        <div className="cross-head">
          <h2 className="cross-h2">{t.landHowTitle}</h2>
          <p className="cross-body max-w-[52ch]">{t.landCrossReadNote}</p>
        </div>
      </div>

      <div className="cross-track">
        {steps.map((step) => (
          <div key={step.key} className="cross-split cross-step py-[clamp(30px,4.4vh,46px)]">
            <div>
              <h3 className="cross-h3">{step.title}</h3>
              <p className="cross-body mt-3 max-w-[44ch]">{step.body}</p>
            </div>

            <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:mt-0">
              <dl className="flex flex-col">
                {step.pairs.map((pair) => (
                  <div
                    key={pair.k}
                    className="flex items-baseline justify-between gap-4 py-2"
                    style={{
                      borderBottom:
                        '1px solid color-mix(in srgb, var(--cross-rule) 14%, transparent)',
                    }}
                  >
                    <dt className="cross-label">{pair.k}</dt>
                    <dd className="cross-fig text-[1rem]">{pair.v}</dd>
                  </div>
                ))}
              </dl>

              <dl className="flex flex-col">
                {step.answers.map((pair) => (
                  <div key={pair.k} className="flex items-baseline justify-between gap-4 py-2">
                    <dt className="cross-label">{pair.k}</dt>
                    <dd className="cross-fig text-[1rem]">{pair.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        ))}
      </div>

      {/* The check. */}
      <div className="cross-track cross-check pt-[clamp(38px,5vh,60px)] pb-[clamp(52px,8vh,92px)]">
        <div className="cross-split">
          <div>
            <h2 className="cross-h2">{t.landShowcaseTitle}</h2>
            <p className="cross-body mt-4">{t.landCrossCaseNote}</p>

            <div className="cross-seg mt-7" role="group" aria-label={t.landCrossCheckTitle}>
              {[
                { on: false, label: t.landCrossCaseStandard, rx: '−4.00 · MR-8' },
                { on: true, label: t.landCrossCasePushed, rx: '−6.00 · CR-39' },
              ].map((option) => (
                <button
                  key={String(option.on)}
                  type="button"
                  onClick={() => setPushedCase(option.on)}
                  aria-pressed={pushedCase === option.on}
                >
                  <span className="text-[0.75rem] tracking-[0.1em] uppercase">{option.label}</span>
                  <span className="cross-fig text-[0.8125rem] normal-case tracking-normal">
                    {option.rx}
                  </span>
                </button>
              ))}
            </div>

            <p
              className="cross-label mt-5 tnum"
              aria-live="polite"
              style={{ color: overCount > 0 ? 'var(--cross-check)' : undefined }}
            >
              {t.landCrossOverCount
                .replace('{n}', String(overCount))
                .replace('{total}', String(rows.length))}
            </p>
          </div>

          <div className="mt-8 lg:mt-0">
            <div
              className="cross-row"
              style={{
                borderBottomColor: 'color-mix(in srgb, var(--cross-rule) 55%, transparent)',
                paddingBottom: '0.6rem',
              }}
            >
              <span className="cross-label">{t.sheetColMeasure}</span>
              <span className="cross-label hidden md:block">{t.sheetColValue}</span>
              <span className="cross-label hidden md:block">{t.sheetColLimit}</span>
              <span className="cross-label hidden md:block">{t.sheetColStatus}</span>
            </div>

            {rows.map((row) => {
              const open = openRow === row.id && Boolean(row.note);
              return (
                <div key={row.id} className={row.ok ? '' : 'cross-row--over'}>
                  <div className="cross-row" style={{ paddingBottom: row.note ? '0.35rem' : undefined }}>
                    <span className="cross-row__label text-[1rem]" style={{ color: 'inherit' }}>
                      {row.note ? (
                        <button
                          type="button"
                          onClick={() => setOpenRow(open ? null : row.id)}
                          aria-expanded={open}
                          className="text-left underline decoration-current/30 underline-offset-4 hover:decoration-current"
                        >
                          {row.label}
                        </button>
                      ) : (
                        row.label
                      )}
                    </span>
                    <span className="cross-row__value cross-fig text-[1rem] md:text-right">
                      <span className="cross-row__unit cross-label md:hidden">{t.sheetColValue}</span>
                      {row.value}
                    </span>
                    <span className="cross-row__limit cross-label tnum md:text-right">
                      <span className="cross-row__unit cross-label md:hidden">{t.sheetColLimit}</span>
                      {row.limit}
                    </span>
                    <span
                      className="cross-row__status cross-label cross-label--ink md:text-right"
                      style={{ color: row.ok ? undefined : 'var(--cross-check)' }}
                    >
                      <span className="cross-row__unit cross-label md:hidden">{t.sheetColStatus}</span>
                      {row.ok ? t.withinLimit : t.overLimit}
                    </span>
                  </div>
                  {open && row.note && (
                    <p className="cross-body cross-settle max-w-[58ch] pb-4 text-[0.9375rem]">
                      {row.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
