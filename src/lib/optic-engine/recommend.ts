/**
 * The material recommendation, shared by the spherical and the aspheric engine.
 *
 * One rule set, one set of reasons, one order: whichever engine is asked,
 * the answer is the same, and the number that describes how much thinner the
 * lens gets is measured from the lens in hand rather than quoted from a
 * table.
 */

import { MATERIALS_DB, FRAME_TYPE_OVERRIDES } from "../../data/materials";
import { FrameType, LensIndex } from "./types";

/** The indices the tool can recommend, in ascending order. */
const LADDER: LensIndex[] = [1.5, 1.56, 1.6, 1.67, 1.74];

export interface Recommendation {
  index: number;
  material: string;
  reason: string;
  abbe: number;
  /**
   * The edge thickness this material gives for the lens in hand, in
   * millimetres, and how much thinner that is than the edge the current
   * material gives.
   */
  edgeThickness: number;
  currentEdgeThickness: number;
  saving: number;
  savingPercent: number;
  /**
   * How much thinner the recommended material is than the standard CR-39
   * would be for this same lens, as a percentage.
   */
  referenceSavingPercent: number;
}

/**
 * The spherical equivalent of a prescription, in dioptres.
 *
 * The magnitude is what decides the index: a plus lens and a minus lens of
 * the same equivalent need the same material.
 */
export function sphericalEquivalent(sph: number, cyl: number): number {
  return Math.abs(sph + cyl / 2);
}

/**
 * The material the power band calls for, and the reason that goes with it.
 *
 * The band and the reason come from the same record, so the reason always
 * describes the material that is actually recommended.
 */
function materialForPower(se: number) {
  const match = MATERIALS_DB.find((m) => se >= m.seRange.min && se < m.seRange.max);
  // Above the top band there is nothing higher to go to, so the top band
  // is the answer; the table is written so that this cannot happen.
  return match ?? MATERIALS_DB[MATERIALS_DB.length - 1];
}

/**
 * The next index up the ladder, or the same one when it is already the top.
 */
function stepUp(index: number): number {
  const at = LADDER.findIndex((i) => Math.abs(i - index) < 0.005);
  if (at === -1 || at === LADDER.length - 1) return index;
  return LADDER[at + 1];
}

/**
 * Recommends a material for a lens.
 *
 * `edgeAt` measures the edge thickness a given index would give for this
 * lens, so the saving quoted to the user is the saving they would actually
 * get rather than a figure from a table.
 */
export function recommendMaterial(options: {
  sph: number;
  cyl: number;
  frameType: FrameType;
  /** The horizontal eye size, A, in millimetres. */
  eyeSize: number;
  /** True when the lens is a minus lens, which is what a big frame makes worse. */
  isMinus: boolean;
  /** The index the lens is being made in. */
  currentIndex: number;
  /** The edge thickness a given index would give for this lens. */
  edgeAt: (index: number) => number;
}): Recommendation {
  const { sph, cyl, frameType, eyeSize, isMinus, currentIndex, edgeAt } = options;
  const se = sphericalEquivalent(sph, cyl);

  const band = materialForPower(se);
  let index = band.index;
  let reason = band.reasonEn;

  // A half-rim or a rimless frame puts the whole edge under strain, so the
  // material cannot go below what the mount can hold.
  const override = FRAME_TYPE_OVERRIDES[frameType as keyof typeof FRAME_TYPE_OVERRIDES];
  if (override && index < override.minIndex - 0.005) {
    const material = MATERIALS_DB.find((m) => Math.abs(m.index - override.minIndex) < 0.005);
    if (material) {
      index = material.index;
      reason = override.reasonEn;
    }
  }

  // A wide frame with a minus lens needs a thinner edge than the power band
  // alone suggests.
  if (isMinus && eyeSize >= 54) {
    const next = stepUp(index);
    if (next > index) {
      index = next;
      reason =
        reason +
        ' Note: Large eye size increases edge thickness; higher index recommended.';
    }
  }

  const material = MATERIALS_DB.find((m) => Math.abs(m.index - index) < 0.005);

  // The figures quoted to the user are measured on the lens in hand: the edge
  // thickness the recommended material gives, the one the material in the
  // frame gives, and the difference between them.
  const current = edgeAt(currentIndex) || 1;
  const recommended = edgeAt(index) || current;
  const reference = edgeAt(1.5) || current;
  const saving = current - recommended;

  return {
    index,
    material: material?.name ?? '',
    reason,
    abbe: material?.abbe ?? 0,
    edgeThickness: recommended,
    currentEdgeThickness: current,
    saving,
    savingPercent: current > 0 ? (saving / current) * 100 : 0,
    referenceSavingPercent: reference > 0 ? ((reference - recommended) / reference) * 100 : 0,
  };
}
