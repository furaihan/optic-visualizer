import { MATERIALS_DB } from "../../data/materials";
import {
  FrameParameters,
  PatientParameters,
  LensParameters,
  VALID_INDICES,
  LensIndex,
  CalculationResult,
  FrameType,
} from "./types";
import {
  MIN_THICKNESS_MM,
  SPHERICAL,
  SurfaceModel,
  backRadius,
  buildOpening,
  buildSection,
  conicSagitta,
  farthestRimDistance,
  frontRadius,
  lensVolumeCm3,
  powerInMeridian,
  protrusion,
  rimRadius,
  solveThickness,
  governingMeridian,
} from "./geometry";
import { recommendMaterial } from "./recommend";

export function isValidIndex(value: unknown): value is LensIndex {
  return VALID_INDICES.includes(value as LensIndex);
}

/**
 * PURE BUSINESS LOGIC: Calculates optical lens outputs based on geometric theory.
 * Entirely decoupled from component lifecycles of React.
 *
 * The model, in short: the frame opening is the A x B box cut by the circle of
 * diameter ED; the optical centre sits at the pupil; the lens fills the
 * opening; the thickness of the material at any point of the rim is the
 * distance between the two surfaces there. The cylinder's axis decides which
 * meridian carries which power, so a prescription that is round in one
 * direction and steep in the other is surfaced as the lens it really is.
 *
 * The lens is placed in the bevel groove by the vertical meridian through the
 * optical centre: the edge at the top of the opening is the one centred on
 * the groove. Everything measured against the frame — how far the lens
 * stands in front of it or behind it — is measured in that same meridian.
 * The frame is a flat plane, with no base curve of its own, so the rim the
 * lens sits in is a straight band and the numbers say what they measure.
 */
export function calculateLens(
  lens: LensParameters,
  frame: FrameParameters,
  patient: PatientParameters,
  minThickness: number = MIN_THICKNESS_MM,
  bevelPercent: number = 0.33,
  frameType: FrameType = "full",
): CalculationResult {
  const { sph, cyl, axis, index, baseCurve } = lens;
  const opening = buildOpening(frame, patient);

  const solved = solveThickness(
    opening,
    index,
    baseCurve,
    sph,
    cyl,
    axis,
    SPHERICAL,
    minThickness,
  );

  if (solved.error) {
    return invalidResult(
      solved.error === "rim"
        ? "The frame opening and the optical centre do not meet: the lens cannot be edged to this shape."
        : "The lens curvature does not reach the edge of the frame at this aperture.",
    );
  }

  const meridians = solved.meridians;
  const worst = governingMeridian(meridians);
  const frontR = frontRadius(index, baseCurve);

  // The section is the vertical meridian through the optical centre, and the
  // lens is placed in the bevel groove by that meridian: the edge at the top
  // of the opening is the one centred on the groove, and the two vertices
  // follow from there.
  const section = buildSection({
    opening,
    meridians,
    centerThickness: solved.centerThickness,
    r1: frontR,
    frameDepth: frame.depth,
    bevelPercent,
  });

  // How far the lens reaches out of the frame. The lens is placed by the
  // vertical meridian, so the protrusion is measured in that same plane: the
  // deepest point of the back surface in the section, not somewhere else
  // around the rim where the lens is not held.
  const maxBackOffset = Math.max(section.backOffsetTop, section.backOffsetBottom);
  const { anterior, posterior } = protrusion({
    frameDepth: frame.depth,
    frontApexZ: section.frontApexZ,
    backApexZ: section.backApexZ,
    maxBackOffset,
  });

  // The lens blank has to hold the shape with the optical centre where the
  // pupil is, and the optical centre does not sit at the boxing centre: the
  // shape reaches further from the pupil than its own diameter. The blank is
  // twice that reach, plus the two millimetres of edging allowance.
  const totalDecentration = Math.abs(frame.a + frame.dbl - patient.pd);
  const minBlank = 2 * farthestRimDistance(opening) + 2;

  const density = densityOf(index);
  const volume = lensVolumeCm3(
    opening,
    solved.centerThickness,
    index,
    baseCurve,
    sph,
    cyl,
    axis,
    SPHERICAL,
  );
  const weight = volume * density;

  const edgeAt = (candidate: number): number => {
    const alt = solveThickness(
      opening,
      candidate,
      baseCurve,
      sph,
      cyl,
      axis,
      SPHERICAL,
      minThickness,
    );
    if (alt.error) return worst.edge;
    return governingMeridian(alt.meridians).edge;
  };

  const recommendation = recommendMaterial({
    sph,
    cyl,
    frameType,
    eyeSize: frame.a,
    isMinus: worst.power < 0,
    currentIndex: index,
    edgeAt,
  });

  return {
    ct: solved.centerThickness,
    et: worst.edge,
    etMin: Math.min(...meridians.map((m) => m.edge)),
    anteriorProtrusion: anterior,
    posteriorProtrusion: posterior,
    r1: frontR,
    r2: Math.abs(worst.backRadius),
    backPower: worst.backPower,
    /** The back vertex power of the thickest-edge meridian, in dioptres. */
    vertexPower: solved.vertexPower,
    /** How far the vertex power is from the prescribed power, in dioptres. */
    vertexPowerError: solved.vertexError,
    s1: worst.frontOffset,
    s2: Math.abs(worst.backOffset),
    decentration: totalDecentration / 2,
    decentrationH: (frame.a + frame.dbl - patient.pd) / 2,
    decentrationV: patient.fittingHeight - frame.b / 2,
    y: Math.max(...meridians.map((m) => m.radius)),
    minBlank,
    weight,
    density,
    section,
    recommendation: {
      index: recommendation.index,
      material: recommendation.material,
      reason: recommendation.reason,
      thinness: `${recommendation.savingPercent.toFixed(0)}%`,
      abbe: recommendation.abbe,
      edgeThickness: recommendation.edgeThickness,
      currentEdgeThickness: recommendation.currentEdgeThickness,
      saving: recommendation.saving,
      savingPercent: recommendation.savingPercent,
      referenceSavingPercent: recommendation.referenceSavingPercent,
    },
  };
}

/**
 * The density of the material of the given index, in grams per cubic
 * centimetre.
 */
export function densityOf(index: number): number {
  const match = MATERIALS_DB.find((m) => Math.abs(m.index - index) < 0.02);
  return match?.density ?? 1.32;
}

/**
 * The result of a prescription that cannot be surfaced: the numbers are
 * placeholders and the error says so.
 */
export function invalidResult(message: string): CalculationResult {
  return {
    error: true,
    errorMessage: message,
    ct: 2.0,
    et: 2.0,
    anteriorProtrusion: 0,
    posteriorProtrusion: 0,
    r1: 0,
    r2: 0,
    backPower: 0,
    s1: 0,
    s2: 0,
    decentration: 0,
    decentrationH: 0,
    decentrationV: 0,
    y: 0,
    minBlank: 0,
    weight: 0,
    density: 1.32,
    recommendation: {
      index: 1.5,
      material: "CR-39",
      reason: "simErrorDesc",
      thinness: "0%",
      abbe: 58,
    },
  };
}

/**
 * The sagitta of a surface of the given radius at the given semi-aperture,
 * in millimetres. Exposed so that the drawing and the engine agree on what
 * a surface does.
 */
export function surfaceSagitta(radius: number, y: number): number {
  return conicSagitta(radius, 0, y);
}

export { SPHERICAL, powerInMeridian, rimRadius, backRadius, frontRadius };
export type { SurfaceModel };
export const OPTICAL_ENGINE_VERSION = "AMP_V5.0.0";
