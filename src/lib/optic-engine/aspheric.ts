import { MATERIALS_DB } from "../../data/materials";
import {
  AsphericCalculationResult,
  AsphericLensParameters,
  FrameParameters,
  PatientParameters,
  FrameType,
} from "./types";
import {
  MIN_THICKNESS_MM,
  SurfaceModel,
  buildOpening,
  buildSection,
  conicSagitta,
  farthestRimDistance,
  frontRadius,
  governingMeridian,
  lensVolumeCm3,
  protrusion,
  solveThickness,
} from "./geometry";
import { recommendMaterial } from "./recommend";

/** The polynomial terms of an aspheric surface. */
export interface AsphericCoefficients {
  A2: number;
  A4: number;
  A6: number;
  A8: number;
}

/**
 * The largest departure from a sphere, in millimetres, that a set of
 * coefficients may produce at the edge of the frame before the surface stops
 * being a lens anybody could wear.
 */
export const MAX_DEPARTURE_MM = 2.0;

/**
 * The polynomial part of an aspheric surface, at the semi-aperture y.
 *
 * The terms are the even powers of y in millimetres, so the numbers are
 * small: an A4 of 1e-6 moves the surface by a millimetre at a 30 mm
 * semi-aperture.
 */
export function polynomialTerm(y: number, coeffs: AsphericCoefficients): number {
  const y2 = y * y;
  const y4 = y2 * y2;
  const y6 = y4 * y2;
  const y8 = y4 * y4;
  return coeffs.A2 * y2 + coeffs.A4 * y4 + coeffs.A6 * y6 + coeffs.A8 * y8;
}

/**
 * The distance from the vertex of an aspheric surface to the surface at the
 * semi-aperture y.
 *
 * The radius is signed and the conic constant follows the usual convention,
 * so the same call gives the front surface and the back surface, and a
 * convex back comes out with its rim in front of its vertex.
 *
 * Returns NaN when the conic has no real point at that aperture. The caller
 * must report that as a lens that cannot be surfaced, not as a flat surface.
 */
export function getAsphericSag(
  R: number,
  yVal: number,
  conic: number,
  coeffs: AsphericCoefficients,
): number {
  if (!Number.isFinite(R)) return 0;
  const conicPart = conicSagitta(R, conic, Math.abs(yVal));
  if (!Number.isFinite(conicPart)) return NaN;
  return conicPart + polynomialTerm(yVal, coeffs);
}

/**
 * How far an aspheric surface departs from the sphere of the same radius, at
 * the semi-aperture y.
 *
 * This is the number that says what the aspheric surface actually does, as
 * opposed to a figure derived from the conic constant on its own.
 */
export function departureFromSphere(
  R: number,
  y: number,
  conic: number,
  coeffs: AsphericCoefficients,
): number {
  if (!Number.isFinite(R)) return 0;
  const sphere = conicSagitta(R, 0, Math.abs(y));
  const shaped = getAsphericSag(R, y, conic, coeffs);
  if (!Number.isFinite(sphere) || !Number.isFinite(shaped)) return NaN;
  return shaped - sphere;
}

/**
 * The surface model the shared solver works with.
 *
 * The aspheric engine carries a conic constant and a polynomial on each
 * surface. The A2 term adds curvature, so it changes the power of the
 * surface it sits on, and the radii below have to be worked out with that
 * in mind: the base curve the user typed is the power of the front surface
 * before the A2 term is added to it.
 */
function buildSurfaceModel(
  index: number,
  baseCurve: number,
  front: { conic: number; A2: number; A4: number; A6: number; A8: number },
  back: { conic: number; A2: number; A4: number; A6: number; A8: number },
): {
  model: SurfaceModel;
  /** The front radius of the base conic. */
  r1: number;
  /** The power the front surface carries once its A2 term is counted in. */
  frontPower: number;
  /**
   * The back surface power of a meridian, as the aspheric surfaces realise
   * it: the back surface makes up the rest of the prescription, less its own
   * A2 term.
   */
  backPowerFor: (meridianPower: number) => number;
  /**
   * How far the realised back surface power sits from the power of its base
   * conic: the A2 term takes that much power away from the conic.
   */
  realisedBackShift: number;
} {
  const indexFactor = 1000 * (index - 1);

  // A2 y^2 adds 2 * A2 to the curvature of the surface it sits on, and the
  // power of a surface is (n - 1) times its curvature.
  const frontShift = 2 * front.A2 * indexFactor;
  const backShift = 2 * back.A2 * indexFactor;

  // The power the front surface carries once its A2 term is counted in.
  const frontPower = baseCurve + frontShift;

  const r1 = frontRadius(index, baseCurve);

  const model: SurfaceModel = {
    frontConic: front.conic,
    backConic: back.conic,
    frontPoly: (y) => polynomialTerm(y, front),
    backPoly: (y) => polynomialTerm(y, back),
  };

  return {
    model,
    r1,
    frontPower,
    backPowerFor: (meridianPower: number) =>
      meridianPower - frontPower - backShift,
    realisedBackShift: backShift,
  };
}

/**
 * The main aspheric lens calculation.
 *
 * The geometry is the same model the spherical engine uses: the frame
 * opening, the optical centre at the pupil, the power in every meridian, and
 * the thickness that follows. The aspheric surface only changes the shape of
 * the two surfaces, not the way the lens is measured.
 */
export function calculateAsphericLens(
  lens: AsphericLensParameters,
  frame: FrameParameters,
  patient: PatientParameters,
  minThickness: number = MIN_THICKNESS_MM,
  bevelPercent: number = 0.33,
  frameType: FrameType = "full",
): AsphericCalculationResult {
  const { sph, cyl, axis, index, baseCurve, asphericFront, asphericBack } = lens;

  const front = asphericFront.isActive
    ? asphericFront
    : { conic: 0, A2: 0, A4: 0, A6: 0, A8: 0 };
  const back = asphericBack.isActive
    ? asphericBack
    : { conic: 0, A2: 0, A4: 0, A6: 0, A8: 0 };

  const opening = buildOpening(frame, patient);
  const { model, r1, frontPower, backPowerFor, realisedBackShift } =
    buildSurfaceModel(index, baseCurve, front, back);

  // The shared solver works out the lens in every meridian, samples the
  // corners of the shape, and re-solves the back power for the thickness the
  // lens comes out at.
  const solved = solveThickness(
    opening,
    index,
    baseCurve,
    sph,
    cyl,
    axis,
    model,
    minThickness,
    { backPowerFor, frontPower, realisedBackShift },
  );

  if (solved.error) {
    return invalidAsphericResult(
      solved.error === "rim"
        ? "The frame opening and the optical centre do not meet: the lens cannot be edged to this shape."
        : "The aspheric surface has no real point at the edge of this frame.",
    );
  }

  const meridians = solved.meridians;
  const worst = governingMeridian(meridians);

  // The section is the vertical meridian through the optical centre, and the
  // lens is placed in the bevel groove by that meridian: the edge at the top
  // of the opening is the one centred on the groove.
  const section = buildSection({
    opening,
    meridians,
    centerThickness: solved.centerThickness,
    r1,
    frameDepth: frame.depth,
    bevelPercent,
  });

  // The protrusion is measured in the section, because that is the meridian
  // the lens is placed by.
  const maxBackOffset = Math.max(section.backOffsetTop, section.backOffsetBottom);
  const { anterior, posterior } = protrusion({
    frameDepth: frame.depth,
    frontApexZ: section.frontApexZ,
    backApexZ: section.backApexZ,
    maxBackOffset,
  });

  // How far the aspheric surface leaves the sphere it started from. This is
  // what the aspheric form actually buys, in millimetres.
  let departure = 0;
  for (const m of meridians) {
    const frontDeparture = departureFromSphere(r1, m.radius, front.conic, front);
    const backDeparture = departureFromSphere(m.backRadius, m.radius, back.conic, back);
    for (const d of [frontDeparture, backDeparture]) {
      if (!Number.isFinite(d)) continue;
      if (Math.abs(d) > Math.abs(departure)) departure = d;
    }
  }

  // A set of coefficients that throws the surface out by more than a couple
  // of millimetres is not a lens, and the engine says so rather than
  // reporting a number nobody can order.
  if (Math.abs(departure) > MAX_DEPARTURE_MM) {
    return invalidAsphericResult(
      `The aspheric coefficients throw the surface ${Math.abs(departure).toFixed(2)} mm out of shape at the edge of the frame. Check the scale of the coefficients.`,
    );
  }

  // The blank has to hold the shape around the optical centre, so it is
  // twice the farthest the rim reaches from the pupil, plus the two
  // millimetres of edging allowance.
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
    model,
  );
  const weight = volume * density;

  const edgeAt = (candidate: number): number => {
    // The same lens in another material: the A2 terms count against the new
    // index, so the surfaces have to be rebuilt for it.
    const factor = 1000 * (candidate - 1);
    const alt = solveThickness(
      opening,
      candidate,
      baseCurve,
      sph,
      cyl,
      axis,
      model,
      minThickness,
      {
        frontPower: baseCurve + 2 * front.A2 * factor,
        backPowerFor: (power: number) =>
          power - (baseCurve + 2 * front.A2 * factor) - 2 * back.A2 * factor,
        realisedBackShift: 2 * back.A2 * factor,
      },
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
    r1,
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
    departure,
    conic: front.conic,
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
export function invalidAsphericResult(message: string): AsphericCalculationResult {
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
    departure: 0,
    recommendation: {
      index: 1.5,
      material: "CR-39",
      reason: "simErrorDesc",
      thinness: "0%",
      abbe: 58,
    },
  };
}

export const ASPHERIC_ENGINE_VERSION = "AMP_ASPH_V2.0.0";
