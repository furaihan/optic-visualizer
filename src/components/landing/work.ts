import { calculateLens } from '@lib/optic-engine/optical';
import type {
  CalculationResult,
  FrameParameters,
  LensIndex,
  LensParameters,
  PatientParameters,
} from '@lib/optic-engine/types';

/**
 * The worked example the landing page is drawn from: the same numbers the
 * simulator opens with, so nothing on the page is invented for the sake of a
 * picture. Every number that appears on this page is calculated by the engine
 * at render time — none of it is typed in by hand.
 */
export const EXAMPLE_LENS: LensParameters = {
  sph: -4,
  cyl: 0,
  axis: 0,
  index: 1.6,
  baseCurve: 4,
};

export const EXAMPLE_FRAME: FrameParameters = {
  a: 52,
  b: 40,
  dbl: 18,
  // The same frame the simulator opens with: a modern rim is around six
  // millimetres deep, and a shallower one cannot take the back of a minus
  // lens.
  depth: 6.0,
  ed: 54,
};

export const EXAMPLE_PATIENT: PatientParameters = {
  pd: 63,
  fittingHeight: 22,
};

export const EXAMPLE_BEVEL = 0.33;

/** The index ladder, in the order the tool offers it. */
export const INDEX_LADDER: LensIndex[] = [1.5, 1.56, 1.6, 1.67, 1.74];

/** Material names, as the tool names them. */
export const MATERIAL_FOR: Record<number, string> = {
  1.5: 'CR-39',
  1.56: 'NK-55',
  1.6: 'MR-8',
  1.67: 'MR-10',
  1.74: 'MR-174',
};

export function computeExample(lens: LensParameters = EXAMPLE_LENS): CalculationResult {
  return calculateLens(
    lens,
    EXAMPLE_FRAME,
    EXAMPLE_PATIENT,
    1.0,
    EXAMPLE_BEVEL,
    'full',
  );
}

/** A prescription that pushes the same frame past its limits. */
export const OVERSIZED_RX: LensParameters = {
  ...EXAMPLE_LENS,
  sph: -6,
  index: 1.5,
};

export const mm = (v: number) => `${v.toFixed(2)} mm`;
export const signed = (v: number, digits = 2) => `${v > 0 ? '+' : ''}${v.toFixed(digits)}`;
