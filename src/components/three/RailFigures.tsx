import type { CalculationResult } from "../../lib/optic-engine/types";
import type { AppTranslations } from "../../lib/translations/types";
import { LIMITS, limitLabel } from "../../data/limits";

/**
 * The rail: the figures the body is drawn from, kept live beside it.
 *
 * This is not a summary of the 3D. It is the same measurement the sheet
 * prints, read from the same `CalculationResult`, in the sheet's own type —
 * so a figure on this surface and the same figure on the sheet can never
 * disagree, because there is only one of them.
 *
 * Each row states its own limit, the way the sheet does: a number that is over
 * its threshold says so in words and in the warning ink, rather than leaving
 * the reader to remember what the threshold was. A figure that is only tinted
 * is a figure the optician has to already know the answer for.
 */
export interface RailFiguresProps {
  result: CalculationResult;
  bevelPercent: number;
  frameDepth: number;
  t: AppTranslations;
  onHover?: (key: RailKey | null) => void;
  /** The row the body is pointing at, so the two directions stay in step. */
  active?: RailKey | null;
  /** The angle the field found the thickest edge at, in degrees. */
  governingAngle?: number;
}

export type RailKey = "ct" | "et" | "anterior" | "posterior" | "groove" | "blank";

interface Row {
  key: RailKey;
  label: string;
  value: string;
  ok: boolean;
  /** The rule this figure is read against, as the sheet prints it. */
  limit?: string;
}

/**
 * The figures, as the sheet states them: two decimals for the millimetres the
 * calipers read, none for the blank.
 */
export function railRows(
  result: CalculationResult,
  bevelPercent: number,
  frameDepth: number,
  t: AppTranslations,
): Row[] {
  return [
    {
      key: "ct",
      label: t.center,
      value: `${result.ct.toFixed(2)} mm`,
      ok: result.ct >= LIMITS.ct.value,
      limit: limitLabel("ct"),
    },
    {
      key: "et",
      label: t.edgeThick,
      value: `${result.et.toFixed(2)} mm`,
      ok: result.et <= LIMITS.et.value,
      limit: limitLabel("et"),
    },
    {
      key: "anterior",
      label: t.anteriorProt,
      value: `${result.anteriorProtrusion.toFixed(2)} mm`,
      ok: result.anteriorProtrusion <= LIMITS.anterior.value,
      limit: limitLabel("anterior"),
    },
    {
      key: "posterior",
      label: t.posteriorProt,
      value: `${result.posteriorProtrusion.toFixed(2)} mm`,
      ok: result.posteriorProtrusion <= LIMITS.posterior.value,
      limit: limitLabel("posterior"),
    },
    {
      key: "groove",
      label: t.groove,
      value: `${Math.round(bevelPercent * 100)}%`,
      ok: true,
      // The groove is a setting, not a measurement, and it is stated against
      // the rim depth it is a share of.
      limit: `${frameDepth.toFixed(1)} mm rim`,
    },
    {
      key: "blank",
      label: t.minBlank,
      value: `${Math.round(result.minBlank ?? 0)} mm`,
      ok: (result.minBlank ?? 0) <= LIMITS.blank.value,
      limit: limitLabel("blank"),
    },
  ];
}

export function RailFigures({
  result,
  bevelPercent,
  frameDepth,
  t,
  onHover,
  active = null,
  governingAngle,
}: RailFiguresProps) {
  const rows = railRows(result, bevelPercent, frameDepth, t);

  return (
    <aside className="flex w-[236px] shrink-0 flex-col border-l border-sheet-stage bg-sheet-ground">
      <div className="border-b border-sheet-stage px-5 py-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.14em] text-sheet-muted">
          {t.view3dRailTitle}
        </h2>
      </div>

      <dl className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.key}
            onMouseEnter={() => onHover?.(row.key)}
            onMouseLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(row.key)}
            onBlur={() => onHover?.(null)}
            tabIndex={0}
            className={`group border-b border-sheet-stage px-5 py-2.5 transition-colors ${
              active === row.key ? "bg-sheet-panel" : "bg-transparent"
            } focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sheet-accent`}
          >
            <dt className="text-[12px] leading-tight text-sheet-muted">{row.label}</dt>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <dd
                className={`text-[21px] font-semibold leading-none tracking-[-0.02em] ${
                  row.ok ? "text-sheet-ink" : "text-sheet-warning"
                }`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {row.value}
              </dd>
              {row.limit && (
                <span
                  className={`shrink-0 text-[11px] tabular-nums ${
                    row.ok ? "text-sheet-muted" : "text-sheet-warning"
                  }`}
                >
                  {row.limit}
                </span>
              )}
            </div>
            {!row.ok && (
              <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-sheet-warning">
                {t.overLimit}
              </p>
            )}
          </div>
        ))}
      </dl>

      {typeof governingAngle === "number" && (
        <p className="mt-auto px-5 py-4 text-[12px] leading-relaxed text-sheet-muted">
          {t.view3dGoverningAt.replace("{angle}", `${Math.round(governingAngle)}°`)}
        </p>
      )}
    </aside>
  );
}
