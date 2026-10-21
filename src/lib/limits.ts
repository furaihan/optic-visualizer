import type { CalculationResult, LensParameters } from './optic-engine/types';
import { LIMITS, type LimitKey } from '../data/limits';

/**
 * The clinical limits the engine's output is judged against.
 *
 * One source of truth: the measurement table below the sheet and the verdict
 * line under the title both read these rows, so a number can never be over its
 * limit in one place and within it in another. The thresholds themselves live
 * in the data file, so the sheet and the schedule cannot disagree about
 * them either.
 */

export type LimitId = LimitKey;

export type MeasuredRow = {
  id: LimitId;
  /** The measured value, in the row's unit. */
  value: number;
  /** The threshold it is compared against, in the same unit. */
  limit: number;
  /** `min` when the value must be at least the limit. */
  direction: 'min' | 'max';
  ok: boolean;
  /** How far past the limit it is, in the same unit. Zero when it is within. */
  over: number;
  /**
   * True when the row is a reference figure rather than a limit: it is
   * reported, and it is never a fault.
   */
  reference?: boolean;
  unit: 'mm' | 'g' | 'Δ';
  decimals: number;
};

/**
 * The prism a lens would carry if the optical centre were not placed on the
 * pupil.
 *
 * The optical centre is placed on the pupil, so the prism at the pupil is
 * zero by construction. What a lab wants to know is the prism the lens
 * would carry at the centre of the frame, if the lens were not decentred
 * onto the pupil: Prentice's rule, per principal meridian, so the cylinder
 * and the axis are in the number and so is the vertical offset.
 */
export interface PrismReference {
  /** The prism in the horizontal meridian, in dioptres. */
  horizontal: number;
  /** The prism in the vertical meridian, in dioptres. */
  vertical: number;
  /** The larger of the two: the prism the reference row reports. */
  value: number;
  /** True when the decentration is large enough to warn about. */
  highDecentration: boolean;
}

export function prismReference(
  result: CalculationResult,
  lens?: LensParameters
): PrismReference {
  // The power of a principal meridian, from the prescription: the sphere
  // power along the cylinder's own axis, the full power at ninety degrees
  // to it.
  const powerIn = (theta: number) =>
    lens
      ? lens.sph + lens.cyl * Math.sin(((theta - lens.axis) * Math.PI) / 180) ** 2
      : 0;

  // Prentice's rule: the prism in dioptres is the power in dioptres times
  // the decentration in centimetres.
  const horizontal = Math.abs(powerIn(0)) * (Math.abs(result.decentration) / 10);
  const vertical = Math.abs(powerIn(90)) * (Math.abs(result.decentrationV ?? 0) / 10);

  return {
    horizontal,
    vertical,
    value: Math.max(horizontal, vertical),
    // A decentration is worth a word of warning when it comes with a power
    // that turns it into a real prismatic effect at the pupil.
    highDecentration: lens
      ? result.decentration > 3 && (Math.abs(lens.sph) >= 4 || Math.abs(powerIn(0)) >= 4)
      : false,
  };
}

/**
 * Every measurement the engine produces, checked against its threshold.
 *
 * The prism row is the one reference row. The optical centre is placed on
 * the pupil, so the prism at the pupil is zero by construction; what the
 * row reports is the prism the lens would carry at the centre of the frame
 * if the optical centre were not decentred onto the pupil. It is a fact
 * about the frame and the prescription, not a fault in the lens, so it is
 * never counted as one.
 */
export function measureRows(
  result: CalculationResult,
  lens?: LensParameters
): MeasuredRow[] {
  const prism = prismReference(result, lens);

  // The engine measures the blank from the shape around the optical centre.
  // The fallback is the same rule: twice the farthest the rim reaches from
  // the pupil, plus the edging allowance.
  const blank = result.minBlank ?? 2 * result.y + 2;

  const rows: MeasuredRow[] = (
    [
      {
        id: 'et',
        value: result.et,
      },
      {
        id: 'ct',
        value: result.ct,
      },
      {
        id: 'anterior',
        value: result.anteriorProtrusion,
      },
      {
        id: 'posterior',
        value: result.posteriorProtrusion,
      },
      {
        id: 'weight',
        value: result.weight,
      },
      {
        id: 'prism',
        value: prism.value,
        // The prism at the pupil is zero, because the optical centre is
        // placed on the pupil. This row is the reference figure for a lens
        // that was not decentred onto it, and it is never a fault.
        ok: true,
        over: 0,
        reference: true,
      },
      {
        id: 'blank',
        value: blank,
      },
    ] as Array<{
      id: LimitId;
      value: number;
      ok?: boolean;
      over?: number;
      reference?: boolean;
    }>
  ).map(({ id, value, ok, over, reference }) => {
    const rule = LIMITS[id];
    const within = rule.direction === 'max' ? value <= rule.value : value >= rule.value;
    return {
      id,
      value,
      limit: rule.value,
      direction: rule.direction,
      ok: ok ?? within,
      over: over ?? Math.max(0, rule.direction === 'max' ? value - rule.value : rule.value - value),
      reference,
      unit: rule.unit,
      decimals: rule.decimals,
    } satisfies MeasuredRow;
  });

  return rows;
}

/** The order a violation is reported in: the surface problems first. */
const PRIORITY: LimitId[] = ['anterior', 'posterior', 'et', 'ct', 'blank', 'weight', 'prism'];

/**
 * The one finding the screen leads with: the first measurement outside its
 * limit, in the order an optician would chase them.
 */
export function worstRow(rows: MeasuredRow[]): MeasuredRow | null {
  for (const id of PRIORITY) {
    const row = rows.find((r) => r.id === id);
    if (row && !row.ok) return row;
  }
  return null;
}

/** How many rows are outside their limit. */
export function flaggedCount(rows: MeasuredRow[]): number {
  return rows.filter((r) => !r.ok).length;
}
