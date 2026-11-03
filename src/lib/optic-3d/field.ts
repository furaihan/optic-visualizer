import {
  DEG,
  buildOpening,
  conicSagitta,
  frontRadius,
  backRadius,
  powerInMeridian,
  rimRadius,
  type OpeningGeometry,
} from "../optic-engine/geometry";
import type {
  CalculationResult,
  FrameParameters,
  LensParameters,
  PatientParameters,
} from "../optic-engine/types";
import { SPHERICAL, type SurfaceModel } from "../optic-engine/geometry";

/**
 * The lens field: the two surfaces of the lens as functions of position.
 *
 * Why this file exists
 * --------------------
 * The sheet draws the lens twice — the section down the vertical meridian, and
 * the edge magnified as a detail — and both come from `SectionGeometry`, which
 * is a handful of named points. A body has to be every point, so this module
 * turns the same engine output into a continuous field the mesher can sample
 * anywhere it likes.
 *
 * The contract
 * ------------
 * Nothing here is a second model. Every quantity is read from the
 * `CalculationResult` the engine already produced (`section.frontApexZ`,
 * `section.backApexZ`, `r1`, `backPowerOffset`) or recomputed with the
 * engine's own functions (`conicSagitta`, `powerInMeridian`, `backRadius`,
 * `rimRadius`). If the field and the sheet ever disagree, the field is wrong.
 *
 * Sign convention, carried over from the engine
 * ---------------------------------------------
 * z runs from the front of the lens to the back, measured from the rim's
 * front face. A surface of signed radius R stands, at semi-aperture y, this
 * far behind its own vertex:
 *
 *     sag(y) = (y^2 / R) / (1 + sqrt(1 - (1 + K) (y / R)^2))
 *
 * so the front surface of a plus lens (R > 0) has its rim behind its vertex
 * and the back surface of a minus lens (also R > 0) has its rim behind its
 * vertex too — which is why the rim of a minus lens is thicker than its
 * centre. One formula, both cases.
 */

/** A coordinate along the optical axis, in millimetres, from the rim's front face. */
export type Axial = number;

/** A point of the lens in its own plane, in millimetres, from the boxing centre. */
export interface PlanePoint {
  x: number;
  y: number;
}

/** A direction around the rim, in degrees from the horizontal, counter-clockwise. */
export type MeridianAngle = number;

/** The two surfaces of one lens, sampled anywhere. */
export interface LensField {
  /** Radius of the front surface, in millimetres (always positive). */
  readonly r1: number;
  /** Where the front vertex sits along the axis. */
  readonly frontApexZ: Axial;
  /** Where the back vertex sits along the axis. */
  readonly backApexZ: Axial;
  /** Where the bevel groove sits along the axis. */
  readonly groove: Axial;
  /** The frame's own depth, in millimetres. */
  readonly frameDepth: number;
  /** The opening, the optical centre, and the shape the lens is edged to. */
  readonly opening: OpeningGeometry;
  /** The lens index the surfaces were cut for. */
  readonly index: number;
  /** The front base curve, in dioptres. */
  readonly baseCurve: number;
  /**
   * The front surface, measured back from its own vertex at semi-aperture
   * `radius`. Returns NaN where the surface does not exist.
   */
  frontSag(radius: number, theta?: MeridianAngle): number;
  /**
   * The back surface, measured back from its own vertex, in the meridian
   * `theta`. Returns NaN where that meridian's surface does not exist.
   */
  backSag(radius: number, theta: MeridianAngle): number;
  /** The front surface in the lens's own frame coordinates. */
  frontZ(theta: MeridianAngle, radius: number): Axial;
  /** The back surface in the lens's own frame coordinates. */
  backZ(theta: MeridianAngle, radius: number): Axial;
  /** The material between the two surfaces at a point, in millimetres. */
  thicknessAt(theta: MeridianAngle, radius: number): number;
  /** How far the rim reaches from the optical centre in a direction. */
  rimRadiusAt(theta: MeridianAngle): number;
  /** The back surface power the field realises in a meridian, in dioptres. */
  backPowerAt(theta: MeridianAngle): number;
  /** True where the field is real at that point (both surfaces exist). */
  isDefined(theta: MeridianAngle, radius: number): boolean;
}

/** How the back surface power follows from the power of a meridian. */
export type BackPowerFor = (meridianPower: number) => number;

export interface LensFieldInput {
  result: CalculationResult;
  lens: LensParameters;
  frame: FrameParameters;
  patient: PatientParameters;
  /**
   * The aspheric engine's back-power rule. The spherical engine leaves it out:
   * its back surface makes up whatever the front did not, so the rule is
   * `power - baseCurve`, and the offset the result carries absorbs the rest.
   */
  backPowerFor?: BackPowerFor;
  /** The extra terms of the surfaces, beyond the conic. The spheres have none. */
  surfaces?: SurfaceModel;
}

/**
 * Builds the field from an engine result.
 *
 * Throws when the engine reported an error: a lens that cannot be surfaced has
 * no body, and a scene that drew one anyway would be inventing a shape the
 * sheet refused to measure.
 */
export function buildLensField(input: LensFieldInput): LensField {
  const { result, lens, frame, patient } = input;
  const { sph, cyl, axis, index, baseCurve } = lens;
  const surfaces = input.surfaces ?? SPHERICAL;

  if (result.error || !result.section) {
    throw new Error(
      result.errorMessage ??
        "The lens has no section: the engine could not surface this prescription in this frame.",
    );
  }

  const section = result.section;
  const opening = buildOpening(frame, patient);
  const r1 = frontRadius(index, baseCurve);
  const backPowerOffset = result.backPowerOffset ?? 0;
  const backPowerOf: BackPowerFor =
    input.backPowerFor ?? ((power: number) => power - baseCurve);

  /** The back power of a meridian, as this engine realises it. */
  const backPowerAt = (theta: MeridianAngle): number =>
    backPowerOf(powerInMeridian(theta, sph, cyl, axis)) + backPowerOffset;

  /** The back radius of a meridian, signed, in millimetres. */
  const backRadiusAt = (theta: MeridianAngle): number =>
    backRadius(index, backPowerAt(theta));

  const frontSag = (radius: number, _theta: MeridianAngle = 0): number =>
    conicSagitta(r1, surfaces.frontConic, radius) + surfaces.frontPoly(radius);

  const backSag = (radius: number, theta: MeridianAngle): number => {
    const r2 = backRadiusAt(theta);
    return conicSagitta(r2, surfaces.backConic, radius) + surfaces.backPoly(radius);
  };

  const frontZ = (_theta: MeridianAngle, radius: number): Axial =>
    section.frontApexZ + frontSag(radius);

  const backZ = (theta: MeridianAngle, radius: number): Axial =>
    section.backApexZ + backSag(radius, theta);

  return {
    r1,
    frontApexZ: section.frontApexZ,
    backApexZ: section.backApexZ,
    groove: section.groove,
    frameDepth: frame.depth,
    opening,
    index,
    baseCurve,
    frontSag,
    backSag,
    frontZ,
    backZ,
    thicknessAt: (theta, radius) => backZ(theta, radius) - frontZ(theta, radius),
    rimRadiusAt: (theta) => rimRadius(opening, ((theta % 360) + 360) % 360),
    backPowerAt,
    isDefined: (theta, radius) =>
      Number.isFinite(frontZ(theta, radius)) && Number.isFinite(backZ(theta, radius)),
  };
}

/** The thickness of the lens at a point of the plane, in millimetres. */
export function thicknessAtPoint(field: LensField, point: PlanePoint): number {
  const dx = point.x - field.opening.ocX;
  const dy = point.y - field.opening.ocY;
  const radius = Math.hypot(dx, dy);
  if (radius < 1e-12) {
    // On the optical centre the meridian is arbitrary: every surface passes
    // through its own vertex there, so any direction gives the centre
    // thickness.
    return field.backApexZ - field.frontApexZ;
  }
  const theta = (Math.atan2(dy, dx) / DEG + 360) % 360;
  return field.thicknessAt(theta, radius);
}

/**
 * The meridian that carries the thickest edge, found by sampling.
 *
 * The engine's `governingMeridian` works on the meridian list it solved, which
 * is what the schedule quotes. A camera preset needs the direction only, and
 * the field can be asked directly — so the view can frame the corner the
 * thickness actually sits in, which for a decentred minus lens is not the side
 * the drawing is read from.
 */
export function findThickestMeridian(
  field: LensField,
  samples = 3600,
): { theta: MeridianAngle; radius: number; thickness: number } {
  let best = { theta: 0, radius: 0, thickness: -Infinity };
  for (let i = 0; i < samples; i += 1) {
    const theta = (360 * i) / samples;
    const radius = field.rimRadiusAt(theta);
    if (!Number.isFinite(radius)) continue;
    const thickness = field.thicknessAt(theta, radius);
    if (Number.isFinite(thickness) && thickness > best.thickness) {
      best = { theta, radius, thickness };
    }
  }
  return best;
}

/**
 * The thickness of the lens in a meridian, walked from the optical centre to
 * the rim. This is what the cut plane draws and what the heat map shades.
 */
export function meridianProfile(
  field: LensField,
  theta: MeridianAngle,
  steps = 96,
): { radius: number; thickness: number }[] {
  const rim = field.rimRadiusAt(theta);
  const out: { radius: number; thickness: number }[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const radius = (rim * i) / steps;
    out.push({ radius, thickness: field.thicknessAt(theta, radius) });
  }
  return out;
}
