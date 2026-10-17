import React from 'react';
import { CalculationResult } from '../../lib/optic-engine/types';
import { translations, Language } from '../../lib/translations';

interface RecommendationRowProps {
  result: CalculationResult;
  /** Kept for call-site compatibility; the figure follows the recommended index. */
  lensIndex?: number;
  lang: Language;
}

/**
 * The engine's index recommendation, set as one band of the sheet: the index
 * it suggests, the material, the Abbe number, and the reason in words.
 * No glow, no badge stack, no gradient meter.
 */
export const RecommendationRow: React.FC<RecommendationRowProps> = ({
  result,
  lang,
}) => {
  const t = translations[lang];
  const rec = result.recommendation;
  if (!rec) return null;

  // The volume figure belongs to the index being recommended, not to the one
  // currently in the frame: the block is about the advice, so the number is too.
  const volumeReductionPercent = Math.max(0, Math.round((1 - 0.5 / (rec.index - 1)) * 100));

  return (
    <section data-ui className="flex flex-col gap-4 rounded-sm bg-sheet-panel p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-[26px] font-medium leading-tight tracking-[-0.02em] text-sheet-ink">
          {t.recomTitle}
        </h2>
        <p className="text-[13px] text-sheet-muted tnum">{t.geometricRuleBase}</p>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-sheet-muted">{t.refractiveIndex}</span>
          <span className="text-[28px] font-medium leading-none text-sheet-ink tnum">
            {rec.index.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-sheet-muted">{t.bestChoice}</span>
          <span className="text-[16px] leading-snug text-sheet-ink">{rec.material}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-sheet-muted">Abbe</span>
          <span className="text-[28px] font-medium leading-none text-sheet-ink tnum">{rec.abbe}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-sheet-muted">{t.volumeLabel} vs 1.50</span>
          <span className="text-[28px] font-medium leading-none text-sheet-ink tnum">
            −{volumeReductionPercent}%
          </span>
        </div>
      </div>

      <p className="max-w-[72ch] text-[16px] leading-relaxed text-sheet-ink">
        {rec.reason === 'simErrorDesc' ? t.simErrorDesc : rec.reason}
      </p>

      <p className="text-[13px] text-sheet-muted tnum">
        {t.volumeReduction
          .replace('{index}', rec.index.toFixed(2))
          .replace('{percent}', volumeReductionPercent.toFixed(0))}
      </p>
    </section>
  );
};
