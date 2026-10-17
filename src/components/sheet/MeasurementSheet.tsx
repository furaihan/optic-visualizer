import React, { useState } from 'react';
import { CalculationResult, FrameParameters, LensParameters } from '../../lib/optic-engine/types';
import { translations, Language } from '../../lib/translations';

interface MeasurementSheetProps {
  result: CalculationResult;
  compareResult?: CalculationResult;
  lang: Language;
  frame?: FrameParameters;
  lens?: LensParameters;
  /** Kept for call-site compatibility: values are always live, so no skeleton. */
  isLoading?: boolean;
  isAdvanced?: boolean;
}

type Row = {
  id: string;
  label: string;
  value: string;
  limit: string;
  ok: boolean;
  detail: string;
  compareValue?: string;
};

/**
 * The measurement sheet.
 *
 * Every value the engine produces, in the order a lab checks them, as a real
 * table: measurement, value, the threshold it is compared against, and its
 * status. One row opens at a time and holds the clinical note, so a warning is
 * never a floating card over the drawing.
 */
export const MeasurementSheet: React.FC<MeasurementSheetProps> = ({
  result,
  compareResult,
  lang,
  frame,
  lens,
  isAdvanced = true,
}) => {
  const t = translations[lang];
  const [open, setOpen] = useState<string | null>(null);

  const mm = (v: number) => `${v.toFixed(2)} mm`;

  const etOk = result.et <= 6;
  const ctOk = result.ct >= 1;
  const antOk = result.anteriorProtrusion <= 1.5;
  const postOk = result.posteriorProtrusion <= 2;
  const weightOk = result.weight <= 15;
  const blankOk = result.y * 2 + 2 <= 85;

  const totalPower = lens ? (lens.sph + (lens.cyl < 0 ? 0 : lens.cyl)) : 0;
  const inducedPrism = lens ? Math.abs(totalPower) * (result.decentration / 10) : 0;
  const highDecentration = lens ? result.decentration > 3 && (Math.abs(lens.sph) >= 4 || Math.abs(totalPower) >= 4) : false;

  const rows: Row[] = [
    {
      id: 'et',
      label: t.edgeThick,
      value: mm(result.et),
      limit: '≤ 6.00 mm',
      ok: etOk,
      detail: t.guideEtDesc,
      compareValue: compareResult ? mm(compareResult.et) : undefined,
    },
    {
      id: 'ct',
      label: t.center,
      value: mm(result.ct),
      limit: '≥ 1.00 mm',
      ok: ctOk,
      detail: t.guideCtDesc,
      compareValue: compareResult ? mm(compareResult.ct) : undefined,
    },
    {
      id: 'anterior',
      label: t.anteriorProt,
      value: mm(result.anteriorProtrusion),
      limit: '≤ 1.50 mm',
      ok: antOk,
      detail: t.guideProtDesc,
      compareValue: compareResult ? mm(compareResult.anteriorProtrusion) : undefined,
    },
    {
      id: 'posterior',
      label: t.posteriorProt,
      value: mm(result.posteriorProtrusion),
      limit: '≤ 2.00 mm',
      ok: postOk,
      detail: t.guideProtDesc,
      compareValue: compareResult ? mm(compareResult.posteriorProtrusion) : undefined,
    },
    {
      id: 'weight',
      label: t.lensWeight,
      value: `${result.weight.toFixed(1)} g`,
      limit: `≤ 15.0 g · ${t.weightComfort} < 10 g`,
      ok: weightOk,
      detail: t.guideWeightDesc,
      compareValue: compareResult ? `${compareResult.weight.toFixed(1)} g` : undefined,
    },
  ];

  if (isAdvanced) {
    rows.push(
      {
        id: 'r1',
        label: t.r1Front,
        value: Number.isFinite(result.r1) ? mm(result.r1) : '∞',
        limit: 'No limit',
        ok: true,
        detail: `${t.curvatureSpecs}: R = 1000 · (n − 1) / BC.`,
      },
      {
        id: 'r2',
        label: t.r2Back,
        value: Number.isFinite(result.r2) ? mm(result.r2) : 'PLANO',
        limit: 'No limit',
        ok: true,
        detail: `${t.curvatureSpecs}: back power ${result.backPower.toFixed(2)} D.`,
      },
      {
        id: 's1',
        label: t.s1Sag,
        value: mm(result.s1),
        limit: 'No limit',
        ok: true,
        detail: 's = R − √(R² − y²), evaluated at the effective radius y.',
      },
      {
        id: 's2',
        label: t.s2Sag,
        value: mm(result.s2),
        limit: 'No limit',
        ok: true,
        detail: 's = R − √(R² − y²), evaluated at the effective radius y.',
      },
      {
        id: 'prism',
        label: t.inducedPrism,
        value: `${inducedPrism.toFixed(2)} Δ`,
        limit: '≤ 1.00 Δ',
        ok: !highDecentration,
        detail: t.decentrationWarning
          .replace('{decentration}', result.decentration.toFixed(1))
          .replace('{prism}', inducedPrism.toFixed(1)),
      },
      {
        id: 'blank',
        label: t.minBlank,
        value: `${(result.y * 2 + 2).toFixed(0)} mm`,
        limit: '≤ 85 mm',
        ok: blankOk,
        detail: t.limitWarningA(frame?.a ?? 0, Number((result.y * 2 + 2).toFixed(0))),
      },
    );
  }

  const flagged = rows.filter((r) => !r.ok);

  return (
    <section data-ui className="flex flex-col gap-4" aria-labelledby="measurements-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="measurements-title" className="text-[26px] font-medium leading-tight tracking-[-0.02em] text-sheet-ink">
          {t.sheetMeasurements}
        </h2>
        <p className={`text-[13px] ${flagged.length ? 'text-sheet-warning' : 'text-sheet-muted'}`}>
          {flagged.length > 0 ? `${flagged.length} × ${t.overLimit}` : t.withinLimit}
        </p>
      </div>

      {/* When the inputs are invalid the engine falls back to placeholders.
          Say so, rather than letting a placeholder pass for a measurement. */}
      {result.error && (
        <p className="bg-sheet-tint p-3 text-[16px] leading-snug text-sheet-ink">
          {result.errorMessage ? `${result.errorMessage} ` : ''}
          {t.invalidInput}
        </p>
      )}

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="text-[13px] text-sheet-muted">
            <th scope="col" className="pb-2 font-normal">{t.sheetColMeasure}</th>
            <th scope="col" className="pb-2 text-right font-normal">{t.sheetColValue}</th>
            <th scope="col" className="hidden pb-2 text-right font-normal sm:table-cell">{t.sheetColLimit}</th>
            <th scope="col" className="pb-2 pl-4 text-right font-normal">{t.sheetColStatus}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isOpen = open === row.id;
            return (
              <React.Fragment key={row.id}>
                <tr
                  className={`sheet-rise delay-${Math.min(i + 1, 9)} cursor-pointer transition-colors duration-150 ${
                    row.ok ? 'bg-sheet-panel hover:bg-sheet-tint' : 'bg-sheet-tint hover:bg-sheet-stage'
                  }`}
                  onClick={() => setOpen(isOpen ? null : row.id)}
                >
                  <th scope="row" className="py-3 pl-3 pr-2 text-left text-[16px] font-normal text-sheet-ink">
                    <button
                      type="button"
                      className="text-left underline-offset-4 hover:underline focus-visible:underline"
                      aria-expanded={isOpen}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(isOpen ? null : row.id);
                      }}
                    >
                      {row.label}
                    </button>
                  </th>
                  <td className="py-3 pr-2 text-right text-[22px] font-medium leading-none text-sheet-ink tnum">
                    <span key={row.value} className="value-step inline-block">{row.value}</span>
                    {row.compareValue && (
                      <span className="mt-1 block text-[13px] font-normal text-sheet-muted tnum">
                        {t.compareAgainst} {row.compareValue}
                      </span>
                    )}
                  </td>
                  <td className="hidden py-3 pr-2 text-right text-[13px] text-sheet-muted tnum sm:table-cell">
                    {row.limit}
                  </td>
                  <td className="py-3 pl-4 pr-3 text-right">
                    <span
                      className={`inline-block px-2 py-1 text-[13px] leading-none ${
                        row.ok
                          ? 'bg-sheet-stage text-sheet-ink'
                          : 'bg-sheet-warning text-white'
                      }`}
                    >
                      {row.ok ? t.withinLimit : t.overLimit}
                    </span>
                  </td>
                </tr>
                {isOpen && (
                  <tr className={row.ok ? 'bg-sheet-panel' : 'bg-sheet-tint'}>
                    <td colSpan={4} className="sheet-fade px-3 pb-4 pt-1">
                      <p className="max-w-[68ch] text-[16px] leading-relaxed text-sheet-ink">
                        {row.detail}
                      </p>
                      <p className="mt-1 text-[13px] text-sheet-muted tnum">
                        {t.threshold} {row.limit}
                      </p>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {flagged.length === 0 && (
        <p className="text-[13px] text-sheet-muted">{t.rowOpenHint}</p>
      )}
    </section>
  );
};
