import React, { useState } from 'react';
import { CalculationResult, FrameParameters, LensParameters } from '../../lib/optic-engine/types';
import { translations, Language } from '../../lib/translations';
import { measureRows, prismReference } from '../../lib/limits';
import { limitLabel } from '../../data/limits';

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
  /** A reference figure: reported, but never a fault. */
  reference?: boolean;
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

  // The limits live in one place, so the table under the sheet and the
  // verdict line above it can never disagree about what is out of bounds.
  const measured = measureRows(result, lens);
  const row = (id: string) => measured.find((r) => r.id === id)!;

  const etOk = row('et').ok;
  const ctOk = row('ct').ok;
  const antOk = row('anterior').ok;
  const postOk = row('posterior').ok;
  const weightOk = row('weight').ok;
  const prismOk = row('prism').ok;
  const blankOk = row('blank').ok;

  // The prism is a reference figure, not a limit: the optical centre is
  // placed on the pupil, so the prism at the pupil is zero whatever the
  // frame is. The row reports the prism the lens would carry at the centre
  // of the frame if it were not decentred onto the pupil.
  const prism = prismReference(result, lens);
  const blank = row('blank').value;

  const rows: Row[] = [
    {
      id: 'et',
      label: t.edgeThick,
      value: mm(result.et),
      limit: limitLabel('et'),
      ok: etOk,
      detail: t.guideEtDesc,
      compareValue: compareResult ? mm(compareResult.et) : undefined,
    },
    {
      id: 'ct',
      label: t.center,
      value: mm(result.ct),
      limit: limitLabel('ct'),
      ok: ctOk,
      detail: t.guideCtDesc,
      compareValue: compareResult ? mm(compareResult.ct) : undefined,
    },
    {
      id: 'anterior',
      label: t.anteriorProt,
      value: mm(result.anteriorProtrusion),
      limit: limitLabel('anterior'),
      ok: antOk,
      detail: t.guideProtDesc,
      compareValue: compareResult ? mm(compareResult.anteriorProtrusion) : undefined,
    },
    {
      id: 'posterior',
      label: t.posteriorProt,
      value: mm(result.posteriorProtrusion),
      limit: limitLabel('posterior'),
      ok: postOk,
      detail: t.guideProtDesc,
      compareValue: compareResult ? mm(compareResult.posteriorProtrusion) : undefined,
    },
    {
      id: 'weight',
      label: t.lensWeight,
      value: `${result.weight.toFixed(1)} g`,
      limit: `${limitLabel('weight')} · ${t.weightComfort} < 10 g`,
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
        detail: `${t.curvatureSpecs}: back power ${result.backPower.toFixed(2)} D. ${
          typeof result.vertexPower === 'number'
            ? t.vertexPowerDesc.replace('{power}', result.vertexPower.toFixed(2))
            : ''
        }`,
      },
      {
        id: 's1',
        label: t.s1Sag,
        value: mm(result.s1),
        limit: 'No limit',
        ok: true,
        detail: 's = R − √(R² − y²), at the rim of the thickest edge.',
      },
      {
        id: 's2',
        label: t.s2Sag,
        value: mm(result.s2),
        limit: 'No limit',
        ok: true,
        detail: 's = R − √(R² − y²), at the rim of the thickest edge.',
      },
      {
        id: 'prism',
        label: t.prismReference,
        value: `${prism.value.toFixed(2)} Δ`,
        limit: limitLabel('prism'),
        ok: prismOk,
        reference: true,
        detail: [
          t.prismReferenceDesc(
            prism.horizontal.toFixed(2),
            prism.vertical.toFixed(2),
            result.decentration.toFixed(1),
          ),
          prism.highDecentration
            ? t.decentrationWarning
                .replace('{decentration}', result.decentration.toFixed(1))
                .replace('{prism}', prism.value.toFixed(1))
            : '',
        ]
          .filter(Boolean)
          .join(' '),
      },
      {
        id: 'blank',
        label: t.minBlank,
        value: `${blank.toFixed(0)} mm`,
        limit: limitLabel('blank'),
        ok: blankOk,
        detail: t.limitWarningA(frame?.a ?? 0, Number(blank.toFixed(0))),
      },
    );

    // The aspheric surfaces bring their own figures. They are the engine's
    // detail, so they belong with the rest of it — and a figure the engine does
    // not compute is never printed as a zero.
    const aspheric = result as unknown as {
      departure?: number;
      conic?: number;
    };
    if (typeof aspheric.departure === 'number') {
      rows.push(
        {
          id: 'k',
          label: t.conicConstant,
          value: aspheric.conic !== undefined ? aspheric.conic.toFixed(2) : '—',
          limit: 'No limit',
          ok: true,
          detail: t.asphericDetailK,
        },
        {
          id: 'departure',
          label: t.asphericDeparture,
          value: `${aspheric.departure.toFixed(3)} mm`,
          limit: 'No limit',
          ok: true,
          detail: t.asphericDetailDeparture,
        },
      );
    }
  }

  const flagged = rows.filter((r) => !r.ok);

  return (
    <section data-ui className="@container flex flex-col gap-4" aria-labelledby="measurements-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="measurements-title" className="text-[26px] font-medium leading-tight tracking-[-0.02em] text-sheet-ink">
          {t.sheetMeasurements}
        </h2>
        <p className={`whitespace-nowrap text-[13px] ${result.error || flagged.length ? 'text-sheet-warning' : 'text-sheet-muted'}`}>
          {result.error
            ? t.invalidInput
            : flagged.length > 0
              ? `${flagged.length} × ${t.overLimit}`
              : t.withinLimit}
        </p>
      </div>

      {/* When the inputs are invalid the engine falls back to placeholders.
          Say so, rather than letting a placeholder pass for a measurement. */}
      {result.error && (
        <p className="bg-sheet-alert p-3 text-[16px] leading-snug text-sheet-ink">
          {result.errorMessage ? `${result.errorMessage} ` : ''}
          {t.invalidInput}
        </p>
      )}

      {/* The vertex power is the power the patient wears. The engine re-solves
          the back power for it, but it says so when the geometry will not let
          it land on the prescription. */}
      {typeof result.vertexPowerError === 'number' &&
        Math.abs(result.vertexPowerError) > 0.12 && (
          <p className="bg-sheet-alert p-3 text-[16px] leading-snug text-sheet-ink">
            {t.vertexPowerWarning.replace(
              '{error}',
              result.vertexPowerError.toFixed(2),
            )}
          </p>
        )}

      {!result.error && <table className="w-full border-collapse text-left">
        <thead>
          <tr className="text-[13px] text-sheet-muted">
            <th scope="col" className="pb-2 font-normal">{t.sheetColMeasure}</th>
            <th scope="col" className="pb-2 text-right font-normal">{t.sheetColValue}</th>
            <th scope="col" className="hidden pb-2 text-right font-normal @2xl:table-cell">{t.sheetColLimit}</th>
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
                    row.ok ? 'bg-sheet-panel hover:bg-sheet-info' : 'bg-sheet-alert hover:bg-sheet-stage'
                  }`}
                  onClick={() => setOpen(isOpen ? null : row.id)}
                >
                  <th scope="row" className="whitespace-nowrap py-3 pl-3 pr-2 text-left text-[16px] font-normal text-sheet-ink">
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
                  <td className="whitespace-nowrap py-3 pr-2 text-right text-[22px] font-medium leading-none text-sheet-ink tnum">
                    <span key={row.value} className="value-step inline-block">{row.value}</span>
                    {row.compareValue && (
                      <span className="mt-1 block text-[13px] font-normal text-sheet-muted tnum">
                        {t.compareAgainst} {row.compareValue}
                      </span>
                    )}
                  </td>
                  <td className="hidden py-3 pr-2 text-right text-[13px] text-sheet-muted tnum @2xl:table-cell">
                    {row.limit}
                  </td>
                  <td className="py-3 pl-4 pr-3 text-right">
                    <span
                      className={`inline-block whitespace-nowrap px-2 py-1 text-[13px] leading-none ${
                        row.reference
                          ? 'bg-sheet-panel text-sheet-muted'
                          : row.ok
                            ? 'bg-sheet-stage text-sheet-ink'
                            : 'bg-sheet-warning text-sheet-warning-ink'
                      }`}
                    >
                      {row.reference ? t.reference : row.ok ? t.withinLimit : t.overLimit}
                    </span>
                  </td>
                </tr>
                {isOpen && (
                  <tr className={row.ok ? 'bg-sheet-panel' : 'bg-sheet-alert'}>
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
      </table>}

      {!result.error && flagged.length === 0 && (
        <p className="text-[13px] text-sheet-muted">{t.rowOpenHint}</p>
      )}

      {/* What the model assumes, stated where the numbers are read: a frame
          without a base curve of its own, so the lens is placed by the
          vertical meridian and the protrusion is measured in that plane. */}
      <p className="max-w-[68ch] border-t border-sheet-panel pt-3 text-[13px] leading-relaxed text-sheet-muted">
        {t.flatFrameNote}
      </p>
    </section>
  );
};
