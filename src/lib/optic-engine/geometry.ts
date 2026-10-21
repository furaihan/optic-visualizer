/**
 * The optical model, shared by the spherical and the aspheric engine.
 *
 * Everything the two engines need to agree on lives here: the shape of the
 * frame opening, the position of the optical centre inside it, the power in a
 * given meridian, the sagitta of a surface, and the thickness that follows.
 *
 * The model in one paragraph
 * -------------------------
 * The frame opening is the A x B box the front elevation draws, and the
 * optical centre sits at the pupil, offset from the boxing centre by the
 * horizontal decentration and the vertical fitting offset. The lens fills the
 * opening, so the rim of the lens is the rim of the opening, and the
 * thickness of the material at a point of the rim is the distance between the
 * front and the back surface there.
 *
 * The lens is placed in the bevel groove by the vertical meridian through the
 * optical centre: the edge at the top of the opening is centred on the
 * groove, and how far the lens stands in front of the frame or behind it is
 * measured in that same meridian. The frame itself is a flat plane, with no
 * base curve of its own, so the rim that holds the lens is a straight band
 * and every number says which plane it was measured in.
 *
 * Sign convention
 * ---------------
 * The axis runs from the front of the lens to the back, and z is measured
 * from the front vertex. A surface of signed radius R stands at this
 * distance from its own vertex at the semi-aperture y:
 *
 *     z(y) = (y^2 / R) / (1 + sqrt(1 - (1 + K)(y / R)^2))
 *
 * The front surface is convex, so R is positive and its rim stands behind
 * its vertex. The back surface of a minus lens is concave, so its R is
 * positive and its rim stands behind its vertex as well; the back surface of
 * a plus lens with a convex back has a negative R and its rim stands in
 * front of its vertex. One formula, both cases.
 *
 * With that convention the thickness of the material at radius y is
 *
 *     t(y) = CT + z_back(y) - z_front(y)
 *
 * because both surfaces stand away from their own vertices in the same
 * direction when the rim is thicker than the centre.
 */

import { FrameParameters, PatientParameters } from "./types";

/** The smallest thickness the engine will surface, in millimetres. */
export const MIN_THICKNESS_MM = 1.0;

/** Degrees to radians. */
export const DEG = Math.PI / 180;

/**
 * The front surface radius of a lens of the given index and base curve.
 *
 * The base curve is the front surface power, so R = 1000 (n - 1) / BC, and
 * it is always positive: the front of a spectacle lens is convex.
 */
export function frontRadius(index: number, baseCurve: number): number {
  return (1000 * (index - 1)) / baseCurve;
}

/**
 * The back surface radius for a given back surface power, signed.
 *
 * The back surface carries whatever power is left over after the front
 * surface has taken its share of the prescription, and the sign follows the
 * convention above: positive for a concave back, negative for a convex one,
 * infinite for a plano back.
 */
export function backRadius(index: number, backPower: number): number {
  if (backPower === 0) return Infinity;
  return (-1000 * (index - 1)) / backPower;
}

/**
 * The distance from a surface's own vertex to the surface at the
 * semi-aperture y, measured backwards along the axis.
 *
 * Positive means the rim stands behind the vertex. The radius is signed, so
 * a convex back surface (R < 0) gives a negative offset and its rim stands
 * in front of the vertex, as it should.
 *
 * Returns NaN when the surface does not exist at that aperture: either the
 * aperture is wider than the sphere, or the conic has run out of real points.
 * The caller must treat NaN as a geometry that cannot be surfaced.
 */
export function conicSagitta(R: number, K: number, y: number): number {
  if (!Number.isFinite(R)) return 0;
  const c = 1 / R;
  const rad = 1 - (1 + K) * c * c * y * y;
  if (rad < 0) return NaN;
  return (c * y * y) / (1 + Math.sqrt(rad));
}

/**
 * The sphere power in the meridian at `theta`.
 *
 * Theta is measured in degrees from the horizontal, counter-clockwise. A minus
 * cylinder of axis `axis` carries the sphere power along its own axis and the
 * full sphere-plus-cylinder power at ninety degrees to it.
 */
export function powerInMeridian(
  theta: number,
  sph: number,
  cyl: number,
  axis: number,
): number {
  const d = (theta - axis) * DEG;
  return sph + cyl * Math.sin(d) ** 2;
}

/**
 * The frame opening and the optical centre, in the frame's own coordinates:
 * x to the right (temporal on the right lens), y up, both in millimetres,
 * with the origin at the boxing centre of the opening.
 */
export interface OpeningGeometry {
  /** Half the box width, A / 2. */
  halfWidth: number;
  /** Half the box height, B / 2. */
  halfHeight: number;
  /**
   * The radius of the circle of diameter ED.
   *
   * The effective diameter is twice the longest radius of the frame shape, so
   * the shape is the A x B box with its corners cut back to that circle, and
   * the circle is what bounds the lens where the box does not.
   */
  shapeRadius: number;
  /** Where the optical centre sits, relative to the boxing centre. */
  ocX: number;
  ocY: number;
}

/**
 * Builds the opening geometry.
 *
 * The horizontal decentration is signed so that the drawing can tell a lens
 * that is decentered nasally from one that is decentered temporally: the
 * optical centre moves toward the nose when the frame is wider than the
 * patient, so it sits at negative x in this frame of reference.
 */
export function buildOpening(
  frame: FrameParameters,
  patient: PatientParameters,
): OpeningGeometry {
  const halfWidth = frame.a / 2;
  const halfHeight = frame.b / 2;

  // How far the pupil sits from the centre of the opening, on the temporal
  // side. A wider frame needs the optical centre further nasal.
  const temporalOffset = (frame.a + frame.dbl - patient.pd) / 2;

  // The fitting height is measured from the bottom of the opening, so the
  // optical centre sits above the boxing centre when it is high.
  const verticalOffset = patient.fittingHeight - halfHeight;

  return {
    halfWidth,
    halfHeight,
    shapeRadius: frame.ed / 2,
    ocX: -temporalOffset,
    ocY: verticalOffset,
  };
}

/**
 * The distance from the optical centre to the rim of the opening along the
 * direction `theta`, in degrees from the horizontal.
 *
 * The rim is the nearer of the two constraints, the A x B box and the circle
 * of diameter ED, and a hit only counts when it lands on the part of the
 * other constraint that survives. The optical centre is not at the boxing
 * centre, so the distance varies with direction, and the lens is thickest
 * where the optical centre is farthest from the rim.
 */
export function rimRadius(opening: OpeningGeometry, theta: number): number {
  const { halfWidth, halfHeight, shapeRadius, ocX, ocY } = opening;
  const dx = Math.cos(theta * DEG);
  const dy = Math.sin(theta * DEG);

  let best = Infinity;

  const insideBox = (x: number, y: number) =>
    Math.abs(x) <= halfWidth + 1e-9 && Math.abs(y) <= halfHeight + 1e-9;
  const insideShape = (x: number, y: number) =>
    shapeRadius <= 0 || x * x + y * y <= shapeRadius * shapeRadius + 1e-9;

  // The circle of diameter ED, centred on the boxing centre.
  if (shapeRadius > 0) {
    const b = 2 * (ocX * dx + ocY * dy);
    const c = ocX * ocX + ocY * ocY - shapeRadius * shapeRadius;
    const disc = b * b - 4 * c;
    if (disc >= 0) {
      const t = (-b + Math.sqrt(disc)) / 2;
      if (t > 0 && insideBox(ocX + t * dx, ocY + t * dy)) best = Math.min(best, t);
    }
  }

  // The four sides of the box.
  if (Math.abs(dx) > 1e-9) {
    for (const edge of [-halfWidth, halfWidth]) {
      const t = (edge - ocX) / dx;
      if (t > 0 && insideShape(ocX + t * dx, ocY + t * dy)) best = Math.min(best, t);
    }
  }
  if (Math.abs(dy) > 1e-9) {
    for (const edge of [-halfHeight, halfHeight]) {
      const t = (edge - ocY) / dy;
      if (t > 0 && insideShape(ocX + t * dx, ocY + t * dy)) best = Math.min(best, t);
    }
  }

  return best;
}

/**
 * A point in the frame's own coordinates, in millimetres.
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * The points where the rim of the opening changes direction.
 *
 * The shape is the A x B box with its corners cut back to the ED circle, so
 * its boundary turns at three kinds of place: the corners of the box that
 * survive the circle, the points where the circle crosses the box, and the
 * point of the circle that lies opposite the optical centre.
 *
 * These are the only places where the distance from the optical centre to
 * the rim can be at its extreme, so they are the points the solver samples
 * and the points the blank is measured from.
 */
export function shapeVertices(opening: OpeningGeometry): Point[] {
  const { halfWidth, halfHeight, shapeRadius, ocX, ocY } = opening;
  const points: Point[] = [];

  const insideBox = (x: number, y: number) =>
    Math.abs(x) <= halfWidth + 1e-9 && Math.abs(y) <= halfHeight + 1e-9;
  const insideCircle = (x: number, y: number) =>
    shapeRadius <= 0 || x * x + y * y <= shapeRadius * shapeRadius + 1e-9;

  // The corners of the box, where the circle has not cut them off.
  for (const x of [-halfWidth, halfWidth]) {
    for (const y of [-halfHeight, halfHeight]) {
      if (insideCircle(x, y)) points.push({ x, y });
    }
  }

  if (shapeRadius > 0) {
    // Where the circle crosses the four sides of the box.
    for (const x of [-halfWidth, halfWidth]) {
      const dy2 = shapeRadius * shapeRadius - x * x;
      if (dy2 < 0) continue;
      const dy = Math.sqrt(dy2);
      for (const y of [dy, -dy]) {
        if (insideBox(x, y)) points.push({ x, y });
      }
    }
    for (const y of [-halfHeight, halfHeight]) {
      const dx2 = shapeRadius * shapeRadius - y * y;
      if (dx2 < 0) continue;
      const dx = Math.sqrt(dx2);
      for (const x of [dx, -dx]) {
        if (insideBox(x, y)) points.push({ x, y });
      }
    }

    // The point of the circle opposite the optical centre: the farthest the
    // circle itself reaches from it. It is only on the rim of the shape when
    // the box leaves it alone.
    const d = Math.hypot(ocX, ocY);
    if (d > 1e-9) {
      const x = (-shapeRadius * ocX) / d;
      const y = (-shapeRadius * ocY) / d;
      if (insideBox(x, y)) points.push({ x, y });
    }
  }

  return points;
}

/**
 * The farthest the rim of the opening reaches from the optical centre.
 *
 * The optical centre does not sit at the boxing centre, so the shape reaches
 * further on one side than the other, and how far depends on the vertical
 * offset as much as on the horizontal decentration. The blank has to hold the
 * shape around the optical centre, so it is twice this distance.
 */
export function farthestRimDistance(opening: OpeningGeometry): number {
  const { shapeRadius, ocX, ocY } = opening;
  let best = 0;

  for (const p of shapeVertices(opening)) {
    const d = Math.hypot(p.x - ocX, p.y - ocY);
    if (d > best) best = d;
  }

  // The optical centre at the boxing centre: every point of the circle is the
  // same distance away, so the circle itself is the answer.
  if (shapeRadius > 0 && Math.hypot(ocX, ocY) <= 1e-9) {
    best = Math.max(best, shapeRadius);
  }

  return best;
}

/**
 * The directions the solver looks at: the uniform samples around the rim,
 * plus the exact directions of the shape's own corners and intersections.
 *
 * The rim of the opening is not a circle, so uniform samples alone can walk
 * past the point where the shape reaches furthest from the optical centre:
 * the corner of a frame is a corner, and a sample that misses it misses the
 * thickest edge of the lens.
 */
export function sampleAngles(opening: OpeningGeometry, samples = 72): number[] {
  const angles: number[] = [];
  for (let i = 0; i < samples; i += 1) {
    angles.push((360 * i) / samples);
  }
  for (const p of shapeVertices(opening)) {
    const dx = p.x - opening.ocX;
    const dy = p.y - opening.ocY;
    if (Math.hypot(dx, dy) <= 1e-9) continue;
    angles.push((Math.atan2(dy, dx) / DEG + 360) % 360);
  }
  return angles;
}

/**
 * One meridian of the lens, worked out completely.
 */
export interface Meridian {
  /** The direction, in degrees from the horizontal. */
  theta: number;
  /** Distance from the optical centre to the rim in this direction. */
  radius: number;
  /** Sphere power in this meridian. */
  power: number;
  /** Back surface power in this meridian. */
  backPower: number;
  /** Back surface radius in this meridian, signed. */
  backRadius: number;
  /** Offset of the front surface at the rim, measured back from its vertex. */
  frontOffset: number;
  /** Offset of the back surface at the rim, measured back from its vertex. */
  backOffset: number;
  /** Material thickness at the rim in this meridian. */
  edge: number;
}

/**
 * How the surfaces of a lens are described. The spherical engine uses a
 * plain sphere for the front and the back; the aspheric engine adds a conic
 * constant and a polynomial to each.
 */
export interface SurfaceModel {
  /** The conic constant of the front surface. */
  frontConic: number;
  /** The conic constant of the back surface. */
  backConic: number;
  /** Extra terms of the front surface, beyond the conic. */
  frontPoly: (y: number) => number;
  /** Extra terms of the back surface, beyond the conic. */
  backPoly: (y: number) => number;
}

/** A plain sphere. */
export const SPHERICAL: SurfaceModel = {
  frontConic: 0,
  backConic: 0,
  frontPoly: () => 0,
  backPoly: () => 0,
};

/**
 * The back vertex power of a lens of a given thickness.
 *
 * A lens is not thin, so its back vertex power — the power the patient
 * actually wears — is not the sum of its two surface powers:
 *
 *     Fv = F1 / (1 - (t / n) F1) + F2
 *
 * The front power is in dioptres and the thickness in millimetres, so the
 * product carries the factor that turns one into the other.
 */
export function vertexPower(
  frontPower: number,
  backPower: number,
  centerThickness: number,
  index: number,
): number {
  const d = (centerThickness / index) * frontPower * 0.001;
  return frontPower / (1 - d) + backPower;
}

/**
 * How the solver is told about a lens that is not a plain sphere.
 */
export interface ThicknessOptions {
  /**
   * The back surface power of a meridian, as the engine realises it.
   *
   * The spherical engine uses the thin-lens rule, so the back surface makes
   * up whatever the front surface did not. The aspheric engine hands in the
   * power its own A2 terms have already taken from the back surface.
   */
  backPowerFor?: (meridianPower: number) => number;
  /**
   * The power of the front surface, as the engine realises it. The spherical
   * engine's front surface is the base curve.
   */
  frontPower?: number;
  /**
   * How far the realised back surface power sits from the power of its base
   * conic.
   *
   * The aspheric engine's A2 term takes that much power away from the back
   * surface's conic, so the vertex power is that much stronger than the
   * conic's. The spherical engine's shift is nothing.
   */
  realisedBackShift?: number;
  /** How many uniform samples to take around the rim. */
  samples?: number;
  /** How many times the back power may be re-solved for the vertex power. */
  maxVertexIterations?: number;
}

/**
 * What the solver worked out.
 */
export interface ThicknessSolution {
  meridians: Meridian[];
  centerThickness: number;
  /** The back vertex power of the governing meridian, in dioptres. */
  vertexPower: number;
  /** How far the vertex power is from the prescribed power, in dioptres. */
  vertexError: number;
  error?: "rim" | "surface";
}

/**
 * Works out the lens in every meridian and settles the thickness.
 *
 * The centre thickness is the smallest thickness the lens may have, and the
 * edge follows from it: the material is thinnest either at the centre (a
 * minus lens) or at the outer rim (a plus lens), so the centre thickness is
 * whatever makes the thinnest point of the whole lens the minimum.
 *
 * The back power is then re-solved for the thickness the lens has come out
 * at, because a lens that is not thin does not carry the sum of its two
 * surface powers: the patient wears the vertex power, and that is the power
 * the prescription asks for. The correction is the same in every meridian,
 * so a cylinder stays a cylinder.
 *
 * Returns the meridians and the thickness they imply, or an error when the
 * geometry cannot be surfaced at all.
 */
export function solveThickness(
  opening: OpeningGeometry,
  index: number,
  baseCurve: number,
  sph: number,
  cyl: number,
  axis: number,
  surfaces: SurfaceModel,
  minThickness: number,
  options: ThicknessOptions = {},
): ThicknessSolution {
  const r1 = frontRadius(index, baseCurve);
  const front = options.frontPower ?? baseCurve;
  const baseBackPower = options.backPowerFor ?? ((power: number) => power - baseCurve);
  const samples = options.samples ?? 72;
  const maxIterations = options.maxVertexIterations ?? 5;

  const run = (offset: number) => {
    const meridians: Meridian[] = [];

    // The uniform samples, plus the corners of the shape: the farthest point
    // of the rim is often a corner, and a sample that misses it would report
    // a thinner lens than the frame actually asks for.
    for (const theta of sampleAngles(opening, samples)) {
      const radius = rimRadius(opening, theta);
      if (!Number.isFinite(radius)) {
        return { meridians, centerThickness: minThickness, error: "rim" as const };
      }

      const power = powerInMeridian(theta, sph, cyl, axis);
      const backPower = baseBackPower(power) + offset;
      const r2 = backRadius(index, backPower);

      const frontOffset =
        conicSagitta(r1, surfaces.frontConic, radius) + surfaces.frontPoly(radius);
      const backOffset =
        conicSagitta(r2, surfaces.backConic, radius) + surfaces.backPoly(radius);

      if (!Number.isFinite(frontOffset) || !Number.isFinite(backOffset)) {
        return { meridians, centerThickness: minThickness, error: "surface" as const };
      }

      meridians.push({
        theta,
        radius,
        power,
        backPower,
        backRadius: r2,
        frontOffset,
        backOffset,
        edge: minThickness,
      });
    }

    // The centre thickness has to make the thinnest point of the lens the
    // minimum thickness: where the surfaces close in the most, the material
    // between the two vertices is least.
    let tightest = 0;
    for (const m of meridians) {
      const slack = m.frontOffset - m.backOffset;
      if (slack > tightest) tightest = slack;
    }

    const centerThickness = minThickness + tightest;
    for (const m of meridians) {
      m.edge = m.backOffset - m.frontOffset + centerThickness;
    }

    return { meridians, centerThickness, error: undefined as undefined };
  };

  // The vertex power of the meridian that carries the thickest edge: that is
  // the meridian the schedule quotes the back power of.
  const governing = (meridians: Meridian[]) => {
    let worst = meridians[0];
    for (const m of meridians) {
      if (m.edge > worst.edge) worst = m;
    }
    return worst;
  };

  const measure = (centerThickness: number, meridians: Meridian[]) => {
    const m = governing(meridians);
    // The vertex power is the power of the surfaces as they are, not of the
    // base conic the back surface is cut from.
    const power = vertexPower(
      front,
      m.backPower + (options.realisedBackShift ?? 0),
      centerThickness,
      index,
    );
    return { power, error: power - m.power };
  };

  let offset = 0;
  let solved = run(offset);
  if (solved.error) {
    return { ...solved, vertexPower: 0, vertexError: 0 };
  }

  let measured = measure(solved.centerThickness, solved.meridians);

  // Re-solve the back power until the vertex power is the power that was
  // prescribed. The back power shifts by the same amount in every meridian,
  // so the cylinder is untouched.
  for (let i = 0; i < maxIterations && Math.abs(measured.error) >= 0.01; i += 1) {
    const d = (solved.centerThickness / index) * front * 0.001;
    offset = front - front / (1 - d);
    solved = run(offset);
    if (solved.error) {
      return { ...solved, vertexPower: measured.power, vertexError: measured.error };
    }
    measured = measure(solved.centerThickness, solved.meridians);
  }

  return {
    meridians: solved.meridians,
    centerThickness: solved.centerThickness,
    vertexPower: measured.power,
    vertexError: measured.error,
  };
}

/**
 * The meridian that carries the worst edge: the thickest one, which is what
 * a lab has to cut and what the frame has to swallow.
 */
export function governingMeridian(meridians: Meridian[]): Meridian {
  let worst = meridians[0];
  for (const m of meridians) {
    if (m.edge > worst.edge) worst = m;
  }
  return worst;
}

/**
 * How far the lens reaches out of the frame, in millimetres.
 *
 * The front surface is convex, so its vertex is the most anterior point of
 * the whole lens. The back surface is convex only where its offset is
 * negative, and then its vertex is the most posterior point; where the offset
 * is positive the back surface curves the other way and the rim is the
 * deepest point of it.
 *
 * Both are measured from the frame's faces: the front face at zero and the
 * back face at the frame's depth. The offsets handed in are the ones of the
 * section, because the section is the meridian the lens is placed by.
 */
export function protrusion(args: {
  frameDepth: number;
  /** Where the front vertex sits, measured back from the front face of the rim. */
  frontApexZ: number;
  /** Where the back vertex sits, measured back from the front face of the rim. */
  backApexZ: number;
  /** The largest back surface offset in the section. */
  maxBackOffset: number;
}): { anterior: number; posterior: number } {
  const anterior = Math.max(0, -args.frontApexZ);
  const backMost = args.backApexZ + Math.max(0, args.maxBackOffset);
  const posterior = Math.max(0, backMost - args.frameDepth);

  return { anterior, posterior };
}

/**
 * The cross-section of the lens in the vertical plane through the optical
 * centre, which is what the side elevation draws.
 *
 * Everything here is measured in millimetres, along the axis from the front
 * face of the rim. The drawing is built from these numbers and nothing else,
 * so what the sheet shows and what the schedule measures are the same
 * measurement.
 */
export interface SectionGeometry {
  /** Radius of the front surface. */
  r1: number;
  /** Radius of the back surface in the vertical meridian, signed. */
  r2: number;
  /** Radius of the back surface in the horizontal meridian, signed. */
  r2Horizontal: number;
  /** Distance from the optical centre to the rim, upwards and downwards. */
  radiusTop: number;
  radiusBottom: number;
  /** Distance from the optical centre to the rim, left and right. */
  radiusLeft: number;
  radiusRight: number;
  /** How far each surface stands from its own vertex at the rim. */
  frontOffsetTop: number;
  frontOffsetBottom: number;
  backOffsetTop: number;
  backOffsetBottom: number;
  frontOffsetLeft: number;
  frontOffsetRight: number;
  backOffsetLeft: number;
  backOffsetRight: number;
  /** The material at the rim, at the top and at the bottom. */
  edgeTop: number;
  edgeBottom: number;
  /** Where the two vertices sit along the axis, from the front face of the rim. */
  frontApexZ: number;
  backApexZ: number;
  /** The optical centre's height above the centre of the opening. */
  ocY: number;
  /** Where the bevel groove sits, from the front face of the rim. */
  groove: number;
}

/**
 * Builds the cross-section from the meridians the solver worked out.
 *
 * The section is the vertical meridian through the optical centre: the lens
 * is cut from the top of the opening to the bottom of it, and the optical
 * centre may sit above or below the middle of the opening, which is why the
 * two ends are not the same distance from the axis.
 *
 * This is the meridian that places the lens. The lens sits in the bevel
 * groove, so the edge at the top of the opening is the one centred on the
 * groove, and the two vertices follow from there. Every measurement of how
 * far the lens stands out of the frame is taken in this plane, because this
 * is the plane the lens is held in.
 */
export function buildSection(args: {
  opening: OpeningGeometry;
  meridians: Meridian[];
  centerThickness: number;
  r1: number;
  frameDepth: number;
  bevelPercent: number;
}): SectionGeometry {
  const nearest = (target: number) =>
    args.meridians.reduce((best, m) =>
      Math.abs(m.theta - target) < Math.abs(best.theta - target) ? m : best,
    );

  const top = nearest(90);
  const bottom = nearest(270);
  const left = nearest(180);
  const right = nearest(0);
  const groove = args.frameDepth * args.bevelPercent;

  // The lens sits in the bevel groove, and the section is the vertical
  // meridian through the optical centre, so the edge at the top of the
  // opening is the one centred on the groove. The two vertices follow from
  // there, and the drawing and the numbers are the same measurement.
  const frontApexZ = groove - top.edge / 2 - top.frontOffset;
  const backApexZ = frontApexZ + args.centerThickness;

  return {
    r1: args.r1,
    r2: top.backRadius,
    r2Horizontal: right.backRadius,
    radiusTop: top.radius,
    radiusBottom: bottom.radius,
    radiusLeft: left.radius,
    radiusRight: right.radius,
    frontOffsetTop: top.frontOffset,
    frontOffsetBottom: bottom.frontOffset,
    backOffsetTop: top.backOffset,
    backOffsetBottom: bottom.backOffset,
    frontOffsetLeft: left.frontOffset,
    frontOffsetRight: right.frontOffset,
    backOffsetLeft: left.backOffset,
    backOffsetRight: right.backOffset,
    edgeTop: args.centerThickness + top.backOffset - top.frontOffset,
    edgeBottom: args.centerThickness + bottom.backOffset - bottom.frontOffset,
    frontApexZ,
    backApexZ,
    ocY: args.opening.ocY,
    groove,
  };
}

/**
 * The volume of the lens, in cubic centimetres.
 *
 * The lens is cut to the frame opening, so the volume is the thickness
 * integrated over that shape, which is what the weight needs and what a flat
 * average of the centre and edge thicknesses gets wrong.
 */
export function lensVolumeCm3(
  opening: OpeningGeometry,
  centerThickness: number,
  index: number,
  baseCurve: number,
  sph: number,
  cyl: number,
  axis: number,
  surfaces: SurfaceModel,
  rings = 90,
  spokes = 144,
): number {
  const r1 = frontRadius(index, baseCurve);
  const { halfWidth, halfHeight, shapeRadius, ocX, ocY } = opening;
  // The rings are centred on the optical centre, so the outer ring has to
  // reach as far as the shape does from there: the corner of a frame is
  // further from the pupil than the diagonal of the box is from its centre.
  const outer = farthestRimDistance(opening);

  let volume = 0;
  for (let i = 0; i < rings; i += 1) {
    // Rings are sampled by area, so the outer rings are not overweighted.
    const inner = Math.sqrt(i / rings) * outer;
    const rim = Math.sqrt((i + 1) / rings) * outer;
    const ringArea = Math.PI * (rim * rim - inner * inner);
    const ringRadius = (inner + rim) / 2;

    for (let j = 0; j < spokes; j += 1) {
      const theta = (360 * j) / spokes;
      const dx = Math.cos(theta * DEG);
      const dy = Math.sin(theta * DEG);
      const x = ocX + ringRadius * dx;
      const y = ocY + ringRadius * dy;

      // Only the part of the ring inside the opening counts.
      if (Math.abs(x) > halfWidth + 1e-9 || Math.abs(y) > halfHeight + 1e-9) continue;
      if (shapeRadius > 0 && x * x + y * y > shapeRadius * shapeRadius + 1e-9) continue;

      const r = Math.hypot(x - ocX, y - ocY);
      const power = powerInMeridian(theta, sph, cyl, axis);
      const r2 = backRadius(index, power - baseCurve);

      const front = conicSagitta(r1, surfaces.frontConic, r) + surfaces.frontPoly(r);
      const back = conicSagitta(r2, surfaces.backConic, r) + surfaces.backPoly(r);
      if (!Number.isFinite(front) || !Number.isFinite(back)) continue;

      const thickness = Math.max(0, centerThickness + back - front);
      volume += thickness * (ringArea / spokes);
    }
  }

  return volume / 1000;
}
