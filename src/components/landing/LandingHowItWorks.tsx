import React from 'react';
import { translations, type Language } from '@lib/translations';
import { MeasurementSheet } from '@components/sheet/MeasurementSheet';
import { CallPanel } from './parts';
import { EXAMPLE_FRAME, EXAMPLE_LENS, computeExample, mm } from './work';

/**
 * How the instrument is used: what you put in, and what comes back.
 *
 * The three entries are the three the workbench asks for — the prescription,
 * the frame, the fitting — and the third answer is the finished sheet, which
 * breaks out of the column and runs the width of the page.
 */
export function LandingHowItWorks({ lang }: { lang: Language }) {
  const t = translations[lang];
  const result = computeExample();

  const steps = [
    {
      title: t.landHow1,
      body: t.landHow1Body,
      group: 'rx' as const,
      callTitle: t.rxLine,
      pairs: [
        { key: 'SPH', value: '-4.00' },
        { key: 'CYL', value: '0.00' },
        { key: 'AXIS', value: '0°' },
        { key: t.refractiveIndex, value: '1.60' },
        { key: 'BC', value: '4.00 D' },
      ],
      answer: [
        { key: t.r1Front, value: mm(result.r1) },
        { key: t.r2Back, value: mm(result.r2) },
        { key: t.s1Sag, value: mm(result.s1) },
        { key: t.s2Sag, value: mm(result.s2) },
      ],
    },
    {
      title: t.landHow2,
      body: t.landHow2Body,
      group: 'frame' as const,
      callTitle: t.frameLine,
      pairs: [
        { key: 'A', value: `${EXAMPLE_FRAME.a}` },
        { key: 'B', value: `${EXAMPLE_FRAME.b}` },
        { key: 'DBL', value: `${EXAMPLE_FRAME.dbl}` },
        { key: 'ED', value: `${EXAMPLE_FRAME.ed}` },
        { key: t.frameDepth, value: mm(EXAMPLE_FRAME.depth) },
      ],
      answer: [
        { key: t.framePd, value: `${(EXAMPLE_FRAME.a + EXAMPLE_FRAME.dbl).toFixed(0)} mm` },
        { key: t.minBlank, value: `${(result.y * 2 + 2).toFixed(0)} mm` },
        { key: t.groove, value: '33%' },
      ],
    },
  ];

  return (
    <section className="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
      <h2 className="reveal text-[32px] font-medium leading-[1.1] tracking-[-0.025em] text-sheet-ink">
        {t.landHowTitle}
      </h2>

      <div className="mt-14 flex flex-col gap-20 lg:gap-28">
        {steps.map((step) => (
          <div
            key={step.title}
            className="reveal grid gap-8 lg:grid-cols-12 lg:gap-12"
          >
            <div className="lg:col-span-5">
              <h3 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-sheet-ink">
                {step.title}
              </h3>
              <p className="mt-4 max-w-[46ch] text-[18px] leading-[1.6] text-sheet-muted">
                {step.body}
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:col-span-7">
              <CallPanel
                group={step.group}
                title={step.callTitle}
                pairs={step.pairs}
                lang={lang}
              />
              <div
                data-ui
                className="rounded-sm bg-sheet-ground p-5"
              >
                <p className="text-[13px] font-medium text-sheet-ink">
                  {t.landHowResponse}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                  {step.answer.map((pair) => (
                    <div key={pair.key} className="flex min-w-0 flex-col gap-0.5">
                      <dt className="text-[13px] leading-tight text-sheet-muted">{pair.key}</dt>
                      <dd className="text-[22px] font-medium leading-tight text-sheet-ink tnum">
                        {pair.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        ))}

        {/* The third entry: the fitting, and the sheet that comes out of it. */}
        <div className="reveal grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h3 className="text-[26px] font-medium leading-[1.15] tracking-[-0.02em] text-sheet-ink">
              {t.landHow3}
            </h3>
            <p className="mt-4 max-w-[46ch] text-[18px] leading-[1.6] text-sheet-muted">
              {t.landHow3Body}
            </p>
            <div className="mt-6 max-w-[420px]">
              <CallPanel
                group="fit"
                title={t.fittingLine}
                pairs={[
                  { key: 'PD', value: '63' },
                  { key: t.fittingHeight, value: '22' },
                  { key: t.bevelPos, value: '33%' },
                ]}
                lang={lang}
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <MeasurementSheet
              result={result}
              lang={lang}
              frame={EXAMPLE_FRAME}
              lens={EXAMPLE_LENS}
              isAdvanced={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
