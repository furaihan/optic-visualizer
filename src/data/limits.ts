/**
 * The clinical limits the engine's output is judged against.
 *
 * One source of truth: the measurement table, the schedule under the
 * drawing and the verdict line above it all read these numbers, so a figure
 * can never be over its limit in one place and within it in another.
 *
 * Every limit carries where it comes from. `guideline` means the number is
 * the tool's own working rule: it is not taken from a published standard,
 * and the sheet says as much. A limit that does come from a standard names
 * it, as `standard:ANSI Z80.1`.
 */
export type LimitSource = 'guideline' | `standard:${string}`;

/** One rule: the threshold, the way it is read, and where it comes from. */
export interface LimitRule {
  /** The threshold, in the row's unit. */
  value: number;
  /** `min` when the measured value has to be at least the limit. */
  direction: 'min' | 'max';
  /** The unit the threshold is in. */
  unit: 'mm' | 'g' | 'Δ';
  /** How many decimals the row shows. */
  decimals: number;
  /** Where the number comes from. */
  source: LimitSource;
}

/**
 * Every limit the sheet measures against.
 *
 * The edge thickness, the centre thickness, the two protrusions, the weight
 * of the lens, the reference prism and the blank it has to be cut from.
 */
export const LIMITS = {
  et: {
    value: 6,
    direction: 'max',
    unit: 'mm',
    decimals: 2,
    source: 'guideline',
  },
  ct: {
    value: 1,
    direction: 'min',
    unit: 'mm',
    decimals: 2,
    source: 'guideline',
  },
  anterior: {
    value: 1.5,
    direction: 'max',
    unit: 'mm',
    decimals: 2,
    source: 'guideline',
  },
  posterior: {
    value: 2,
    direction: 'max',
    unit: 'mm',
    decimals: 2,
    source: 'guideline',
  },
  weight: {
    value: 15,
    direction: 'max',
    unit: 'g',
    decimals: 1,
    source: 'guideline',
  },
  prism: {
    value: 1,
    direction: 'max',
    unit: 'Δ',
    decimals: 2,
    source: 'guideline',
  },
  blank: {
    value: 85,
    direction: 'max',
    unit: 'mm',
    decimals: 0,
    source: 'guideline',
  },
} as const satisfies Record<string, LimitRule>;

/** The rows the sheet measures. */
export type LimitKey = keyof typeof LIMITS;

/**
 * The threshold as the sheet prints it: the sign the rule is read with, the
 * number, and the unit.
 */
export function limitLabel(id: LimitKey): string {
  const rule = LIMITS[id];
  const sign = rule.direction === 'max' ? '≤' : '≥';
  return `${sign} ${rule.value.toFixed(rule.decimals)} ${rule.unit}`;
}
