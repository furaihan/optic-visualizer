import type { CalculationResult, LensParameters } from './optic-engine/types';

/**
 * The clinical limits the engine's output is judged against.
 *
 * One source of truth: the measurement table below the sheet and the verdict
 * line under the title both read these rows, so a number can never be over its
 * limit in one place and within it in another.
 */

export type LimitId =
  | 'et'
  | 'ct'
  | 'anterior'
  | 'posterior'
  | 'weight'
  | 'prism'
  | 'blank';

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
  /** True when the row is flagged for a reason other than its own number. */
  compound?: boolean;
  unit: 'mm' | 'g' | 'Δ';
  decimals: number;
};

/**
 * Every measurement the engine produces, checked against its threshold.
 *
 * The prism row is the one compound rule: a prismatic effect is only a fault
 * when it comes with a decentration, so it is flagged by the pair and not by
 * its own number.
 */
export function measureRows(
  result: CalculationResult,
  lens?: LensParameters
): MeasuredRow[] {
  const totalPower = lens ? lens.sph + (lens.cyl < 0 ? 0 : lens.cyl) : 0;
  const inducedPrism = lens ? Math.abs(totalPower) * (result.decentration / 10) : 0;
  const highDecentration = lens
    ? result.decentration > 3 && (Math.abs(lens.sph) >= 4 || Math.abs(totalPower) >= 4)
    : false;
  const blank = result.y * 2 + 2;

  const rows: MeasuredRow[] = [
    {
      id: 'et',
      value: result.et,
      limit: 6,
      direction: 'max',
      ok: result.et <= 6,
      over: Math.max(0, result.et - 6),
      unit: 'mm',
      decimals: 2,
    },
    {
      id: 'ct',
      value: result.ct,
      limit: 1,
      direction: 'min',
      ok: result.ct >= 1,
      over: Math.max(0, 1 - result.ct),
      unit: 'mm',
      decimals: 2,
    },
    {
      id: 'anterior',
      value: result.anteriorProtrusion,
      limit: 1.5,
      direction: 'max',
      ok: result.anteriorProtrusion <= 1.5,
      over: Math.max(0, result.anteriorProtrusion - 1.5),
      unit: 'mm',
      decimals: 2,
    },
    {
      id: 'posterior',
      value: result.posteriorProtrusion,
      limit: 2,
      direction: 'max',
      ok: result.posteriorProtrusion <= 2,
      over: Math.max(0, result.posteriorProtrusion - 2),
      unit: 'mm',
      decimals: 2,
    },
    {
      id: 'weight',
      value: result.weight,
      limit: 15,
      direction: 'max',
      ok: result.weight <= 15,
      over: Math.max(0, result.weight - 15),
      unit: 'g',
      decimals: 1,
    },
    {
      id: 'prism',
      value: inducedPrism,
      limit: 1,
      direction: 'max',
      ok: !highDecentration,
      over: Math.max(0, inducedPrism - 1),
      compound: highDecentration,
      unit: 'Δ',
      decimals: 2,
    },
    {
      id: 'blank',
      value: blank,
      limit: 85,
      direction: 'max',
      ok: blank <= 85,
      over: Math.max(0, blank - 85),
      unit: 'mm',
      decimals: 0,
    },
  ];

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
