import type { AppTranslations } from "../../lib/translations/types";

/**
 * The thickness map's own scale.
 *
 * A ramp without numbers is decoration. These are the two figures the body
 * spans, printed under it, so the colour can be read as a millimetre the way
 * the rail's figures can.
 */
export function HeatLegend({
  min,
  max,
  t,
}: {
  min: number;
  max: number;
  t: AppTranslations;
}) {
  return (
    <div className="pointer-events-none absolute bottom-3 right-4 flex w-[228px] flex-col gap-1.5">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-sheet-muted">
        {t.view3dHeatLegend}
      </p>
      <div
        className="h-2 w-full"
        style={{
          background:
            "linear-gradient(90deg, #dcecf7 0%, #9ecbe8 35%, #4a9ed4 70%, #156fb5 100%)",
        }}
        aria-hidden="true"
      />
      <div className="flex justify-between text-[12px] text-sheet-muted" style={{ fontVariantNumeric: "tabular-nums" }}>
        <span>{min.toFixed(2)} mm</span>
        <span>{max.toFixed(2)} mm</span>
      </div>
    </div>
  );
}
