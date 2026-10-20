import React from 'react';
import { CalculationResult } from '../../lib/optic-engine/types';
import { Language, translations } from '../../lib/translations';

interface CompareLegendProps {
  lang: Language;
  index: number;
  compareIndex: number | null;
  result: CalculationResult;
  compareResult: CalculationResult;
}

/**
 * The legend that makes the drawing readable at a glance.
 *
 * At the board's scale two indices are a fraction of a millimetre apart — a
 * couple of pixels on screen — so the outlines alone cannot carry the
 * comparison. This states both specs and the difference as numbers, in the
 * board's own header where the eye already looks for the view's name, and
 * swatches each row the way the drawing draws it: a solid dot for the primary
 * lens, a hatch for the comparison.
 *
 * The saving is written as a sentence rather than a signed delta: "1.74 saves
 * 0.74 mm" cannot be misread, whereas a bare "−0.74" leaves the reader to work
 * out which of the two lenses is the thinner one.
 */
export const CompareLegend: React.FC<CompareLegendProps> = ({
  lang,
  index,
  compareIndex,
  result,
  compareResult,
}) => {
  const t = translations[lang];

  const saved = result.et - compareResult.et;
  const savedPct = result.et > 0 ? (saved / result.et) * 100 : 0;
  const thinner = saved > 0.005;

  const spec = (r: CalculationResult) => `ET ${r.et.toFixed(2)} · CT ${r.ct.toFixed(2)}`;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] tnum">
      <span className="flex items-center gap-1.5 text-sheet-muted">
        <span aria-hidden="true" className="inline-block size-2.5 rounded-full bg-sheet-rx" />
        <span className="font-medium text-sheet-ink">n {index.toFixed(2)}</span>
        <span>{spec(result)}</span>
      </span>

      <span className="flex items-center gap-1.5 text-sheet-muted">
        <span
          aria-hidden="true"
          className="inline-block size-2.5 border border-sheet-ink"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, var(--sheet-muted) 0 1px, transparent 1px 3px)',
          }}
        />
        <span className="font-medium text-sheet-ink">
          n {(compareIndex ?? 0).toFixed(2)}
        </span>
        <span>{spec(compareResult)}</span>
      </span>

      <span className="font-semibold text-sheet-ink">
        {Math.abs(saved) < 0.005
          ? t.compareSame
          : thinner
            ? `${(compareIndex ?? 0).toFixed(2)} ${t.compareSaves} ${saved.toFixed(2)} mm · ${savedPct.toFixed(0)}%`
            : `${index.toFixed(2)} ${t.compareSaves} ${Math.abs(saved).toFixed(2)} mm · ${Math.abs(savedPct).toFixed(0)}%`}
      </span>
    </div>
  );
};
