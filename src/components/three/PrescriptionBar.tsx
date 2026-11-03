import type { FrameParameters, LensParameters } from "../../lib/optic-engine/types";
import type { AppTranslations } from "../../lib/translations/types";

/**
 * The prescription the body was built from.
 *
 * A lens body without its prescription is a shape: the reader can see that one
 * edge is thicker, but not that a minus four with no cylinder is what made it
 * that way, or that the toric reading is the axis. The sheet states its inputs
 * once at the top and the drawing reads as a consequence; this surface states
 * them the same way, in the same words, so the two are read with one
 * vocabulary.
 *
 * The figures are the session's own, not a copy: changing an input on the
 * inspector changes both the body and this line in the same frame.
 *
 * The slots do not reflow. A prescription is read down its columns, so CYL and
 * AXIS keep their places when there is no cylinder and show an em dash instead
 * of the row rearranging itself under the reader's eye.
 */

/** A signed dioptre value, as a prescription is written: −4.00, +1.25. */
function dioptre(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "\u2212" : "";
  return `${sign}${Math.abs(value).toFixed(2)}`;
}

export interface PrescriptionBarProps {
  lens: LensParameters;
  frame: FrameParameters;
  t: AppTranslations;
  /** False while the surface is in Present mode, which states claims instead. */
  detailed?: boolean;
}

const EMPTY = "\u2014";

export function PrescriptionBar({ lens, frame, t, detailed = true }: PrescriptionBarProps) {
  const hasCylinder = Math.abs(lens.cyl) >= 0.005;

  return (
    <div className="pointer-events-none absolute left-5 top-5 flex flex-col gap-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-sheet-muted">
        {t.view3dRx}
      </p>

      <div className="flex items-end gap-6">
        <Figure label={t.view3dRxSphere} value={dioptre(lens.sph)} />
        <Figure
          label={t.view3dRxCylinder}
          value={hasCylinder ? dioptre(lens.cyl) : EMPTY}
          muted={!hasCylinder}
        />
        <Figure
          label={t.view3dRxAxis}
          value={hasCylinder ? `${Math.round(lens.axis)}\u00B0` : EMPTY}
          muted={!hasCylinder}
        />
        <Figure label={t.view3dRxIndex} value={lens.index.toFixed(2)} />
      </div>

      {detailed && (
        <p className="flex items-baseline gap-2 text-[11px] text-sheet-muted">
          <span className="uppercase tracking-[0.12em]">{t.view3dFrameSize}</span>
          <span style={{ fontVariantNumeric: "tabular-nums" }}>
            {t.view3dFrameSizeValue
              .replace("{a}", String(frame.a))
              .replace("{b}", String(frame.b))
              .replace("{dbl}", String(frame.dbl))
              .replace("{ed}", String(frame.ed))}
          </span>
        </p>
      )}
    </div>
  );
}

function Figure({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <span className="flex min-w-[52px] flex-col gap-0.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-sheet-muted">
        {label}
      </span>
      <span
        className={`text-[18px] font-medium leading-none ${
          muted ? "text-sheet-muted" : "text-sheet-ink"
        }`}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </span>
    </span>
  );
}