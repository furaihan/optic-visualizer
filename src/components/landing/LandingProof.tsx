import React from 'react';
import { translations, type Language } from '@lib/translations';
import { MATERIALS_DB } from '@data/materials';
import { MATERIAL_FOR } from './work';

/**
 * The standards the instrument holds to: the materials it recommends, and the
 * limits it refuses to let pass. Both come out of the tool's own data.
 */
export function LandingProof({ lang }: { lang: Language }) {
  const t = translations[lang];

  const ladder = [1.5, 1.56, 1.6, 1.67, 1.74].map((index) => {
    const entry = MATERIALS_DB.find((material) => Math.abs(material.index - index) < 0.02);
    return {
      index,
      name: MATERIAL_FOR[index],
      abbe: entry?.abbe ?? 0,
      thinness: entry?.thinness ?? '0%',
    };
  });

  const limits = [
    { key: t.aSize, value: '35–65 mm' },
    { key: t.bSize, value: '20–55 mm' },
    { key: t.dbl, value: '10–28 mm' },
    { key: t.ed, value: '≤ 75 mm' },
    { key: t.minBlank, value: '≤ 85 mm' },
    { key: t.edgeThick, value: '≤ 6.00 mm' },
  ];

  return (
    <section id="standards" className="mx-auto w-full max-w-[1200px] px-6 sm:px-10">
      <div className="reveal grid gap-6 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className="text-[32px] font-medium leading-[1.1] tracking-[-0.025em] text-sheet-ink">
            {t.landProofTitle}
          </h2>
        </div>
      </div>

      <div className="reveal reveal-1 mt-12">
        <p className="text-[16px] text-sheet-muted">{t.landProofMaterials}</p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {ladder.map((material) => (
            <div key={material.index} className="flex flex-col gap-1">
              <dt className="flex items-baseline gap-2">
                <span className="text-[22px] font-medium leading-none text-sheet-ink tnum">
                  {material.index.toFixed(2)}
                </span>
                <span className="text-[16px] text-sheet-muted">{material.name}</span>
              </dt>
              <dd className="mt-1 flex flex-col gap-0.5 text-[13px] text-sheet-muted tnum">
                <span>
                  {t.landProofAbbe} {material.abbe}
                </span>
                <span>
                  {t.landProofVolume}:{' '}
                  {material.thinness === '0%' ? '0%' : `−${material.thinness}`}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="reveal reveal-2 mt-16">
        <p className="text-[16px] text-sheet-muted">{t.landProofLimits}</p>
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {limits.map((limit) => (
            <div key={limit.key} className="flex flex-col gap-1">
              <dt className="text-[13px] leading-tight text-sheet-muted">{limit.key}</dt>
              <dd className="text-[22px] font-medium leading-tight text-sheet-ink tnum">
                {limit.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
